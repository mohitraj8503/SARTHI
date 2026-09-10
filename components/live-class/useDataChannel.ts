'use client';

import { useDataChannel as useLiveKitDataChannel } from '@livekit/components-react';
import { useCallback, useRef } from 'react';

/**
 * useDataChannel wrapper
 *
 * Provides safe JSON parsing under a try/catch, logging warnings on malformed inputs,
 * and encapsulates stringifying payloads on transmit.
 */
export function useDataChannel<T>(topic: string, onMessage?: (payload: T, participantIdentity: string) => void) {
  const encoder = useRef(new TextEncoder());
  const decoder = useRef(new TextDecoder());

  const { send: lkSend, message } = useLiveKitDataChannel(topic, (msg) => {
    if (!onMessage) return;
    try {
      const text = decoder.current.decode(msg.payload);
      const parsed = JSON.parse(text) as T;
      if (msg.from) {
        onMessage(parsed, msg.from.identity);
      }
    } catch (e) {
      console.warn(`[useDataChannel] Failed to parse message on topic "${topic}":`, e);
    }
  });

  const send = useCallback(
    async (payload: T, options?: { reliable?: boolean }) => {
      try {
        const data = encoder.current.encode(JSON.stringify(payload));
        await lkSend(data, {
          reliable: options?.reliable ?? true,
        });
      } catch (e) {
        console.error(`[useDataChannel] Failed to send message on topic "${topic}":`, e);
      }
    },
    [lkSend, topic]
  );

  return { send, message };
}
