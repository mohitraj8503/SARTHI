'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  TrendingUp, 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Twitter, 
  Linkedin, 
  MessageCircle,
  History,
  Award,
  Star,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import { format } from 'date-fns';

interface RewardsClientProps {
  user: {
    name: string | null;
    totalPoints: number;
    referralCode: string | null;
  };
  transactions: any[];
  referrals: any[];
}

export default function RewardsClient({ user, transactions, referrals }: RewardsClientProps) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${user.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.referralCode || '');
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Code Copied',
      message: 'Referral code copied to clipboard.'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    const text = `Join me on SARTHI and accelerate your career! Use my referral code: ${user.referralCode}`;
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + referralUrl)}`;
        break;
    }
    
    window.open(url, '_blank');
  };

  const currentLevel = Math.floor(user.totalPoints / 1000) + 1;
  const pointsToNextLevel = 1000 - (user.totalPoints % 1000);
  const levelProgress = (user.totalPoints % 1000) / 10;

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 lg:px-12 space-y-12">
      
      {/* Header */}
      <section className="space-y-4 border-b border-slate-200/80 pb-6">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#D4915C]/10 text-[#D4915C] text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-[#D4915C]/20 mb-2">
          <Gift className="w-3.5 h-3.5" />
          Rewards_Engine
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-[#1B4332] tracking-tighter uppercase italic leading-[0.9]">
          Earn While You <span className="text-[#D4915C]">Learn.</span>
        </h1>
        <p className="text-gray-500 font-bold text-lg max-w-2xl italic opacity-60">
          Unlock premium rewards, specialized certifications, and exclusive events by earning XP points and referring peers to the SARTHI ecosystem.
        </p>
      </section>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Points Summary */}
        <div className="lg:col-span-2 bg-[#1B4332] rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-bl-full -z-0" />
          <div className="relative z-10 space-y-10">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2 block">Total_XP_Accumulated</span>
                <div className="text-7xl md:text-8xl font-black italic tracking-tighter flex items-end gap-4 leading-none">
                  {user.totalPoints.toLocaleString()}
                  <span className="text-2xl text-[#D4915C] mb-3 uppercase tracking-widest font-black">XP</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Current_Rank</span>
                <div className="text-4xl font-black italic">LVL_{currentLevel}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-black uppercase tracking-widest text-white/60 italic">Next Milestone: Level {currentLevel + 1}</span>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#D4915C] italic">{pointsToNextLevel} XP REMAINING</span>
              </div>
              <div className="h-6 bg-white/10 rounded-full p-1.5 border border-white/5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#D4915C] to-amber-300 rounded-full shadow-[0_0_20px_rgba(212,149,106,0.5)] relative"
                >
                  <div className="absolute top-0 right-0 w-8 h-full bg-white/20 blur-sm -skew-x-12" />
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-[#D4915C]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">+12% vs last week</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-[#D4915C]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{referrals.length} referrals active</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-[#D4915C]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">4 badges unlocked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Card */}
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight italic mb-2 flex items-center gap-3">
              <Share2 className="w-6 h-6 text-[#D4915C]" />
              Invite_Peers
            </h3>
            <p className="text-gray-400 font-bold italic text-sm mb-10 leading-relaxed">
              Gift your friends 200 XP and earn 500 XP for every peer who completes their first module.
            </p>

            <div className="space-y-4 mb-10">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-1">Your_Unique_Code</label>
              <div className="relative group">
                <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] px-8 py-6 text-center">
                  <span className="text-3xl font-black text-[#1B4332] tracking-[0.2em]">{user.referralCode || 'NOT_GEN'}</span>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#1B4332] text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group-hover:bg-[#D4915C]"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-1 block text-center">Instant_Share</span>
            <div className="flex justify-center gap-4">
              <button onClick={() => shareOnSocial('twitter')} className="w-14 h-14 rounded-2xl bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-all shadow-sm">
                <Twitter className="w-6 h-6" />
              </button>
              <button onClick={() => shareOnSocial('linkedin')} className="w-14 h-14 rounded-2xl bg-[#0077B5]/10 text-[#0077B5] flex items-center justify-center hover:bg-[#0077B5] hover:text-white transition-all shadow-sm">
                <Linkedin className="w-6 h-6" />
              </button>
              <button onClick={() => shareOnSocial('whatsapp')} className="w-14 h-14 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all shadow-sm">
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Tabs */}
      <div className="grid lg:grid-cols-12 gap-12">
        
        {/* Points History */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/50">
          <h3 className="text-2xl font-black text-[#1B4332] uppercase tracking-tight italic mb-10 flex items-center gap-4">
            <History className="w-7 h-7 text-[#D4915C]" />
            XP_Activity_Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Activity_Source</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">XP_Amount</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Date_Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length > 0 ? transactions.map((tx, i) => (
                  <tr key={tx.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1B4332]/5 flex items-center justify-center text-[#1B4332]">
                          {tx.reason.includes('Referral') ? <Users className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                        </div>
                        <span className="text-sm font-black text-[#1B4332] italic">{tx.reason}</span>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className="text-sm font-black text-emerald-600">+{tx.amount} XP</span>
                    </td>
                    <td className="py-6">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {format(new Date(tx.createdAt), 'MMM dd, yyyy • HH:mm')}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-gray-400 font-black uppercase tracking-widest text-[10px] italic">
                      No points history found. Start learning to earn XP!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rewards Potential */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#FAF9F6] p-10 rounded-[3rem] border border-[#1B4332]/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#1B4332]/5 rounded-bl-full group-hover:scale-150 transition-transform duration-1000" />
            <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight italic mb-8 flex items-center gap-3">
              <Star className="w-6 h-6 text-[#D4915C]" />
              Unlockable_Tiers
            </h3>
            
            <div className="space-y-6">
              {[
                { name: 'Beta Access', points: '5,000 XP', active: user.totalPoints >= 5000 },
                { name: 'Exclusive Seminars', points: '12,000 XP', active: user.totalPoints >= 12000 },
                { name: 'Mentor 1-on-1', points: '25,000 XP', active: user.totalPoints >= 25000 },
                { name: 'VIP Certificate Tier', points: '50,000 XP', active: user.totalPoints >= 50000 },
              ].map((reward, i) => (
                <div key={i} className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all",
                  reward.active ? "bg-[#1B4332] text-white border-[#1B4332] shadow-lg" : "bg-white text-gray-400 border-gray-100"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      reward.active ? "bg-white/10" : "bg-gray-50"
                    )}>
                      {reward.active ? <Check className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-gray-300" />}
                    </div>
                    <span className="text-xs font-black uppercase tracking-tight">{reward.name}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    reward.active ? "text-white/40" : "text-[#D4915C]"
                  )}>{reward.points}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 p-10 rounded-[3rem] border border-amber-100 shadow-sm">
            <h3 className="text-lg font-black text-[#1B4332] uppercase tracking-tight italic mb-4">Pro Tip_</h3>
            <p className="text-gray-600 font-bold italic text-xs leading-relaxed">
              Completing daily streaks doubles your module XP. Ensure your referral code is shared within your professional network for higher conversion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Lock({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  );
}

