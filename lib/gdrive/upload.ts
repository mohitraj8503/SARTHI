import { GetObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getDriveClient } from './client';

/**
 * lib/gdrive/upload.ts
 *
 * Streams an S3/R2 object directly to Google Drive without buffering to disk.
 * After a successful upload the temp S3 object is deleted.
 *
 * Access control:
 *  By default, uploaded recordings are kept PRIVATE (only the service account can read them).
 *  Set env var LIVE_CLASS_RECORDING_PUBLIC=true to make them publicly readable via link.
 *  For paid-course content, keep them private and use /api/recordings/[liveClassId]/stream
 *  to proxy authenticated playback.
 *
 * Required env vars:
 *  EGRESS_S3_BUCKET, EGRESS_S3_ACCESS_KEY, EGRESS_S3_SECRET,
 *  EGRESS_S3_REGION, EGRESS_S3_ENDPOINT (optional), GDRIVE_FOLDER_ID
 */

function buildS3Client(): S3Client {
  const config: ConstructorParameters<typeof S3Client>[0] = {
    region: process.env.EGRESS_S3_REGION || 'auto',
    credentials: {
      accessKeyId: process.env.EGRESS_S3_ACCESS_KEY!,
      secretAccessKey: process.env.EGRESS_S3_SECRET!,
    },
  };
  if (process.env.EGRESS_S3_ENDPOINT) {
    config.endpoint = process.env.EGRESS_S3_ENDPOINT;
    config.forcePathStyle = true;
  }
  return new S3Client(config);
}

export interface UploadResult {
  driveFileId: string;
  /** webViewLink — always returned. For private files, direct playback requires auth proxy. */
  driveViewUrl: string;
  /** true if the file was made publicly readable via link */
  isPublic: boolean;
}

/**
 * uploadRecordingToDrive
 *
 * 1. Fetches the MP4 from S3/R2 as a Node Readable stream (no disk buffering).
 * 2. Uploads it to Drive via multipart resumable upload.
 * 3. Conditionally sets public reader permission.
 * 4. Deletes the source S3 object (non-fatal on failure).
 */
export async function uploadRecordingToDrive({
  s3Key,
  fileName,
}: {
  s3Key: string;
  fileName: string;
}): Promise<UploadResult> {
  const s3 = buildS3Client();
  const drive = getDriveClient();

  const bucket = process.env.EGRESS_S3_BUCKET;
  const folderId = process.env.GDRIVE_FOLDER_ID;
  const makePublic = process.env.LIVE_CLASS_RECORDING_PUBLIC === 'true';

  if (!bucket) throw new Error('[gdrive/upload] EGRESS_S3_BUCKET is not set');
  if (!folderId) throw new Error('[gdrive/upload] GDRIVE_FOLDER_ID is not set');

  // ── 1. Fetch from S3/R2 ──────────────────────────────────────────────────
  const s3Object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: s3Key }));
  if (!s3Object.Body) {
    throw new Error(`[gdrive/upload] S3 object has no body: s3://${bucket}/${s3Key}`);
  }
  const readableStream = s3Object.Body as any;

  // ── 2. Upload to Drive (supports Shared Drives / Team Drives) ──────────────
  const driveFile = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType: 'video/mp4', body: readableStream },
    fields: 'id, webViewLink',
    supportsAllDrives: true,
    supportsTeamDrives: true,
  });

  const driveFileId = driveFile.data.id;
  const driveViewUrl = driveFile.data.webViewLink;

  if (!driveFileId || !driveViewUrl) {
    throw new Error('[gdrive/upload] Drive upload succeeded but returned no file ID or link');
  }

  // ── 3. A3: Conditional public access ─────────────────────────────────────
  // Default is PRIVATE. Only set anyone/reader if explicitly opted-in via env var.
  // For paid courses, keep private and use /api/recordings/[liveClassId]/stream instead.
  if (makePublic) {
    await drive.permissions.create({
      fileId: driveFileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
      supportsTeamDrives: true,
    });
    console.log(`[gdrive/upload] File ${driveFileId} set to public (LIVE_CLASS_RECORDING_PUBLIC=true)`);
  } else {
    console.log(`[gdrive/upload] File ${driveFileId} kept private (use /api/recordings proxy for playback)`);
  }

  // ── 4. Delete temp S3 object (B3: non-fatal) ─────────────────────────────
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: s3Key }));
    console.log(`[gdrive/upload] Deleted temp S3 object: s3://${bucket}/${s3Key}`);
  } catch (deleteErr) {
    console.warn('[gdrive/upload] Failed to delete temp S3 object (non-fatal):', deleteErr);
  }

  return { driveFileId, driveViewUrl, isPublic: makePublic };
}
