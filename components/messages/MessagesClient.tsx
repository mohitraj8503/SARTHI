"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ConversationList } from "./ConversationList";
import { ChatArea } from "./ChatArea";
import { NewConversationModal } from "./NewConversationModal";
import { useMessages, useTypingIndicator } from "@/hooks/use-messages";
import { Bell, MessageSquare, Users, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Conversation {
  id: string;
  type: string;
  title?: string;
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

export function MessagesClient() {
  const searchParams = useSearchParams();
  const openConversationId = searchParams.get("openConversationId");

  const [conversations, setConversations] = useState<any[]>([]);
  const [stats, setStats] = useState({ instructors: 0, active: 0, unread: 0 });
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(
    openConversationId || undefined
  );
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState<boolean | null>(null);
  const [hasActiveBatchMembership, setHasActiveBatchMembership] = useState(false);

  const {
    messages,
    isLoading: isLoadingMessages,
    isConnected,
    fetchMessages,
    sendMessage,
    markAsRead,
    typingUsers,
    handleTextChange,
  } = useMessages(selectedConversationId);

  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const [convRes, enrollRes] = await Promise.all([
        fetch("/api/messages/conversations"),
        fetch("/api/student/my-courses"),
      ]);

      const convData = await convRes.json();
      const enrollData = await enrollRes.json();

      setConversations(convData.conversations || []);
      setStats(convData.stats || { instructors: 0, active: 0, unread: 0 });
      setHasEnrolledCourses(enrollData.courses && enrollData.courses.length > 0);
      // Allow access if intern has an active batch (bypasses course enrollment lock)
      setHasActiveBatchMembership(!!convData.isActiveMember);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Auto-select conversation from URL param (e.g. from "Message Mentor" redirect)
  useEffect(() => {
    if (openConversationId && conversations.length > 0) {
      setSelectedConversationId(openConversationId);
    }
  }, [openConversationId, conversations.length]);

  useEffect(() => {
    if (selectedConversationId && !selectedConversationId.startsWith('new-')) {
      fetchMessages();
      markAsRead();
    }
  }, [selectedConversationId, fetchMessages, markAsRead]);

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
  }, []);

  const handleNewConversation = useCallback(() => {
    setIsNewModalOpen(true);
  }, []);

  const handleSelectContact = useCallback(async (contactId: string) => {
    try {
      const response = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: contactId }),
      });

      const data = await response.json();

      if (data.conversationId) {
        await fetchConversations();
        setSelectedConversationId(data.conversationId);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  }, [fetchConversations]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedConversationId) return;

      // Handle virtual conversation initiation
      if (selectedConversationId.startsWith('new-')) {
        const targetUserId = selectedConversationId.replace('new-', '');
        try {
            const res = await fetch("/api/messages/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId }),
            });
            const data = await res.json();
            if (data.conversationId) {
                // Now send the message to the real conversation
                const message = await sendMessage(content, data.conversationId);
                if (message) {
                    await fetchConversations();
                    setSelectedConversationId(data.conversationId);
                }
            }
        } catch (error) {
            console.error("Failed to initiate conversation:", error);
        }
        return;
      }

      const message = await sendMessage(content);
      if (message) {
        fetchConversations();
      }
    },
    [selectedConversationId, sendMessage, fetchConversations]
  );

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  // Loading State
  if (hasEnrolledCourses === null && isLoadingConversations) {
    return (
        <div className="h-screen w-full bg-[#FAF9F6] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#174F3A]/10 border-t-[#174F3A] rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">Initializing Support Engine...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-transparent overflow-hidden">
      {/* Header */}
      <div className="px-4 lg:px-10 pt-4 lg:pt-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6 border-b border-slate-200/80 pb-6">
            <div className="space-y-1.5 text-left relative">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-1.5 w-5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-[0.25em]">COMMUNITY HUB</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
                    COMMUNITY <span className="text-emerald-500">CHAT</span>
                </h1>
                <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
                    Direct lines to your mentor &amp; faculty
                </p>
            </div>
            <div className="hidden lg:flex items-center gap-4">
                <Link
                    href="/dashboard/courses"
                    className="px-8 py-3 bg-[#174F3A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#174F3A]/10 hover:scale-105 transition-all flex items-center gap-2"
                >
                    View Courses <ArrowRight size={14} />
                </Link>
            </div>
        </header>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-[500px] h-[calc(100vh-140px)] lg:h-[calc(100vh-180px)] overflow-hidden relative p-4 lg:p-10 pt-4 sm:pt-6 gap-4 lg:gap-8">
        {/* Enrollment Lock Overlay — shown only if neither enrolled in courses NOR an active intern */}
        {hasEnrolledCourses === false && !hasActiveBatchMembership && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md" />
            <div className="relative max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-200/80 text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-[#174F3A]/5 rounded-[2rem] flex items-center justify-center mx-auto">
                <Lock className="w-10 h-10 text-[#174F3A]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Access Restricted</h2>
                <p className="text-gray-400 font-medium text-sm leading-relaxed">
                  You must be enrolled in at least one course or an active internship to communicate with our faculty.
                </p>
              </div>
              <Link
                href="/courses"
                className="flex items-center justify-center gap-3 w-full py-5 bg-[#174F3A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[3px] shadow-xl shadow-[#174F3A]/20 hover:scale-105 transition-all"
              >
                Purchase Course <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        <div className={cn(
          "flex-1 flex bg-white rounded-3xl sm:rounded-[3rem] overflow-hidden border border-slate-200/80 shadow-sm",
          hasEnrolledCourses === false && !hasActiveBatchMembership && "blur-xl grayscale pointer-events-none opacity-20"
        )}>
          {/* Left: Conversation List */}
          <div className={cn(
            "w-full md:w-96 border-r border-slate-100",
            selectedConversationId && "hidden md:block"
          )}>
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversationId}
              onSelect={handleSelectConversation}
              onNewConversation={handleNewConversation}
              isLoading={isLoadingConversations}
            />
          </div>

          {/* Right: Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col min-w-0 bg-transparent",
            !selectedConversationId && "hidden md:flex"
          )}>
            <ChatArea
              conversationId={selectedConversationId}
              participants={
                selectedConversation?.participants.map((p) => ({
                  ...p,
                  isYou: false,
                })) || []
              }
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoadingMessages}
              typingUsers={typingUsers}
              onTyping={handleTextChange}
              onBack={() => setSelectedConversationId(undefined)}
            />
          </div>
        </div>
      </div>

      <NewConversationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
    return (
        <div 
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all"
            style={{ borderTop: `4px solid ${color}` }}
        >
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}10` }}>
                    <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-gray-900 leading-none">{value}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{title}</p>
                </div>
            </div>
        </div>
    );
}

