'use client';

import { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { formatCurrency } from '@/lib/utils/dashboard-utils';
import { cn } from '@/lib/utils';
import { TrendingUp, MoreHorizontal, Calendar } from 'lucide-react';

interface RevenueChartProps {
  data: { date: string; amount: number }[];
  isLoading?: boolean;
}

export default function RevenueAnalytics({ data, isLoading }: RevenueChartProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [viewType, setViewType] = useState<'area' | 'bar'>('area');

  if (isLoading) {
    return (
      <div className="bg-white rounded-[32px] p-10 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] h-[500px] animate-pulse">
        <div className="h-8 w-48 bg-slate-100 rounded mb-10" />
        <div className="h-[300px] bg-slate-50 rounded-2xl" />
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-lg font-black text-white tracking-tight">{formatCurrency(payload[0].value)}</p>
          <div className="flex items-center gap-1 mt-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
             <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Growth Confirmed</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[32px] p-10 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] h-full flex flex-col group">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse" />
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">REVENUE ANALYTICS</h3>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Studio Performance</p>
        </div>

        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                period === p 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-100" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[300px] min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#10B981" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                animationDuration={1500}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]} animationDuration={1500}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#10B981' : '#F1F5F9'} className="hover:fill-emerald-400 transition-colors duration-300" />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setViewType('area')}
             className={cn("p-2 rounded-lg transition-all", viewType === 'area' ? "bg-emerald-50 text-emerald-600" : "text-slate-300 hover:text-slate-400")}
           >
              <TrendingUp className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setViewType('bar')}
             className={cn("p-2 rounded-lg transition-all", viewType === 'bar' ? "bg-emerald-50 text-emerald-600" : "text-slate-300 hover:text-slate-400")}
           >
              <Calendar className="w-5 h-5" />
           </button>
        </div>
        
        <div className="flex items-center gap-2">
           {(() => {
             const avgGrowth = data.length > 1 
               ? ((data[data.length - 1].amount - data[0].amount) / (data[0].amount || 1)) * 100 
               : 0;
             return (
               <span className={cn(
                 "text-[11px] font-black uppercase tracking-widest",
                 avgGrowth >= 0 ? "text-emerald-600" : "text-rose-600"
               )}>
                 {avgGrowth >= 0 ? '+' : ''}{avgGrowth.toFixed(1)}% AVG GROWTH
               </span>
             );
           })()}
        </div>

      </div>
    </div>
  );
}

