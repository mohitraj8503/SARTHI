'use client';

import { useEffect, useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Search,
  FileText
} from 'lucide-react';

export default function MarketingPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-pulse text-left">
        <div className="h-10 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-64 bg-white/50 backdrop-blur-md rounded-[24px]" />
      </div>
    );
  }

  const { stats, payments = [] } = data;

  // Filter logic
  const filteredPayments = payments.filter((p: any) => {
    const term = search.toLowerCase();
    return p.id.toLowerCase().includes(term) || 
           (p.utr && p.utr.toLowerCase().includes(term)) ||
           (p.remarks && p.remarks.toLowerCase().includes(term));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      
      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-outfit">Commissions & Payments</h1>
        <p className="text-slate-400 text-xs mt-1">Manage and track your payout releases, bank transfers, and pending balances.</p>
      </div>

      {/* Payout Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-6 space-y-1.5 shadow-md">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Commission Earned</p>
          <p className="text-2xl font-black text-slate-800">₹{stats.earnings.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-6 space-y-1.5 shadow-md">
          <Clock className="w-5 h-5 text-amber-500" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Release</p>
          <p className="text-2xl font-black text-slate-800">₹{stats.pendingCommission.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-6 space-y-1.5 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid Payouts</p>
          <p className="text-2xl font-black text-slate-800">₹{stats.paidCommission.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Search Row */}
      <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search payments by Transaction ID, UTR, or remarks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>
      </div>

      {/* Payout History Ledger */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[24px] shadow-xl overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-bold">No payout history found.</p>
            <p className="text-xs mt-1">Released payments will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-black bg-slate-50/40">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Payment Date</th>
                  <th className="px-6 py-4">Release Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">UTR/Ref No</th>
                  <th className="px-6 py-4">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/30">
                    <td className="px-6 py-4 font-bold text-slate-800">{p.id}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-700 text-sm">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                        p.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                        p.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">{p.utr || '—'}</td>
                    <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">{p.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
