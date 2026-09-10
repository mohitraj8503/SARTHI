'use client';

/**
 * SocketInitializer.tsx
 * Invisible component that boots the socket connection when mounted.
 * Place in any layout to ensure the connection is established for that route group.
 */

import { useEffect } from 'react';
import { socketService } from '@/lib/realtime/socket-client';

export function SocketInitializer() {
  useEffect(() => {
    // Initialize and connect the socket
    const socket = socketService.connect();

    return () => {
      // Don't disconnect on route changes — keep the persistent connection
      // Only fully disconnect on unmount of the root layout
    };
  }, []);

  // Renders nothing — purely functional
  return null;
}
