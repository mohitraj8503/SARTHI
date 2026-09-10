'use client';

import { useQuery } from '@tanstack/react-query';
import { Lightbulb, ArrowRight } from 'lucide-react';

export default function ResourceSuggestionsWidget() {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['resource-suggestions'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/suggestions');
      if (!res.ok) return { data: [] };
      const json = await res.json();
      return json.success ? json : { data: [] };
    }
  });

  const items = Array.isArray(suggestions?.data) 
    ? suggestions.data 
    : [
    { title: 'Shorten Lesson 3', desc: '40% drop-off detected', action: 'Edit' },
    { title: 'Add Quiz to Module 2', desc: 'Boost engagement by 20%', action: 'Add' },
  ];



  if (isLoading) return <div className="h-48 bg-slate-900 animate-pulse rounded-[32px]" />;


  return (
    <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all" />
      
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-emerald-400" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-wider">Smart Insights</h3>
      </div>

      <div className="space-y-4 relative z-10">
        {items.length === 0 ? (
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-center py-4">No suggestions available yet</p>
        ) : (
          items.map((s: any) => (
            <div key={s.title} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group/item">
              <p className="text-xs font-black mb-1">{s.title}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-tight mb-3">{s.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{s.action}</span>
                <ArrowRight className="w-3 h-3 text-white/20 group-hover/item:translate-x-1 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

