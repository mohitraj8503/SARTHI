'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Activity,
  TrendingUp,
  Award,
  Trophy,
  Calendar,
  BarChart3,
  Shield,
  Target,
  Globe,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';

interface OlympiadStats {
  totalParticipants: number;
  totalSchools: number;
  totalClasses: number;
  aiCurriculumCompletion: number;
  advancedCSProgress: number;
  certificatesAwarded: number;
  topStudents: Array<{
    id: string;
    name: string;
    score: number;
    rank: number;
    class: string;
    avatar: string | null;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    type: 'olympiad' | 'workshop' | 'competition';
    registeredStudents: number;
  }>;
  performanceMetrics: {
    averageScore: number;
    improvementRate: number;
    participationRate: number;
    excellenceRate: number;
  };
}

export default function TeacherOlympiadOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OlympiadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateOlympiadStats = () => {
      if (!user) return;

      try {
        // Get teacher's courses to calculate class/school level stats
        const allCourses = storage.list<any>('courses:', true);
        const myCourses =
          user.role === 'admin'
            ? allCourses
            : allCourses.filter((c: any) => c.instructor.id === user.id);
        
        const myCourseIds = new Set(myCourses.map((c: any) => c.id));
        
        // Get enrollments for these courses
        const allEnrollments = storage.list<any>('enrollment:', true);
        const myEnrollments = allEnrollments.filter((e: any) =>
          myCourseIds.has(e.courseId || e.course_id || '')
        );
        const allUsers = storage.list<any>('users:', true);
        const userMap = new Map(allUsers.map((entry: any) => [entry.id, entry]));
        
        const totalParticipants = myEnrollments.length;
        const totalClasses = myCourses.length;
        const totalSchools = new Set(
          myEnrollments.map((entry: any) => entry.schoolId || entry.school_id || 'default-school')
        ).size;
        
        const averageProgress =
          totalParticipants > 0
            ? myEnrollments.reduce((sum: number, entry: any) => sum + (entry.progressPercentage || entry.progress_percentage || 0), 0) / totalParticipants
            : 0;
        const aiCurriculumCompletion = Math.round(averageProgress);
        
        const advancedCSProgress = Math.round(
          totalParticipants > 0
            ? (myEnrollments.filter((entry: any) => (entry.progressPercentage || entry.progress_percentage || 0) >= 60).length / totalParticipants) * 100
            : 0
        );
        
        const certificatesAwarded = myEnrollments.filter(
          (entry: any) => (entry.progressPercentage || entry.progress_percentage || 0) >= 100 || entry.status === 'completed'
        ).length;
        
        const topStudents = myEnrollments
          .map((entry: any) => {
            const userId = entry.userId || entry.user_id;
            const student = userMap.get(userId);
            const score = Number(student?.totalPoints || 0) + Number(entry.progressPercentage || entry.progress_percentage || 0);
            return {
              id: userId || entry.id,
              name: student?.name || 'Student',
              score,
              rank: 0,
              class: student?.grade || 'Unassigned',
              avatar: student?.image || student?.profile_picture || null,
            };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((student, index) => ({
            ...student,
            rank: index + 1,
          }));
        
        const upcomingEvents = [
          {
            id: 'event_1',
            title: 'National AI Olympiad Qualifiers',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'olympiad' as const,
            registeredStudents: Math.floor(totalParticipants * 0.3),
          },
          {
            id: 'event_2',
            title: 'CS Advanced Programming Workshop',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'workshop' as const,
            registeredStudents: Math.floor(totalParticipants * 0.2),
          },
          {
            id: 'event_3',
            title: 'International Olympiad Finals',
            date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'competition' as const,
            registeredStudents: Math.floor(totalParticipants * 0.15),
          }
        ];
        
        const performanceMetrics = {
          averageScore: topStudents.length > 0
            ? topStudents.reduce((sum, student) => sum + student.score, 0) / topStudents.length
            : 0,
          improvementRate: Math.min(100, Math.round(aiCurriculumCompletion * 0.35)),
          participationRate: myCourses.length > 0
            ? Math.min(100, Math.round((totalParticipants / myCourses.length) * 10))
            : 0,
          excellenceRate: totalParticipants > 0
            ? Math.round((topStudents.filter((student) => student.score >= 80).length / totalParticipants) * 100)
            : 0,
        };
        
        setStats({
          totalParticipants,
          totalSchools,
          totalClasses,
          aiCurriculumCompletion,
          advancedCSProgress,
          certificatesAwarded,
          topStudents,
          upcomingEvents,
          performanceMetrics,
        });
      } catch (error) {
        console.error('Error calculating olympiad stats:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateOlympiadStats();
    // Poll for updates
    const interval = setInterval(calculateOlympiadStats, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading)
    return (
      <div className="p-12 flex justify-center text-slate-400">
        <BarChart3 className="w-6 h-6 animate-spin mr-2" /> Loading olympiad data...
      </div>
    );

  if (!stats) return <div className="p-8 text-center text-slate-400">No olympiad data available</div>;

  return (
    <div className="space-y-8">
      {/* Olympiad Overview Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-dark">Olympiad & AI/CS Overview</h2>
            <p className="text-gray-500 text-sm">Comprehensive view of your school&apos;s olympiad participation and achievements</p>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <Globe className="w-6 h-6" />
          </div>
        </div>
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Users} 
            label="Total Participants" 
            value={stats.totalParticipants} 
            color="blue" 
          />
          <StatCard 
            icon={BookOpen} 
            label="AI Curriculum" 
            value={`${stats.aiCurriculumCompletion}%`} 
            color="purple" 
          />
          <StatCard 
            icon={Activity} 
            label="Advanced CS" 
            value={`${stats.advancedCSProgress}%`} 
            color="green" 
          />
          <StatCard 
            icon={Award} 
            label="Certificates" 
            value={stats.certificatesAwarded} 
            color="emerald" 
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-brand-dark flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-orange" />
            Performance Metrics
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="Average Score" 
            value={Math.round(stats.performanceMetrics.averageScore)}
            icon={Target}
            color="blue"
          />
          <MetricCard 
            label="Improvement Rate" 
            value={stats.performanceMetrics.improvementRate.toFixed(1) + '%'}
            icon={TrendingUp}
            color="green"
          />
          <MetricCard 
            label="Participation Rate" 
            value={stats.performanceMetrics.participationRate.toFixed(0) + '%'}
            icon={Users}
            color="purple"
          />
          <MetricCard 
            label="Excellence Rate" 
            value={stats.performanceMetrics.excellenceRate.toFixed(0) + '%'}
            icon={Shield}
            color="red"
          />
        </div>
      </div>

      {/* Leaderboard & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-brand-dark flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Top Performers Leaderboard
            </h3>
          </div>
          <div className="space-y-3">
            {stats.topStudents.map((student) => (
              <div 
                key={student.id} 
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {student.avatar ? (
                    <Image
                      src={student.avatar}
                      alt={student.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-gray-500">{student.name[0]}</span>
                  )}
                </div>
                <div className="flex-1 ml-4">
                  <p className="text-brand-dark font-bold">{student.name}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">{student.class}</span>
                    <span className="w-px h-2 bg-gray-300 mx-2"></span>
                    <span className="text-gray-500">Rank #{student.rank}</span>
                  </div>
                </div>
                <div className="text-right text-gray-600 font-mono">
                  {student.score} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-brand-dark flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Upcoming Events
            </h3>
          </div>
          <div className="space-y-3">
            {stats.upcomingEvents.map((event) => (
              <div 
                key={event.id} 
                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-brand-dark">{event.title}</h4>
                    <p className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{event.registeredStudents} students registered</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span 
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        event.type === 'olympiad' 
                          ? 'bg-blue-100 text-blue-800'
                          : event.type === 'workshop'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {stats.upcomingEvents.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No upcoming events scheduled
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    green: 'text-green-600 bg-green-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    indigo: 'text-indigo-600 bg-indigo-50',
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-1">{label}</p>
          <h3 className="text-2xl font-extrabold text-brand-dark">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${colors[color as keyof typeof colors]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: any) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 text-center">
      <div className="flex items-center justify-center mb-3">
        <Icon className={`w-6 h-6 ${colors[color as keyof typeof colors]}`} />
      </div>
      <p className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-2">{label}</p>
      <p className="text-2xl font-extrabold text-brand-dark">{value}</p>
    </div>
  );
}

