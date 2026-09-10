import { prisma } from '@/lib/prisma';
import { livekit } from '@/lib/livekit';

interface RecordingTask {
  roomName: string;
  liveSessionId: string;
  attempts: number;
}

class RecordingQueue {
  private queue: RecordingTask[] = [];
  private isProcessing = false;
  private maxAttempts = 3;

  async addTask(roomName: string, liveSessionId: string) {
    this.queue.push({ roomName, liveSessionId, attempts: 0 });
    console.log(`[RecordingQueue] Task added for room: ${roomName}. Queue size: ${this.queue.length}`);
    this.process();
  }

  private async process() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const task = this.queue.shift();

    if (task) {
      try {
        console.log(`[RecordingQueue] Processing recording for: ${task.roomName}`);
        
        // 1. Start LiveKit Egress
        const egressId = await livekit.startRoomRecording(task.roomName);
        console.log(`🔴 [RecordingQueue] Egress started: ${task.roomName} -> ${egressId}`);

        // 2. Update Database
        await prisma.$transaction([
          prisma.liveSession.update({
            where: { id: task.liveSessionId },
            data: { egressId, isRecording: true }
          }),
          prisma.recording.create({
            data: {
              sessionId: task.liveSessionId,
              egressId: egressId,
              status: 'RECORDING',
            }
          })
        ]);
        
        console.log(`✅ [RecordingQueue] Database synced for ${task.roomName}`);
      } catch (error) {
        console.error(`❌ [RecordingQueue] Failed for ${task.roomName}:`, error);
        
        if (task.attempts < this.maxAttempts) {
          task.attempts++;
          const delay = task.attempts * 5000;
          console.log(`🔄 [RecordingQueue] Retrying ${task.roomName} in ${delay}ms...`);
          setTimeout(() => this.addTask(task.roomName, task.liveSessionId), delay);
        } else {
          console.error(`💀 [RecordingQueue] Max attempts reached for ${task.roomName}`);
          // Update DB to mark as failed
          await prisma.liveSession.update({
            where: { id: task.liveSessionId },
            data: { isRecording: false }
          }).catch(console.error);
        }
      }
    }

    this.isProcessing = false;
    // Process next item if any
    this.process();
  }
}

export const recordingQueue = new RecordingQueue();
