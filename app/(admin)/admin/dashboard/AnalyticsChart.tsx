'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueDataPoint {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  data: RevenueDataPoint[];
}

const defaultData: RevenueDataPoint[] = [
  { label: 'Mon', value: 18500 },
  { label: 'Tue', value: 24200 },
  { label: 'Wed', value: 19800 },
  { label: 'Thu', value: 31500 },
  { label: 'Fri', value: 28900 },
  { label: 'Sat', value: 42000 },
  { label: 'Sun', value: 38400 },
];

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const chartData = React.useMemo(() => {
    if (!data || data.length === 0 || data.every(d => d.value === 0)) {
      return defaultData;
    }
    return data;
  }, [data]);

  if (!mounted) return <div className="h-[300px] w-full mt-4 bg-slate-50 animate-pulse rounded-2xl" />;

  return (
    <div className="h-[300px] w-full min-w-0 mt-4">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }}
            tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#0F172A', 
              border: 'none', 
              borderRadius: '1.5rem', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              padding: '16px'
            }}
            itemStyle={{ color: '#F59E0B', fontWeight: 900, fontSize: '15px' }}
            labelStyle={{ color: '#64748b', fontWeight: 800, fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            formatter={(v: number) => [`₹${v.toLocaleString()}`, 'NET REVENUE']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#F59E0B"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorRev)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

