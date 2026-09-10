'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Activity,
  Clock,
  Edit,
  LogIn,
  X,
  ExternalLink,
  CreditCard,
  GraduationCap,
  MessageSquare,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Award,
  History,
  Send,
  Lock,
  Pause,
  Play,
  Download,
  MapPin,
  Globe,
  Zap,
  TrendingUp,
  Monitor,
  Key
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { isIilmUniversity } from '@/lib/utils/iilm';

// --- Interfaces ---

interface StudentIntelligence {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  avatar_url: string | null;
  avatar_version: number;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string | null;
  lastActive: string | null;
  enrollmentNumber: string | null;
  loginCount: number;
  failedLoginAttempts: number;
  location: string | null;
  authProvider: string | null;
  college?: string | null;
  currentCourse?: string | null;
  lastQualification?: string | null;
  onboarded?: boolean;
  onboardingStatus?: string | null;
  bio?: string | null;
  studentId?: string | null;
  applications?: Array<{
    id: string;
    college: string | null;
    course: string | null;
    semester: string | null;
    domain: string | null;
    preferredField: string | null;
    internshipTrack: string | null;
    status: string;
    resume: string | null;
    github: string | null;
    linkedin: string | null;
    portfolio: string | null;
    statement: string | null;
    submittedAt: string;
    offerAcceptedAt: string | null;
  }>;
  stats: {
    enrolledCourses: number;
    activeCourses: number;
    avgProgress: number;
    totalWatchTime: string;
    engagementScore: number;
    attendanceRate: number;
  };
  enrollments: Array<{
    id: string;
    status: string;
    progressPercentage: number;
    liveAttendanceRate: number;
    lastAccessedAt: string | null;
    course: {
      id: string;
      title: string;
      slug: string;
      category: string | null;
      level: string;
    };
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    data: string;
    createdAt: string;
  }>;
}

// --- Main Component ---

