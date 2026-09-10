'use client'

import { useEffect, useState } from 'react'
import MobileHeader from '@/components/mobile/MobileHeader'
import CourseCard from '@/components/mobile/CourseCard'
import SkeletonCard from '@/components/mobile/SkeletonCard'
import { BookOpen, Video, Award, Trophy, ChevronRight, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MobileDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/student/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json.data); // ApiResponse wraps data in .data
        }
      } catch (err) {
        console.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = [
    { label: 'Enrolled', value: data?.stats?.activeCourses || 0, color: 'text-emerald-600' },
    { label: 'Completed', value: data?.stats?.completedCourses || 0, color: 'text-blue-600' },
    { label: 'XP Points', value: data?.user?.totalPoints || 0, color: 'text-amber-600' },
  ];

  const quickLinks = [
    { label: 'Courses', icon: BookOpen, path: '/m/dashboard/courses', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Live', icon: Video, path: '/m/dashboard/live-lessons', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Achievements', icon: Award, path: '/m/dashboard/grades', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Badges', icon: Trophy, path: '/m/dashboard/certificates', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileHeader title="SARTHI" />
      
      <main className="p-4 space-y-8 pb-24">
        {/* Greeting Card */}
        <div className="relative overflow-hidden bg-emerald-900 rounded-3xl p-7 text-white shadow-xl shadow-emerald-900/20">
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight mb-1">
              {loading ? 'Initializing...' : `Hi, ${data?.user?.name?.split(' ')[0] || 'Student'}!`}
            </h2>
            <p className="text-sm text-emerald-100 font-medium opacity-90">
              Continue your professional evolution.
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute right-6 top-6">
            <Zap className="w-8 h-8 text-emerald-400 opacity-20" />
          </div>
        </div>

        {/* Stats Grid - Responsive via CSS utility */}
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="bg-white rounded-3xl p-5 text-center border border-slate-100 shadow-sm transition-all active:scale-95 group hover:border-emerald-100"
            >
              <div className={`text-2xl font-black mb-1 transition-transform group-hover:scale-110 ${stat.color}`}>
                {loading ? '—' : stat.value}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Learning */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
              CONTINUE LEARNING
            </h3>
            <button 
              onClick={() => router.push('/m/dashboard/courses')}
              className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>

          {loading ? (
            <SkeletonCard />
          ) : data?.enrolledCourses?.length > 0 ? (
            <CourseCard 
              {...data.enrolledCourses[0]} 
              title={data.enrolledCourses[0].title}
              instructor={data.enrolledCourses[0].instructor}
              thumbnail={data.enrolledCourses[0].thumbnail}
              progress={data.enrolledCourses[0].progress}
            />
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200">
              <p className="text-sm text-slate-500 font-medium mb-6">No active courses found.</p>
              <button 
                onClick={() => router.push('/m/dashboard/courses')}
                className="h-11 px-6 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-sm active:scale-95 transition-all"
              >
                Explore Courses
              </button>
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 px-1">
            QUICK ACCESS
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => router.push(link.path)}
                className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center gap-4 cursor-pointer shadow-sm active:scale-95 transition-all hover:border-emerald-100"
              >
                <div className={`${link.bg} p-4 rounded-2xl`}>
                  <link.icon size={24} className={link.color} />
                </div>
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{link.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

