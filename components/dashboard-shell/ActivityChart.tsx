'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from 'next-themes';

const data = [
    { name: 'Mon', study: 2, tasks: 1 },
    { name: 'Tue', study: 5.5, tasks: 3 },
    { name: 'Wed', study: 2, tasks: 2 },
    { name: 'Thu', study: 8.5, tasks: 4 },
    { name: 'Fri', study: 1.5, tasks: 1 },
    { name: 'Sat', study: 5, tasks: 3 },
    { name: 'Sun', study: 4, tasks: 2 },
];

export function ActivityChart() {
    return (
        <div className="h-full w-full min-h-[240px] relative">
            <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                <LineChart data={data && data.length > 0 ? data : []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ fontSize: '11px', fontWeight: '600' }}
                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="study"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="tasks"
                        stroke="#a5b4fc"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

