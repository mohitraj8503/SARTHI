import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WebhookReceiver } from 'livekit-server-sdk';
import { livekit } from '@/lib/livekit';
import { IncidentResponseSystem, IncidentSeverity } from '@/lib/monitoring/incident-response';
import crypto from 'crypto';

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

/**
 * POST /api/livekit/webhook
 *
 * LiveKit Cloud webhook receiver. Configure in:
 *   LiveKit Cloud Dashboard → Webhooks → Add webhook URL
 *   → https://sarthi-woad.vercel.app/api/livekit/webhook
 *   Subscribe to: egress_started, egress_ended, room_finished, participant_joined, participant_left
 *
 * Security:
 *  - receiver.receive() throws on invalid/missing signature → RETURNS 401 UNAUTHORIZED (never 200).
 *  - Egress status is checked before triggering upload (COMPLETE only).
 *  - Idempotency: READY / COMPLETED rows are skipped on duplicate webhook delivery.
 *  - Server errors return 500 so LiveKit retries sending the event.
 */
export async function POST(req: Request) {
  let body: string;
  try {
    body = await req.text();
  } catch {
    return NextResponse.json({ error: 'Malformed request body' }, { status: 400 });
  }

  const signature = req.headers.get('Authorization');

  if (!signature) {
    console.warn('⚠️ [livekit/webhook] SECURITY_REJECT: Missing Authorization signature header');
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  }

  // ── 1. Strict signature check — returns 401 on failure ──────────────────────
  let event: ReturnType<typeof receiver.receive>;
  try {
    event = receiver.receive(body, signature);
  } catch (sigErr: any) {
    console.warn('🚨 [livekit/webhook] SECURITY_REJECT: Signature verification failed:', sigErr?.message);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  console.log(`🔔 [livekit/webhook] Verified Event: ${event.event}`);

  try {
    // ──────────────────────────────────────────────────────────────────────────
    // room_finished — auto-end the LiveClass when the LiveKit room closes
    // ──────────────────────────────────────────────────────────────────────────
    if (event.event === 'room_finished') {
      const roomName = event.room?.name;
      if (roomName) {
        const liveClass = await prisma.liveClass.findFirst({
          where: { roomName, liveKitStatus: 'LIVE' },
          select: { id: true, recording: { select: { egressId: true } } },
        });

        if (liveClass) {
          const egressId = liveClass.recording?.egressId;
          if (egressId) {
            const { stopRoomRecording } = await import('@/lib/livekit/egress');
            await stopRoomRecording(egressId).catch((e: any) =>
              console.warn('[livekit/webhook] room_finished: stopEgress non-fatal:', e?.message)
            );
          }

          await prisma.liveClass.update({
            where: { id: liveClass.id },
            data: {
              liveKitStatus: 'ENDED',
              liveKitEndedAt: new Date(),
              endedAt: new Date(),
              status: 'ENDED' as any,
            },
          });

          console.log(`[livekit/webhook] room_finished: auto-ended class ${liveClass.id} (room: ${roomName})`);
        }
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // participant_joined / participant_left — Automated Attendance Capture
    // ──────────────────────────────────────────────────────────────────────────
    if (event.event === 'participant_joined' || event.event === 'participant_left') {
      const participant = event.participant;
      const room = event.room;

      if (participant?.identity && room?.name) {
        const liveClass = await prisma.liveClass.findFirst({
          where: { roomName: room.name },
          select: { id: true }
        });

        if (liveClass) {
          const isJoin = event.event === 'participant_joined';

          if (isJoin) {
            await prisma.liveClassAttendance.create({
              data: {
                liveClassId: liveClass.id,
                studentId: participant.identity,
                joinedAt: new Date(),
              }
            }).catch((err) => console.warn('[livekit/webhook] Attendance create error:', err?.message));
          } else {
            const existing = await prisma.liveClassAttendance.findFirst({
              where: {
                liveClassId: liveClass.id,
                studentId: participant.identity
              },
              orderBy: { joinedAt: 'desc' }
            });

            if (existing && existing.joinedAt) {
              const leftAt = new Date();

              await prisma.liveClassAttendance.update({
                where: { id: existing.id },
                data: { leftAt }
              }).catch((err) => console.warn('[livekit/webhook] Attendance update error:', err?.message));
            }
          }
        }
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // egress_started — mark recording as PROCESSING
    // ──────────────────────────────────────────────────────────────────────────
    if (event.event === 'egress_started') {
      const egress = event.egressInfo;
      if (egress?.egressId) {
        await prisma.recording.updateMany({
          where: { egressId: egress.egressId },
          data: { status: 'processing', processingStartedAt: new Date() },
        }).catch(() => {});

        await prisma.liveClassRecording.updateMany({
          where: { egressId: egress.egressId },
          data: { recordingStatus: 'PROCESSING' },
        }).catch(() => {});
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // egress_ended — trigger upload pipeline
    // ──────────────────────────────────────────────────────────────────────────
    if (event.event === 'egress_ended') {
      const egress = event.egressInfo;
      if (!egress) return NextResponse.json({ success: true });

      const { egressId } = egress;

      // EgressStatus enum: 0=STARTING, 1=ACTIVE, 2=ENDING, 3=COMPLETE, 4=FAILED, 5=ABORTED, 6=LIMIT_REACHED
      const egressStatus = egress.status;
      const egressSucceeded = egressStatus === 3;
      const egressError = egress.error || `egress status: ${egressStatus}`;

      const s3Key = egress.fileResults?.[0]?.filename ?? null;
      const fileSizeBytes = BigInt(egress.fileResults?.[0]?.size ?? 0);
      const durationSec = egress.fileResults?.[0]?.duration
        ? Math.round(Number(egress.fileResults[0].duration) / 1e9)
        : null;

      // ──── Path A: LiveSession recording (legacy) ────────────────────────────
      const liveSessionRecording = await prisma.recording.findUnique({ where: { egressId } });

      if (liveSessionRecording?.sessionId) {
        if (!egressSucceeded) {
          await prisma.recording.update({
            where: { id: liveSessionRecording.id },
            data: { status: 'failed', errorMessage: egressError },
          }).catch(() => {});
        } else {
          await prisma.recording.update({
            where: { id: liveSessionRecording.id },
            data: { status: 'processing', duration: durationSec ?? undefined, originalFilename: s3Key ?? undefined },
          }).catch(() => {});

          (async () => {
            try {
              const { driveService } = await import('@/lib/google-drive');
              const axios = (await import('axios')).default;

              const liveSession = await prisma.liveSession.findUnique({
                where: { id: liveSessionRecording.sessionId! },
                include: { course: true },
              });
              if (!liveSession || !s3Key) return;

              const folderId = await driveService.getOrCreateCourseFolder(
                liveSession.teacherId, liveSession.courseId, liveSession.course.title
              );
              const downloadUrl = s3Key.startsWith('http')
                ? s3Key
                : `${process.env.LIVEKIT_EGRESS_DOWNLOAD_URL || ''}/${s3Key}`;
              const response = await axios({ method: 'get', url: downloadUrl, responseType: 'stream' });
              const driveFile = await driveService.uploadRecording(
                liveSession.teacherId, folderId,
                `Recording_${liveSession.course.title}_${new Date().toISOString()}.mp4`,
                response.data
              );

              if (driveFile?.webViewLink) {
                await prisma.recording.update({
                  where: { id: liveSessionRecording.id },
                  data: { status: 'completed', googleDriveUrl: driveFile.webViewLink, shareableLink: driveFile.webViewLink, processingCompletedAt: new Date() },
                });
                await prisma.liveSession.update({
                  where: { id: liveSession.id },
                  data: { recordingUrl: driveFile.webViewLink, status: 'completed' },
                });
                await prisma.lesson.updateMany({
                  where: { liveSessionId: liveSession.id },
                  data: { liveStatus: 'ENDED', videoUrl: driveFile.webViewLink, recordingUrl: driveFile.webViewLink, upload_status: 'COMPLETED' },
                });
                console.log(`✅ [livekit/webhook] LiveSession recording moved to Drive: ${driveFile.webViewLink}`);
                livekit.getEgressClient().deleteEgress(egressId).catch(() => {});
              }
            } catch (err) {
              console.error('❌ [livekit/webhook] LiveSession Drive upload failed:', err);
              await prisma.recording.update({
                where: { id: liveSessionRecording.id },
                data: { status: 'failed' },
              }).catch(() => {});
            }
          })();
        }
      }

      // ──── Path B: LiveClass recording ────────────────────────────────────────
      const liveClassRecording = await prisma.liveClassRecording.findUnique({
        where: { egressId },
        include: { liveClass: { select: { id: true, title: true, courseId: true } } },
      });

      if (liveClassRecording) {
        // Idempotency guard — skip duplicate delivery if already READY
        if (liveClassRecording.recordingStatus === 'READY') {
          console.log(`[livekit/webhook] Idempotency: Skipping duplicate egress_ended for ${egressId} (already READY)`);
          return NextResponse.json({ success: true });
        }

        if (!egressSucceeded) {
          console.warn(`[livekit/webhook] Egress ${egressId} failed on LiveKit side: ${egressError}`);
          await prisma.liveClassRecording.update({
            where: { id: liveClassRecording.id },
            data: {
              recordingStatus: 'FAILED',
              failureReason: `LiveKit egress did not complete: ${egressError}`,
            },
          }).catch(() => {});

          IncidentResponseSystem.raise({
            id: crypto.randomUUID(),
            title: 'LiveClass Recording Egress Failed',
            description: `LiveKit egress failed for class "${liveClassRecording.liveClass.title}". Error: ${egressError}`,
            severity: IncidentSeverity.HIGH,
            sessionId: egressId,
            autoResolvable: false,
            createdAt: new Date(),
          });

          return NextResponse.json({ success: true });
        }

        await prisma.liveClassRecording.update({
          where: { id: liveClassRecording.id },
          data: { recordingStatus: 'UPLOADING_TO_DRIVE', tempS3Key: s3Key ?? undefined },
        }).catch(() => {});

        // Async upload pipeline with retries & incident alerting
        (async () => {
          try {
            if (!s3Key) throw new Error('No S3 key in egress fileResults');

            const { uploadRecordingToDrive } = await import('@/lib/gdrive/upload');
            const safeTitle = liveClassRecording.liveClass.title.replace(/[^a-zA-Z0-9 _-]/g, '');
            const fileName = `LiveClass_${safeTitle}_${new Date().toISOString()}.mp4`;

            const { driveFileId, driveViewUrl } = await uploadRecordingToDrive({ s3Key, fileName });

            await prisma.liveClassRecording.update({
              where: { id: liveClassRecording.id },
              data: {
                recordingStatus: 'READY',
                driveFileId,
                driveViewUrl,
                uploadedAt: new Date(),
                durationSec: durationSec ?? undefined,
                fileSizeBytes,
                tempS3Key: null,
                failureReason: null,
              },
            });

            console.log(`✅ [livekit/webhook] LiveClass recording uploaded to Drive & R2 temp cleaned up: ${driveViewUrl}`);
          } catch (err: any) {
            const reason = err?.message || String(err);
            console.error('❌ [livekit/webhook] LiveClass Drive upload failed:', reason);

            await prisma.liveClassRecording.update({
              where: { id: liveClassRecording.id },
              data: { recordingStatus: 'FAILED', failureReason: reason.substring(0, 2000) },
            }).catch(() => {});

            IncidentResponseSystem.raise({
              id: crypto.randomUUID(),
              title: 'LiveClass Drive Upload Pipeline Failed',
              description: `Drive upload failed for class "${liveClassRecording.liveClass.title}". R2 raw file preserved (Key: ${s3Key}). Error: ${reason}`,
              severity: IncidentSeverity.CRITICAL,
              sessionId: egressId,
              autoResolvable: false,
              createdAt: new Date(),
            });
          }
        })();
      }
    }

    return NextResponse.json({ success: true });

  } catch (innerErr: any) {
    console.error('❌ [livekit/webhook] Server processing error:', innerErr?.message);
    // Return 500 so LiveKit knows processing failed and will retry delivery
    return NextResponse.json({ error: 'Internal processing error', details: innerErr?.message }, { status: 500 });
  }
}
