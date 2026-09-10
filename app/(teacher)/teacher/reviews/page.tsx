'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Star, 
  MessageSquare, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingUp,
  Activity,
  Users,
  Loader2,
  Quote
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import StatCard from '@/components/teacher/dashboard/StatCard';

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['teacher-reviews'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/reviews');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  const reviews = reviewsData?.reviews || [];

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const filteredReviews = reviews.filter((r: any) => {
    const matchesSearch = r.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.review?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || 
      (activeTab === 'Positive' && r.rating >= 4) ||
      (activeTab === 'Negative' && r.rating <= 2);
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-4 bg-amber-500 rounded-full" />
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">SOCIAL PROOF</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            LEARNER <span className="text-amber-500">FEEDBACK</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-3">Monitor and analyze student sentiment. Build reputation through high-quality interactions.</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                 <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                 <p className="text-2xl font-black text-slate-900 leading-none">{avgRating}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Average Rating</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8 space-y-8">
           {/* Filters */}
           <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                 {['All', 'Positive', 'Negative'].map(tab => (
                    <button
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={cn(
                          "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                          activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                       )}
                    >
                       {tab}
                    </button>
                 ))}
              </div>
              <div className="flex-1 max-w-xs mx-6 relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                 <input 
                    type="text" 
                    placeholder="Search reviews..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-12 pr-4 text-xs font-medium focus:ring-2 focus:ring-amber-500 transition-all"
                 />
              </div>
           </div>

           {/* Review List */}
           <div className="space-y-6">
              {isLoading ? (
                 <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
                 </div>
              ) : filteredReviews.length === 0 ? (
                 <div className="bg-white p-20 rounded-[40px] border border-dashed border-slate-200 text-center">
                    <Quote className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-slate-900">No Reviews Found</h3>
                    <p className="text-sm text-slate-500 font-medium mt-2">Feedback from your students will appear here once they complete your courses.</p>
                 </div>
              ) : (
                 filteredReviews.map((review: any) => (
                    <div key={review.id} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shadow-inner relative">
                                {review.user.image ? (
                                   <Image src={review.user.image} alt={review.user.name} width={48} height={48} className="w-full h-full object-cover" />
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">
                                      {review.user.name?.[0] || 'S'}
                                   </div>
                                )}
                             </div>
                             <div>
                                <h4 className="text-lg font-black text-slate-900 tracking-tight">{review.user.name || 'Anonymous Learner'}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                   <div className="flex items-center">
                                      {[1,2,3,4,5].map(star => (
                                         <Star key={star} className={cn("w-3 h-3", star <= review.rating ? "text-amber-400 fill-current" : "text-slate-100")} />
                                      ))}
                                   </div>
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">• {format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
                                </div>
                             </div>
                          </div>
                          <div className="bg-slate-50 px-4 py-1.5 rounded-lg border border-slate-100">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{review.course.title}</p>
                          </div>
                       </div>

                       <div className="relative">
                          <Quote className="absolute -left-2 -top-2 w-8 h-8 text-slate-50 opacity-10" />
                          <p className="text-slate-600 leading-relaxed font-medium relative z-10 pl-4 border-l-2 border-slate-50 italic">
                             {review.review || "No written feedback provided, but gave a high rating!"}
                          </p>
                       </div>

                       <div className="mt-8 flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Flag as Spam</button>
                          <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                             <MessageSquare className="w-3.5 h-3.5" />
                             Reply
                          </button>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                 <h3 className="text-xl font-black mb-6">Sentiment Pulse</h3>
                 <div className="space-y-6">
                    {[
                       { label: 'Positive', value: 88, color: 'bg-emerald-500' },
                       { label: 'Neutral', value: 10, color: 'bg-amber-500' },
                       { label: 'Negative', value: 2, color: 'bg-rose-500' }
                    ].map(item => (
                       <div key={item.label} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                             <span>{item.label}</span>
                             <span>{item.value}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                             <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.value}%` }} />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Rating Distribution</h3>
              <div className="space-y-4">
                 {[5,4,3,2,1].map(num => (
                    <div key={num} className="flex items-center gap-4">
                       <span className="text-[10px] font-black text-slate-400 w-4">{num}</span>
                       <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${num === 5 ? 75 : num === 4 ? 15 : 5}%` }} />
                       </div>
                       <Star className="w-3 h-3 text-amber-400 fill-current" />
                    </div>
                 ))}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}

