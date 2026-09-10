'use client';

import { useEffect, useState } from 'react';
import { 
  Copy, 
  Share2, 
  QrCode, 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Percent, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

export default function MarketingOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/marketing/stats');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleCopy = () => {
    if (!data?.partner?.couponCode) return;
    navigator.clipboard.writeText(data.partner.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralUrl = data?.partner?.couponCode 
    ? `https://sarthi-woad.vercel.app/register?ref=${data.partner.couponCode}` 
    : '';

  const handleCopyLink = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    alert('Referral link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-pulse text-left">
        <div className="h-40 bg-white/50 backdrop-blur-md rounded-[24px]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-white/50 backdrop-blur-md rounded-[20px]" />
          <div className="h-24 bg-white/50 backdrop-blur-md rounded-[20px]" />
          <div className="h-24 bg-white/50 backdrop-blur-md rounded-[20px]" />
          <div className="h-24 bg-white/50 backdrop-blur-md rounded-[20px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white/50 backdrop-blur-md rounded-[24px]" />
          <div className="h-96 bg-white/50 backdrop-blur-md rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-slate-500 mt-2">Could not load marketing partner profile details.</p>
      </div>
    );
  }

  const { stats, partner, leaderboard, students } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      
      {/* Hero Banner Section */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-slate-100/50">
        <div className="space-y-2">
          <span className="text-[10px] font-black tracking-widest text-[#174F3A] uppercase block">YOUR SALARY</span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-outfit">
            ₹{stats.earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Updated after every successful enrollment.
          </p>
        </div>
        
        {/* Quick Stats Column */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 md:min-w-[450px]">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Referred</span>
            <span className="text-lg font-black text-slate-800">{stats.referredCount}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Coupon Usage</span>
            <span className="text-lg font-black text-slate-800">{stats.couponUsage}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
            <span className="text-lg font-black text-amber-600">₹{stats.pendingCommission.toLocaleString('en-IN')}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Paid</span>
            <span className="text-lg font-black text-emerald-600">₹{stats.paidCommission.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Coupon & Basic Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Referral Coupon Glass Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[28px] p-6 flex flex-col justify-between shadow-xl shadow-slate-100/50 min-h-[220px]">
          <div>
            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block mb-1">Your Referral Coupon</span>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight font-outfit uppercase">
              {partner.couponCode}
            </h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Students get a discount & you earn a **{data.commissionPercentage}% commission** on every sale.
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex gap-2">
              <button 
                onClick={handleCopy} 
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy Coupon'}
              </button>
              <button 
                onClick={() => setShowQr(!showQr)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 rounded-xl transition-all"
                title="Generate QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
            
            {showQr && (
              <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center animate-scale-in">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(referralUrl)}`} 
                  alt="Referral QR Code" 
                  className="w-28 h-28 object-contain"
                />
                <button 
                  onClick={handleCopyLink}
                  className="text-[10px] font-bold text-emerald-600 hover:underline mt-2"
                >
                  Copy Referral Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sales Statistics Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-1">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <p className="text-xl font-black text-slate-800">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-1">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Commission Earned</p>
            <p className="text-xl font-black text-slate-800">₹{stats.earnings.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-1">
            <Users className="w-5 h-5 text-blue-600" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referrals</p>
            <p className="text-xl font-black text-slate-800">{stats.referredCount}</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-1">
            <Percent className="w-5 h-5 text-[#f97316]" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</p>
            <p className="text-xl font-black text-slate-800">{stats.conversionRate}%</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-1">
            <Clock className="w-5 h-5 text-amber-500" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Payout</p>
            <p className="text-xl font-black text-slate-800">₹{stats.pendingCommission.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-4 space-y-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Successful Referrals</p>
            <p className="text-xl font-black text-slate-800">{stats.referredCount}</p>
          </div>
        </div>
      </div>

      {/* Grid: Timeline & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Sales Timeline */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/40 rounded-[28px] p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
              Recent Sales Timeline
            </h3>
            <Link 
              href="/marketing/dashboard/students" 
              className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 tracking-wider uppercase flex items-center gap-0.5"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {students.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-bold">No referrals yet.</p>
              <p className="text-xs mt-1">Share your coupon to start earning commissions!</p>
            </div>
          ) : (
            <div className="relative border-l border-slate-100 pl-4 space-y-6">
              {students.slice(0, 5).map((s: any) => (
                <div key={s.id} className="relative text-left">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-4 ring-emerald-50" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {s.studentName} enrolled in {s.courseName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        +₹{s.commissionEarned} Commission
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(s.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Marketing Leaderboard */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[28px] p-6 shadow-xl">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-6">
            Top Partners Leaderboard
          </h3>

          <div className="space-y-4">
            {leaderboard.slice(0, 5).map((l: any) => (
              <div key={l.rank} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    l.rank === 1 ? 'bg-amber-100 text-amber-700' :
                    l.rank === 2 ? 'bg-slate-100 text-slate-600' :
                    l.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {l.rank}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{l.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">{l.couponCode}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700">{l.students} Referrals</p>
                  <p className="text-[9px] font-bold text-emerald-600">₹{l.commission.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