export default function StudentIntelligencePage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const studentId = params.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'learning' | 'activity' | 'engagement' | 'logs' | 'security' | 'notes'>('overview');

  // Fetch student intelligence data
  const { data: student, isLoading, error } = useQuery<StudentIntelligence>({
    queryKey: ['admin-student-intel', studentId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/students/${studentId}`);
      if (!res.ok) throw new Error('Failed to fetch intelligence data');
      const data = await res.json();
      return data.student;
    },
    enabled: !!studentId,
    retry: false,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      addToast({ type: 'success', title: 'Protocol Updated', message: 'Student status synchronized successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-student-intel', studentId] });
    },
  });

  if (isLoading) return <LoadingState />;
  if (error || !student) return <ErrorState onBack={() => router.push('/admin/students')} />;

  const profileImage = student.avatar_url 
    ? `${student.avatar_url}?v=${student.avatar_version || 0}` 
    : student.image || "/avatar.png";

  return (
    <div className="relative min-h-screen pb-20 space-y-8 animate-in fade-in duration-700">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/admin/students')}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <Image
              src={profileImage}
              alt={student.name || 'Student Avatar'}
              width={72}
              height={72}
              className="rounded-2xl object-cover border-2 border-amber-500/20 shadow-md"
            />
            <span className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
              student.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'
            )} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{student.name || 'Anonymous Student'}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                student.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
              )}>
                {student.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
              <span className="font-mono text-amber-600 font-bold">{student.enrollmentNumber || 'NO-ID'}</span>
              <span>•</span>
              <Mail className="w-3.5 h-3.5" /> {student.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => updateStatusMutation.mutate(student.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
            className={cn(
              "flex-1 lg:flex-none px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm",
              student.status === 'ACTIVE' 
                ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200" 
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200"
            )}
          >
            {student.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {student.status === 'ACTIVE' ? 'Suspend Access' : 'Reactivate Student'}
          </button>
        </div>
      </div>

      {/* 📊 STATS HIGHLIGHT BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Courses Intel" value={student.stats.enrolledCourses} subtext={`${student.stats.activeCourses} Active`} icon={BookOpen} color="blue" />
        <StatCard title="Avg Progress" value={`${student.stats.avgProgress}%`} subtext="Across All Courses" icon={TrendingUp} color="emerald" />
        <StatCard title="Learning Hours" value={student.stats.totalWatchTime} subtext="Est. Watch Time" icon={Clock} color="amber" />
        <StatCard title="Engagement Score" value={student.stats.engagementScore} subtext="Activity Metric" icon={Zap} color="purple" />
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: Globe },
          { id: 'learning', label: 'Learning', icon: BookOpen },
          { id: 'activity', label: 'Activity', icon: Activity },
          { id: 'engagement', label: 'Engagement', icon: MessageSquare },
          { id: 'logs', label: 'Logs', icon: History },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'notes', label: 'Notes', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all relative whitespace-nowrap",
              activeTab === tab.id ? "text-amber-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500" />
            )}
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-amber-500" : "text-slate-400")} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🚀 CONTENT AREA: Dynamic Tab Views */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[500px]"
        >
          {activeTab === 'overview' && <OverviewView student={student} />}
          {activeTab === 'learning' && <LearningView student={student} />}
          {activeTab === 'activity' && <ActivityView student={student} />}
          {activeTab === 'engagement' && <EngagementView student={student} />}
          {activeTab === 'logs' && <LogsView student={student} />}
          {activeTab === 'security' && <SecurityView student={student} />}
          {activeTab === 'notes' && <NotesView studentId={student.id} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- Sub-View Components ---

function OverviewView({ student }: { student: StudentIntelligence }) {
  const latestApp = student.applications && student.applications.length > 0 ? student.applications[0] : null;
  const collegeName = student.college || latestApp?.college || 'Not Provided';
  const courseName = student.currentCourse || (latestApp?.course ? (latestApp.semester ? `${latestApp.course} (Sem ${latestApp.semester})` : latestApp.course) : 'Not Provided');
  const trackName = latestApp?.internshipTrack || latestApp?.domain || latestApp?.preferredField || 'N/A';

  const isIilm = isIilmUniversity(collegeName) || isIilmUniversity(student.college) || isIilmUniversity(latestApp?.college);

  const displayAppStatus = isIilm ? 'NOT APPLIED' : (latestApp?.status || 'N/A');
  const displayPhone = isIilm ? '—' : (student.phone || 'Not provided');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Academic & Onboarding Intelligence */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-amber-500" /> Academic & Onboarding Intelligence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DataField label="College / University" value={collegeName} icon={GraduationCap} />
            <DataField label="Course & Semester" value={courseName} icon={BookOpen} />
            <DataField label="Internship Track / Field" value={trackName} icon={Zap} />
            <DataField label="Onboarding Status" value={student.onboardingStatus || (student.onboarded ? 'COMPLETED' : 'IN_PROGRESS')} icon={CheckCircle} />
            {student.bio && <div className="md:col-span-2"><DataField label="Student Bio" value={student.bio} icon={FileText} /></div>}
          </div>
        </section>

        {/* Internship Application & Portfolios */}
        {latestApp && (
          <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-indigo-500" /> Internship Application & Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <DataField label="Application Status" value={displayAppStatus} icon={Award} />
              <DataField label="Offer Letter Date" value={latestApp.offerAcceptedAt ? new Date(latestApp.offerAcceptedAt).toLocaleDateString() : 'Pending'} icon={Calendar} />
            </div>

            {/* Quick Clickable Links Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
              {latestApp.resume && (
                <a 
                  href={latestApp.resume} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" /> Download Resume PDF
                </a>
              )}
              {latestApp.github && (
                <a 
                  href={latestApp.github.startsWith('http') ? latestApp.github : `https://${latestApp.github}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all"
                >
                  <Globe className="w-4 h-4 text-amber-500" /> GitHub Profile
                </a>
              )}
              {latestApp.linkedin && (
                <a 
                  href={latestApp.linkedin.startsWith('http') ? latestApp.linkedin : `https://${latestApp.linkedin}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> LinkedIn Profile
                </a>
              )}
              {latestApp.portfolio && (
                <a 
                  href={latestApp.portfolio.startsWith('http') ? latestApp.portfolio : `https://${latestApp.portfolio}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all"
                >
                  <Globe className="w-4 h-4" /> Portfolio Site
                </a>
              )}
            </div>
          </section>
        )}

        <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-500" /> Personal Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DataField label="Full Name" value={student.name || 'N/A'} icon={Edit} />
            <DataField label="Email Address" value={student.email} icon={Mail} />
            <DataField label="Contact Number" value={displayPhone} icon={Phone} />
            <DataField label="Identity Provider" value={student.authProvider || 'Email/Password'} icon={Shield} />
            <DataField label="Location Intel" value={student.location || 'Unknown Access Point'} icon={MapPin} />
            <DataField label="System Role" value={student.role} icon={Lock} />
          </div>
        </section>
      </div>
    </div>
  );
}

