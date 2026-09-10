"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, Paperclip, Smile, MessageSquare, ChevronLeft } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";

interface Participant {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  isYou?: boolean;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  senderImage?: string;
  isOwn: boolean;
  isRead: boolean;
  createdAt: string | Date;
  reactions?: Array<{
    type: string;
    count: number;
    me: boolean;
  }>;
}

interface ChatAreaProps {
  conversationId?: string;
  participants: Participant[];
  messages: Message[];
  onSendMessage: (content: string) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  isSending?: boolean;
  typingUsers?: string[];
  onTyping?: () => void;
  onBack?: () => void;
}

export function ChatArea({
  conversationId,
  participants,
  messages,
  onSendMessage,
  onLoadMore,
  isLoading,
  isSending,
  typingUsers = [],
  onTyping,
  onBack,
}: ChatAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const otherParticipant = participants.find((p) => !p.isYou);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isSending) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Empty state - no conversation selected
  if (!conversationId) {
    return (
      <div className="flex-1 bg-transparent flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-200 animate-float">
          <MessageSquare className="w-12 h-12 text-slate-400 stroke-[1.5]" />
        </div>
        <div className="space-y-3">
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight font-outfit leading-tight">
            Faculty Messenger
            </h3>
            <p className="text-[12px] font-medium text-slate-500 max-w-xs leading-relaxed mx-auto uppercase tracking-widest">
            Select a mentor from the sidebar to start a conversation and get expert support.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-transparent flex flex-col h-full relative">
      {/* Header */}
      <div className="px-4 lg:px-10 py-4 sm:py-6 bg-white border-b border-slate-200/80 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 sm:gap-5">
          {onBack && (
            <button 
              onClick={onBack}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="relative shrink-0">
            <UserAvatar 
              user={{
                name: otherParticipant?.name || 'Program Lead',
                avatar_url: otherParticipant?.image
              }} 
              size="sm" 
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22C55E] border-4 border-white rounded-full shadow-sm" />
          </div>
 
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-black text-[18px] text-slate-800 tracking-tight uppercase font-outfit">
                {otherParticipant?.name || otherParticipant?.email || "Academic Mentor"}
              </h3>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[2px]">{otherParticipant?.role || 'Program Lead'}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 lg:px-10 py-6 lg:py-10 space-y-6 lg:space-y-10 relative z-10 student-scrollbar"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-[#174F3A]/10 border-t-[#174F3A] rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-50">
            <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-200 flex items-center justify-center">
              <Smile className="w-8 h-8 text-slate-400 stroke-[1.5]" />
            </div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[3px]">No messages here yet</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-4 text-[10px] text-[#174F3A] font-black uppercase tracking-[2px] bg-slate-50 p-4 rounded-[1.5rem] border border-slate-200 shadow-none self-start animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#174F3A] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#174F3A] rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1.5 h-1.5 bg-[#174F3A] rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
                <span>{typingUsers[0]} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 sm:p-8 bg-transparent relative z-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <div className="flex items-end gap-2 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-[2rem] border border-slate-200 focus-within:border-[#174F3A]/30 transition-all shadow-lg">
            <button
              type="button"
              className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-[#174F3A] transition-all"
            >
              <Paperclip className="w-5 h-5 stroke-[1.5]" />
            </button>

            <textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                onTyping?.();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 px-2 py-3 bg-transparent text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none font-medium min-h-[44px] max-h-[150px]"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 disabled:opacity-20 disabled:grayscale transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

