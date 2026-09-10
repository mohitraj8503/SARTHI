/**
 * TRACK SUBSCRIPTION OPTIMIZATION
 * Manages video/audio track subscriptions for performance
 */

const livekit = require('./index');

interface TrackSubscription {
  id: string;
  kind: 'audio' | 'video';
  participantId: string;
  participantRole: 'teacher' | 'student' | 'guest';
  isScreenShare: boolean;
  isActiveSpeaker: boolean;
  quality: TrackQuality;
  priority: number;
}

type TrackQuality = 'low' | 'medium' | 'high';

export class TrackManager {
  private subscriptions = new Map<string, TrackSubscription>();
  private participantTracks = new Map<string, TrackSubscription[]>();
  private qualityPreferences = new Map<string, TrackQuality>();
  private maxVideoSubscriptions = 4; // Max video streams per participant

  async optimizeSubscriptions(roomName: string, participantId: string) {
    const participantTracks = this.participantTracks.get(participantId) || [];
    const videoSubscriptions = participantTracks.filter(sub => sub.kind === 'video');

    // Limit concurrent video subscriptions
    if (videoSubscriptions.length > this.maxVideoSubscriptions) {
      const toUnsubscribe = this.selectTracksToUnsubscribe(videoSubscriptions);

      for (const track of toUnsubscribe) {
        await this.unsubscribeFromTrack(track.id, participantId);
      }
    }

    // Adjust quality based on connection and room conditions
    await this.adjustQuality(roomName, participantId);
  }

  private selectTracksToUnsubscribe(videoSubscriptions: TrackSubscription[]): TrackSubscription[] {
    // Sort by priority (highest first) and keep only top N
    const sorted = videoSubscriptions.sort((a, b) => b.priority - a.priority);
    return sorted.slice(this.maxVideoSubscriptions);
  }

  private async unsubscribeFromTrack(trackId: string, participantId: string) {
    try {
      // Unsubscribe from track
      await livekit.roomService.unsubscribeFromTrack(trackId, participantId);
      this.subscriptions.delete(trackId);

      // Update participant tracks
      const participantTracks = this.participantTracks.get(participantId) || [];
      const filtered = participantTracks.filter(track => track.id !== trackId);
      this.participantTracks.set(participantId, filtered);

      console.log(`📡 Unsubscribed ${participantId} from track ${trackId}`);
    } catch (error) {
      console.error(`Failed to unsubscribe from track ${trackId}:`, error);
    }
  }

  async subscribeToTrack(roomName: string, trackId: string, participantId: string, metadata: any) {
    const subscription: TrackSubscription = {
      id: trackId,
      kind: metadata.kind,
      participantId,
      participantRole: metadata.participantRole || 'student',
      isScreenShare: metadata.isScreenShare || false,
      isActiveSpeaker: metadata.isActiveSpeaker || false,
      quality: 'medium',
      priority: this.calculatePriority(metadata),
    };

    this.subscriptions.set(trackId, subscription);

    // Add to participant tracks
    const participantTracks = this.participantTracks.get(participantId) || [];
    participantTracks.push(subscription);
    this.participantTracks.set(participantId, participantTracks);

    // Optimize subscriptions after adding new one
    await this.optimizeSubscriptions(roomName, participantId);
  }

  private calculatePriority(metadata: any): number {
    let priority = 5; // Base priority

    if (metadata.participantRole === 'teacher') priority += 10;
    if (metadata.isScreenShare) priority += 9;
    if (metadata.isActiveSpeaker) priority += 8;
    if (metadata.kind === 'audio') priority += 2; // Audio is more important than video

    return priority;
  }

  private async adjustQuality(roomName: string, participantId: string) {
    const connectionQuality = await this.getConnectionQuality(participantId);
    const roomStats = await this.getRoomStats(roomName);

    for (const [trackId, subscription] of this.subscriptions) {
      if (subscription.participantId === participantId) continue; // Don't adjust own tracks

      let newQuality = this.calculateOptimalQuality(subscription, connectionQuality, roomStats);

      if (newQuality !== subscription.quality) {
        await this.setTrackQuality(trackId, newQuality);
        subscription.quality = newQuality;
      }
    }
  }

  private calculateOptimalQuality(
    subscription: TrackSubscription,
    connectionQuality: string,
    roomStats: any
  ): TrackQuality {
    // High priority tracks always get best quality
    if (subscription.priority >= 15) return 'high';

    // Adjust based on connection quality
    if (connectionQuality === 'poor') {
      return subscription.isScreenShare ? 'medium' : 'low';
    }

    if (connectionQuality === 'good') {
      return subscription.isActiveSpeaker ? 'high' : 'medium';
    }

    // Excellent connection - use high quality for important tracks
    if (subscription.priority >= 10) return 'high';
    if (subscription.isActiveSpeaker) return 'high';
    return 'medium';
  }

  private async getConnectionQuality(participantId: string): Promise<'poor' | 'good' | 'excellent'> {
    // This would integrate with LiveKit's connection quality metrics
    // For now, return based on subscription count and room size
    const participantTracks = this.participantTracks.get(participantId) || [];

    if (participantTracks.length > 6) return 'poor';
    if (participantTracks.length > 3) return 'good';
    return 'excellent';
  }

  private async getRoomStats(roomName: string) {
    try {
      const participants = await livekit.roomService.listParticipants(roomName);
      return {
        participantCount: participants.length,
        activeSpeakers: participants.filter(p => p.metadata?.isActiveSpeaker).length,
      };
    } catch (error) {
      console.error('Failed to get room stats:', error);
      return { participantCount: 0, activeSpeakers: 0 };
    }
  }

  private async setTrackQuality(trackId: string, quality: TrackQuality) {
    try {
      await livekit.roomService.setTrackQuality(trackId, quality);
      console.log(`⚙️ Set track ${trackId} quality to ${quality}`);
    } catch (error) {
      console.error(`Failed to set track quality for ${trackId}:`, error);
    }
  }

  // Update participant activity status
  updateParticipantActivity(participantId: string, isActiveSpeaker: boolean) {
    const participantTracks = this.participantTracks.get(participantId) || [];

    for (const track of participantTracks) {
      track.isActiveSpeaker = isActiveSpeaker;
      track.priority = this.calculatePriority(track);
    }
  }

  // Get subscription statistics
  getSubscriptionStats() {
    const stats = {
      totalSubscriptions: this.subscriptions.size,
      participants: this.participantTracks.size,
      qualityDistribution: {
        low: 0,
        medium: 0,
        high: 0,
      },
    };

    for (const subscription of this.subscriptions.values()) {
      stats.qualityDistribution[subscription.quality]++;
    }

    return stats;
  }

  // Cleanup subscriptions for disconnected participant
  cleanupParticipant(participantId: string) {
    const participantTracks = this.participantTracks.get(participantId) || [];

    for (const track of participantTracks) {
      this.subscriptions.delete(track.id);
    }

    this.participantTracks.delete(participantId);
  }
}