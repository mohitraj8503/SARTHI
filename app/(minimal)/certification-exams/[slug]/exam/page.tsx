'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Minimize2,
  Timer,
  BookOpen,
  Check,
  AlertTriangle,
  Sparkles,
  Loader2,
  Code2
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CodeEditor } from '@/components/assessment/CodeEditor';

interface ExamState {
  currentQuestion: number;
  answers: Record<string, number>;
  markedForReview: Set<number>;
  timeRemaining: number;
  isFullscreen: boolean;
}

export default function PremiumExamPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [state, setState] = useState<ExamState>({
    currentQuestion: 0,
    answers: {},
    markedForReview: new Set(),
    timeRemaining: 3600, // Default 60 mins
    isFullscreen: false,
  });
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [certification, setCertification] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Exam Data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push(`/login?returnUrl=/certification-exams/${slug}/exam`);
          return;
        }

        const res = await fetch(`/api/certifications/${slug}`);
        const data = await res.json();
        
        if (data && !data.error) {
          setCertification(data);
          setQuestions(data.questions || []);
          setState(prev => ({
            ...prev,
            timeRemaining: (data.durationMinutes || 60) * 60
          }));
        } else {
          toast.error(data.error || "Failed to load exam");
          router.push('/certification-exams');
        }
      } catch (err) {
        console.error("Failed to fetch exam:", err);
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [slug, router]);

  // Timer Logic
  useEffect(() => {
    if (loading || isSubmitting) return;
    
    const timer = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          handleSubmit();
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isSubmitting, handleSubmit]);

  // Fullscreen and Tab Switching Enforcement
  useEffect(() => {
    if (loading || isSubmitting) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings((prev) => {
          const newWarnings = prev + 1;
          
          // Log violation to console for debugging
          console.warn(`[PROCTOR] Tab switch detected. Violation count: ${newWarnings}`);
          
          if (newWarnings >= 3) {
            setShowWarningModal(true);
          }
          return newWarnings;
        });
        toast.error("Security Warning: Tab switching is monitored!", { 
          position: 'top-center',
          icon: '🛡️',
          style: { background: '#1B4332', color: '#fff', borderRadius: '12px' }
        });
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmitting) {
        setState(prev => ({ ...prev, isFullscreen: false }));
        toast.error("Full-screen mode exited! Re-enter to continue.", { position: 'bottom-center' });
      } else if (document.fullscreenElement) {
        setState(prev => ({ ...prev, isFullscreen: true }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [loading, isSubmitting]);

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setState(prev => ({ ...prev, isFullscreen: true }));
      }
    } catch (error) {
      console.error('Fullscreen request rejected:', error);
      toast.error("Full-screen mode required for technical assessments.");
    }
  };

  // Handlers
  const selectAnswer = (questionId: string, value: any) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value }
    }));
  };

  const toggleMarkReview = useCallback(() => {
    setState(prev => {
      const newMarked = new Set(prev.markedForReview);
      if (newMarked.has(state.currentQuestion)) {
        newMarked.delete(state.currentQuestion);
      } else {
        newMarked.add(state.currentQuestion);
      }
      return { ...prev, markedForReview: newMarked };
    });
  }, [state.currentQuestion]);

  const navigate = useCallback((direction: 'next' | 'prev') => {
    setState(prev => {
      if (direction === 'next' && prev.currentQuestion < questions.length - 1) {
        return { ...prev, currentQuestion: prev.currentQuestion + 1 };
      } else if (direction === 'prev' && prev.currentQuestion > 0) {
        return { ...prev, currentQuestion: prev.currentQuestion - 1 };
      }
      return prev;
    });
  }, [questions.length]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (loading || showFinishConfirm || showWarningModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        navigate('next');
      } else if (e.key === 'ArrowLeft') {
        navigate('prev');
      } else if (e.key.toLowerCase() === 'm') {
        toggleMarkReview();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        setShowFinishConfirm(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, showFinishConfirm, showWarningModal, navigate, toggleMarkReview]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setState(prev => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setState(prev => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const timeTaken = (certification?.durationMinutes || 60) * 60 - state.timeRemaining;
      const res = await fetch(`/api/certifications/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: state.answers,
          timeTaken,
          tabSwitchCount: warnings
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Submission failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        toast.success("Assessment Securely Submitted", { 
          icon: '🛡️',
          style: { background: '#1B4332', color: '#fff', borderRadius: '12px', fontWeight: 'bold' }
        });
        // P0 Fix: Result Page Dependency Break - Use data.attemptId from response
        const targetAttemptId = data.attemptId;
        setTimeout(() => {
          router.push(`/certification-exams/${slug}/result?attemptId=${targetAttemptId}`);
        }, 800);
      } else {
        throw new Error(data.error || "Submission rejected by security gateway");
      }
    } catch (err: any) {
      console.error("Submission crash:", err);
      toast.error(err.message || "Network failure during submission. Re-attempting sync...");
      // P0 Fix: Fallback route for sync failures
      router.push(`/certification-exams/${slug}/submission-failed`);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, certification?.durationMinutes, state.timeRemaining, state.answers, slug, warnings, router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-emerald-900 font-bold">Loading Premium Exam Environment...</p>
        </div>
      </div>
    );
  }

  // Security Gate: Ensure fullscreen on user gesture
  if (!state.isFullscreen && !isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white rounded-[40px] shadow-2xl p-12 text-center border border-[#1B4332]/5"
        >
          <div className="w-20 h-20 bg-[#1B4332]/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Maximize2 className="w-10 h-10 text-[#1B4332]" />
          </div>
          <h2 className="text-3xl font-black text-[#1B4332] uppercase italic mb-4 tracking-tighter">Security_Gate_Active</h2>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">
            This professional certification assessment requires a secure, isolated environment. 
            Full-screen mode will be enforced to maintain integrity. 
            <br/><span className="text-[10px] font-black uppercase tracking-widest text-[#D4915C]">Tab switching is monitored and logged.</span>
          </p>
          <button
            onClick={enterFullscreen}
            className="w-full py-5 bg-[#1B4332] text-white rounded-2xl font-black uppercase tracking-[0.2em] italic shadow-xl shadow-[#1B4332]/20 hover:bg-[#2D6A4F] transition-all"
          >
            Enter Secure Session
          </button>
        </motion.div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-bold">No questions found for this exam.</p>
          <button onClick={() => router.push('/certification-exams')} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold">Go Back</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[state.currentQuestion];
  const progress = ((state.currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(state.answers).length;
  const isLowTime = state.timeRemaining < 300; // < 5 mins

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1B4332] font-sans selection:bg-[#1B4332]/10 overflow-x-hidden">
      {/* Global Submission Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] bg-[#1B4332]/90 backdrop-blur-md flex flex-col items-center justify-center text-white"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#D4915C]" />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-black uppercase tracking-[0.3em] italic">Finalizing_Assessment</h2>
            <p className="mt-2 text-white/40 font-bold text-[10px] uppercase tracking-widest">Encrypting Results & Generating Performance Analytics</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Background Textures */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-[#D4915C]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-[#1a3326]/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
      </div>

      {/* Top Header - Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-[#1B4332]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 py-3 md:px-6 md:py-4 flex items-center justify-between gap-3">
          {/* Left: Branding & Progress */}
          <div className="flex items-center gap-3 md:gap-8">
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] font-black text-[#D4915C] uppercase tracking-[0.3em] leading-none mb-1">SARTHI</span>
              <span className="text-[10px] md:text-xs font-black text-[#1B4332] uppercase tracking-tighter italic">Assessment_Session</span>
            </div>
            
            <div className="h-8 w-px bg-gray-200 hidden md:block" />

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-[11px] font-black text-[#1B4332]/40 uppercase tracking-widest italic">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Question {state.currentQuestion + 1} / {questions.length}</span>
              </div>
              <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[#1B4332] to-[#D4915C] rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Center: Timer */}
          <motion.div 
            animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`flex items-center gap-1.5 md:gap-3 px-3 py-1.5 md:px-6 md:py-2.5 rounded-xl md:rounded-2xl border-2 transition-all shadow-sm ${
              isLowTime 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-white border-[#1B4332]/5 text-[#1B4332]'
            }`}
          >
            <Timer className={`w-4 h-4 md:w-5 md:h-5 ${isLowTime ? 'text-red-500' : 'text-[#D4915C]'}`} />
            <span className="font-mono font-black text-sm md:text-xl tracking-tighter">{formatTime(state.timeRemaining)}</span>
          </motion.div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 md:gap-4">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 md:p-2.5 hover:bg-gray-100 rounded-xl transition-all text-[#1B4332]/40 hover:text-[#1B4332] hidden sm:block"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 md:w-5 md:h-5" /> : <VolumeX className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
            <button 
              onClick={() => setShowFinishConfirm(true)}
              className="px-3 py-2 md:px-6 md:py-3 bg-white border-2 border-[#1B4332]/5 text-[#1B4332] font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] rounded-xl shadow-sm hover:border-[#1B4332] transition-all hover:-translate-y-0.5 active:translate-y-0 italic"
            >
              Finalize
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 py-4 md:px-6 md:py-8 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        
        {/* Question Card */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 sm:p-8 md:p-10"
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-12">
                <div className="space-y-4 md:space-y-6 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1B4332]/5 rounded-2xl flex items-center justify-center border border-[#1B4332]/10">
                      <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-[#1B4332]" />
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black text-[#1B4332]/30 uppercase tracking-[0.3em] italic">Assessment_Segment</p>
                      <h4 className="text-[10px] md:text-xs font-black text-[#1B4332] uppercase tracking-widest">{currentQ.sectionName || 'Core_Python'}</h4>
                    </div>
                  </div>
                  <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black text-[#1B4332] leading-[1.2] tracking-tighter uppercase italic max-w-4xl">
                    {currentQ.questionText || currentQ.question}
                  </h2>
                </div>
                <button
                  onClick={toggleMarkReview}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all italic border-2 self-start ${
                    state.markedForReview.has(state.currentQuestion)
                      ? 'bg-[#D4915C] text-white border-[#D4915C] shadow-lg shadow-[#D4915C]/20'
                      : 'bg-[#FAF9F6] text-[#1B4332]/40 border-transparent hover:border-[#1B4332]/10 hover:text-[#1B4332]'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Flag Item</span>
                </button>
              </div>

              {/* Question Content */}
              <div className="grid gap-4 sm:gap-6">
                {(currentQ.questionType === 'CODING' || currentQ.questionType === 'Coding' || (currentQ.type === 'Coding')) ? (
                  <div className="space-y-4 md:space-y-6">
                    <div className={`flex items-center justify-between px-3 py-2 md:px-4 md:py-3 rounded-xl border ${
                      certification?.codeExecutionAvailable 
                        ? 'bg-gray-50 border-gray-100' 
                        : 'bg-amber-50 border-amber-100'
                     }`}>
                      <div className="flex items-center gap-2 md:gap-3">
                        <Code2 className={`w-3.5 h-3.5 md:w-4 md:h-4 ${certification?.codeExecutionAvailable ? 'text-[#D4915C]' : 'text-amber-600'}`} />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#1B4332]">
                          {currentQ.language || 'Python'} {certification?.codeExecutionAvailable ? 'Environment Ready' : 'Practice Mode'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${certification?.codeExecutionAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className={`text-[8px] md:text-[9px] font-bold uppercase ${certification?.codeExecutionAvailable ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {certification?.codeExecutionAvailable ? 'Secure Sandbox Active' : 'Execution Temporarily Offline'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="h-[250px] sm:h-[400px] rounded-2xl overflow-hidden border-2 border-[#1B4332]/5 shadow-inner relative">
                      {!certification?.codeExecutionAvailable && (
                        <div className="absolute inset-0 z-10 bg-white/10 backdrop-blur-[2px] flex items-center justify-center p-4">
                          <div className="bg-white p-4 rounded-xl shadow-2xl border border-amber-100 text-center max-w-xs">
                            <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                            <h4 className="font-black text-[#1B4332] uppercase italic text-xs mb-1">Technical_Maintenance</h4>
                            <p className="text-[9px] text-gray-500 font-bold leading-relaxed">
                              Code execution is currently unavailable for this question. 
                              Please draft your solution; it will be stored and manually graded.
                            </p>
                          </div>
                        </div>
                      )}
                      <CodeEditor 
                        value={state.answers[currentQ.id] || currentQ.starterCode || ''}
                        language={(currentQ.language || 'python').toLowerCase()}
                        onChange={(val) => selectAnswer(currentQ.id, val)}
                        readOnly={!certification?.codeExecutionAvailable}
                      />
                    </div>
                    
                    <div className={`p-3 rounded-xl border flex gap-2 ${
                      certification?.codeExecutionAvailable ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
                    }`}>
                      {certification?.codeExecutionAvailable ? <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> : <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                      <p className={`text-[10px] md:text-[11px] font-medium leading-relaxed ${certification?.codeExecutionAvailable ? 'text-amber-900' : 'text-blue-900'}`}>
                        {certification?.codeExecutionAvailable 
                          ? "Ensure your solution handles all edge cases. You can reset the editor if you need to start over. Your progress is auto-saved locally."
                          : "Draft your code clearly. Our evaluators will review the logic and structure of your implementation."
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  (currentQ.options || []).map((option: any, idx: number) => {
                    const optionText = typeof option === 'string' ? option : option.text;
                    const isSelected = state.answers[currentQ.id] === idx;
                    
                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => selectAnswer(currentQ.id, idx)}
                        className={`w-full group relative overflow-hidden p-3.5 sm:p-6 md:p-8 rounded-xl sm:rounded-[24px] border-2 text-left transition-all duration-300 flex items-center gap-3 sm:gap-6 ${
                          isSelected
                            ? 'border-[#1B4332] bg-[#1B4332]/5 shadow-xl shadow-[#1B4332]/5 scale-[1.01]'
                            : 'border-[#1B4332]/5 hover:border-[#1B4332]/20 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`flex items-center justify-center shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm transition-all border-2 ${
                          isSelected
                            ? 'bg-[#1B4332] text-white border-[#1B4332] rotate-6'
                            : 'bg-[#FAF9F6] text-[#1B4332]/20 border-transparent group-hover:text-[#1B4332] group-hover:border-[#1B4332]/10'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className={`text-sm sm:text-lg md:text-2xl font-bold italic tracking-tight transition-colors ${isSelected ? 'text-[#1B4332]' : 'text-[#1B4332]/60'}`}>
                          {optionText}
                        </span>
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Navigation Footer - Sticky on Mobile */}
              <div className="sticky bottom-0 bg-white border-t border-[#1B4332]/5 py-3 px-2 flex items-center justify-between -mx-4 -mb-4 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] sm:shadow-none sm:bg-transparent sm:border-none sm:relative sm:bottom-auto sm:mb-0 sm:mx-0 sm:py-0 sm:px-0 sm:mt-16 sm:pt-10 z-40">
                <button
                  onClick={() => navigate('prev')}
                  disabled={state.currentQuestion === 0}
                  className="flex items-center gap-1.5 px-3 py-2.5 sm:px-8 sm:py-4 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest text-[#1B4332]/40 hover:text-[#1B4332] hover:bg-gray-50 disabled:opacity-20 transition-all italic"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const newAnswers = { ...state.answers };
                      delete newAnswers[currentQ.id];
                      setState(prev => ({ ...prev, answers: newAnswers }));
                    }}
                    className="px-3 py-2.5 sm:px-8 sm:py-4 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest text-[#1B4332]/40 hover:text-[#1B4332] transition-all italic"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => navigate('next')}
                    disabled={state.currentQuestion === questions.length - 1}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#1B4332]/5 text-[#1B4332] rounded-xl sm:rounded-[24px] font-black uppercase tracking-[0.2em] shadow-sm hover:border-[#1B4332] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-20 italic text-[10px] sm:text-[11px]"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar Navigator */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 space-y-6">
            <div>
              <h3 className="text-[10px] font-black text-[#1B4332]/30 uppercase tracking-[0.3em] mb-4 italic">Question_Map</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-black text-[#1B4332] italic">Progress</span>
                <span className="px-3 py-1 bg-[#1B4332]/5 text-[#1B4332] text-[10px] font-black rounded-full">
                  {answeredCount} / {questions.length}
                </span>
              </div>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {questions.map((q, i) => {
                const isAnswered = state.answers[q.id] !== undefined;
                const isMarked = state.markedForReview.has(i);
                const isCurrent = i === state.currentQuestion;

                return (
                  <motion.button
                    key={q.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setState(prev => ({ ...prev, currentQuestion: i }))}
                    className={`aspect-square rounded-xl font-semibold text-sm transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-emerald-500 ring-offset-2 bg-emerald-600 text-white'
                        : isAnswered && isMarked
                        ? 'bg-amber-400 text-white'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : isMarked
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {i + 1}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend - Simple Terms */}
            <div className="grid grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-widest italic">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1B4332]" />
                <span className="text-[#1B4332]">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1B4332]/20" />
                <span className="text-[#1B4332]/60">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4915C]" />
                <span className="text-[#D4915C]">Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-100" />
                <span className="text-gray-300">Pending</span>
              </div>
            </div>

            {/* Finalize Button */}
            <button
              onClick={() => setShowFinishConfirm(true)}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Finalize Assessment
            </button>

            {/* Shortcuts - Easy to Use */}
            <div className="pt-6 border-t border-[#1B4332]/5 hidden sm:block">
              <div className="flex items-center gap-2 text-[10px] font-black text-[#1B4332]/40 uppercase tracking-[0.2em] mb-4 italic">
                <Sparkles className="w-3.5 h-3.5 text-[#D4915C]" />
                <span>Shortcuts</span>
              </div>
              <div className="grid grid-cols-1 gap-3 text-[10px] font-bold text-[#1B4332]/60 uppercase tracking-widest italic">
                <div className="flex justify-between items-center">
                  <span>Next Question</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-[9px] border border-gray-200">ARROW RIGHT</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Prev Question</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-[9px] border border-gray-200">ARROW LEFT</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Flag For Review</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-[9px] border border-gray-200">KEY M</kbd>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Finish Confirmation Modal */}
      <AnimatePresence>
        {showFinishConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-center text-slate-900 mb-3">Submit Assessment?</h3>
              <p className="text-center text-slate-600 mb-8 leading-relaxed">
                You&apos;ve answered <strong className="text-slate-900">{answeredCount}</strong> out of <strong className="text-slate-900">{questions.length}</strong> questions. 
                {answeredCount < questions.length && ' Some questions are unanswered.'} 
                <br />This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowFinishConfirm(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Review Answers
                </button>
                <button
                  onClick={() => {
                    handleSubmit();
                  }}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalize & Submit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tab Warning Modal */}
      <AnimatePresence>
        {showWarningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl border border-red-100"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-center text-slate-900 mb-3">
                Security Protocol Violation
              </h3>
              <p className="text-center text-slate-600 mb-8 leading-relaxed">
                You have switched tabs or windows multiple times. To maintain the integrity of the certification, your assessment will be automatically submitted now.
              </p>
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  handleSubmit();
                }}
                disabled={isSubmitting}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Acknowledge & Submit'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
