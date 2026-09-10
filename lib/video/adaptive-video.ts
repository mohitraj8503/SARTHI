// ✅ lib/video/adaptive-video.ts - Dynamic quality adjustment
import { Room, VideoPresets } from 'livekit-client';

export class AdaptiveVideoManager {
  private room: Room;
  private bandwidthEstimate = 0;
  private qualityLevels = [
    { name: 'low', width: 320, height: 180, maxBitrate: 200_000 },
    { name: 'medium', width: 640, height: 360, maxBitrate: 800_000 },
    { name: 'high', width: 1280, height: 720, maxBitrate: 2_500_000 },
    { name: 'full', width: 1920, height: 1080, maxBitrate: 5_000_000 }
  ];
  
  constructor(room: Room) {
    this.room = room;
    this.startBandwidthMonitoring();
  }
  
  private startBandwidthMonitoring() {
    // ✅ Monitor connection quality every 5 seconds
    setInterval(() => {
      this.estimateBandwidth();
      this.adjustVideoQuality();
    }, 5000);
  }
  
  private estimateBandwidth() {
    // ✅ Use WebRTC stats for bandwidth estimation
    // @ts-ignore - access internal rtcEngine stats
    const stats = this.room.engine.rtcEngine.getStats?.();
    if (!stats?.video) return;
    
    const videoStats = stats.video;
    const availableBandwidth = videoStats.availableOutgoingBitrate || 0;
    const packetLoss = (videoStats.packetsLost / (videoStats.packetsSent || 1)) * 100;
    
    // Adjust estimate based on packet loss
    this.bandwidthEstimate = packetLoss > 5 
      ? availableBandwidth * 0.7 // Reduce if high loss
      : availableBandwidth;
  }
  
  private adjustVideoQuality() {
    const localParticipant = this.room.localParticipant;
    if (!localParticipant) return;
    
    // ✅ Find best quality level for current bandwidth
    const bestLevel = [...this.qualityLevels]
      .reverse() // Start from highest quality
      .find(level => level.maxBitrate <= this.bandwidthEstimate * 0.9) // 10% buffer
      || this.qualityLevels[0]; // Fallback to lowest
    
    // ✅ Apply new video settings
    localParticipant.videoTrackPublications.forEach(pub => {
      if (pub.track?.kind === 'video') {
        // @ts-ignore - access internal setProcessor
        (pub.track as any).setProcessor({
          videoDimensions: { width: bestLevel.width, height: bestLevel.height },
          maxBitrate: bestLevel.maxBitrate
        });
      }
    });
    
    // ✅ Notify UI of quality change
    (this.room as any).emit('videoQualityChanged', { level: bestLevel.name, bandwidth: this.bandwidthEstimate });
  }
  
  // ✅ Manual quality override (for teacher controls)
  setPreferredQuality(level: 'low' | 'medium' | 'high' | 'full') {
    const target = this.qualityLevels.find(l => l.name === level);
    if (!target) return;
    
    this.room.localParticipant?.videoTrackPublications.forEach(pub => {
      if (pub.track?.kind === 'video') {
        // @ts-ignore
        (pub.track as any).setProcessor({
          videoDimensions: { width: target.width, height: target.height },
          maxBitrate: target.maxBitrate
        });
      }
    });
  }
}
