'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Calendar, CheckCircle2, AlertCircle, XCircle, 
  ArrowRight, ShieldCheck, HelpCircle, Loader2, DollarSign
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';

export default function SubscriptionsDashboardPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch('/api/student/subscriptions', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCancelSubscription = async (subId: string) => {
    if (!window.confirm('Are you sure you want to cancel this subscription? You will retain access until the end of the current billing cycle.')) {
      return;
    }
    setCancellingId(subId);
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription');
      addToast({ type: 'success', title: 'Subscription Cancelled', message: data.message });
      fetchSubscriptions();
    } catch (err: any) {
      console.error(err);
      addToast({ type: 'error', title: 'Action Failed', message: err.message || 'Could not cancel subscription' });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">Active</span>;
      case 'CANCELLED':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">Cancelled</span>;
      case 'COMPLETED':
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">Completed</span>;
      case 'PAUSED':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">Paused</span>;
      case 'HALTED':
        return <span className="bg-red-500/15 text-red-500 border border-red-500/35 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase font-outfit">Halted</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">{status}</span>;
    }
  };

  return (
    <div className="w-full bg-transparent p-3 sm:p-4 lg:p-10 pb-24 lg:pb-20 space-y-8 sm:space-y-12 min-h-screen">
      <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-8">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight font-outfit uppercase italic">
            Subscriptions
          </h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">
            Manage your recurring course payment cycles
          </p>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#1B4332]" />
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Retrieving Subscriptions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Connection Interrupted</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Could not establish sync with your billing parameters. Please reload the page.</p>
            <button onClick={fetchSubscriptions} className="btn-glass-primary mt-2">Retry Link</button>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="py-40 text-center space-y-8 max-w-lg mx-auto bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-xl">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CreditCard className="w-10 h-10 text-slate-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-950 uppercase tracking-tight">No Active Plans</h3>
              <p className="text-xs text-slate-400 px-6 max-w-sm mx-auto leading-relaxed">You do not have any courses enrolled via recurring monthly subscriptions. Standard courses are accessed via one-time payments.</p>
            </div>
            <Link href="/courses" className="btn-glass-primary inline-flex items-center gap-2">
              Browse Courses <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 max-w-5xl">
            {subscriptions.map((sub) => (
              <motion.div 
                key={sub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-6 sm:p-10 shadow-xl overflow-hidden relative group flex flex-col gap-8 hover:border-emerald-500/20 transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MONTHLY PLAN</span>
                      <h3 className="text-lg font-black text-gray-950 line-clamp-1">{sub.course?.title || 'Course Package'}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(sub.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Monthly Cost</span>
                    <p className="text-xl font-black text-gray-950">₹{(sub.amountPerMonth / 100).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Paid Months</span>
                    <p className="text-xl font-black text-gray-950">{sub.currentMonth} of {sub.totalMonths}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Next Bill Date</span>
                    <p className="text-sm font-bold text-gray-950 mt-1">
                      {sub.nextChargeAt ? new Date(sub.nextChargeAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Subscription ID</span>
                    <p className="text-xs font-mono text-slate-500 mt-1.5 truncate max-w-[120px]">{sub.razorpaySubscriptionId}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Charge History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {sub.payments && sub.payments.length > 0 ? (
                      sub.payments.map((pmt: any) => (
                        <div key={pmt.id} className="flex justify-between items-center text-xs py-2 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-2">
                            {pmt.status === 'CAPTURED' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-slate-500 font-mono">{pmt.razorpayPaymentId}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-950 mr-4">₹{(pmt.amount / 100).toLocaleString('en-IN')}</span>
                            <span className="text-slate-500 text-[10px]">{new Date(pmt.chargedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No transactions captured yet.</p>
                    )}
                  </div>
                </div>

                {sub.status === 'ACTIVE' && (
                  <div className="pt-6 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => handleCancelSubscription(sub.razorpaySubscriptionId)}
                      disabled={cancellingId === sub.razorpaySubscriptionId}
                      className="px-6 py-3 border border-red-500/30 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {cancellingId === sub.razorpaySubscriptionId ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...
                        </>
                      ) : (
                        'Cancel Subscription'
                      )}
                    </button>
                  </div>
                )}

                {sub.status === 'CANCELLED' && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-400 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white mb-0.5">Subscription Cancelled</p>
                      <p>You cancelled your auto-debit on {sub.cancelledAt ? new Date(sub.cancelledAt).toLocaleDateString() : 'recently'}. Course access remains valid until the final paid cycle end date.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