function LearningView({ student }: { student: StudentIntelligence }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {student.enrollments.map((enrollment) => (
          <motion.div
            key={enrollment.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500 transition-all group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-amber-50 transition-colors">
                  <BookOpen className="w-6 h-6 text-slate-400 group-hover:text-amber-600" />
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                  enrollment.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                )}>
                  {enrollment.status}
                </span>
              </div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-1 leading-tight group-hover:text-amber-600 transition-colors">
                {enrollment.course.title}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {enrollment.course.category || 'Core Path'} • {enrollment.course.level}
              </p>

              <div className="mt-8 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    <span>Progress</span>
                    <span className="text-slate-900">{enrollment.progressPercentage}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${enrollment.progressPercentage}%` }}
                      className="h-full bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</span>
                    <span className="text-sm font-black text-slate-900">{enrollment.liveAttendanceRate || 0}%</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Access</span>
                    <span className="text-sm font-black text-slate-900">
                      {enrollment.lastAccessedAt ? new Date(enrollment.lastAccessedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full py-4 bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-[#0F172A] hover:text-white transition-all flex items-center justify-center gap-2 border-t border-slate-100">
              <ExternalLink className="w-4 h-4" /> View Full Analytics
            </button>
          </motion.div>
        ))}
      </div>
      
      {student.enrollments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <BookOpen className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest">No active enrollments found</p>
        </div>
      )}
    </div>
  );
}

function ActivityView({ student }: { student: StudentIntelligence }) {
  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 p-10">
      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-10 flex items-center gap-4">
        <Activity className="w-8 h-8 text-amber-500" /> Behavioral Intelligence
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Activity Timeline</h4>
          <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {student.recentActivity.map((activity) => {
               let activityData = { description: '' };
               try { if (activity.data) activityData = JSON.parse(activity.data); } catch (e) {}
               return (
                 <div key={activity.id} className="relative">
                   <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 bg-white border-2 border-amber-500 rounded-full z-10" />
                   <div className="flex flex-col">
                     <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                       {activityData.description || activity.type.replace(/_/g, ' ')}
                     </span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                       {new Date(activity.createdAt).toLocaleString()}
                     </span>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>

        <div className="space-y-8">
           <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Login Frequency (Heatmap Simulation)</h4>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }).map((_, i) => {
                  const intensity = Math.random() > 0.5 ? Math.floor(Math.random() * 4) : 0;
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "aspect-square rounded-md transition-all",
                        intensity === 0 ? "bg-slate-200/50" :
                        intensity === 1 ? "bg-amber-100" :
                        intensity === 2 ? "bg-amber-300" : "bg-amber-500"
                      )}
                      title={`${intensity} sessions`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <span>Less Active</span>
                <span>Highly Active</span>
              </div>
           </div>

           <div className="p-8 bg-[#0F172A] rounded-[2.5rem] text-white">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6">Device Intel</h4>
              <div className="space-y-4">
                 <DeviceMetric icon={Monitor} label="Desktop (Chrome)" percentage={85} />
                 <DeviceMetric icon={Globe} label="Mobile (Safari)" percentage={15} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function EngagementView({ student }: { student: StudentIntelligence }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       <EngagementCard 
         title="Discussions" 
         count={Math.floor(student.loginCount / 2)} 
         label="Doubts Asked" 
         icon={MessageSquare} 
         color="blue" 
       />
       <EngagementCard 
         title="Assessments" 
         count={student.enrollments.length * 2} 
         label="Quizzes Taken" 
         icon={Award} 
         color="amber" 
       />
       <EngagementCard 
         title="Sync Attendance" 
         count={`${student.stats.attendanceRate}%`} 
         label="Live Presence" 
         icon={Calendar} 
         color="emerald" 
       />
       <EngagementCard 
         title="System Reputation" 
         count="A+" 
         label="Grade Index" 
         icon={Zap} 
         color="purple" 
       />
    </div>
  );
}

function LogsView({ student }: { student: StudentIntelligence }) {
  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
       <div className="p-8 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
             <History className="w-6 h-6 text-slate-400" /> System Audit Trail
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing Last 50 Events</span>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-white border-b border-slate-100">
                <tr>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol / Event</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Signature</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {student.recentActivity.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-100 rounded-lg">
                              <Shield className="w-3.5 h-3.5 text-slate-500" />
                           </div>
                           <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{log.type.replace(/_/g, ' ')}</span>
                        </div>
                     </td>
                     <td className="px-8 py-4">
                        <span className="text-xs font-medium text-slate-500 font-mono">192.168.1.XX (Cloud)</span>
                     </td>
                     <td className="px-8 py-4 text-xs text-slate-400 font-bold uppercase">
                        {new Date(log.createdAt).toLocaleString()}
                     </td>
                     <td className="px-8 py-4 text-right">
                        <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded uppercase tracking-widest">Verified</span>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}

function SecurityView({ student }: { student: StudentIntelligence }) {
  const { addToast } = useToast();
  return (
    <div className="max-w-4xl space-y-6">
       <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8">Security Configuration</h3>
          <div className="space-y-4">
             <SecurityToggle 
               icon={Key} 
               label="Password Protocol" 
               subLabel="Last synchronized: Never" 
               actionLabel="Reset Access" 
               onClick={() => addToast({ type: 'success', title: 'Security Protocol', message: 'Reset link dispatched' })}
             />
             <SecurityToggle 
               icon={Shield} 
               label="Email Verification" 
               subLabel={student.emailVerified ? "Verified Identity" : "Unverified"} 
               isStatus 
               statusLabel={student.emailVerified ? "VALID" : "PENDING"}
             />
             <SecurityToggle 
               icon={AlertCircle} 
               label="Failed Logins" 
               subLabel="Recent security events" 
               isStatus 
               statusLabel={`${student.failedLoginAttempts} ATTEMPTS`}
               statusColor={student.failedLoginAttempts > 0 ? "rose" : "emerald"}
             />
          </div>
       </section>

       <section className="bg-rose-50 rounded-[2.5rem] border border-rose-100 p-8">
          <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-4">Danger Zone</h3>
          <p className="text-xs text-rose-500/80 mb-6 font-medium leading-relaxed">
            Deactivating or suspending an account will terminate all active learning sessions and block access to all enrolled courses. Proceed with caution.
          </p>
          <div className="flex gap-4">
             <button className="px-6 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
                Suspend Account
             </button>
             <button className="px-6 py-3 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">
                Deactivate Forever
             </button>
          </div>
       </section>
    </div>
  );
}

function NotesView({ studentId }: { studentId: string }) {
  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 p-10">
       <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8">Internal Intel Notes</h3>
       <div className="space-y-6">
          <textarea 
            placeholder="Add a classified internal note..."
            className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm focus:bg-white focus:border-amber-500 outline-none min-h-[150px] transition-all"
          />
          <button className="px-8 py-3.5 bg-[#0F172A] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl">
             Save Intel Note
          </button>
       </div>
    </div>
  );
}

// --- Internal Reusable Components ---

function StatCard({ title, value, subtext, icon: Icon, color }: any) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };
  const currentColor = colors[color as keyof typeof colors] || colors.blue;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-2xl border", currentColor)}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-900 tracking-tighter group-hover:scale-105 transition-transform origin-left">{value}</p>
      {subtext && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtext}</p>}
    </div>
  );
}

function IntelStatCard({ icon: Icon, label, value, subValue, color, progress }: any) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 ring-blue-500",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500",
    amber: "bg-amber-50 text-amber-600 border-amber-100 ring-amber-500",
    purple: "bg-purple-50 text-purple-600 border-purple-100 ring-purple-500",
  };
  
  const currentColor = colors[color as keyof typeof colors];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
           <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={cn("h-full", `bg-${color}-500`)} />
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-2xl border", currentColor)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h3>
      <p className="text-3xl font-black text-slate-900 tracking-tighter group-hover:scale-105 transition-transform origin-left">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subValue}</p>
    </div>
  );
}

function DataField({ label, value, icon: Icon }: any) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
      <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-400">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-black text-slate-900 tracking-tight">{value}</span>
      </div>
    </div>
  );
}

function ProgressMetric({ label, value, color }: any) {
  const colors = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-900">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={cn("h-full rounded-full", colors[color as keyof typeof colors])} 
        />
      </div>
    </div>
  );
}

function DeviceMetric({ icon: Icon, label, percentage }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-white/30" />
            <span className="text-[11px] font-bold text-white/60">{label}</span>
         </div>
         <span className="text-[11px] font-black text-white">{percentage}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
         <div className="h-full bg-amber-500" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function EngagementCard({ title, count, label, icon: Icon, color }: any) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-500",
    amber: "bg-amber-500/10 text-amber-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    purple: "bg-purple-500/10 text-purple-500",
  };
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 flex flex-col items-center text-center group hover:border-amber-500 transition-all shadow-sm">
       <div className={cn("p-5 rounded-3xl mb-6 transition-transform group-hover:scale-110 duration-500", colors[color as keyof typeof colors])}>
          <Icon className="w-8 h-8" />
       </div>
       <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{title}</h4>
       <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{count}</p>
       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function SecurityToggle({ icon: Icon, label, subLabel, actionLabel, onClick, isStatus, statusLabel, statusColor }: any) {
  return (
    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
       <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 border border-slate-100">
             <Icon className="w-5 h-5" />
          </div>
          <div>
             <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{label}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subLabel}</p>
          </div>
       </div>
       {isStatus ? (
          <span className={cn(
            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
            statusColor === 'rose' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
          )}>
             {statusLabel}
          </span>
       ) : (
          <button onClick={onClick} className="px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0F172A] hover:text-white hover:border-[#0F172A] transition-all shadow-sm">
             {actionLabel}
          </button>
       )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing Intel Core...</p>
    </div>
  );
}

function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] text-center px-6">
      <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mb-6 border border-rose-100">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Protocol Breach</h2>
      <p className="text-slate-500 max-w-md mb-8 font-medium">
        Unable to resolve student identity. The data nexus might be offline or the user record has been purged.
      </p>
      <button onClick={onBack} className="px-8 py-4 bg-[#0F172A] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl">
         Return to Fleet Command
      </button>
    </div>
  );
}
