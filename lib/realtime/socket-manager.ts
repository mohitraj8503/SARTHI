/**
 * ROOM MANAGER FOR LIVEKIT SCALING
 * Manages room creation, participant limits, and adaptive configuration
 */

const livekit = require('./index');

interface RoomOptions {
  expectedParticipants: number;
  isPremium: boolean;
  duration: number; // in minutes
  features: string[];
}

interface RoomConfig {
  maxParticipants: number;
  emptyTimeout: number;
  departureTimeout: number;
  simulcast: boolean;
  dynacast: boolean;
  adaptiveStream: boolean;
}

export class RoomManager {
  private static instance: RoomManager;
  private rooms = new Map<string, RoomConfig>();

  static getInstance() {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  async createRoom(roomName: string, options: RoomOptions) {
    const config = this.calculateOptimalConfig(options);

    const room = await livekit.roomService.createRoom({
      name: roomName,
      maxParticipants: config.maxParticipants,
      emptyTimeout: config.emptyTimeout,
      departureTimeout: config.departureTimeout,
    });

    // Configure advanced features
    await this.configureRoomFeatures(roomName, config, options);

    this.rooms.set(roomName, config);
    return room;
  }

  private calculateOptimalConfig(options: RoomOptions): RoomConfig {
    const { expectedParticipants, isPremium } = options;

    let config: RoomConfig = {
      maxParticipants: 10,
      emptyTimeout: 300, // 5 minutes
      departureTimeout: 20, // 20 seconds
      simulcast: true,
      dynacast: true,
      adaptiveStream: true,
    };

    // Scale configuration based on expected participants
    if (expectedParticipants <= 5) {
      config.maxParticipants = 10;
    } else if (expectedParticipants <= 20) {
      config.maxParticipants = 25;
      config.emptyTimeout = 600;
    } else if (expectedParticipants <= 50) {
      config.maxParticipants = 50;
      config.emptyTimeout = 1800;
      config.departureTimeout = 60;
    } else {
      config.maxParticipants = 100;
      config.emptyTimeout = 3600;
      config.departureTimeout = 120;
      config.adaptiveStream = false; // Too resource intensive
    }

    // Premium plan features
    if (isPremium) {
      config.maxParticipants = Math.floor(config.maxParticipants * 1.5);
      config.simulcast = true;
      config.dynacast = true;
    }

    return config;
  }

  private async configureRoomFeatures(roomName: string, config: RoomConfig, options: RoomOptions) {
    const settings: any = {};

    if (config.simulcast) {
      settings.simulcast = true;
    }

    if (config.dynacast) {
      settings.dynacast = true;
    }

    if (config.adaptiveStream) {
      settings.adaptiveStream = true;
    }

    // Enable recording if requested
    if (options.features.includes('recording')) {
      settings.recording = true;
    }

    // Set room metadata
    settings.metadata = JSON.stringify({
      expectedParticipants: options.expectedParticipants,
      isPremium: options.isPremium,
      duration: options.duration,
      features: options.features,
      createdAt: new Date().toISOString(),
    });

    await livekit.roomService.updateRoom({
      name: roomName,
      settings,
    });
  }

  async getRoomConfig(roomName: string): Promise<RoomConfig | null> {
    return this.rooms.get(roomName) || null;
  }

  async scaleRoom(roomName: string, newMaxParticipants: number) {
    const config = this.rooms.get(roomName);
    if (!config) return;

    config.maxParticipants = newMaxParticipants;

    await livekit.roomService.updateRoom({
      name: roomName,
      maxParticipants: newMaxParticipants,
    });

    this.rooms.set(roomName, config);
  }

  async getRoomStats(roomName: string) {
    try {
      const participants = await livekit.roomService.listParticipants(roomName);
      const config = this.rooms.get(roomName);

      return {
        participantCount: participants.length,
        maxParticipants: config?.maxParticipants || 0,
        isAtCapacity: participants.length >= (config?.maxParticipants || 0),
        participants: participants.map(p => ({
          identity: p.identity,
          role: p.metadata ? JSON.parse(p.metadata).role : 'unknown',
          joinedAt: p.joinedAt,
          isPublisher: p.permission?.canPublish || false,
        })),
      };
    } catch (error) {
      console.error('Failed to get room stats:', error);
      return null;
    }
  }

  async cleanupEmptyRooms() {
    const rooms = await livekit.roomService.listRooms();

    for (const room of rooms) {
      const stats = await this.getRoomStats(room.name);
      if (stats && stats.participantCount === 0) {
        const config = this.rooms.get(room.name);
        if (config) {
          const emptyTime = config.emptyTimeout;
          // Check if room has been empty for too long
          // Implementation would check last activity time
        }
      }
    }
  }
}