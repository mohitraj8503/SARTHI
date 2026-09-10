'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import MobileHeader from '@/components/mobile/MobileHeader'
import { Calendar, Video, User, Clock, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MobileLiveLessons() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const router = useRouter();

  useEffect(() => {
    async function fetchLessons() {
      try {
        const res = await fetch('/api/student/live-sessions');
        if (res.ok) {
          const json = await res.json();
          setLessons(json.sessions || []);
        }
      } catch (err) {
        console.error('Failed to load live lessons');
      } finally {
        setLoading(false);
      }
    }
    fetchLessons();
  }, []);

  const filterItems = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'today', label: 'Today' },
    { id: 'past', label: 'Past' },
  ];

  const handleJoin = (joinUrl: string) => {
    if (joinUrl) {
      router.push(joinUrl);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileHeader title="Live Lessons" />
      
      <main className="p-4 pb-24">
        {/* Filter Pills */}
        <div className="flex gap-2 mb-6">
          {filterItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 border ${
                filter === item.id 
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' 
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Lesson List */}
        <div className="flex flex-col gap-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse h-44 bg-white rounded-3xl border border-slate-100" />
            ))
          ) : lessons.length > 0 ? (
            lessons.map((lesson) => (
              <div 
                key={lesson.id} 
                className={`bg-white rounded-3xl overflow-hidden border border-slate-100 p-5 shadow-sm relative ${
                  lesson.status === 'live' ? 'ring-2 ring-orange-500/20' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-orange-50 text-orange-600 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                    {lesson.topic || 'General'}
                  </div>
                  
                  {lesson.status === 'live' && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Live Now</span>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-4 leading-snug">
                  {lesson.title}
                </h3>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                      <User size={14} className="text-slate-400" />
                    </div>
                    <span className="text-xs font-medium truncate">{lesson.instructor || 'Expert Faculty'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                      <Calendar size={14} className="text-slate-400" />
                    </div>
                    <span className="text-xs font-medium">{new Date(lesson.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleJoin(lesson.joinUrl)}
                  disabled={lesson.status !== 'live' && filter !== 'today'}
                  className={`w-full h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    lesson.status === 'live' 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Video size={18} />
                  {lesson.status === 'live' ? 'Join Lesson' : 'Scheduled'}
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Video size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No live lessons</h3>
              <p className="text-sm text-slate-500">Check back later for scheduled seminars and workshops.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

