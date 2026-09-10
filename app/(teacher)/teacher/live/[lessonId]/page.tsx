'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  X, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Users, 
  Heart, 
  ShieldAlert, 
  MoreHorizontal, 
  Radio,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import '@/app/(teacher)/teacher/live/classroom.css';

interface RaisedHand {
  id: string;
  raisedAt: string;
  student: {
    id: string;
    name: string;
  };
}

interface ChatMessage {
  id: string;
  message: string;
  createdAt: string;
  student: {
    name: string;
    role: string;
  };
}

export default function TeacherLiveStudioPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = (params?.lessonId as string) || '';

  // State Management
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  
  // Media capture & WebSockets
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [streamStats, setStreamStats] = useState({
    chunksSent: 0,
    bytesSent: 0,
    startTime: 0,
    fps: 30,
    bitrate: '3000 kbps'
  });

  // DB Sync features: Chat & Raised Hands
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const lastChatTimeRef = useRef<string | null>(null);

  // Fetch Session Info
  const { data: sessionInfo, isLoading: isSessionLoading } = useQuery({
    queryKey: ['live-session-teacher-yt', lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/live/session-info?lessonId=${lessonId}`);
      if (!res.ok) throw new Error('Failed to load session');
      const json = await res.json();
      return json.data;
    }
  });

  // Init local camera stream on mount
  useEffect(() => {
    async function initCamera() {
      try {
        setDeviceError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, frameRate: 30 },
          audio: true
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error('Camera capture failed:', err);
        setDeviceError('Camera/Microphone permissions are blocked or unavailable.');
      }
    }
    initCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Toggle Video / Mic locally
  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  // Poll Chat & Raised Hands
  useEffect(() => {
    let active = true;
    
    async function poll() {
      if (!active) return;
      try {
        // Chat
        const chatUrl = `/api/live/chat?liveClassId=${lessonId}${lastChatTimeRef.current ? `&since=${lastChatTimeRef.current}` : ''}`;
        const chatRes = await fetch(chatUrl);
        if (chatRes.ok) {
          const chatJson = await chatRes.json();
          const newMsgs = chatJson.data?.messages || [];
          if (newMsgs.length > 0) {
            setChatMessages(prev => {
              const all = [...prev, ...newMsgs];
              // De-duplicate
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

        // Hands
        const handRes = await fetch(`/api/live/hand-raise?liveClassId=${lessonId}`);
        if (handRes.ok) {
          const handJson = await handRes.json();
          setRaisedHands(handJson.data?.raisedHands || []);
        }
      } catch (err) {
        console.error('Error polling chat/hands:', err);
      }
      setTimeout(poll, 3000);
    }

    poll();
    return () => {
      active = false;
    };
  }, [lessonId]);

  // Start Broadcast
  const handleStartBroadcast = async () => {
    try {
      setDeviceError(null);
      // 1. Post to live API start
      const startRes = await fetch(`/api/teacher/live/${lessonId}/start`, {
        method: 'POST'
      });

      if (!startRes.ok) {
        const errJson = await startRes.json();
        throw new Error(errJson.error || 'Failed to start stream backend configuration');
      }

      const startData = await startRes.json();
      const { wsUrl } = startData.data;

      // 2. Connect WebSocket
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[Broadcast WS] Connection established');
        setIsBroadcasting(true);
        setStreamStats({
          chunksSent: 0,
          bytesSent: 0,
          startTime: Date.now(),
          fps: 30,
          bitrate: '3000 kbps'
        });

        // 3. Start MediaRecorder streaming
        if (streamRef.current) {
          const options = { mimeType: 'video/webm;codecs=vp8,opus' };
          const mediaRecorder = new MediaRecorder(streamRef.current, options);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
              ws.send(event.data);
              setStreamStats(prev => ({
                ...prev,
                chunksSent: prev.chunksSent + 1,
                bytesSent: prev.bytesSent + event.data.size
              }));
            }
          };

          // Capture in 1 second chunks
          mediaRecorder.start(1000);
        }
      };

      ws.onerror = (err) => {
        console.error('[Broadcast WS] Error:', err);
        setDeviceError('Ingestion server connection lost.');
      };

      ws.onclose = () => {
        console.log('[Broadcast WS] Closed');
        setIsBroadcasting(false);
      };

    } catch (err: any) {
      console.error('Failed to start broadcast:', err);
      setDeviceError(err.message || 'Stream setup failed.');
    }
  };

  // End Broadcast
  const handleEndBroadcast = async () => {
    // Stop Recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    // Close WS
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsBroadcasting(false);

    try {
      await fetch(`/api/teacher/live/${lessonId}/end`, {
        method: 'POST'
      });
      router.push('/teacher/dashboard');
    } catch (e) {
      console.error('Error ending class:', e);
      router.push('/teacher/dashboard');
    }
  };

  // Resolve Raised Hand
  const handleResolveHand = async (handRaiseId: string) => {
    try {
      await fetch('/api/live/hand-raise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveClassId: lessonId,
          action: 'resolve',
          handRaiseId
        })
      });
      setRaisedHands(prev => prev.filter(h => h.id !== handRaiseId));
    } catch (e) {
      console.error('Failed to resolve hand raise:', e);
    }
  };

  // Resolve All Hands
  const handleResolveAllHands = async () => {
    try {
      await fetch('/api/live/hand-raise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveClassId: lessonId,
          action: 'resolve'
        })
      });
      setRaisedHands([]);
    } catch (e) {
      console.error('Failed to resolve all hands:', e);
    }
  };

  // Send Chat message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage;
    setNewMessage('');

    try {
      const res = await fetch('/api/live/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveClassId: lessonId,
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

  if (isSessionLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#111111] gap-12">
        <div className="w-10 h-10 border border-white/10 border-t-white rounded-full animate-spin" />
        <p className="text-white/40 text-[10px] font-medium uppercase tracking-[0.25em]">Loading Studio Setup...</p>
      </div>
    );
  }

  // Format Elapsed Time
  const getElapsedTimeString = () => {
    if (!isBroadcasting || streamStats.startTime === 0) return '00:00:00';
    const seconds = Math.floor((Date.now() - streamStats.startTime) / 1000);
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#111111] font-sans select-none text-white overflow-hidden">
      {/* Top Header */}
      <header className="h-[50px] bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-black text-white tracking-wider font-sans uppercase">
            SARTHI Live Studio
          </span>
          <div className="h-3 w-px bg-white/15" />
          <span className="text-xs text-white/50 truncate max-w-[200px]">
            {sessionInfo?.lessonTitle || 'Live Broadcast'}
          </span>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-3">
          {isBroadcasting ? (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">LIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700 px-3 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-zinc-500" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">OFFLINE</span>
            </div>
          )}
          
          <button 
            onClick={() => router.push('/teacher/dashboard')}
            className="text-xs text-white/40 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
          >
            <X size={14} />
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Video Preview Monitor & Stats */}
        <div className="flex-1 flex flex-col bg-[#0f0f10] p-4 gap-4 overflow-y-auto">
          {deviceError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span>{deviceError}</span>
            </div>
          )}

          {/* Monitor Screen Frame */}
          <div className="relative flex-1 bg-black rounded-xl overflow-hidden border border-white/5 flex items-center justify-center shadow-inner min-h-[300px]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                isVideoOff ? "opacity-0" : "opacity-100"
              )}
            />

            {isVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-zinc-950">
                <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-500 uppercase">
                  {sessionInfo?.instructorName?.[0] || 'T'}
                </div>
                <span className="text-zinc-600 text-xs font-semibold uppercase tracking-wider mt-4">Camera Disabled</span>
              </div>
            )}

            {/* In-stream Info */}
            <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-xs flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-white/95">{sessionInfo?.instructorName || 'Teacher Studio'}</span>
            </div>
          </div>

          {/* Broadcast Stats Card */}
          <div className="bg-[#161618] border border-white/5 rounded-xl p-4 flex flex-wrap gap-6 items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Uplink Status</span>
              <span className="text-xs font-bold text-white/90">
                {isBroadcasting ? 'Streaming to RTMP relay' : 'Ready to start'}
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Active Duration</span>
              <span className="text-xs font-bold text-white/90">
                {getElapsedTimeString()}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Data Transferred</span>
              <span className="text-xs font-bold text-white/90">
                {(streamStats.bytesSent / (1024 * 1024)).toFixed(2)} MB ({streamStats.chunksSent} packets)
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Target Bitrate</span>
              <span className="text-xs font-bold text-white/90">{streamStats.bitrate}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interaction Dashboard (Chat, Raised Hands) */}
        <div className="w-[380px] border-l border-[#2a2a2a] bg-[#141416] flex flex-col">
          {/* Raised Hands Section */}
          <div className="flex-1 flex flex-col border-b border-[#2a2a2a] min-h-[220px] overflow-hidden">
            <div className="p-3 border-b border-[#2a2a2a] bg-[#1a1a1c] flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Raised Hands ({raisedHands.length})
              </span>
              {raisedHands.length > 0 && (
                <button 
                  onClick={handleResolveAllHands}
                  className="text-[10px] text-white/50 hover:text-white font-bold uppercase transition-all bg-white/5 px-2 py-1 rounded"
                >
                  Resolve All
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <AnimatePresence initial={false}>
                {raisedHands.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-white/20 p-4">
                    <CheckCircle2 size={32} className="stroke-1 mb-2" />
                    <p className="text-xs font-medium">No active student requests</p>
                  </div>
                ) : (
                  raisedHands.map(hand => (
                    <motion.div
                      key={hand.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-white/90">{hand.student?.name}</p>
                        <p className="text-[9px] text-white/40">
                          Raised {new Date(hand.raisedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleResolveHand(hand.id)}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[10px] font-bold uppercase px-3 py-1 rounded transition-all cursor-pointer"
                      >
                        Resolve
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Classroom Chat Section */}
          <div className="flex-[1.5] flex flex-col overflow-hidden bg-[#121213]">
            <div className="p-3 border-b border-[#2a2a2a] bg-[#1a1a1c]">
              <span className="text-[11px] font-black uppercase tracking-wider text-white/85 flex items-center gap-1.5">
                <Users size={12} className="text-blue-400" />
                Live Session Chat
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/20 p-4">
                  <p className="text-xs">Chat is empty. Type a message below to start.</p>
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className="text-xs space-y-0.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className={cn(
                        "font-bold",
                        msg.student?.role === 'TEACHER' || msg.student?.role === 'ADMIN' ? "text-indigo-400" : "text-zinc-300"
                      )}>
                        {msg.student?.name}
                      </span>
                      {msg.student?.role === 'TEACHER' && (
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

            <form onSubmit={handleSendChat} className="p-3 border-t border-[#2a2a2a] bg-[#18181a] flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Send instructions to room..."
                className="flex-1 bg-[#222224] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <footer className="h-[64px] bg-[#1a1a1c] border-t border-[#2a2a2a] px-4 flex items-center justify-between z-50">
        {/* Toggle Devices */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleMute}
            className="flex flex-col items-center justify-center w-14 h-10 rounded-lg hover:bg-white/5 transition-all text-white/60 hover:text-white cursor-pointer"
          >
            {isMuted ? <MicOff size={18} className="text-red-500" /> : <Mic size={18} />}
            <span className="text-[9px] mt-1 font-semibold">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button 
            onClick={toggleVideo}
            className="flex flex-col items-center justify-center w-14 h-10 rounded-lg hover:bg-white/5 transition-all text-white/60 hover:text-white cursor-pointer"
          >
            {isVideoOff ? <VideoOff size={18} className="text-red-500" /> : <Video size={18} />}
            <span className="text-[9px] mt-1 font-semibold">{isVideoOff ? 'Start Cam' : 'Stop Cam'}</span>
          </button>
        </div>

        {/* Start / End Broadcast Controller */}
        <div>
          {isBroadcasting ? (
            <button
              onClick={handleEndBroadcast}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-red-600/15 active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              <Radio size={14} />
              End Broadcast
            </button>
          ) : (
            <button
              onClick={handleStartBroadcast}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-600/15 active:scale-95 transition-all cursor-pointer"
            >
              <Radio size={14} />
              Go Live now
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
