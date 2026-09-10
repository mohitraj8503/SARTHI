'use client';

import { Trophy, Medal, Crown, TrendingUp, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';

interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl?: string;
  grade?: string;
  totalPoints: number;
  xp: number;
  streak: number;
  rank: number;
}

export default function Leaderboard() {
  const router = useRouter();

  // Handle errors gracefully without crashing the app
  const { data, isLoading, isError } = useQuery({
    queryKey: ['leaderboard-rankings'],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      try {
        const res = await fetch('/api/leaderboard/rankings?limit=10', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        return data as {
          leaderboard: LeaderboardUser[];
          currentUserRank?: number;
          total: number;
        };
      } catch (e: any) {
        if (e.name === 'AbortError') {
          console.warn('Leaderboard fetch timed out or was cancelled');
        } else {
          console.error('Leaderboard error:', e);
        }
        return { leaderboard: [], total: 0 };
      } finally {
        clearTimeout(timeoutId);
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
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

  const leaderboard = data?.leaderboard || [];

  if (isError) {
    return (
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 border border-gray-100 text-center shadow-xl shadow-gray-200/50">
        <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Temporary leaderboard unavailable.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 border border-gray-100 text-center shadow-xl shadow-gray-200/50">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-100 rounded-xl"></div>
          <div className="h-12 bg-gray-100 rounded-xl"></div>
          <div className="h-12 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 border border-gray-100 text-center shadow-xl shadow-gray-200/50">
        <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">
          No rankings yet. Start learning to get on the board!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-2xl relative">
      <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-black text-brand-dark flex items-center gap-3">
            <Trophy className="w-7 h-7 text-brand-orange shadow-sm" />
            Global Leaderboard
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mt-1">
            Live XP Rankings
          </p>
        </div>

        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-yellow-50 via-transparent to-transparent rounded-full -mr-40 -mt-20 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-50 via-transparent to-transparent rounded-full -ml-32 -mb-16 blur-2xl opacity-40" />
      </div>

      <div className="divide-y divide-gray-50">
        <AnimatePresence>
          {leaderboard.map((user, index) => {
            const isTopThree = index < 3;
            const RankIcon =
              index === 0 ? Crown : index === 1 ? Trophy : index === 2 ? Medal : null;
            const rankColor =
              index === 0
                ? 'text-yellow-500'
                : index === 1
                ? 'text-gray-400'
                : index === 2
                ? 'text-orange-600'
                : 'text-gray-400';

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`px-6 md:px-8 py-5 md:py-6 flex items-center gap-4 group hover:bg-gradient-to-r ${
                  isTopThree
                    ? 'hover:from-orange-50/50 hover:to-transparent bg-gradient-to-r from-gray-50/50 to-transparent'
                    : 'hover:from-gray-50/50 hover:to-transparent'
                } transition-all cursor-pointer relative`}
              >
                {/* Rank */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                    isTopThree
                      ? 'bg-gradient-to-br from-brand-orange to-orange-600 text-white shadow-lg shadow-brand-orange/30'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {RankIcon ? <RankIcon className={`w-6 h-6 ${rankColor}`} /> : `#${index + 1}`}
                </div>

                {/* Avatar */}
                <Avatar avatarUrl={user.avatarUrl} name={user.name} size={56} className="rounded-2xl shadow-inner" />

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 truncate text-base md:text-lg">
                    {user.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {user.grade && (
                      <>
                        <span className="text-xs font-bold text-gray-400">{user.grade}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      </>
                    )}
                    <div className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-black text-orange-600">
                        {user.streak} day streak
                      </span>
                    </div>
                  </div>
                </div>

                {/* XP Score */}
                <div className="text-right">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl md:text-3xl font-black text-brand-orange">
                      {user.xp.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase">XP</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <button
        onClick={() => router.push('/leaderboard')}
        className="w-full py-4 bg-gray-50 hover:bg-gray-100 transition-all text-gray-900 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
      >
        View Full Leaderboard
        <Trophy className="w-4 h-4" />
      </button>
    </div>
  );
}

