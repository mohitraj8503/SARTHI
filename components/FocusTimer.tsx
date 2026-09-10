'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Zap, Pause, Play, RotateCcw, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface FocusSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: string;
  deepWorkScore?: number;
}

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  totalDeepWorkHours: string;
  avgEfficiency: number;
}

export default function FocusTimer() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch session stats with timeout protection
  const { data: sessionData } = useQuery({
    queryKey: ['focus-sessions'],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      try {
        const res = await fetch('/api/focus/sessions?limit=5', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        return data as { sessions: FocusSession[]; stats: SessionStats };
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn('Focus sessions fetch timed out or was cancelled');
        } else {
          console.error('Focus sessions error:', error);
        }
        // Return empty data on error to prevent crashes
        return { sessions: [], stats: { totalSessions: 0, completedSessions: 0, totalDeepWorkHours: '0', avgEfficiency: 0 } };
      } finally {
        clearTimeout(timeoutId);
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      // Retry up to 1 time for other errors
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/focus/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionType: 'study' }),
      });
      if (!res.ok) throw new Error('Failed to start session');
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.session.id);
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      deepWorkScore,
    }: {
      id: string;
      status: string;
      deepWorkScore?: number;
    }) => {
      const res = await fetch(`/api/focus/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, deepWorkScore }),
      });
      if (!res.ok) throw new Error('Failed to update session');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentSessionId) {
      // Session completed
      const deepWorkScore = Math.floor(75 + Math.random() * 25); // 75-100 score
      updateSessionMutation.mutate({
        id: currentSessionId,
        status: 'completed',
        deepWorkScore,
      });
      setIsActive(false);
      setIsPaused(false);
      setCurrentSessionId(null);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, currentSessionId, updateSessionMutation]);

  const toggleTimer = () => {
    if (!isActive) {
      // Start new session
      startSessionMutation.mutate();
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
      // Update session status in database
      if (currentSessionId) {
        updateSessionMutation.mutate({
          id: currentSessionId,
          status: isPaused ? 'active' : 'paused',
        });
      }
    }
  };

  const resetTimer = () => {
    if (currentSessionId) {
      updateSessionMutation.mutate({
        id: currentSessionId,
        status: 'completed',
        deepWorkScore: 50, // Lower score for incomplete session
      });
    }
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(25 * 60);
    setCurrentSessionId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;
  const stats = sessionData?.stats;

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-brand-orange/10 transition-colors" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center shadow-inner">
              <Zap className="w-7 h-7 text-brand-orange fill-current" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 leading-none mb-1">Focus Mode</h3>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black">
                Pomodoro Technique
              </p>
            </div>
          </div>
          {isActive && (
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Active Session
            </div>
          )}
        </div>

        {!isActive ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                  Deep Work Stats
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-gray-900">
                    {stats?.totalDeepWorkHours || '0.0'}
                  </span>
                  <span className="text-sm font-bold text-gray-400">hours</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                  Efficiency
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600">
                    {stats?.avgEfficiency || 0}%
                  </span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </div>

            <button
              onClick={toggleTimer}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-brand-orange text-white rounded-2xl font-black text-base shadow-xl shadow-brand-orange/30 hover:shadow-2xl hover:shadow-brand-orange/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 min-h-[48px] touch-manipulation flex items-center justify-center gap-2"
            >
              <Timer className="w-5 h-5" />
              Start 25 Min Session
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-100"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                    className="text-brand-orange transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-black text-gray-900 mb-1">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {isPaused ? 'Paused' : 'Focusing'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={toggleTimer}
                className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all min-h-[48px] touch-manipulation"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={resetTimer}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 transition-all min-h-[48px] touch-manipulation"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

