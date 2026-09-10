'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Users, Clock } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  host: string;
  time: string;
  isLive?: boolean;
  viewers?: number;
}

interface SeminarsCardProps {
  sessions?: Session[];
  title?: string;
}

const defaultSessions: Session[] = [
  {
    id: '1',
    title: 'Python Q&A Session',
    host: 'Mohit Raj',
    time: 'Live Now',
    isLive: true,
    viewers: 234,
  },
  {
    id: '2',
    title: 'React Hooks Deep Dive',
    host: 'Industry Expert',
    time: '7:00 PM',
    isLive: false,
  },
  {
    id: '3',
    title: 'System Design Basics',
    host: 'Industry Expert',
    time: '8:30 PM',
    isLive: false,
  },
];

export default function SeminarsCard({ 
  sessions = defaultSessions,
  title = 'Seminars'
}: SeminarsCardProps) {
  const seminar = sessions.find(s => s.isLive);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="flex items-center gap-1.5 text-xs font-medium text-red-500">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Current Live Session - Highlighted */}
      {seminar && (
        <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wide">Now Playing</span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              {seminar.viewers}
            </span>
          </div>
          <h4 className="text-[15px] font-medium text-gray-900 mb-1">{seminar.title}</h4>
          <p className="text-[13px] text-gray-500 mb-3">with {seminar.host}</p>
          <button className="w-full py-2.5 bg-[#FF6A00] text-white rounded-lg text-[14px] font-medium hover:bg-[#E05E00] transition-all">
            Join Live
          </button>
        </div>
      )}

      {/* Upcoming Sessions */}
      <div className="space-y-2">
        {sessions.filter(s => !s.isLive).map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {/* Time */}
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-gray-500" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-gray-900 truncate">
                {session.title}
              </p>
              <p className="text-[12px] text-gray-500">
                {session.time}
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

