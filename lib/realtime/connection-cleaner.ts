/**
 * INTELLIGENT SOCKET MANAGER
 * Manages WebSocket connections with automatic reconnection and pooling
 */

interface SubscribeOptions {
  url?: string;
  roomId?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

interface SocketConnection {
  id: string;
  socket: any; // Socket.io client
  subscribers: Set<Function>;
  isConnected: () => boolean;
  connect: () => void;
  disconnect: () => void;
}

export class SocketManager {
  private static instance: SocketManager;
  private connections = new Map<string, SocketConnection>();
  private reconnectAttempts = new Map<string, number>();
  private maxReconnectAttempts = 5;
  private baseDelay = 1000;

  static getInstance() {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  subscribe(event: string, callback: Function, options: SubscribeOptions = {}) {
    const key = this.getSubscriptionKey(event, options.roomId);

    if (!this.connections.has(key)) {
      this.createConnection(key, options);
    }

    const connection = this.connections.get(key)!;
    connection.subscribers.add(callback);

    // Return unsubscribe function
    return () => this.unsubscribe(event, callback, options.roomId);
  }

  unsubscribe(event: string, callback: Function, roomId?: string) {
    const key = this.getSubscriptionKey(event, roomId);
    const connection = this.connections.get(key);

    if (connection) {
      connection.subscribers.delete(callback);

      // Close connection if no more subscribers
      if (connection.subscribers.size === 0) {
        connection.disconnect();
        this.connections.delete(key);
      }
    }
  }

  private createConnection(key: string, options: SubscribeOptions) {
    const io = require('socket.io-client');

    const socket = io(options.url || process.env.NEXT_PUBLIC_APP_URL, {
      path: '/api/socket',
      transports: ['websocket'],
      timeout: 5000,
      forceNew: false, // Reuse connections
    });

    const connection: SocketConnection = {
      id: key,
      socket,
      subscribers: new Set(),
      isConnected: () => socket.connected,
      connect: () => socket.connect(),
      disconnect: () => socket.disconnect(),
    };

    // Set up event handlers
    socket.on('connect', () => this.onConnect(key));
    socket.on('disconnect', () => this.onDisconnect(key));
    socket.on('error', (error) => this.onError(key, error));
    socket.on('message', (data) => this.onMessage(key, data));

    this.connections.set(key, connection);
  }

  private onConnect(key: string) {
    console.log(`🔗 Socket connected: ${key}`);
    this.reconnectAttempts.delete(key);

    // Authenticate if needed
    const connection = this.connections.get(key);
    if (connection) {
      const token = this.getAuthToken();
      if (token) {
        connection.socket.emit('authenticate', token);
      }
    }
  }

  private onDisconnect(key: string) {
    console.log(`📡 Socket disconnected: ${key}`);
    this.attemptReconnect(key);
  }

  private onError(key: string, error: any) {
    console.error(`❌ Socket error for ${key}:`, error);
    this.attemptReconnect(key);
  }

  private onMessage(key: string, data: any) {
    const connection = this.connections.get(key);
    if (connection) {
      connection.subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket callback:', error);
        }
      });
    }
  }

  private attemptReconnect(key: string) {
    const attempts = this.reconnectAttempts.get(key) || 0;

    if (attempts >= this.maxReconnectAttempts) {
      console.error(`🚫 Max reconnection attempts reached for ${key}`);
      this.connections.delete(key);
      return;
    }

    const delay = this.calculateDelay(attempts);
    this.reconnectAttempts.set(key, attempts + 1);

    console.log(`🔄 Reconnecting ${key} in ${delay}ms (attempt ${attempts + 1})`);

    setTimeout(() => {
      const connection = this.connections.get(key);
      if (connection && !connection.isConnected()) {
        connection.connect();
      }
    }, delay);
  }

  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
  }

  private getSubscriptionKey(event: string, roomId?: string): string {
    return roomId ? `${roomId}:${event}` : `global:${event}`;
  }

  private getAuthToken(): string | null {
    // Get auth token from cookies or context
    if (typeof window !== 'undefined') {
      const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('next-auth.session-token='));

      return cookie ? cookie.split('=')[1] : null;
    }
    return null;
  }

  // Broadcast to all subscribers of an event
  broadcast(event: string, data: any, roomId?: string) {
    const key = this.getSubscriptionKey(event, roomId);
    const connection = this.connections.get(key);

    if (connection) {
      connection.socket.emit(event, data);
    }
  }

  // Get connection stats for monitoring
  getStats() {
    const stats = {
      totalConnections: this.connections.size,
      connections: [] as any[],
    };

    for (const [key, connection] of this.connections) {
      stats.connections.push({
        key,
        connected: connection.isConnected(),
        subscribers: connection.subscribers.size,
      });
    }

    return stats;
  }
}