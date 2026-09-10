import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Hexagon } from 'lucide-react';

interface TechStackRadarProps {
  courses: any[];
}

export function TechStackRadar({ courses }: TechStackRadarProps) {
  // Mock data generation based on courses or static if empty
  const data = [
    { subject: 'Frontend', A: 80, fullMark: 150 },
    { subject: 'Backend', A: 45, fullMark: 150 },
    { subject: 'DevOps', A: 30, fullMark: 150 },
    { subject: 'AI/ML', A: 90, fullMark: 150 },
    { subject: 'Database', A: 65, fullMark: 150 },
    { subject: 'Design', A: 50, fullMark: 150 },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-8 border border-gray-800 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
          <Hexagon className="w-4 h-4 text-purple-400" />
          Tech Stack Analysis
        </h3>
      </div>

      <div className="h-[250px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 900 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
            <Radar
              name="Skills"
              dataKey="A"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="#8B5CF6"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"></div>
      </div>
    </div>
  );
}

