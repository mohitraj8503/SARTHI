// ✅ lib/classroom/raise-hand.ts - Real-time hand raise system
import { Room, RoomEvent, Participant, DataPacket_Kind } from 'livekit-client';

export class RaiseHandManager {
  private room: Room;
  private raisedHands = new Map<string, { timestamp: number; message?: string }>();
  
  constructor(room: Room) {
    this.room = room;
    this.setupHandlers();
  }
  
  private setupHandlers() {
    // ✅ Listen for hand raise data messages
    this.room.on(RoomEvent.DataReceived, (payload, participant, kind) => {
      // payload is Uint8Array
      const decoder = new TextDecoder();
      const text = decoder.decode(payload);
      
      try {
        const data = JSON.parse(text);
        if (data.type === 'raiseHand') {
          if (participant) {
            this.raisedHands.set(participant.sid, {
              timestamp: Date.now(),
              message: data.message
            });
            this.room.emit('handRaised', { participant, message: data.message });
          }
        } else if (data.type === 'lowerHand') {
          if (participant) {
            this.raisedHands.delete(participant.sid);
            this.room.emit('handLowered', { participant });
          }
        } else if (data.type === 'lowerHandByTeacher') {
          // If I am the target, lower my hand
          if (this.room.localParticipant?.sid === data.targetSid) {
            this.raisedHands.delete(this.room.localParticipant.sid);
            this.room.emit('handLowered', { participant: this.room.localParticipant });
          }
        }
      } catch (error) {
        console.error('Failed to parse hand raise data:', error);
      }
    });
    
    // ✅ Clean up old hand raises (auto-lower after 5 min)
    setInterval(() => {
      const now = Date.now();
      for (const [sid, { timestamp }] of this.raisedHands) {
        if (now - timestamp > 5 * 60 * 1000) {
          this.raisedHands.delete(sid);
          const participant = this.room.participants.get(sid);
          if (participant) {
            this.room.emit('handLowered', { participant, reason: 'timeout' });
          }
        }
      }
    }, 60000);
  }
  
  // ✅ Student raises hand
  async raiseHand(message?: string) {
    if (!this.room.localParticipant) return;
    
    const payload = JSON.stringify({ type: 'raiseHand', message, timestamp: Date.now() });
    const encoder = new TextEncoder();
    
    await this.room.localParticipant.publishData(encoder.encode(payload), {
      reliable: true
    });
    
    this.raisedHands.set(this.room.localParticipant.sid, {
      timestamp: Date.now(),
      message
    });
    this.room.emit('handRaised', { participant: this.room.localParticipant, message });
  }
  
  // ✅ Student lowers hand
  async lowerHand() {
    if (!this.room.localParticipant) return;
    
    const payload = JSON.stringify({ type: 'lowerHand', timestamp: Date.now() });
    const encoder = new TextEncoder();
    
    await this.room.localParticipant.publishData(encoder.encode(payload), {
      reliable: true
    });
    
    this.raisedHands.delete(this.room.localParticipant.sid);
    this.room.emit('handLowered', { participant: this.room.localParticipant });
  }
  
  // ✅ Teacher gets list of raised hands
  getRaisedHands() {
    return Array.from(this.raisedHands.entries())
      .map(([sid, data]) => ({
        participant: sid === this.room.localParticipant?.sid ? this.room.localParticipant : this.room.participants.get(sid),
        ...data
      }))
      .filter(item => item.participant)
      .sort((a, b) => a.timestamp - b.timestamp); // Oldest first
  }
  
  // ✅ Teacher lowers a student's hand
  async lowerStudentHand(participantSid: string) {
    if (!this.room.localParticipant) return;

    const payload = JSON.stringify({ 
      type: 'lowerHandByTeacher', 
      targetSid: participantSid,
      timestamp: Date.now() 
    });
    const encoder = new TextEncoder();
    
    await this.room.localParticipant.publishData(encoder.encode(payload), {
      reliable: true
    });
    
    this.raisedHands.delete(participantSid);
  }

  cleanup() {
    this.room.off(RoomEvent.DataReceived);
  }
}
