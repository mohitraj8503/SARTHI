'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Calendar, 
  Users, 
  Zap,
  CheckCircle2,
  X,
  Loader2,
  DollarSign,
  Percent
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';

export default function CouponsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: couponsData, isLoading } = useQuery({
    queryKey: ['teacher-coupons'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/coupons');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  const { data: coursesData } = useQuery({
    queryKey: ['teacher-courses-minimal'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/courses?minimal=true');
      return res.json();
    }
  });

  const createCoupon = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/teacher/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-coupons'] });
      setIsCreating(false);
      addToast('Coupon activated successfully!', 'success');
    },
    onError: (error: any) => {
      addToast(error.message, 'error');
    }
  });

  const coupons = couponsData?.coupons || [];
  const courses = coursesData?.courses || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-4 bg-purple-500 rounded-full" />
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em]">PROMOTION ENGINE</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            DISCOUNT <span className="text-purple-500">VAULT</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-3">Create and manage high-conversion promotional codes for your ecosystem.</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <Loader2 className="w-10 h-10 text-slate-200 animate-spin" />
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-4">Syncing Vault Data...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] border border-dashed border-slate-200 text-center">
            <div className="w-24 h-24 bg-purple-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Ticket className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Active Coupons</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium mb-8">Launch your first promotional campaign to boost your course enrollments.</p>
            <button
               onClick={() => setIsCreating(true)}
               className="bg-purple-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition-all"
            >
              Start New Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coupons.map((coupon: any) => (
              <div key={coupon.id} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white shadow-xl relative z-10">
                     <span className="text-xs font-black">{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</span>
                     <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">OFF</span>
                  </div>
                  <div className="flex gap-2 relative z-10">
                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-rose-50 rounded-xl transition-colors text-slate-400 hover:text-rose-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 mb-8 relative z-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{coupon.code}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{coupon.course?.title || 'STORE WIDE ACCESS'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-50 relative z-10">
                   <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                         <Users className="w-3 h-3" />
                         <span className="text-[9px] font-black uppercase tracking-widest">REDEMPTIONS</span>
                      </div>
                      <p className="text-sm font-black text-slate-900">{coupon.usedCount} <span className="text-slate-400 font-bold">/ {coupon.maxUses || '∞'}</span></p>
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                         <Calendar className="w-3 h-3" />
                         <span className="text-[9px] font-black uppercase tracking-widest">EXPIRES</span>
                      </div>
                      <p className="text-sm font-black text-slate-900">{coupon.expiresAt ? format(new Date(coupon.expiresAt), 'MMM d, yyyy') : 'NEVER'}</p>
                   </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Coupon Modal Overlay */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsCreating(false)} />
           <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
              <div className="p-12">
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
                          <Ticket className="w-6 h-6" />
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">New Campaign</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Configuration Layer</p>
                       </div>
                    </div>
                    <button onClick={() => setIsCreating(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                       <X className="w-5 h-5" />
                    </button>
                 </div>

                 <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    createCoupon.mutate(Object.fromEntries(formData));
                 }} className="space-y-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Coupon Code</label>
                       <input 
                          name="code" 
                          required 
                          placeholder="e.g. SUMMER50" 
                          className="w-full bg-slate-50 border-none rounded-2xl p-5 text-xl font-black text-slate-900 focus:ring-2 focus:ring-purple-600 transition-all uppercase"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Type</label>
                          <select name="discountType" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-purple-600">
                             <option value="PERCENTAGE">Percentage (%)</option>
                             <option value="FIXED">Fixed Amount (₹)</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Value</label>
                          <input 
                             name="discountValue" 
                             type="number" 
                             required 
                             placeholder="20" 
                             className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-black focus:ring-2 focus:ring-purple-600"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scope Protection</label>
                       <select name="courseId" className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-purple-600">
                          <option value="all">Apply to All Courses</option>
                          {courses.map((course: any) => (
                             <option key={course.id} value={course.id}>{course.title}</option>
                          ))}
                       </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Redemptions</label>
                          <input 
                             name="maxUses" 
                             type="number" 
                             placeholder="Unlimited" 
                             className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-purple-600"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                          <input 
                             name="expiresAt" 
                             type="date" 
                             className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-purple-600"
                          />
                       </div>
                    </div>

                    <button 
                       type="submit" 
                       disabled={createCoupon.isPending}
                       className="w-full bg-purple-600 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition-all shadow-2xl shadow-purple-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                       {createCoupon.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                       Activate Coupon
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

