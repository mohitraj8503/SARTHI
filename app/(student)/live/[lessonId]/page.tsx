'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  Send,
  Users,
  Hand,
  Clock,
  Heart,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AssignmentGatingOverlay from '@/components/assignments/AssignmentGatingOverlay';
import '@/app/(teacher)/teacher/live/classroom.css';

interface ChatMessage {
  id: string;
  message: string;
  createdAt: string;
  student: {
    name: string;
    role: string;
  };
}

export default function StudentLiveClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = (params?.lessonId as string) || '';

  // State Management
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [handRaiseId, setHandRaiseId] = useState<string | null>(null);
  const [showInfoPopover, setShowInfoPopover] = useState(false);

  // Floating reactions local preview
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number; scale: number }[]>([]);
  const nextReactionId = useRef(0);

  const lastChatTimeRef = useRef<string | null>(null);
  const attendanceActiveRef = useRef<string | null>(null);

  // Fetch Session Info (contains course/lesson metadata)
  const { data: sessionInfo, isLoading: isSessionLoading } = useQuery({
    queryKey: ['live-session-info', lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/live/session-info?lessonId=${lessonId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
    enabled: !!lessonId
  });

  // Fetch active YouTube video and live class details
  const { data: activeClassData, isLoading: isActiveLoading } = useQuery({
    queryKey: ['active-live-class', sessionInfo?.courseId],
    queryFn: async () => {
      if (!sessionInfo?.courseId) return null;
      const res = await fetch(`/api/student/live/active?courseId=${sessionInfo.courseId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data?.activeClass;
    },
    enabled: !!sessionInfo?.courseId,
    refetchInterval: 5000 // Poll active status every 5 seconds
  });

  // Gating check
  const isGated = sessionInfo?.isRestricted;

  // Attendance tracking
  useEffect(() => {
    if (activeClassData?.id && !attendanceActiveRef.current) {
      const activeId = activeClassData.id;
      attendanceActiveRef.current = activeId;
      
      fetch('/api/student/live/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveClassId: activeId, action: 'join' }),
      }).catch(console.error);

      // Check if student already raised hand
      fetch(`/api/live/hand-raise?liveClassId=${activeId}`)
        .then(res => res.json())
        .then(json => {
          const raised = json.data?.raisedHands || [];
          // Find if current student is in the list
          // We don't have user object directly, but we can verify if any matches user if we check handRaiseId on toggle
        })
        .catch(console.error);
    }

    return () => {
      if (attendanceActiveRef.current) {
        const id = attendanceActiveRef.current;
        attendanceActiveRef.current = null;
        fetch('/api/student/live/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ liveClassId: id, action: 'leave' }),
        }).catch(console.error);
      }
    };
  }, [activeClassData?.id]);

  // Heartbeat verification for gating / status validation
  useEffect(() => {
    if (!activeClassData?.id || !sessionInfo?.id) return;

    const heartbeat = async () => {
      try {
        const res = await fetch('/api/live/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: sessionInfo.courseId,
            sessionId: sessionInfo.id
          })
        });

        if (res.status === 403 || res.status === 409) {
          alert('Your enrollment status changed. Please contact support.');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('[Heartbeat] failed', error);
      }
    };

    heartbeat();
    const interval = setInterval(heartbeat, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeClassData?.id, sessionInfo?.id, sessionInfo?.courseId, router]);

  // Poll Chat messages
  useEffect(() => {
    if (!activeClassData?.id) return;
    
    let active = true;

    async function pollChat() {
      if (!active || !activeClassData?.id) return;
      try {
        const chatUrl = `/api/live/chat?liveClassId=${activeClassData.id}${lastChatTimeRef.current ? `&since=${lastChatTimeRef.current}` : ''}`;
        const res = await fetch(chatUrl);
        if (res.ok) {
          const json = await res.json();
          const newMsgs = json.data?.messages || [];
          if (newMsgs.length > 0) {
            setChatMessages(prev => {
              const all = [...prev, ...newMsgs];
              const seen = new Set();
              return all.filter(m => {
                if (seen.has(m.id)) return false;
                seen.add(m.id);
                return true;
              });
            });
            lastChatTimeRef.current = newMsgs[newMsgs.length - 1].createdAt;
          }
        }
      } catch (err) {
        console.error('Error fetching live chat:', err);
      }
      setTimeout(pollChat, 3000);
    }

    pollChat();
    return () => {
      active = false;
    };
  }, [activeClassData?.id]);

  // Handle Raise Hand toggle
  const handleRaiseHand = useCallback(async () => {
    if (!activeClassData?.id) return;
    
    try {
      const action = isHandRaised ? 'resolve' : 'raise';
      const body: any = {
        liveClassId: activeClassData.id,
        action
      };
      if (isHandRaised && handRaiseId) {
        body.handRaiseId = handRaiseId;
      }

      const res = await fetch('/api/live/hand-raise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const json = await res.json();
        if (action === 'raise') {
          setIsHandRaised(true);
          setHandRaiseId(json.data.id);
        } else {
          setIsHandRaised(false);
          setHandRaiseId(null);
        }
      }
    } catch (err) {
      console.error('Raise hand operation failed:', err);
    }
  }, [isHandRaised, handRaiseId, activeClassData?.id]);

  // Send Chat message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeClassData?.id || isGated) return;

    const messageContent = newMessage;
    setNewMessage('');

    try {
      const res = await fetch('/api/live/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveClassId: activeClassData.id,
          message: messageContent
        })
      });
      if (res.ok) {
        const json = await res.json();
        setChatMessages(prev => [...prev, json.data]);
      }
    } catch (e) {
      console.error('Failed to send chat message:', e);
    }
  };

  // Reactions simulation
  const handleSendReaction = (emoji: string) => {
    const id = nextReactionId.current++;
    const x = 10 + Math.random() * 80;
    const scale = 0.8 + Math.random() * 1.2;
    setReactions(prev => [...prev, { id, emoji, x, scale }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 4500);
  };

  if (isSessionLoading || isActiveLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] gap-12">
        <div className="relative">
          <div className="w-24 h-24 border border-white/5 rounded-[2.5rem] animate-pulse bg-white/[0.02]" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-3">
          <p className="text-white text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">Syncing Portal</p>
          <p className="text-white/20 text-[8px] font-bold uppercase tracking-widest">Connecting to classroom nodes</p>
        </div>
      </div>
    );
  }

  // Show waiting room if class isn't live yet
  if (!activeClassData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] p-8 text-center text-white">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/25 flex items-center justify-center mb-8 animate-bounce">
          <Clock size={36} className="text-indigo-400" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-wider mb-2 font-outfit">Waiting Room</h2>
        <p className="text-white/40 max-w-sm mb-8 text-sm font-medium leading-relaxed">
          The instructor has not started the broadcast yet. Please hold on; the player will load automatically.
        </p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl font-bold uppercase tracking-widest text-xs transition-all cursor-pointer"
        >
          Exit to Dashboard
        </button>
      </div>
    );
  }

  const youtubeVideoId = activeClassData.youtubeVideoId;

  return (
    <div className="w-full h-screen flex flex-col bg-[#111111] font-sans select-none text-white overflow-hidden relative">
      {/* Gating overlay for restricted students */}
      {isGated && (
        <AssignmentGatingOverlay 
          isRestricted={true}
          pendingCount={sessionInfo?.pendingCount || 0}
          courseId={sessionInfo?.courseId || ''}
        />
      )}

      {/* Header bar */}
      <header className="h-[50px] bg-[#0d0d0d] border-b border-[#2d2d2d] flex items-center justify-between px-4 z-50 text-white text-xs select-none">
        <div className="flex items-center gap-1.5 relative">
          <span className="font-bold text-white text-sm select-none">
            sarthi<span className="font-normal text-zinc-400 ml-1">live</span>
          </span>
          <div className="w-px h-3.5 bg-zinc-700 mx-2" />
          <button 
            onClick={() => setShowInfoPopover(!showInfoPopover)}
            className="flex items-center gap-1 hover:text-white text-zinc-400 transition-all font-semibold"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
            <span>Classroom Info</span>
            <ChevronDown size={12} />
          </button>

          {showInfoPopover && (
            <div className="absolute top-8 left-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-[100] p-4 min-w-[280px]">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Topic</p>
                  <p className="text-xs font-semibold">{activeClassData.title || sessionInfo?.lessonTitle}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Course</p>
                  <p className="text-xs font-semibold">{sessionInfo?.courseName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Status</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-bold text-emerald-400">Stream Connected</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/35 px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">LIVE BROADCAST</span>
          </div>

          <button 
            onClick={() => {
              if (confirm('Leave classroom?')) {
                router.push('/dashboard');
              }
            }}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Stream Player Panel */}
        <div className="flex-1 bg-black relative flex items-center justify-center p-0 overflow-hidden">
          {youtubeVideoId ? (
            <iframe 
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=0&rel=0&modestbranding=1&showinfo=0`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center text-white/30 space-y-2">
              <AlertTriangle className="mx-auto text-amber-500" size={32} />
              <p className="text-xs">Uplink initialized. Waiting for stream data...</p>
            </div>
          )}
        </div>

        {/* Right Panel: Chat & Hand-Raise */}
        <div className="w-[350px] border-l border-[#2d2d2d] bg-[#141416] flex flex-col">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-[#2d2d2d] bg-[#1a1a1c] flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Users size={12} className="text-blue-400" />
              Live Chat
            </span>
          </div>

          {/* Chat Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-white/20">
                <p className="text-xs">Welcome to the live chat!</p>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className="text-xs space-y-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className={cn(
                      "font-bold",
                      msg.student?.role === 'TEACHER' || msg.student?.role === 'ADMIN' ? "text-indigo-400 font-extrabold" : "text-zinc-400"
                    )}>
                      {msg.student?.name}
                    </span>
                    {(msg.student?.role === 'TEACHER' || msg.student?.role === 'ADMIN') && (
                      <span className="text-[8px] px-1 bg-indigo-500/20 text-indigo-300 rounded font-semibold uppercase">
                        Instructor
                      </span>
                    )}
                  </div>
                  <p className="text-white/80 break-words font-medium">{msg.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Form / Input */}
          <form onSubmit={handleSendChat} className="p-3.5 border-t border-[#2d2d2d] bg-[#18181a] flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={isGated ? "Chat is disabled" : "Ask a question..."}
              disabled={isGated}
              className="flex-1 bg-[#222224] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isGated}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Reactions Toolbar */}
      <div className="absolute bottom-16 left-6 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/5 shadow-2xl z-40">
        {['👏', '👍', '❤️', '🎉', '💡', '❓'].map(emoji => (
          <button 
            key={emoji}
            onClick={() => handleSendReaction(emoji)}
            className="hover:scale-125 transition-transform duration-100 p-1 text-base cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Raised Hand Button (Footer overlay style) */}
      <div className="absolute bottom-6 right-6 z-40">
        <button
          onClick={handleRaiseHand}
          className={cn(
            "h-12 px-6 rounded-full font-bold uppercase text-xs tracking-wider flex items-center gap-2 shadow-2xl transition-all cursor-pointer",
            isHandRaised 
              ? "bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20 scale-[1.03]" 
              : "bg-zinc-800 hover:bg-zinc-700 text-white shadow-black/40"
          )}
        >
          <Hand size={14} className={cn(isHandRaised && "animate-bounce")} />
          <span>{isHandRaised ? 'Lower Hand' : 'Raise Hand'}</span>
        </button>
      </div>

      {/* Cinematic Reactions floating space */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <AnimatePresence>
          {reactions.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: '110vh', x: `${r.x}vw`, scale: 0.2, rotate: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: '-10vh', 
                x: `${r.x + (Math.random() * 20 - 10)}vw`, 
                scale: r.scale,
                rotate: Math.random() * 360 
              }}
              transition={{ duration: 4, ease: "circOut" }}
              className="absolute text-4xl drop-shadow-lg"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
