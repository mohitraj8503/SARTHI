'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, ChevronDown, ChevronRight, CheckCircle,
  Circle, Lock, BookOpen, FileText, MessageSquare, Download,
  Clock, Trophy, Target, ArrowLeft, Search, Menu, X,
  Share2, Bookmark, AlertTriangle, PlayCircle, Loader2 as LucideLoader,
  HelpCircle, MessageCircle, Send, Plus, CornerDownRight, Check, CheckCircle2,
  Terminal, Monitor, Users, Eye, Sparkles, BookOpenCheck, Settings, Volume2, ShieldCheck,
  Video, User, FileSpreadsheet, Zap, HelpCircle as ChallengeIcon, GraduationCap, Flame, Radio
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import UnifiedVideoPlayer from '@/components/UnifiedVideoPlayer';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';
import { useLearnStore } from '@/lib/store/useLearnStore';

interface CourseLearningClientPageProps {
  slug: string;
  user: any;
}

export default function CourseLearningClientPage({ slug, user }: CourseLearningClientPageProps) {
  const router = useRouter();
  const { addToast } = useToast();

  // Zustand Store
  const {
    currentLessonId,
    completedLessons,
    progressPercent,
    sidebarOpen,
    activeTab,
    isZenMode,
    setLesson,
    markComplete,
    setCompletedLessons,
    setProgressPercent,
    setSidebarOpen,
    setTab,
    setZenMode
  } = useLearnStore();

  // Local Component States
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Workstation state: show lesson outcome screen before video plays
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  // Active Cognitive States
  const [predictionSelected, setPredictionSelected] = useState<string | null>(null);
  const [sandboxSelected, setSandboxSelected] = useState<string | null>(null);
  const [sandboxRate, setSandboxRate] = useState<string>('');
  const [sandboxFeedback, setSandboxFeedback] = useState<string | null>(null);
  const [showDopamineModal, setShowDopamineModal] = useState(false);
  const [dopamineMsg, setDopamineMsg] = useState('');

  // Discussion state
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [postingQuestion, setPostingQuestion] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  
  // Quiz state
  const [quizData, setQuizData] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<any>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);

  const playerRef = useRef<any>(null);

  // Reset starting state on unit transition
  useEffect(() => {
    setHasStartedPlaying(false);
    setPredictionSelected(null);
    setSandboxSelected(null);
    setSandboxRate('');
    setSandboxFeedback(null);
  }, [currentLessonId]);

  // Poll curriculum status every 30 seconds to update live streams dynamically
  useEffect(() => {
    if (!slug) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/student/courses/${slug}/learn`);
        if (res.ok) {
          const result = await res.json();
          setCourseData(result.data);
        }
      } catch (err) {
        console.warn('[Poll] Failed to sync live stream status:', err);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  // Fetch Course curriculum & lessons
  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/student/courses/${slug}/learn`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to fetch learning data');
        
        const payload = result.data;
        setCourseData(payload);
        setProgressPercent(payload?.progress || 0);

        // Gather all completed lesson ids
        const completedIds: string[] = [];
        payload?.modules?.forEach((m: any) => {
          m.lessons?.forEach((l: any) => {
            if (l.completed) completedIds.push(l.id);
          });
        });
        setCompletedLessons(completedIds);
        
        // Auto-select and expand first active lesson
        if (payload?.modules?.length > 0) {
          const firstMod = payload.modules[0];
          setExpandedModules(new Set([firstMod.id]));
          if (firstMod.lessons?.length > 0) {
            setLesson(firstMod.lessons[0].id);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An error occurred while loading');
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [slug, setLesson, setCompletedLessons, setProgressPercent]);

  // Current lesson lookup helper
  const currentLesson = courseData?.modules
    ?.flatMap((m: any) => m.lessons)
    ?.find((l: any) => l.id === currentLessonId);

  // Find milestone name & index for overlays
  const currentModule = courseData?.modules?.find((m: any) =>
    m.lessons?.some((l: any) => l.id === currentLessonId)
  );
  const currentModuleIdx = courseData?.modules?.indexOf(currentModule) + 1;
  const currentLessonIdx = currentModule?.lessons?.indexOf(currentLesson) + 1;

  // Auto-fetch Discussions and Quiz when current lesson changes
  useEffect(() => {
    if (!courseData?.id || !currentLessonId) return;

    // Reset Quiz state when switching lessons
    setQuizData(null);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setQuizFeedback(null);
    setQuizScore(null);
    setQuizPassed(null);

    // Fetch Discussions
    async function fetchDiscussions() {
      setDiscussionLoading(true);
      try {
        const res = await fetch(`/api/courses/discussions?courseId=${courseData.id}&lessonId=${currentLessonId}`);
        if (res.ok) {
          const data = await res.json();
          setDiscussions(data || []);
        }
      } catch (err) {
        console.error('Failed to load discussions:', err);
      } finally {
        setDiscussionLoading(false);
      }
    }

    // Fetch Quiz
    async function fetchQuiz() {
      setQuizLoading(true);
      try {
        const res = await fetch(`/api/student/lessons/${currentLessonId}/quiz`);
        const data = await res.json();
        if (res.ok && data.available) {
          setQuizData(data.quiz);
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setQuizLoading(false);
      }
    }

    fetchDiscussions();
    fetchQuiz();
  }, [courseData?.id, currentLessonId]);

  const toggleModule = (id: string) => {
    const next = new Set(expandedModules);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedModules(next);
  };

  // Submit / Mark as complete logic
  const handleMarkComplete = async () => {
    if (!currentLessonId || !courseData?.id) return;
    
    try {
      const res = await fetch('/api/courses/video-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLessonId,
          courseId: courseData.id,
          progress: 1.0
        })
      });
      
      if (res.ok) {
        markComplete(currentLessonId);
        
        // Show Dopamine Success Banner
        setDopamineMsg(`Filing Skill Mastered: "${currentLesson?.title || 'Tax Unit'}"`);
        setShowDopamineModal(true);
        setTimeout(() => setShowDopamineModal(false), 2400);

        // Refresh progress
        const pRes = await fetch(`/api/student/courses/${slug}/learn`);
        if (pRes.ok) {
          const pData = await pRes.json();
          const pPayload = pData.data;
          setCourseData(pPayload);
          setProgressPercent(pPayload?.progress || 0);
        }

        setTimeout(() => {
          handleNextLesson();
        }, 1200);
      } else {
        throw new Error('Failed to mark complete');
      }
    } catch (err) {
      addToast('Failed to sync progress', 'error');
    }
  };

  const handleNextLesson = () => {
    const allLessons = courseData.modules.flatMap((m: any) => m.lessons);
    const currentIndex = allLessons.findIndex((l: any) => l.id === currentLessonId);
    if (currentIndex < allLessons.length - 1) {
      const next = allLessons[currentIndex + 1];
      if (next.status === 'locked') {
        addToast('Next unit is locked. Complete the current one first.', 'warning');
        return;
      }
      setLesson(next.id);
      const mod = courseData.modules.find((m: any) => m.lessons.some((l: any) => l.id === next.id));
      if (mod) {
        setExpandedModules(prev => new Set([...prev, mod.id]));
      }
    } else {
      addToast('Curriculum Mastered! Certificate unlocked.', 'success');
    }
  };

  const handlePreviousLesson = () => {
    const allLessons = courseData.modules.flatMap((m: any) => m.lessons);
    const currentIndex = allLessons.findIndex((l: any) => l.id === currentLessonId);
    if (currentIndex > 0) {
      const prev = allLessons[currentIndex - 1];
      setLesson(prev.id);
      const mod = courseData.modules.find((m: any) => m.lessons.some((l: any) => l.id === prev.id));
      if (mod) {
        setExpandedModules(prevSet => new Set([...prevSet, mod.id]));
      }
    }
  };

  // Broadcast doubtful questions
  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionContent || !courseData?.id || !currentLessonId) return;

    try {
      setPostingQuestion(true);
      const normalizedTitle = newQuestionTitle.trim() || newQuestionContent.trim().slice(0, 60) || 'Discussion';
      const res = await fetch('/api/courses/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: courseData.id,
          lessonId: currentLessonId,
          title: normalizedTitle,
          content: newQuestionContent
        })
      });
      if (res.ok) {
        const question = await res.json();
        setDiscussions(prev => [question, ...prev]);
        setNewQuestionTitle('');
        setNewQuestionContent('');
        addToast('Question posted to cohort.', 'success');
      } else {
        throw new Error();
      }
    } catch (err) {
      addToast('Failed to post question', 'error');
    } finally {
      setPostingQuestion(false);
    }
  };

  // Broadcast replies to questions
  const handlePostReply = async (questionId: string) => {
    const content = replyContent[questionId];
    if (!content) return;

    try {
      const res = await fetch(`/api/courses/discussions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: content })
      });
      if (res.ok) {
        const reply = await res.json();
        setDiscussions(prev => prev.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              answers: [...(q.answers || []), reply],
              _count: { ...q._count, answers: (q._count?.answers || 0) + 1 }
            };
          }
          return q;
        }));
        setReplyContent(prev => ({ ...prev, [questionId]: '' }));
        addToast('Response posted.', 'success');
      } else {
        throw new Error();
      }
    } catch (err) {
      addToast('Failed to submit reply', 'error');
    }
  };

  // Submit Quiz answers
  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizData || quizSubmitted) return;

    try {
      const res = await fetch(`/api/student/lessons/${currentLessonId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: selectedAnswers })
      });
      const data = await res.json();
      if (res.ok) {
        setQuizSubmitted(true);
        setQuizFeedback(data.feedback);
        setQuizScore(data.score);
        setQuizPassed(data.passed);

        if (data.passed) {
          addToast(`Verification complete! Score: ${data.score}%`, 'success');
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#c5a059', '#b8860b', '#10b981', '#3b82f6']
            });
          }, 300);
        } else {
          addToast(`Verification failed. Score: ${data.score}%. Retake the quiz!`, 'error');
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      addToast('Failed to submit evaluation', 'error');
    }
  };

  // Filter lectures based on search query
  const filteredModules = courseData?.modules?.map((module: any) => {
    const lessons = module.lessons.filter((l: any) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...module, lessons };
  }).filter((module: any) => module.lessons.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b0c] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="w-12 h-12 border-4 border-emerald-550/10 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest animate-pulse">Syncing learning environment...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !courseData) {
    return (
      <div className="min-h-screen bg-[#070b0c] flex items-center justify-center p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="max-w-md bg-white/[0.13] backdrop-blur-[24px] border border-white/[0.22] p-8 rounded-[32px] shadow-2xl relative z-10">
          <AlertTriangle size={48} className="text-emerald-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-3">Connection Interrupted</h2>
          <p className="text-white/60 font-semibold mb-8 text-xs">{errorMsg || 'The learning server is currently unreachable.'}</p>
          <button onClick={() => window.location.reload()} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
            Retry Handshake
          </button>
        </div>
      </div>
    );
  }

  const allLessonsList = courseData.modules.flatMap((m: any) => m.lessons);
  const isFirstLesson = allLessonsList[0]?.id === currentLessonId;
  const isLastLesson = allLessonsList[allLessonsList.length - 1]?.id === currentLessonId;
  const currentCourseLessonIdx = allLessonsList.findIndex((l: any) => l.id === currentLessonId) + 1;
  const totalCourseLessons = allLessonsList.length;

  // Custom sandbox transaction testing
  const handleSandboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxSelected) return;

    if (sandboxSelected === 'igst' && sandboxRate === '18') {
      setSandboxFeedback('[VALIDATED]: Correct tax stream and rate selected for this scenario.');
    } else if (sandboxSelected !== 'igst') {
      setSandboxFeedback('[REJECTED]: This scenario requires the alternate tax stream.');
    } else {
      setSandboxFeedback('[REJECTED]: Expected rate is 18%, not ' + sandboxRate + '%.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex antialiased select-none text-slate-900 relative overflow-hidden font-sans">

      {/* Dopamine Success Modal Overlay */}
      <AnimatePresence>
        {showDopamineModal && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/40 p-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.25)] flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="animate-bounce" size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Mastery Level Unlocked</p>
              <p className="text-xs font-semibold text-white mt-0.5">{dopamineMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📚 LEFT SIDEBAR: ACTIVE DEPTH SYSTEM */}
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 w-80 bg-[#1B4332] text-white border-r border-white/10 z-[110] flex flex-col transition-all duration-500 shadow-xl",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 h-[76px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl flex items-center justify-center p-1.5 w-9 h-9 relative shrink-0 shadow-md">
              <Image 
                src="/sarthi-logo.png" 
                alt="TT Logo" 
                width={36}
                height={36}
                priority
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="logo-text overflow-hidden whitespace-nowrap">
              <span className="text-sm font-black text-white tracking-tight block uppercase leading-none">
                SARTHI
              </span>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] leading-none mt-1 block">
                LEARNING OS
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileSidebarOpen(false)} 
            className="lg:hidden w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="p-5 border-b border-white/10 bg-white/5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-emerald-400">
              <span>Overall Progress</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="h-2 w-full bg-emerald-950/60 rounded-full overflow-hidden border border-emerald-500/20">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
              />
            </div>
          </div>
        </div>

        {/* Searching Node */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 rounded-xl border border-white/15 focus-within:border-emerald-400 transition-all">
            <Search size={13} className="text-white/60 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search syllabus units..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-medium w-full text-white placeholder:text-white/50" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-white/60 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Milestones & Lectures Active Depth List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
          {(searchQuery ? filteredModules : courseData.modules)?.map((module: any, mIdx: number) => {
            const completedCount = module.lessons.filter((l: any) => completedLessons.includes(l.id)).length;
            const isModuleComplete = completedCount === module.lessons.length && module.lessons.length > 0;

            return (
              <div key={module.id} className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
                <button 
                  onClick={() => toggleModule(module.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 transition-all text-left",
                    expandedModules.has(module.id) ? "bg-white/[0.03]" : "hover:bg-white/[0.01]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-inner transition-all border",
                      isModuleComplete ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      expandedModules.has(module.id) ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/40"
                    )}>
                      {isModuleComplete ? <Check size={12} className="text-emerald-400" /> : `0${mIdx + 1}`}
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold text-white uppercase tracking-wide line-clamp-1">{module.title}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">{module.lessons?.length || 0} Units</span>
                        <span className="text-[8px] text-white/30">•</span>
                        <span className="text-[8px] text-white/40 font-bold">{completedCount}/{module.lessons?.length || 0} complete</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown size={12} className={cn("text-white/30 transition-transform", expandedModules.has(module.id) && "rotate-180")} />
                </button>

                <AnimatePresence initial={false}>
                  {expandedModules.has(module.id) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-black/10 border-t border-white/5"
                    >
                      <div className="py-1">
                        {module.lessons?.map((lesson: any) => {
                          const isActive = lesson.id === currentLessonId;
                          const isLocked = lesson.status === 'locked';
                          const isCompleted = completedLessons.includes(lesson.id);

                          return (
                            <button
                              key={lesson.id}
                              disabled={isLocked}
                              onClick={() => {
                                setLesson(lesson.id);
                                if (window.innerWidth < 1024) setIsMobileSidebarOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 pl-6 text-left transition-all relative group border-b border-white/[0.02] last:border-0",
                                isActive 
                                  ? "bg-emerald-500/15 text-[#4ade80] border-l-[3px] border-l-[#22c55e]" 
                                  : isCompleted
                                    ? "text-white/45 hover:text-white/70 hover:bg-white/[0.01]"
                                    : "text-white/65 hover:bg-white/[0.02]",
                                isLocked && "opacity-25 cursor-not-allowed"
                              )}
                            >
                              <div className={cn(
                                "w-6 h-6 rounded-md flex items-center justify-center transition-all border",
                                isActive ? "bg-emerald-500/10 border-emerald-500/30 text-[#4ade80]" : "bg-black/20 border-white/5 text-white/30 group-hover:text-white/50"
                              )}>
                                {isCompleted ? <CheckCircle size={11} className="text-[#4ade80]" /> : 
                                 isLocked ? <Lock size={9} className="text-white/20" /> : 
                                 isActive ? <Play size={9} fill="currentColor" className="animate-pulse" /> : <Circle size={9} />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-[11px] font-bold leading-tight truncate",
                                  isCompleted && "line-through decoration-white/20 text-white/35"
                                )}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Clock size={8} className="text-white/20" />
                                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{lesson.duration || 10} min</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Sidebar Bottom section */}
        <div className="p-4 border-t border-white/5 space-y-2 bg-black/25">
          <Link 
            href="/dashboard/courses" 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={10} />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* 🎬 MAIN WORKSPACE FRAME */}
      <main className="flex-1 flex flex-col bg-transparent overflow-y-auto custom-scrollbar pb-16 relative z-[2]">
        
        {/* Navigation Header */}
        <header className="h-[76px] bg-white border-b border-[#EAF0F7] shadow-xs flex items-center justify-between px-6 sticky top-0 z-[100] text-slate-900">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
              className="lg:hidden p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-200 transition-all"
            >
              <Menu size={14} />
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">
                {courseData.title}
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs text-emerald-600 font-black uppercase tracking-wider">
                Milestone 0{currentModuleIdx}
              </span>
            </div>
          </div>

          <div className="text-center max-w-md hidden md:block">
            <h1 className="text-sm font-black text-slate-900 tracking-tight line-clamp-1 uppercase">
              {currentLesson?.title || 'Lesson View'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {currentCourseLessonIdx} of {totalCourseLessons}
            </span>
            <span className="text-slate-200">|</span>
            <button
              disabled={isFirstLesson}
              onClick={handlePreviousLesson}
              className={cn(
                "p-2 rounded-xl border transition-all",
                isFirstLesson ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed" : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 shadow-xs"
              )}
              title="Previous Lesson"
            >
              <SkipBack size={12} />
            </button>
            <button
              onClick={handleMarkComplete}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-emerald-900/10 active:scale-95"
            >
              <span>{isLastLesson ? 'Finish Course' : 'Complete Lesson'}</span>
              <SkipForward size={12} />
            </button>
          </div>
        </header>
        <div className="max-w-[1536px] w-full mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-all duration-500">
          
          {/* LEFT SIDE (70-75% width on desktop) */}
          <div className={cn(
            "flex flex-col space-y-6 transition-all duration-500",
            hasStartedPlaying ? "lg:col-span-9" : "lg:col-span-8"
          )}>
            <motion.div
              key={currentLessonId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col space-y-6"
            >
              {hasStartedPlaying && (
                /* Compact Lesson Bar */
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl px-5 py-3 flex items-center justify-between text-xs text-white/70 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      Milestone 0{currentModuleIdx} • Lecture 0{currentLessonIdx || 1}
                    </span>
                    <span className="font-bold text-white tracking-tight">{currentLesson?.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-white/40 font-bold">
                    <span className="flex items-center gap-1.5"><Clock size={10} className="text-white/30" /> {currentLesson?.duration || 10} min</span>
                    <span>•</span>
                    <span className="capitalize">{currentLesson?.difficulty || 'Beginner'}</span>
                  </div>
                </div>
              )}

              {!hasStartedPlaying && (
                /* Lesson Identity context card */
                <div className="bg-white border border-[#EAF0F7] rounded-[32px] p-6 lg:p-8 shadow-[0_12px_35px_rgba(15,23,42,0.06)] text-left space-y-3">
                  <div className="flex flex-wrap gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                    <span className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                      Milestone 0{currentModuleIdx} • Lecture 0{currentLessonIdx || 1}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {currentLesson?.title}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
                    {currentLesson?.description || "Build strong fundamentals and practical workflow clarity for this lecture."}
                  </p>

                  {/* Minimal Metadata badges */}
                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-500 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-emerald-600" />
                      {currentLesson?.duration || 10} min
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <User size={14} className="text-emerald-600" />
                      Dr. Vighnesh VN
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-emerald-600" />
                      Beginner
                    </span>
                  </div>
                </div>
              )}

            {/* Video Player / Poster Container */}
            <div 
              className={cn(
                "relative overflow-hidden w-full aspect-video max-h-[520px] rounded-[32px] border border-[#EAF0F7] bg-slate-950 shadow-[0_12px_35px_rgba(15,23,42,0.06)]",
                (!hasStartedPlaying && !(currentLesson?.contentType === 'live' || currentLesson?.contentType === 'live-session')) ? "cursor-pointer group" : ""
              )}
              onClick={() => { 
                if (!hasStartedPlaying && !(currentLesson?.contentType === 'live' || currentLesson?.contentType === 'live-session')) {
                  setHasStartedPlaying(true); 
                }
              }}
            >
              <div className="w-full h-full relative">
                {(currentLesson?.contentType === 'live' || currentLesson?.contentType === 'live-session') ? (
                  currentLesson?.liveStatus === 'LIVE' ? (
                    /* Class is Currently Live - Join Button */
                    <div className="absolute inset-0 bg-[#0E1712] backdrop-blur-md flex flex-col items-center justify-center p-6 sm:p-8 text-center border border-emerald-500/25">
                      <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 animate-pulse">
                        <Radio className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase mb-2 tracking-tight">Class is Currently LIVE!</h3>
                      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                        Your instructor is now live streaming. Join the interactive video session now.
                      </p>
                      <Link 
                        href={`/live/${currentLesson?.id}`}
                        target="_blank"
                        className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                      >
                        Join Live Class
                      </Link>
                    </div>
                  ) : currentLesson?.liveStatus === 'ENDED' ? (
                    /* Class Has Ended - Custom player mode */
                    currentLesson?.videoUrl ? (
                      <div className="w-full h-full relative">
                        <div className="absolute top-4 left-4 z-20 bg-emerald-600/90 border border-emerald-500/30 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                          Watch Class Recording
                        </div>
                        <UnifiedVideoPlayer
                          ref={playerRef}
                          src={currentLesson?.videoUrl || ''}
                          title={currentLesson?.title || 'Class Recording'}
                          lessonId={currentLesson?.id}
                          courseId={courseData?.id}
                          autoplay={hasStartedPlaying}
                          onComplete={handleMarkComplete}
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      /* Video is still processing on Drive */
                      <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                          <LucideLoader className="w-8 h-8 animate-spin" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase mb-2 tracking-tight">Processing Class Recording</h3>
                        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                          The live session has ended. We are currently preparing the video and saving it to Google Drive. This usually takes 1-2 minutes. Please refresh the page in a moment.
                        </p>
                      </div>
                    )
                  ) : (
                    /* Class Scheduled - Waiting Room view */
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                      <div className="w-16 h-16 bg-white/5 border border-white/10 text-slate-400 rounded-full flex items-center justify-center mb-6">
                        <Clock className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase mb-2 tracking-tight">Live Session Scheduled</h3>
                      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                        Waiting for the teacher to start the meeting. Once active, a Join button will appear automatically.
                      </p>
                      {currentLesson?.scheduledAt && (
                        <span className="text-[10px] mt-4 px-3 py-1 bg-white/5 border border-white/5 text-slate-400 rounded-full font-bold uppercase tracking-wider">
                          Scheduled: {new Date(currentLesson.scheduledAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )
                ) : (
                  /* Standard Pre-recorded Lesson */
                  <>
                    <UnifiedVideoPlayer
                      ref={playerRef}
                      src={currentLesson?.videoUrl || ''}
                      title={currentLesson?.title || 'Learning Node'}
                      lessonId={currentLesson?.id}
                      courseId={courseData?.id}
                      autoplay={hasStartedPlaying}
                      onComplete={handleMarkComplete}
                      className="w-full h-full"
                    />
                    
                    {/* Poster Overlay */}
                    {!hasStartedPlaying && (
                      <div className="absolute inset-0 z-10">
                        <Image 
                          src={courseData?.thumbnail || '/sarthi-logo.png'}
                          alt="Lesson Preview"
                          fill
                          className="object-cover opacity-100 group-hover:scale-[1.03] transition-transform duration-700 brightness-[1.04] contrast-[1.03]"
                          style={{ imageRendering: 'auto' }}
                        />
                        <div 
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(to top, rgba(0,0,0,0.18), rgba(0,0,0,0.02))'
                          }}
                        >
                          <div 
                            className="w-11 h-11 rounded-full bg-white/12 border border-white/20 text-white flex items-center justify-center backdrop-blur-[8px] transition-all transform group-hover:scale-110 active:scale-95 shadow-none"
                          >
                            <Play size={15} fill="currentColor" className="ml-0.5" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {hasStartedPlaying && (
              /* Active Play Workspace Tabs */
              <div className="bg-white border border-[#EAF0F7] rounded-[32px] p-6 lg:p-8 shadow-[0_12px_35px_rgba(15,23,42,0.06)] text-slate-900 flex flex-col min-h-[380px] text-left mt-6 animate-fadeIn">
                {/* Tab Navigation */}
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'learn', label: 'Learn', icon: BookOpen },
                    { id: 'practice', label: 'Practice', icon: Terminal },
                    { id: 'discuss', label: 'Discuss', icon: MessageSquare },
                    { id: 'review', label: 'Review', icon: Trophy },
                    { id: 'validate', label: 'Validate', icon: ShieldCheck }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-1.5 pb-2 text-xs font-black uppercase tracking-widest transition-all relative flex-shrink-0",
                        activeTab === tab.id ? "text-emerald-600 font-black" : "text-slate-400 hover:text-slate-700"
                      )}
                    >
                      <tab.icon size={13} className={activeTab === tab.id ? "text-emerald-600" : "text-slate-400"} />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div 
                          layoutId="tabLine" 
                          className="absolute bottom-[-1px] left-0 right-0 h-[2.5px] bg-emerald-600 rounded-full" 
                          transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* TAB PANELS */}
                <div className="flex-1 mt-4 overflow-y-auto custom-scrollbar pr-1">
                  
                  {/* 📘 1. LEARN PANEL */}
                  {activeTab === 'learn' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="space-y-2">
                        <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                          {currentLesson?.description || 'Learn core concepts and practical workflows in this lesson.'}
                        </p>
                      </div>

                      {/* Cognitive Tension Challenge */}
                      <div className="p-5 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black text-emerald-700 uppercase tracking-widest">
                          <ChallengeIcon size={14} />
                          Filing Challenge Predictor
                        </div>
                        <p className="text-xs text-slate-800 font-bold leading-normal">
                          Before moving ahead, test your intuition: choose the most accurate option for this scenario.
                        </p>
                        
                        <div className="grid grid-cols-1 gap-2.5 pt-1">
                          <button 
                            onClick={() => setPredictionSelected('a')}
                            className={cn(
                              "p-3.5 rounded-xl border text-left text-xs font-bold transition-all",
                              predictionSelected === 'a' 
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            A. Consolidated State-wise
                          </button>
                          <button 
                            onClick={() => setPredictionSelected('b')}
                            className={cn(
                              "p-3.5 rounded-xl border text-left text-xs font-bold transition-all",
                              predictionSelected === 'b' 
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            B. Invoice-level detailed logs
                          </button>
                        </div>

                        {predictionSelected && (
                          <div className="text-xs text-emerald-800 font-bold mt-2 animate-fadeIn p-3 bg-emerald-100/60 rounded-xl border border-emerald-200">
                            💡 {predictionSelected === 'a' 
                              ? "Correct! Small inter-state or any intra-state B2C transactions are reported state-wise." 
                              : "Incorrect. B2C sales under ₹2.5 Lakhs (or local B2C sales) do not need individual invoice logs."}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 💻 2. PRACTICE PANEL (Sandbox Simulator) */}
                  {activeTab === 'practice' && (
                    <div className="space-y-4 text-left animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Workspace: Sandbox V2</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      
                      <div className="bg-black/60 rounded-xl p-3 border border-white/5 font-mono text-[10px] text-zinc-300 space-y-2 leading-relaxed">
                        <div className="text-zinc-500"># System initialized. Raw invoices loaded in memory.</div>
                        <div>$ npm run process-invoices</div>
                        <div className="text-emerald-400">✓ Parsing transaction CSV... [OK]</div>
                        <div className="text-emerald-400">✓ Running validation rules... [OK]</div>
                        <div>$ gst-cli validate --type b2c</div>
                        <div className="text-amber-400">! Warning: 3 records default to fallback rate (18%)</div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => addToast('Executing diagnostic reconciliation...', 'info')}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all"
                        >
                          Run Reconciliation
                        </button>
                        <button 
                          onClick={() => addToast('Downloading invoice templates...', 'info')}
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-[9px] font-bold uppercase transition-all"
                        >
                          Templates
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 💬 3. DISCUSS PANEL (Active Cohort Feed) */}
                  {activeTab === 'discuss' && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Form */}
                      <form onSubmit={handlePostQuestion} className="space-y-2">
                        <textarea
                          value={newQuestionContent}
                          onChange={(e) => setNewQuestionContent(e.target.value)}
                          placeholder="Ask your cohort about this lecture..."
                          className="w-full min-h-[70px] bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 resize-none font-medium"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={!newQuestionContent.trim() || postingQuestion}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-md shadow-emerald-500/10"
                          >
                            {postingQuestion ? 'Posting...' : 'Ask Cohort'}
                            <Send size={8} />
                          </button>
                        </div>
                      </form>

                      {/* Feed */}
                      <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                        {discussionLoading ? (
                          <div className="flex justify-center py-4">
                            <LucideLoader className="w-4 h-4 animate-spin text-emerald-400" />
                          </div>
                        ) : discussions.length === 0 ? (
                          <div className="text-center py-6 text-[10px] text-white/30 font-bold">
                            No active discussions. Be the first to start!
                          </div>
                        ) : (
                          discussions.map((d: any) => (
                            <div key={d.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-2">
                              <div className="flex items-center justify-between text-[9px]">
                                <span className="font-bold text-white/70 italic">@{d.user?.name || 'Student'}</span>
                                <span className="text-white/30">{new Date(d.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[10px] text-white/80 font-medium leading-normal">{d.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* 🏆 4. REVIEW PANEL (Active Unit Summary & Notes) */}
                  {activeTab === 'review' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                          <BookOpenCheck size={11} />
                          Core Synthesis Notes
                        </div>
                        <ul className="space-y-2 text-[10px] text-white/80 font-semibold leading-relaxed list-disc pl-4">
                          <li>Identify key concepts discussed in the lecture.</li>
                          <li>Validate your understanding with practice checks.</li>
                          <li>Summarize important decision rules before proceeding.</li>
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => addToast('Downloading Lesson Template...', 'info')}
                          className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                        >
                          <Download size={10} />
                          Lesson Template
                        </button>
                        <button 
                          onClick={() => addToast('Downloading IT Slab Chart...', 'info')}
                          className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                        >
                          <Download size={10} />
                          IT Slab Chart
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 🛡️ 5. VALIDATE PANEL (Real Quiz Evaluation) */}
                  {activeTab === 'validate' && (
                    <div className="space-y-4 animate-fadeIn">
                      {quizLoading ? (
                        <div className="flex justify-center py-8">
                          <LucideLoader className="w-5 h-5 animate-spin text-emerald-400" />
                        </div>
                      ) : !quizData ? (
                        <div className="text-center py-6 text-[10px] text-white/30 font-bold">
                          No diagnostic verification questionnaire available for this unit.
                        </div>
                      ) : (
                        <form onSubmit={handleQuizSubmit} className="space-y-4">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{quizData.title}</span>
                            <span className="text-[9px] text-white/40 font-bold">{quizData.questions.length} Questions</span>
                          </div>

                          <div className="space-y-3">
                            {quizData.questions.map((q: any, qIdx: number) => (
                              <div key={q.id} className="space-y-2">
                                <p className="text-[10px] font-bold text-white/80 leading-normal">
                                  {qIdx + 1}. {q.question}
                                </p>
                                <div className="grid grid-cols-1 gap-1.5">
                                  {q.options.map((opt: string, optIdx: number) => {
                                    const isSelected = selectedAnswers[q.id] === optIdx;
                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        disabled={quizSubmitted}
                                        onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                        className={cn(
                                          "p-2.5 rounded-xl border text-left text-[10px] font-semibold transition-all",
                                          isSelected
                                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                            : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                                        )}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-white/5">
                            {!quizSubmitted ? (
                              <button
                                type="submit"
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest text-[8px] transition-all shadow-md shadow-emerald-600/10"
                              >
                                Submit Evaluation
                              </button>
                            ) : quizPassed ? (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center py-6 space-y-4"
                              >
                                <div className="relative flex items-center justify-center w-24 h-24 bg-emerald-500/10 rounded-full border-4 border-emerald-500/30">
                                  <span className="text-3xl font-black text-emerald-400">{quizScore}%</span>
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute inset-0 rounded-full border-2 border-emerald-400"
                                  />
                                </div>
                                <div className="text-center">
                                  <h3 className="text-lg font-black text-white tracking-tight uppercase">Evaluation Passed!</h3>
                                  <p className="text-[10px] text-white/60 font-medium mt-1">{quizFeedback || 'You have successfully mastered this module.'}</p>
                                </div>
                                
                                <Link
                                  href="/certificates/TT-PY-2026-X7B9K"
                                  className="mt-4 w-full py-3 bg-gradient-to-r from-[#c5a059] to-[#b8860b] text-white rounded-xl font-black uppercase tracking-widest text-[10px] text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(197,160,89,0.3)]"
                                >
                                  Claim Your Certificate
                                </Link>
                              </motion.div>
                            ) : (
                              <div className="space-y-3 text-center">
                                <div className="p-3 rounded-xl border text-[10px] font-bold leading-normal bg-red-500/15 border-red-500/30 text-red-400">
                                  {quizFeedback || `Attempt completed. Score: ${quizScore}%`}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuizSubmitted(false);
                                    setSelectedAnswers({});
                                    setQuizFeedback(null);
                                    setQuizScore(null);
                                    setQuizPassed(null);
                                  }}
                                  className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-[8px] transition-all"
                                >
                                  Reset Attempt
                                </button>
                              </div>
                            )}
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}
            </motion.div>
          </div>

          {/* RIGHT SIDE (30% width on desktop) */}
          <div className="lg:col-span-3 w-full">
            <motion.div
              key={currentLessonId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
              className="w-full"
            >
              {!hasStartedPlaying ? (
                /* Pre-play Right Panel: Objectives & CTA */
                <div className="bg-white border border-[#EAF0F7] rounded-[32px] p-6 lg:p-8 shadow-[0_12px_35px_rgba(15,23,42,0.06)] flex flex-col justify-between min-h-[340px] text-left space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">{'Today you\'ll learn'}</h4>
                    <ul className="space-y-3.5 text-xs text-slate-700 font-bold leading-relaxed">
                      {currentLesson?.objectives?.map((obj: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                          <span>{obj}</span>
                        </li>
                      )) || (
                        <>
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>Core concept structures</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>Filing schedules & timelines</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>Invoice classification data</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>Tax ledger reconciliation</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100 mt-6">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Interactive walkthrough • {currentLesson?.duration || 10} min
                    </div>
                    <button 
                      onClick={() => setHasStartedPlaying(true)}
                      className="w-full py-3.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Play size={12} fill="currentColor" />
                      Start Lesson
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {(activeTab === 'learn' || activeTab === 'practice') && (
                    <div className="bg-white border border-[#EAF0F7] rounded-[32px] p-6 lg:p-8 shadow-[0_12px_35px_rgba(15,23,42,0.06)] text-left space-y-4 animate-fadeIn text-slate-900">
                        <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                          Classify the transaction: Your client in Mumbai (Maharashtra) sells IT Consulting Services worth ₹1,50,000 to a client in Ahmedabad (Gujarat). Calculate the tax category and code rate.
                        </p>

                        <form onSubmit={handleSandboxSubmit} className="space-y-4 pt-2">
                          <div className="space-y-3">
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Stream type</label>
                              <div className="grid grid-cols-2 gap-2">
                                <button 
                                  type="button"
                                  onClick={() => setSandboxSelected('cgst')}
                                  className={cn(
                                    "py-2.5 px-3 border rounded-xl text-xs font-bold text-center transition-all",
                                    sandboxSelected === 'cgst' ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  Stream A
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setSandboxSelected('igst')}
                                  className={cn(
                                    "py-2.5 px-3 border rounded-xl text-xs font-bold text-center transition-all",
                                    sandboxSelected === 'igst' ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                  )}
                                >
                                  Stream B
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax rate % (e.g. 5, 12, 18)</label>
                              <input 
                                type="number"
                                placeholder="Enter Rate (e.g. 18)"
                                value={sandboxRate}
                                onChange={(e) => setSandboxRate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                required
                              />
                            </div>

                          </div>

                          <div className="flex justify-end pt-2">
                            <button 
                              type="submit"
                              className="w-full py-3.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-900/10 active:scale-95"
                            >
                              Validate Classification
                            </button>
                          </div>
                        </form>

                        {sandboxFeedback && (
                          <div className={cn(
                            "p-3.5 rounded-xl border text-xs font-mono leading-normal font-bold",
                            sandboxFeedback.startsWith('[VALIDATED]') 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                              : "bg-rose-50 border-rose-200 text-rose-800"
                          )}>
                            {sandboxFeedback}
                          </div>
                        )}
                    </div>
                  )}

                  {/* 💬 3. DISCUSS PANEL */}
                  {activeTab === 'discuss' && (
                    <div className="space-y-5">
                      {/* Broadcast Doubt */}
                      <form onSubmit={handlePostQuestion} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                          <MessageSquare size={12} />
                          Submit technical question to cohort
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <input 
                            type="text" 
                            placeholder="Brief query header..." 
                            value={newQuestionTitle}
                            onChange={(e) => setNewQuestionTitle(e.target.value)}
                            className="bg-black/25 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-555/30 placeholder:text-white/20"
                            required
                          />
                          <textarea 
                            placeholder="Provide details about your question..." 
                            value={newQuestionContent}
                            onChange={(e) => setNewQuestionContent(e.target.value)}
                            className="bg-black/25 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none resize-none min-h-[60px] focus:border-emerald-555/30 placeholder:text-white/20"
                            required
                          />
                        </div>
                        <div className="flex justify-end">
                          <button 
                            type="submit" 
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest text-[8px] transition-all flex items-center justify-center gap-1.5"
                          >
                            <Send size={8} />
                            Post Question
                          </button>
                        </div>
                      </form>

                      {/* Doubt board logs */}
                      <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                        {discussionLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <LucideLoader className="w-5 h-5 text-emerald-400 animate-spin" />
                          </div>
                        ) : discussions.length === 0 ? (
                          <div className="space-y-3">
                            {/* Live Activity indicator */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] font-bold text-emerald-400">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                              <span>12 students discussing this lesson</span>
                            </div>

                            <div className="text-xs font-bold text-white/50 uppercase tracking-widest pt-1">Frequently Asked Cohort Queries</div>
                            
                            <div className="border border-white/5 bg-white/[0.02] rounded-xl p-3.5 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-white/80 uppercase">How does B2CL registration code differ?</span>
                                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">RESOLVED</span>
                              </div>
                              <p className="text-[10px] text-white/60 leading-relaxed">
                                {"For advanced cases, validate detailed fields against the reporting format before submission."}
                              </p>
                            </div>

                            <div className="border border-white/5 bg-white/[0.02] rounded-xl p-3.5 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-white/80 uppercase">Should I submit even with zero activity?</span>
                                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">RESOLVED</span>
                              </div>
                              <p className="text-[10px] text-white/60 leading-relaxed">
                                {"Yes, submit a nil report where required to keep compliance status healthy."}
                              </p>
                            </div>
                          </div>
                        ) : (
                          discussions.map((doubt: any) => (
                            <div key={doubt.id} className="border border-white/5 bg-white/5 rounded-2xl p-4 space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-white/5 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 border border-white/10">
                                  {doubt.user?.name ? doubt.user.name.substring(0, 2).toUpperCase() : 'ST'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-[11px] font-bold text-white uppercase">{doubt.title}</h4>
                                    <span className="text-[8px] text-white/30 font-bold">
                                      {new Date(doubt.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-white/70 font-medium mt-0.5 leading-relaxed">{doubt.question || doubt.content}</p>
                                </div>
                              </div>

                              {/* Nested Replies */}
                              <div className="pl-4 border-l border-white/10 space-y-2.5">
                                {doubt.answers?.map((ans: any) => (
                                  <div key={ans.id} className="flex gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                                    <div className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 font-black text-[8px] flex items-center justify-center flex-shrink-0">
                                      {ans.user?.name ? ans.user.name.substring(0, 2).toUpperCase() : 'TG'}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <h5 className="text-[9px] font-bold text-slate-200">{ans.user?.name || 'Academy Guide'}</h5>
                                        <span className="text-[7px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1 rounded uppercase">staff</span>
                                      </div>
                                      <p className="text-[10px] text-white/60 font-medium mt-0.5">{ans.answer}</p>
                                    </div>
                                  </div>
                                ))}

                                {/* Reply Input */}
                                <div className="flex gap-2 items-center pt-1">
                                  <input 
                                    type="text"
                                    placeholder="Post response..."
                                    value={replyContent[doubt.id] || ''}
                                    onChange={(e) => setReplyContent(prev => ({ ...prev, [doubt.id]: e.target.value }))}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-3 py-1.5 text-[10px] font-bold text-white outline-none focus:border-emerald-555/30 placeholder:text-white/20"
                                  />
                                  <button 
                                    onClick={() => handlePostReply(doubt.id)}
                                    className="p-1.5 bg-[#1B4332] border border-white/10 text-white rounded-lg transition-all"
                                  >
                                    <Send size={10} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* 📘 4. REVIEW PANEL */}
                  {activeTab === 'review' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-white/5 text-emerald-400 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                            <FileSpreadsheet size={16} />
                          </div>
                          <div className="text-left min-w-0">
                            <h4 className="text-[11px] font-bold text-white uppercase truncate">Lesson-Template.xlsx</h4>
                            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">EXCEL WORKBOOK • 2.4 MB</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => addToast('Downloading lesson template...', 'info')}
                          className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-emerald-400 hover:border-emerald-500/20 transition-all shrink-0"
                        >
                          <Download size={12} />
                        </button>
                      </div>

                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-white/5 text-emerald-400 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                            <FileText size={16} />
                          </div>
                          <div className="text-left min-w-0">
                            <h4 className="text-[11px] font-bold text-white uppercase truncate">Slab Chart 2026.pdf</h4>
                            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">PDF DOCUMENT • 1.1 MB</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => addToast('Downloading IT Slab Chart...', 'info')}
                          className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-emerald-400 hover:border-emerald-500/20 transition-all shrink-0"
                        >
                          <Download size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ❓ 5. VALIDATE PANEL */}
                  {activeTab === 'validate' && (
                    <div className="space-y-4">
                      {quizLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <LucideLoader className="w-5 h-5 text-emerald-400 animate-spin" />
                        </div>
                      ) : !quizData ? (
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                          <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div>
                              <h3 className="text-xs font-bold text-white uppercase">Competency Checklist</h3>
                              <p className="text-[8px] font-bold text-emerald-400/60 uppercase tracking-widest mt-0.5">Verify your knowledge</p>
                            </div>
                            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                              Self-Check
                            </span>
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-start gap-3 p-3 bg-black/20 border border-white/5 rounded-xl cursor-pointer hover:bg-black/35 transition-colors">
                              <input type="checkbox" className="mt-0.5 accent-emerald-500 rounded" />
                              <div className="text-left">
                                <p className="text-[10.5px] font-bold text-white leading-tight">Reporting Schema</p>
                                <p className="text-[9px] text-white/50 mt-0.5">I understand how to group invoices by B2B, B2CL, and B2CS tables.</p>
                              </div>
                            </label>

                            <label className="flex items-start gap-3 p-3 bg-black/20 border border-white/5 rounded-xl cursor-pointer hover:bg-black/35 transition-colors">
                              <input type="checkbox" className="mt-0.5 accent-emerald-500 rounded" />
                              <div className="text-left">
                                <p className="text-[10.5px] font-bold text-white leading-tight">Tax stream rules</p>
                                <p className="text-[9px] text-white/50 mt-0.5">I can accurately determine the Place of Supply (PoS).</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleQuizSubmit} className="space-y-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <h3 className="text-xs font-bold text-white uppercase">{quizData.title}</h3>
                              <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Requirement: {quizData.passingScore}%</p>
                            </div>
                            <span className="text-[8px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg uppercase">
                              Quiz
                            </span>
                          </div>

                          {/* Question logs */}
                          <div className="space-y-3">
                            {quizData.questions?.map((q: any, qIdx: number) => {
                              const userAns = selectedAnswers[q.id];
                              const feedbackItem = quizFeedback?.find((f: any) => f.questionId === q.id);

                              return (
                                <div key={q.id} className="border border-white/5 rounded-xl p-4 bg-white/5 space-y-3">
                                  <h4 className="text-[11px] font-bold text-white flex gap-1.5">
                                    <span>0{qIdx + 1}.</span>
                                    <span>{q.prompt}</span>
                                  </h4>

                                  <div className="grid grid-cols-1 gap-2">
                                    {q.options?.map((opt: any) => {
                                      const isSelected = userAns === opt.id;
                                      const isCorrectAns = feedbackItem?.correctAnswer === opt.id;
                                      
                                      let optionStyle = "border-white/5 bg-white/5 text-white/60 hover:border-emerald-500/20 hover:bg-white/[0.08]";
                                      if (isSelected && !quizSubmitted) optionStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
                                      if (quizSubmitted) {
                                        if (isCorrectAns) optionStyle = "border-emerald-600 bg-emerald-500/20 text-emerald-300";
                                        else if (isSelected) optionStyle = "border-red-500/50 bg-red-500/10 text-red-400";
                                      }

                                      return (
                                        <button
                                          key={opt.id}
                                          type="button"
                                          disabled={quizSubmitted}
                                          onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                                          className={cn(
                                            "w-full flex items-center justify-between p-3 border rounded-xl text-left text-[11px] font-bold transition-all",
                                            optionStyle
                                          )}
                                        >
                                          <span>{opt.text}</span>
                                          {quizSubmitted ? (
                                            isCorrectAns ? <Check className="text-emerald-400" size={12} /> :
                                            isSelected ? <X className="text-red-400" size={12} /> : null
                                          ) : isSelected ? (
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                          ) : null}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Submit evaluation */}
                          <div className="flex items-center justify-between pt-3 border-t border-white/10 flex-wrap gap-4">
                            {!quizSubmitted ? (
                              <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all shadow-md shadow-emerald-600/10"
                              >
                                Submit Answers
                              </button>
                            ) : (
                              <div className="flex flex-col gap-3 w-full">
                                <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2">
                                  {quizPassed ? (
                                    <CheckCircle2 className="text-emerald-400" size={20} />
                                  ) : (
                                    <AlertTriangle className="text-red-400" size={20} />
                                  )}
                                  <div>
                                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-none">Diagnostic Result</p>
                                    <p className="text-[10px] font-bold text-white mt-1">
                                      {quizPassed ? 'COMPLIANT' : 'NON-COMPLIANT'} • SCORE: {quizScore}%
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuizSubmitted(false);
                                    setSelectedAnswers({});
                                    setQuizFeedback(null);
                                    setQuizScore(null);
                                    setQuizPassed(null);
                                  }}
                                  className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-[8px] transition-all"
                                >
                                  Reset Attempt
                                </button>
                              </div>
                            )}
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                </div>
            )}
            </motion.div>
          </div>
        </div>
      </main>



      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(52,211,153,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(52,211,153,0.25); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
