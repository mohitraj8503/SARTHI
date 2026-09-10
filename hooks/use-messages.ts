"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { useSocket } from "@/lib/realtime/socket-client";

interface UseMessagesOptions {
  conversationId?: string;
  onNewMessage?: (message: any) => void;
}

export function useSSE(options: UseMessagesOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const eventSource = new EventSource("/api/messages/stream");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.addEventListener("message:new", (event) => {
      const data = JSON.parse(event.data);
      setLastEvent({ type: "message:new", data });
      options.onNewMessage?.(data);
    });

    eventSource.addEventListener("typing", (event) => {
      const data = JSON.parse(event.data);
      setLastEvent({ type: "typing", data });
    });

    eventSource.addEventListener("connected", (event) => {
      const data = JSON.parse(event.data);
      console.log("SSE Connected:", data);
    });

    let reconnectDelay = 1000;

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      
      // Exponential backoff for reconnection
      const delay = Math.min(reconnectDelay * 2, 30000); // Max 30 seconds
      reconnectDelay = delay;
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          // Trigger a re-render to reconnect
          setLastEvent({ type: "reconnect", timestamp: Date.now() });
        }
      }, delay);
    };

    // Cleanup function to prevent memory leaks
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [options]);

  return { isConnected, lastEvent };
}

export function useTypingIndicator(conversationId?: string) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendTypingStatus = useCallback(async (typing: boolean) => {
    if (!conversationId) return;
    
    try {
      await fetch("/api/messages/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, isTyping: typing }),
      });
    } catch (error) {
      console.error("Failed to send typing status:", error);
    }
  }, [conversationId]);

  const handleTextChange = useCallback(() => {
    setIsTyping(true);
    sendTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 2000);
  }, [sendTypingStatus]);

  // Note: Polling removed in favor of real-time SSE events in useMessages
  return { isTyping, typingUsers, handleTextChange };
}

