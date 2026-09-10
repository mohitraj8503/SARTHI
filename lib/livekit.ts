import { AccessToken, EgressClient, TrackSource } from 'livekit-server-sdk';

/**
 * LiveKit Server Helper
 * Handles token generation and recording (Egress) management
 */
export const livekit = {
  /**
   * Generates a secure JWT token for a user to join a room
   */
  generateToken: async (params: {
    roomName: string;
    userId: string;
    userName: string;
    role: 'teacher' | 'student';
    avatarUrl?: string;
  }) => {
    const { roomName, userId, userName, role, avatarUrl } = params;

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('LIVEKIT_API_KEY or LIVEKIT_API_SECRET is not defined in environment variables.');
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      ttl: '6h',
    });

    at.name = userName;
    at.metadata = JSON.stringify({ 
      role, 
      avatarUrl,
      createdAt: new Date().toISOString(),
      isTeacher: role === 'teacher'
    });

    // Granular publish grants:
    // Teachers can publish camera, microphone, screen share, and screen share audio + full admin control.
    // Students can publish camera and microphone ONLY (screen sharing blocked by default at JWT grant level).
    const publishSources = role === 'teacher'
      ? [TrackSource.CAMERA, TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO]
      : [TrackSource.CAMERA, TrackSource.MICROPHONE];

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishSources: publishSources,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: role === 'teacher',
    });

    return await at.toJwt();
  },

  /**
   * Helper to get a configured RoomServiceClient (for admin room operations)
   */
  getRoomServiceClient: () => {
    const { RoomServiceClient } = require('livekit-server-sdk');
    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;
    const wsUrl = (process.env.LIVEKIT_WS_URL || process.env.LIVEKIT_URL)!;
    const host = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://');
    return new RoomServiceClient(host, apiKey, apiSecret) as import('livekit-server-sdk').RoomServiceClient;
  },

  /**
   * Helper to get a configured EgressClient
   */
  getEgressClient: () => {
    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;
    const wsUrl = process.env.LIVEKIT_WS_URL!;
    const host = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://');
    
    return new EgressClient(host, apiKey, apiSecret);
  },

  /**
   * Triggers a Cloud Recording (Egress) for the room
   * This is what enables "Auto-Recording"
   */
  startRoomRecording: async (roomName: string, config?: any) => {
    const egressClient = livekit.getEgressClient();
    const { EncodingOptionsPreset } = await import('livekit-server-sdk');

    // Advanced Egress Configuration following the strict prompt guidelines
    const result = await egressClient.startRoomCompositeEgress(roomName, {
      file: {
        filepath: `SARTHI_Recording_${roomName}_${Date.now()}.mp4`,
      },
      layout: 'speaker', // Active speaker layout prioritizing screen shares
      audioOnly: false,
      videoOnly: false,
      options: {
        preset: EncodingOptionsPreset.H264_720P_30, // 720p 30fps default
      },
    });

    return result.egressId;
  }
};
