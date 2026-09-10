'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  SortDesc,
  Eye,
  Edit,
  BookOpen,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Play,
  Pause,
  Archive,
  Trash2,
  Copy,
  Download,
  MoreVertical,
  Star,
  TrendingUp,
  Calendar,
  User,
  Package,
  RefreshCw,
  Zap,
  ArrowRight,
  Lock,
  History
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams, usePathname, useParams } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import Image from 'next/image';
import LessonVideoManager from './components/LessonVideoManager';

interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  price: number;
  originalPrice?: number;
  isPublished: boolean;
  isActive: boolean;
  publish_state: string;
  thumbnail?: string;
  instructor: { id: string; name: string; image?: string; email?: string };
  _count: { enrollments: number };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  slug: string;
  enrollmentStats?: {
    active: number;
    completed: number;
    expired: number;
    revoked: number;
  };
  avgCompletion?: number;
}

type TabType = 'overview' | 'curriculum' | 'pricing' | 'enrollments' | 'reviews' | 'analytics' | 'settings';

export default function CourseManagePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  const currentTab = (searchParams.get('tab') as TabType) || 'overview';
  
  const { data: course, isLoading, error, refetch } = useQuery<Course>({
    queryKey: ['admin-course', courseId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/courses/${courseId}`);
      if (!res.ok) throw new Error('Failed to fetch course');
      return res.json();
    },
    enabled: !!courseId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (action: string) => {
      const res = await fetch(`/api/admin/courses/${courseId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (!res.ok) throw new Error('Action failed');
      return res.json();
    },
    onSuccess: (data, action) => {
      addToast({ message: `Course ${action} successfully`, type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] });
      refetch();
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'enrollments', label: 'Enrollments', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const getStatusBadge = () => {
    if (!course) return null;
    const states = {
      draft: { label: 'Draft', class: 'bg-orange-50 text-orange-600 border-orange-100' },
      review: { label: 'In Review', class: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
      scheduled: { label: 'Scheduled', class: 'bg-blue-50 text-blue-600 border-blue-100' },
      published: { label: 'Published', class: 'bg-green-50 text-green-600 border-green-100' },
      archived: { label: 'Archived', class: 'bg-gray-50 text-gray-600 border-gray-100' },
      rejected: { label: 'Rejected', class: 'bg-red-50 text-red-600 border-red-100' },
    };
    const state = states[course.publish_state as keyof typeof states] || states.draft;
    return (
      <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", state.class)}>
        {state.label}
      </span>
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-red-50 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-[20px] font-bold text-[#1C2B4A]">Course Not Found</h3>
        <p className="text-[14px] text-[#7A8FAF] mt-2 mb-8">The course you&apos;re looking for doesn&apos;t exist.</p>
        <button onClick={() => router.push('/admin/courses')} className="px-10 py-4 bg-[#1C2B4A] text-white rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#2C3E5F] transition-all">
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/courses')}
            className="p-3 bg-white rounded-xl border border-[#E2E8F4] hover:border-[#1C2B4A] transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-[#1C2B4A]" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[24px] font-bold text-[#1C2B4A]">{course?.title || 'Loading...'}</h1>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-3 text-[12px] text-[#7A8FAF]">
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {course?.category || 'No category'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {course?.instructor?.name || 'No instructor'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created {course?.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(`/courses/${course?.slug}`, '_blank')}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-[#E2E8F4] text-[#1C2B4A] rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#F8F9FC] transition-all"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => updateStatusMutation.mutate(course?.isPublished ? 'unpublish' : 'publish')}
            disabled={updateStatusMutation.isPending}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all",
              course?.isPublished 
                ? "bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100"
                : "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"
            )}
          >
            {updateStatusMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : course?.isPublished ? (
              <>
                <Pause className="w-4 h-4" />
                Unpublish
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Publish
              </>
            )}
          </button>
          <button
            onClick={() => router.push(`/admin/courses/${courseId}/manage?tab=edit`)}
            className="flex items-center gap-2 px-5 py-3 bg-[#1C2B4A] text-white rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#2C3E5F] transition-all"
          >
            <Edit className="w-4 h-4" />
            Edit Course
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#F8F9FC] rounded-[20px] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-[16px] text-[11px] font-bold uppercase tracking-widest transition-all",
              currentTab === tab.id
                ? "bg-white text-[#1C2B4A] shadow-lg shadow-[#1C2B4A]/5"
                : "text-[#7A8FAF] hover:text-[#1C2B4A]"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-[32px] border border-[#E2E8F4] p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1C2B4A]" />
          </div>
        ) : (
          <>
            {currentTab === 'overview' && <OverviewTab course={course} />}
            {currentTab === 'curriculum' && <CurriculumTab course={course} refetch={refetch} />}
            {currentTab === 'pricing' && <PricingTab course={course} />}
            {currentTab === 'enrollments' && <EnrollmentsTab course={course} />}
            {currentTab === 'reviews' && <ReviewsTab course={course} />}
            {currentTab === 'analytics' && <AnalyticsTab course={course} />}
            {currentTab === 'settings' && <SettingsTab course={course} />}
          </>
        )}
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ course }: { course?: Course }) {
  if (!course) return null;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-[16px] font-bold text-[#1C2B4A] mb-3">Description</h3>
          <p className="text-[14px] text-[#7A8FAF] leading-relaxed">
            {course.description || 'No description provided.'}
          </p>
        </div>
        
        <div>
          <h3 className="text-[16px] font-bold text-[#1C2B4A] mb-3">Instructor</h3>
          <div className="flex items-center gap-4 p-4 bg-[#F8F9FC] rounded-2xl">
            <div className="relative w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[16px] border border-blue-100 uppercase overflow-hidden">
              {course.instructor?.image ? (
                <Image src={course.instructor.image} alt={course.instructor.name || 'Instructor'} fill className="object-cover" />
              ) : (
                (course.instructor?.name || 'I').split(' ').map(n => n[0]).join('')
              )}
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#1C2B4A]">{course.instructor?.name || 'Unassigned'}</p>
              <p className="text-[12px] text-[#7A8FAF]">{course.instructor?.email || 'No email'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="p-6 bg-[#F8F9FC] rounded-2xl">
          <h4 className="text-[12px] font-black text-[#7A8FAF] uppercase tracking-widest mb-4">Quick Stats</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#7A8FAF]">Total Enrollments</span>
              <span className="text-[16px] font-black text-[#1C2B4A]">{course._count?.enrollments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#7A8FAF]">Active Students</span>
              <span className="text-[16px] font-black text-[#1C2B4A]">{course.enrollmentStats?.active || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#7A8FAF]">Completed</span>
              <span className="text-[16px] font-black text-[#1C2B4A]">{course.enrollmentStats?.completed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#7A8FAF]">Avg. Completion</span>
              <span className="text-[16px] font-black text-green-600">{course.avgCompletion || 0}%</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-[#F8F9FC] rounded-2xl">
          <h4 className="text-[12px] font-black text-[#7A8FAF] uppercase tracking-widest mb-4">Timeline</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#7A8FAF]" />
              <span className="text-[12px] text-[#7A8FAF]">Created: {course?.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#7A8FAF]" />
              <span className="text-[12px] text-[#7A8FAF]">Updated: {course?.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            {course?.publishedAt && (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-[12px] text-[#7A8FAF]">Published: {new Date(course.publishedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Curriculum Tab (Enhanced with YouTube Teaching Flow)
function CurriculumTab({ course, refetch }: { course?: Course, refetch: () => void }) {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (course?.id) {
      fetch(`/api/courses/${course.id}/content`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setContent(data.modules || data.content || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [course?.id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#1C2B4A]" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-[#F0F4F8]">
        <div>
          <h3 className="text-[20px] font-bold text-[#1C2B4A]">Curriculum Manager</h3>
          <p className="text-[12px] text-[#7A8FAF] font-medium mt-1">Design your student&apos;s learning journey and manage video content.</p>
        </div>
        <div className="flex items-center gap-3">
             <button 
                onClick={() => addToast({ message: "Syncing from YouTube Playlist...", type: "info" })}
                className="px-5 py-3 bg-white border border-[#E2E8F4] text-[#1C2B4A] rounded-xl text-[11px] font-bold uppercase tracking-widest hover:border-[#1C2B4A] transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Sync YouTube
            </button>
            <button 
                onClick={() => window.open(`/admin/courses/${course?.id}/manage?tab=edit`, '_self')}
                className="px-5 py-3 bg-[#1C2B4A] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#2C3E5F] transition-all shadow-lg shadow-[#1C2B4A]/10"
            >
                Edit Structure
            </button>
        </div>
      </div>

      {content.length === 0 ? (
        <div className="text-center py-24 bg-[#F8F9FC] rounded-[32px] border-2 border-dashed border-[#E2E8F4]">
          <BookOpen className="w-16 h-16 text-[#E2E8F4] mx-auto mb-6" />
          <h4 className="text-[18px] font-bold text-[#1C2B4A]">The stage is empty.</h4>
          <p className="text-[#7A8FAF] max-w-sm mx-auto mt-2 mb-8 text-[14px]">Your curriculum structure determines how students progress through the course.</p>
          <button 
             onClick={() => window.open(`/admin/courses/${course?.id}/manage?tab=edit`, '_self')}
             className="px-8 py-3.5 bg-white border border-[#E2E8F4] text-[#1C2B4A] rounded-xl text-[12px] font-bold uppercase tracking-widest hover:border-[#1C2B4A] transition-all"
          >
             Initialize Curriculum
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {content.map((module: any, idx: number) => (
            <div key={module.id || idx} className="bg-[#FBFCFE] border border-[#E2E8F4] rounded-[24px] overflow-hidden group transition-all hover:bg-white hover:shadow-xl hover:shadow-[#1C2B4A]/5">
              <div className="p-6 flex items-center justify-between border-b border-[#F0F4F8]">
                <div className="flex items-center gap-5">
                  <span className="w-12 h-12 rounded-[14px] bg-[#1C2B4A] text-white flex items-center justify-center text-[18px] font-black shadow-lg shadow-[#1C2B4A]/20">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7A8FAF] mb-1 block">Module {idx + 1}</span>
                    <h4 className="font-bold text-[#1C2B4A] text-[16px]">{module.title || `Untitled Module`}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-white border border-[#E2E8F4] text-[10px] font-black text-[#7A8FAF] uppercase tracking-widest rounded-full">
                    {module.lessons?.length || 0} Lessons
                  </span>
                </div>
              </div>

              {module.lessons?.length > 0 ? (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {module.lessons.map((lesson: any, lIdx: number) => (
                    <div 
                      key={lesson.id || lIdx} 
                      className="bg-white border border-[#F0F4F8] p-4 rounded-2xl flex items-center justify-between group/lesson hover:border-[#3A6BC4] transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            lesson.youtube_video_id ? "bg-green-50 text-green-600 border border-green-100" : "bg-[#F8F9FC] text-[#7A8FAF] border border-[#F0F4F8]"
                        )}>
                          {lesson.youtube_video_id ? <CheckCircle2 className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#1C2B4A] group-hover/lesson:text-[#3A6BC4] transition-colors">{lesson.title || `Untitled Lesson ${lIdx + 1}`}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#E2E8F4]" />
                             <span className="text-[10px] font-bold text-[#A8B8D8] uppercase tracking-wider">{lesson.youtube_video_id ? 'Synced with YouTube' : 'No Video Bound'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="opacity-0 group-hover/lesson:opacity-100 transition-all">
                         <button className="p-2 bg-white border border-[#E2E8F4] text-[#7A8FAF] rounded-lg hover:border-[#3A6BC4] hover:text-[#3A6BC4] transition-all">
                            <Settings className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-[#7A8FAF] opacity-60">
                   <p className="text-[12px] font-bold uppercase tracking-widest">Add lessons to this module to start teaching</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Teaching Flow / Video Management Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedLesson(null)}
               className="absolute inset-0 bg-[#1C2B4A]/60 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-[85vh] bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
               <LessonVideoManager 
                  lesson={selectedLesson} 
                  onClose={() => setSelectedLesson(null)} 
                  onUpdate={() => {
                        refetch();
                        // Also trigger curriculum refetch if possible
                        // For now local status is enough
                  }} 
               />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Pricing Tab
function PricingTab({ course }: { course?: Course }) {
  if (!course) return null;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-[16px] font-bold text-[#1C2B4A] mb-4">Pricing Configuration</h3>
        <div className="space-y-4">
          <div className="p-4 bg-[#F8F9FC] rounded-2xl">
            <span className="text-[11px] font-black text-[#7A8FAF] uppercase tracking-widest">Current Price</span>
            <p className="text-[32px] font-bold text-[#1C2B4A] mt-1">
              {course.price === 0 ? 'FREE' : `₹${course.price.toLocaleString()}`}
            </p>
            {course.originalPrice && course.originalPrice > course.price && (
              <p className="text-[14px] text-[#7A8FAF] line-through mt-1">
                ₹{course.originalPrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-[16px] font-bold text-[#1C2B4A] mb-4">Pricing Actions</h3>
        <div className="space-y-3">
          <button 
            onClick={() => window.open(`/admin/courses/${course?.id}/manage?tab=edit`, '_self')}
            className="w-full flex items-center gap-3 p-4 bg-[#F8F9FC] rounded-xl text-[14px] font-bold text-[#1C2B4A] hover:bg-[#E2E8F4] transition-all"
          >
            <Edit className="w-5 h-5" />
            Update Price
          </button>
          <button className="w-full flex items-center gap-3 p-4 bg-[#F8F9FC] rounded-xl text-[14px] font-bold text-[#1C2B4A] hover:bg-[#E2E8F4] transition-all">
            <Copy className="w-5 h-5" />
            Apply Discount
          </button>
          <button 
            onClick={() => {
              const data = `Course,Price,Original Price\n"${course?.title}",${course?.price},${course?.originalPrice || ''}`;
              const blob = new Blob([data], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `pricing-${course?.slug || 'report'}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full flex items-center gap-3 p-4 bg-[#F8F9FC] rounded-xl text-[14px] font-bold text-[#1C2B4A] hover:bg-[#E2E8F4] transition-all"
          >
            <Download className="w-5 h-5" />
            Export Pricing Report
          </button>
        </div>
      </div>
    </div>
  );
}

// Enrollments Tab
function EnrollmentsTab({ course }: { course?: Course }) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (course?.id) {
      fetch(`/api/admin/courses/${course.id}/students`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setEnrollments(data.students || data.enrollments || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [course?.id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#1C2B4A]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[#1C2B4A]">Enrolled Students ({course?._count?.enrollments || 0})</h3>
      </div>
      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-[#E2E8F4] mx-auto mb-4" />
          <p className="text-[#7A8FAF]">No students enrolled yet</p>
        </div>
      ) : (
        <div className="divide-y divide-[#E2E8F4]">
          {enrollments.map((enrollment: any) => (
            <div key={enrollment.id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1C2B4A]/5 flex items-center justify-center font-bold text-[#1C2B4A]">
                  {(enrollment?.user?.name || enrollment?.name || 'Student')[0]}
                </div>
                <div>
                  <p className="font-medium text-[#1C2B4A]">{enrollment?.user?.name || enrollment?.name || 'Student'}</p>
                  <p className="text-sm text-[#7A8FAF]">{enrollment?.user?.email || enrollment?.email || ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#7A8FAF]">Enrolled: {enrollment?.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : 'N/A'}</p>
                <div className="mt-1">
                  <div className="h-1.5 bg-[#E2E8F4] rounded-full w-24">
                    <div className="h-full bg-[#E8B84B] rounded-full" style={{ width: `${enrollment.progress || 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Reviews Tab
function ReviewsTab({ course }: { course?: Course }) {
  return (
    <div className="space-y-6">
      <h3 className="text-[16px] font-bold text-[#1C2B4A]">Course Reviews</h3>
      <div className="text-center py-12">
        <Star className="w-12 h-12 text-[#E2E8F4] mx-auto mb-4" />
        <p className="text-[#7A8FAF]">Reviews feature coming soon</p>
        <p className="text-sm text-[#7A8FAF] mt-1">Student reviews and ratings will appear here</p>
      </div>
    </div>
  );
}

// Analytics Tab
function AnalyticsTab({ course }: { course?: Course }) {
  if (!course) return null;
  return (
    <div className="space-y-6">
      <h3 className="text-[16px] font-bold text-[#1C2B4A]">Course Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-[#F8F9FC] rounded-2xl">
          <p className="text-[11px] font-bold text-[#7A8FAF] uppercase tracking-widest">Total Enrollments</p>
          <p className="text-[32px] font-bold text-[#1C2B4A] mt-2">{course._count?.enrollments || 0}</p>
        </div>
        <div className="p-6 bg-[#F8F9FC] rounded-2xl">
          <p className="text-[11px] font-bold text-[#7A8FAF] uppercase tracking-widest">Active Students</p>
          <p className="text-[32px] font-bold text-green-600 mt-2">{course.enrollmentStats?.active || 0}</p>
        </div>
        <div className="p-6 bg-[#F8F9FC] rounded-2xl">
          <p className="text-[11px] font-bold text-[#7A8FAF] uppercase tracking-widest">Avg Completion</p>
          <p className="text-[32px] font-bold text-[#E8B84B] mt-2">{course.avgCompletion || 0}%</p>
        </div>
      </div>
      <div className="p-6 bg-[#F8F9FC] rounded-2xl">
        <p className="text-[14px] font-bold text-[#1C2B4A] mb-4">Enrollment Breakdown</p>
        <div className="space-y-3">
          {[
            { label: 'Active', value: course.enrollmentStats?.active || 0, color: 'bg-green-500' },
            { label: 'Completed', value: course.enrollmentStats?.completed || 0, color: 'bg-blue-500' },
            { label: 'Expired', value: course.enrollmentStats?.expired || 0, color: 'bg-orange-500' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full", stat.color)} />
              <span className="text-sm text-[#7A8FAF] flex-1">{stat.label}</span>
              <span className="font-bold text-[#1C2B4A]">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Settings Tab
function SettingsTab({ course }: { course?: Course }) {
  return (
    <div className="space-y-6">
      <h3 className="text-[16px] font-bold text-[#1C2B4A]">Course Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-[#E2E8F4] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#1C2B4A]">Visibility</span>
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
              course?.isPublished ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
            )}>
              {course?.isPublished ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
        <div className="p-4 border border-[#E2E8F4] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#1C2B4A]">Certificate Enabled</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
        </div>
        <div className="p-4 border border-[#E2E8F4] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#1C2B4A]">Drip Content</span>
            <XCircle className="w-5 h-5 text-gray-300" />
          </div>
        </div>
        <div className="p-4 border border-[#E2E8F4] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#1C2B4A]">Prerequisites</span>
            <XCircle className="w-5 h-5 text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
