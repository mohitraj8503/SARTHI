"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Plus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";

interface Conversation {
  id: string;
  type: string;
  title?: string;
  courseTitle?: string;
  participants: Array<{
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  }>;
  lastMessage: {
    id: string;
    content: string;
    senderName: string;
    createdAt: string | Date;
  } | null;
  unreadCount: number;
  updatedAt: string | Date;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNewConversation,
  isLoading,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return conv.participants.some(
      (p) =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower)
    );
  });

  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full md:w-[400px] bg-white border-r border-slate-200/80 flex flex-col h-full">
        <div className="p-8 border-b border-slate-100">
          <div className="h-8 w-40 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#174F3A]/10 border-t-[#174F3A] rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[400px] bg-white border-r border-slate-200/80 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight font-outfit">Messages</h2>
          <button
            onClick={onNewConversation}
            className="p-3 bg-[#174F3A] text-white rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#174F3A]/20 active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#174F3A] transition-colors" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border border-slate-200 focus:border-[#174F3A] rounded-xl sm:rounded-[1.25rem] text-[12px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all shadow-none"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-8 student-scrollbar">
        {filteredConversations.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm">
              <MessageSquare className="w-8 h-8 text-gray-200 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
                <p className="text-[12px] font-black uppercase tracking-[2px] text-gray-900">No active conversations</p>
                <p className="text-[10px] font-medium text-gray-400">Your chat history with mentors will appear here.</p>
            </div>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const otherParticipant = conv.participants[0];
            const isSelected = selectedId === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "w-full p-5 rounded-[2rem] text-left transition-all duration-300 group relative overflow-hidden",
                  isSelected
                    ? "bg-slate-100/80 shadow-none border border-slate-200"
                    : "bg-transparent border-transparent hover:bg-slate-50"
                )}
              >
                {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_#10b981]" />}
                
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <UserAvatar 
                      user={{
                        name: otherParticipant?.name,
                        avatar_url: otherParticipant?.image
                      }} 
                      size="sm" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22C55E] border-4 border-white rounded-full shadow-sm" />
                  </div>
 
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={cn(
                        "font-black text-[14px] truncate uppercase font-outfit tracking-tight",
                        isSelected ? "text-slate-800" : "text-slate-700"
                      )}>
                        {otherParticipant?.name || otherParticipant?.email || "Lead Mentor"}
                      </h3>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest shrink-0">
                        {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                      </span>
                    </div>
                    
                    {/* Course Title Badge-style label */}
                    <div className="mb-2">
                        <span className="text-[9px] font-black uppercase tracking-[1px] text-[#174F3A] bg-[#174F3A]/10 px-2 py-0.5 rounded-lg">
                            {conv.courseTitle || 'Academy Mentor'}
                        </span>
                    </div>
 
                    <p className={cn(
                      "text-[12px] truncate leading-tight font-medium",
                      conv.unreadCount > 0 ? "font-black text-slate-900" : "text-slate-500"
                    )}>
                      {conv.lastMessage?.content || (conv.isExisting ? "Signal channel established" : "Start conversation")}
                    </p>
                  </div>
 
                  {/* Unread dot */}
                  {conv.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-[#D4915C] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

