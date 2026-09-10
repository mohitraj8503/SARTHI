'use client';

import { useRef, useEffect, useState, FormEvent } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { useChat, useLocalParticipant } from '@livekit/components-react';

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  isHost: boolean;
  chatDisabled: boolean;
  onChatDisabledToggle: () => void;
}

/**
 * ChatDrawer — right-side slide-in panel (desktop) / full-screen sheet (mobile).
 *
 * Uses LiveKit's useChat hook for real message delivery.
 * Host can disable chat for all students via the ⋯ menu in the header.
 */
export function ChatDrawer({ open, onClose, isHost, chatDisabled, onChatDisabledToggle }: ChatDrawerProps) {
  const { chatMessages, send, isSending } = useChat();
  const { localParticipant } = useLocalParticipant();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isNearBottom = useRef(true);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const checkScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const threshold = 30; // pixels
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    isNearBottom.current = atBottom;
  };

  // Auto-scroll to bottom on new messages if already near bottom
  useEffect(() => {
    if (isNearBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSend = (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;
    if (chatDisabled && !isHost) {
      alert('Chat is disabled');
      return;
    }
    send(text);
    setInput('');
  };

  return (
    <>
      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-40 w-full md:w-80 bg-slate-950 border-l border-white/8 flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-white">Chat</h2>
            {chatDisabled && (
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Disabled
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Host-only overflow menu */}
            {isHost && (
              <div className="relative">
                <button
                  onClick={() => setHeaderMenuOpen((v) => !v)}
                  className="text-xs px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
                  id="chat-menu-btn"
                >
                  ⋯
                </button>
                {headerMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 min-w-[180px] z-50">
                    <button
                      onClick={() => { onChatDisabledToggle(); setHeaderMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {chatDisabled ? 'Enable chat for students' : 'Disable chat for students'}
                    </button>
                  </div>
                )}
              </div>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors" id="chat-close-btn">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Message list */}
        <div
          ref={listRef}
          onScroll={checkScroll}
          className="flex-1 overflow-y-auto py-4 px-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10"
        >
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2 text-slate-600">
              <MessageSquare size={28} />
              <p className="text-sm">No messages yet — say hi!</p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isOwn = msg.from?.identity === localParticipant?.identity;
              const senderName = msg.from?.name || msg.from?.identity || 'Unknown';
              const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                    {!isOwn && (
                      <span className="text-xs text-slate-500 px-1">{senderName}</span>
                    )}
                    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                    }`}>
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-slate-600 px-1">{time}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/8">
          {chatDisabled && !isHost ? (
            <div className="w-full py-3 px-4 rounded-xl bg-slate-900 text-slate-600 text-sm text-center border border-white/5">
              Chat has been disabled by the host
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message everyone…"
                maxLength={500}
                className="flex-1 bg-slate-900 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                id="chat-input"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                id="chat-send-btn"
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
