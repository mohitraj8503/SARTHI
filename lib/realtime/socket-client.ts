'use client';

/**
 * socket-client.ts
 * Browser-side Socket.IO client singleton.
 * Handles connection, authentication, auto-reconnect, and event subscriptions.
 */

import { io, Socket } from 'socket.io-client';

interface SocketService {
  socket: Socket | null;
  connect: () => Socket;
  get: () => Socket | null;
  disconnect: () => void;
}

// Prevent multiple instances during hot reload (Next.js dev)
declare global {
  var __socketInstance: Socket | null | undefined;
}

function createSocketClient(): Socket {
  const URL = process.env.NEXT_PUBLIC_APP_URL || '';

  const socket = io(URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,   // sends the tt_session cookie automatically
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    autoConnect: true,
  });

  socket.on('connect', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Socket] Connected:', socket.id);
    }
  });

  socket.on('disconnect', (reason) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Socket] Disconnected:', reason);
    }
    // If the server kicked us, reconnect manually
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });

  socket.on('connect_error', (err) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Socket] Connection error:', err.message);
    }
  });

  return socket;
}

export const socketService: SocketService = {
  socket: null,

  connect() {
    // SSR guard
    if (typeof window === 'undefined') {
      return {} as Socket;
    }

    // Return existing instance in dev to prevent hot-reload duplication
    if (process.env.NODE_ENV !== 'production') {
      if (!global.__socketInstance) {
        global.__socketInstance = createSocketClient();
      }
      this.socket = global.__socketInstance;
      return this.socket!;
    }

    if (!this.socket) {
      this.socket = createSocketClient();
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  },

  get() {
    return this.socket;
  },

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    if (process.env.NODE_ENV !== 'production') {
      global.__socketInstance = null;
    }
  },
};

/**
 * React hook for using the socket connection.
 * Connects on mount, returns the socket instance.
 */
export function useSocket(): Socket | null {
  // Only usable in components with useEffect — returns the connected socket
  if (typeof window === 'undefined') return null;
  return socketService.connect();
}
