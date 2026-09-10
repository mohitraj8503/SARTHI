import { EgressClient, EncodedFileOutput, S3Upload } from 'livekit-server-sdk';

/**
 * lib/livekit/egress.ts
 *
 * Helpers for starting and stopping LiveKit RoomComposite egress with output
 * directed to a private S3-compatible bucket (AWS S3 / Cloudflare R2 / Backblaze B2).
 *
 * Required env vars:
 *  LIVEKIT_WS_URL         — wss://... LiveKit Cloud URL
 *  LIVEKIT_API_KEY
 *  LIVEKIT_API_SECRET
 *  EGRESS_S3_BUCKET
 *  EGRESS_S3_ACCESS_KEY
 *  EGRESS_S3_SECRET
 *  EGRESS_S3_REGION       — e.g. "auto" for R2, "us-east-1" for AWS
 *  EGRESS_S3_ENDPOINT     — custom endpoint URL (R2/B2 only; omit for AWS)
 */

function getEgressClient(): EgressClient {
  const wsUrl = process.env.LIVEKIT_WS_URL!;
  // EgressClient requires https:// host, not wss://
  const host = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://');
  return new EgressClient(host, process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!);
}

function buildS3Upload(): S3Upload {
  const s3Config: ConstructorParameters<typeof S3Upload>[0] = {
    accessKey: process.env.EGRESS_S3_ACCESS_KEY!,
    secret: process.env.EGRESS_S3_SECRET!,
    region: process.env.EGRESS_S3_REGION || 'auto',
    bucket: process.env.EGRESS_S3_BUCKET!,
  };

  // Only set endpoint for non-AWS storage (Cloudflare R2, Backblaze B2)
  if (process.env.EGRESS_S3_ENDPOINT) {
    s3Config.endpoint = process.env.EGRESS_S3_ENDPOINT;
    s3Config.forcePathStyle = true;
  }

  return new S3Upload(s3Config);
}

/**
 * startRoomRecording
 *
 * Starts a RoomComposite egress for `roomName`, writing the MP4 to:
 *   recordings/{liveClassId}/{room_name}-{time}.mp4
 * in the configured S3/R2 bucket.
 *
 * @returns egressId — store in LiveClassRecording for later stop + webhook lookup
 */
export async function startRoomRecording(
  roomName: string,
  liveClassId: string
): Promise<{ egressId: string; s3KeyPrefix: string }> {
  const client = getEgressClient();

  const s3KeyPrefix = `recordings/${liveClassId}`;
  const filepath = `${s3KeyPrefix}/{room_name}-{time}.mp4`;

  const fileOutput = new EncodedFileOutput({
    filepath,
    output: { case: 's3', value: buildS3Upload() },
  });

  const egressInfo = await client.startRoomCompositeEgress(
    roomName,
    { file: fileOutput },
    {
      layout: 'speaker-dark', // speaker-dark gives a clean dark-mode presentation layout
      audioOnly: false,
      videoOnly: false,
    }
  );

  console.log(
    `[livekit/egress] Started egress for room "${roomName}" (class: ${liveClassId}) → egressId: ${egressInfo.egressId}`
  );

  return {
    egressId: egressInfo.egressId,
    s3KeyPrefix,
  };
}

/**
 * stopRoomRecording
 *
 * Stops the egress job identified by `egressId`. LiveKit will then finalize the
 * MP4, upload it to the configured S3 bucket, and fire an `egress_ended` webhook.
 */
export async function stopRoomRecording(egressId: string) {
  const client = getEgressClient();
  const result = await client.stopEgress(egressId);
  console.log(`[livekit/egress] Stopped egress ${egressId}`);
  return result;
}
