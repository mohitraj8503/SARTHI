import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Clock, Sparkles } from 'lucide-react';

interface LearningAnalyticsProps {
  dailyActivity: Array<{ day: string; minutes: number }>;
  weeklyMinutes: number;
}

export default function LearningAnalytics({ dailyActivity, weeklyMinutes }: LearningAnalyticsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card/60 backdrop-blur-xl rounded-[48px] p-10 border border-border/20 shadow-2xl hover:shadow-primary/5 transition-all duration-700 h-full flex flex-col antialiased"
    >
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center shadow-inner">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[14px] font-black text-primary uppercase tracking-[0.3em] font-manrope">Learning Velocity</h3>
            <p className="text-[11px] font-semibold text-primary/40 uppercase tracking-widest font-inter">7-Day Analysis</p>
          </div>
        </div>
        <div className="text-right space-y-1">
            <div className="flex items-center gap-2 justify-end">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-2xl font-black text-primary font-manrope tracking-tighter">{weeklyMinutes}m</span>
            </div>
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] font-inter">Total Focus</p>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26, 60, 46, 0.05)" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'rgba(26, 60, 46, 0.4)', fontWeight: 800, textAnchor: 'middle' }}
              dy={15}
            />
            <YAxis 
                hide 
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '24px', 
                border: '1px solid rgba(26, 60, 46, 0.1)', 
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                fontSize: '11px',
                fontWeight: '900',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
              cursor={{ stroke: 'var(--accent)', strokeWidth: 2, strokeDasharray: '6 6' }}
            />
            <Area 
              type="monotone" 
              dataKey="minutes" 
              stroke="var(--accent)" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorMinutes)" 
              animationDuration={2500}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-10 pt-8 border-t border-border/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-[11px] font-black text-primary/60 uppercase tracking-widest">Optimized Trajectory</span>
          </div>
          <div className="h-1.5 w-32 bg-primary/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 2, delay: 1 }}
                className="h-full bg-accent shadow-[0_0_10px_rgba(212,149,106,0.3)]"
              />
          </div>
      </div>
    </motion.div>
  );
}

