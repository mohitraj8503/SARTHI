'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp, 
  Search,
  ChevronRight,
  User,
  Zap,
  Target,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LeaderboardUser {
  id: string;
  name: string | null;
  image: string | null;
  totalPoints: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface LeaderboardClientProps {
  topUsers: LeaderboardUser[];
  currentUser: LeaderboardUser | null;
}

export default function LeaderboardClient({ topUsers, currentUser }: LeaderboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredUsers = topUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const podium = topUsers.slice(0, 3);
  const others = filteredUsers.slice(3);

  // Reorder podium for visual display: [2, 1, 3]
  const displayPodium = [
    podium[1] || null, // 2nd
    podium[0] || null, // 1st
    podium[2] || null, // 3rd
  ].filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 lg:px-12 space-y-16">
      
      {/* Header & Stats */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-500/20 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Hall_Of_Fame
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-[#1B4332] tracking-tighter uppercase italic leading-[0.9]">
            The Global <span className="text-[#D4915C]">Elite.</span>
          </h1>
          <p className="text-gray-500 font-bold text-lg max-w-xl italic opacity-60">
            Recognizing the top learners in the SARTHI ecosystem. Points are earned through course completion, assessments, and community contributions.
          </p>
        </div>

        {currentUser && (
          <div className="bg-[#1B4332] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group min-w-[280px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full group-hover:scale-150 transition-transform duration-1000" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-3 block">Your_Global_Standing</span>
            <div className="flex items-end gap-3">
              <div className="text-5xl font-black italic">#{currentUser.rank}</div>
              <div className="mb-1 text-sm font-black uppercase tracking-widest text-[#D4915C]">RANK</div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-white/60 uppercase tracking-widest italic">
              <Zap className="w-3 h-3 text-amber-400" />
              {currentUser.totalPoints.toLocaleString()} TOTAL XP
            </div>
          </div>
        )}
      </section>

      {/* Podium Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-12 pb-8">
        {displayPodium.map((user, idx) => {
          const isFirst = user?.rank === 1;
          const isSecond = user?.rank === 2;
          const isThird = user?.rank === 3;
          
          return (
            <motion.div
              key={user?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative flex flex-col items-center",
                isFirst ? "order-2 md:-translate-y-8" : isSecond ? "order-1" : "order-3"
              )}
            >
              {/* Crown for #1 */}
              {isFirst && (
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-16 z-20"
                >
                  <Crown className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" fill="currentColor" />
                </motion.div>
              )}

              {/* Avatar Container */}
              <div className={cn(
                "relative mb-6 rounded-[2.5rem] p-1 shadow-2xl",
                isFirst ? "w-40 h-40 bg-gradient-to-tr from-amber-400 to-yellow-200" : "w-32 h-32 bg-gray-100"
              )}>
                <div className="w-full h-full rounded-[2.3rem] overflow-hidden bg-white border-4 border-white relative">
                  {user?.image ? (
                    <Image src={user.image} alt={user.name || ''} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#1B4332] text-white text-3xl font-black">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                {/* Rank Badge */}
                <div className={cn(
                  "absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-xl",
                  isFirst ? "bg-amber-400 text-white" : isSecond ? "bg-gray-400 text-white" : "bg-[#D4915C] text-white"
                )}>
                  {user?.rank}
                </div>
              </div>

              {/* Info */}
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight italic">
                  {user?.name || 'Anonymous Learner'}
                </h3>
                <div className="text-sm font-black text-[#D4915C] uppercase tracking-widest italic">
                  {user?.totalPoints.toLocaleString()} XP
                </div>
              </div>

              {/* Pedestal (Visual) */}
              <div className={cn(
                "mt-8 w-full rounded-t-[3rem] border-x border-t border-gray-100 shadow-sm",
                isFirst ? "h-32 bg-white" : isSecond ? "h-24 bg-white/60" : "h-16 bg-white/40"
              )} />
            </motion.div>
          );
        })}
      </section>

      {/* Main List */}
      <section className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight italic flex items-center gap-4">
            <Target className="w-7 h-7 text-[#D4915C]" />
            Elite_Leaderboard
          </h2>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#D4915C] transition-colors" />
            <input 
              type="text" 
              placeholder="Search learners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#1B4332] focus:bg-white focus:border-[#1B4332]/5 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-gray-400">Standing</th>
                <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Learner_Identity</th>
                <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Total_XP</th>
                <th className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {others.length > 0 ? others.map((user) => (
                <tr 
                  key={user.id} 
                  className={cn(
                    "group hover:bg-gray-50 transition-all cursor-default",
                    user.isCurrentUser && "bg-[#1B4332]/5"
                  )}
                >
                  <td className="py-6 px-10">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-gray-300 group-hover:text-[#1B4332] italic">#{user.rank}</span>
                      {user.rank < 10 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4915C] animate-pulse" />
                      )}
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#1B4332]/5 flex items-center justify-center text-[#1B4332] font-black overflow-hidden relative border-2 border-transparent group-hover:border-[#1B4332]/10 transition-all">
                        {user.image ? (
                          <Image src={user.image} alt={user.name || ''} fill className="object-cover" />
                        ) : (
                          user.name?.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="text-[15px] font-black text-[#1B4332] uppercase tracking-tight flex items-center gap-2">
                          {user.name || 'Anonymous'}
                          {user.isCurrentUser && (
                            <span className="px-2 py-0.5 bg-[#1B4332] text-white text-[8px] font-black rounded-full">YOU</span>
                          )}
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic opacity-60">Verified Learner</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex flex-col">
                      <span className="text-[15px] font-black text-[#1B4332] italic">{user.totalPoints.toLocaleString()}</span>
                      <div className="w-24 h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-[#D4915C]" 
                          style={{ width: `${Math.min(100, (user.totalPoints / (podium[0]?.totalPoints || 1)) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-10 text-right">
                    <button className="text-[10px] font-black text-[#D4915C] uppercase tracking-widest hover:text-[#1B4332] transition-colors flex items-center gap-2 ml-auto">
                      VIEW PROFILE <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs italic">
                    {searchQuery ? "No learners match your search." : "Leaderboard is being updated..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer Info */}
      <div className="bg-[#FAF9F6] p-10 rounded-[3rem] border border-[#1B4332]/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#1B4332] rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-[#1B4332]/20">
            <Star className="w-8 h-8 text-amber-400" fill="currentColor" />
          </div>
          <div>
            <h4 className="text-xl font-black text-[#1B4332] uppercase tracking-tight italic">Climb the Ranks_</h4>
            <p className="text-gray-500 font-bold italic text-sm">Consistent learning and high assessment scores boost your standing.</p>
          </div>
        </div>
        <button className="px-10 py-5 bg-[#1B4332] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-[#1B4332]/20 hover:scale-105 active:scale-95 transition-all italic text-sm">
          Challenge Top Performers
        </button>
      </div>
    </div>
  );
}