export function useMessages(conversationId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const sseOptions = useMemo(() => ({
    conversationId,
    onNewMessage: (message: any) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    },
  }), [conversationId]);
  
  const { isConnected: isSSEConnected, lastEvent: lastSSEEvent } = useSSE(sseOptions);
  const socket = useSocket();

  // Unified event handler for SSE and Socket.io
  const handleRealtimeEvent = useCallback((type: string, data: any) => {
    if (!data || data.conversationId !== conversationId) return;

    if (type === "message:new") {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }

    if (type === "message:update") {
      setMessages((prev) => prev.map((m) => m.id === data.id ? { ...m, content: data.content } : m));
    }

    if (type === "message:read") {
      setMessages((prev) => prev.map((m) => m.isOwn ? { ...m, isRead: true } : m));
    }

    if (type === "typing") {
      const { userId, isTyping } = data;
      setTypingUsers((prev) => {
        if (isTyping) {
          if (prev.includes(userId)) return prev;
          return [...prev, userId];
        } else {
          return prev.filter((id) => id !== userId);
        }
      });
    }
  }, [conversationId]);

  // Listen to SSE events
  useEffect(() => {
    if (lastSSEEvent) {
      handleRealtimeEvent(lastSSEEvent.type, lastSSEEvent.data);
    }
  }, [lastSSEEvent, handleRealtimeEvent]);

  // Listen to Socket.io events
  useEffect(() => {
    if (!socket) return;

    socket.on("message:new", (data) => handleRealtimeEvent("message:new", data));
    socket.on("message:update", (data) => handleRealtimeEvent("message:update", data));
    socket.on("message:read", (data) => handleRealtimeEvent("message:read", data));
    socket.on("typing", (data) => handleRealtimeEvent("typing", data));

    return () => {
      socket.off("message:new");
      socket.off("message:update");
      socket.off("message:read");
      socket.off("typing");
    };
  }, [socket, handleRealtimeEvent]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    setError(null);
    setHasMore(true);

    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/messages?limit=30`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || `HTTP ${response.status}`);
        return;
      }

      const data = await response.json();
      setMessages(data.messages || []);
      if ((data.messages || []).length < 30) {
        setHasMore(false);
      }
    } catch (err) {
      setError("Failed to load messages: Network error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // ── Polling fallback (5s) ─────────────────────────────────────────────────
  // SSE connections are in-memory and reset on HMR / serverless cold-starts,
  // so the real-time push is unreliable in dev and on edge/serverless.
  // Poll every 5 seconds as a reliable fallback so messages always appear.
  const isFetchingRef = useRef(false);
  useEffect(() => {
    if (!conversationId) return;

    const poll = async () => {
      // Skip if tab is hidden or a fetch is already in-flight
      if (document.visibilityState === "hidden" || isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        const response = await fetch(
          `/api/messages/conversations/${conversationId}/messages?limit=30`
        );
        if (response.ok) {
          const data = await response.json();
          const fresh = (data.messages || []) as any[];
          setMessages((prev) => {
            // Only update if we have new messages (compare latest id)
            if (fresh.length === 0) return prev;
            const prevLastId = prev[prev.length - 1]?.id;
            const freshLastId = fresh[fresh.length - 1]?.id;
            if (prevLastId === freshLastId) return prev; // no change
            return fresh;
          });
        }
      } catch {
        // Silent — primary fetch handles error state
      } finally {
        isFetchingRef.current = false;
      }
    };

    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);
  // ─────────────────────────────────────────────────────────────────────────


  // Infinite scroll: fetch older messages
  const fetchOlderMessages = useCallback(async () => {
    if (!conversationId || messages.length === 0 || isPaginationLoading || !hasMore) return;

    setIsPaginationLoading(true);
    const oldestMessage = messages[0];
    const beforeTime = oldestMessage.createdAt;

    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/messages?before=${encodeURIComponent(beforeTime)}&limit=30`);
      if (response.ok) {
        const data = await response.json();
        const older = data.messages || [];
        if (older.length < 30) {
          setHasMore(false);
        }
        if (older.length > 0) {
          setMessages((prev) => [...older, ...prev]);
        }
      }
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setIsPaginationLoading(false);
    }
  }, [conversationId, messages, isPaginationLoading, hasMore]);

  // Unified send message function supporting replies and attachments
  const sendMessage = useCallback(async (content: string, replyTo?: any, attachments?: any[]) => {
    const sanitizedContent = DOMPurify.sanitize(content.trim());
    if (!conversationId || (!sanitizedContent && (!attachments || attachments.length === 0))) return;

    // Standardize content payload structure
    let finalPayloadText = sanitizedContent;
    if (replyTo || (attachments && attachments.length > 0)) {
      finalPayloadText = JSON.stringify({
        text: sanitizedContent,
        replyTo: replyTo ? {
          messageId: replyTo.id,
          senderName: replyTo.senderName,
          content: replyTo.content
        } : undefined,
        attachments: attachments || []
      });
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      content: finalPayloadText,
      senderId: "me",
      senderName: "You",
      isOwn: true,
      isRead: false,
      status: "sending",
      createdAt: new Date().toISOString()
    };

    // Optimistically insert message
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: finalPayloadText }),
      });

      if (!response.ok) {
        throw new Error("Failed to send");
      }

      const data = await response.json();

      // Replace optimistic message with actual message from server
      setMessages((prev) => 
        prev.map((m) => m.id === tempId ? { ...data.message, status: "sent" } : m)
      );
      return data.message;
    } catch (err) {
      setMessages((prev) => 
        prev.map((m) => m.id === tempId ? { ...m, status: "failed" } : m)
      );
      console.error(err);
      return null;
    }
  }, [conversationId]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newText: string) => {
    if (!conversationId || !messageId) return;

    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newText }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => prev.map((m) => m.id === messageId ? data.message : m));
      }
    } catch (err) {
      console.error("Failed to edit message:", err);
    }
  }, [conversationId]);

  // Delete message (for everyone)
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!conversationId || !messageId) return;

    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/messages/${messageId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setMessages((prev) => 
          prev.map((m) => m.id === messageId ? { 
            ...m, 
            content: JSON.stringify({ text: "This message was deleted", deletedAt: new Date().toISOString() }) 
          } : m)
        );
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  }, [conversationId]);

  // Pin/Unpin message
  const togglePinMessage = useCallback(async (messageId: string, isPinned: boolean) => {
    if (!conversationId || !messageId) return;

    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => prev.map((m) => m.id === messageId ? data.message : m));
      }
    } catch (err) {
      console.error("Failed to toggle pin message:", err);
    }
  }, [conversationId]);

  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      await fetch(`/api/messages/conversations/${conversationId}/read`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, [conversationId]);
  
  const addReaction = useCallback(async (messageId: string, reactionType: string) => {
    if (!conversationId || !messageId) return;
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => prev.map((m) => {
          if (m.id !== messageId) return m;
          const currentReactions = m.reactions || [];
          let nextReactions = [...currentReactions];
          if (data.reaction.me) {
            const existingIdx = nextReactions.findIndex(r => r.userId === "me" && r.type === reactionType);
            if (existingIdx === -1) {
              nextReactions.push({ id: Math.random().toString(), userId: "me", userName: "You", type: reactionType });
            }
          } else {
            nextReactions = nextReactions.filter(r => !(r.userId === "me" && r.type === reactionType));
          }
          return { ...m, reactions: nextReactions };
        }));
      }
    } catch (err) {
      console.error("Failed to add reaction:", err);
    }
  }, [conversationId]);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleTextChange = useCallback(() => {
    if (!conversationId) return;

    fetch("/api/messages/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, isTyping: true }),
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      fetch("/api/messages/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, isTyping: false }),
      });
    }, 2000);
  }, [conversationId]);

  return {
    messages,
    isLoading,
    isPaginationLoading,
    hasMore,
    error,
    isConnected: isSSEConnected || socket?.connected,
    fetchMessages,
    fetchOlderMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    togglePinMessage,
    addReaction,
    markAsRead,
    typingUsers,
    handleTextChange,
  };
}
