'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Award, Clock, ChevronRight, ChevronLeft, 
  CheckCircle2, AlertCircle, Shield, 
  RotateCcw, Timer, Trophy, ArrowRight, Code,
  Flag, Info, LogOut, Check, X, Bookmark, HelpCircle,
  Maximize, Activity, ShieldAlert, Monitor,
  User as UserIcon, Grid
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  startCertificationAttempt, 
  updateCertificationAttempt, 
  submitCertificationAttempt,
  getCertificationAttempt 
} from '@/app/actions/certifications';

interface Question {
  id: string;
  section: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty?: string;
  tags?: string[];
  marks?: number;
}

const EXAM_DURATION = 60 * 60; // 60 minutes
const LOCAL_STORAGE_KEY = 'tt_py_assessment_state';

interface AssessmentState {
  answers: Record<string, string>;
  markedForReview: string[];
  visitedQuestions: string[];
  timeLeft: number;
  currentQuestionIndex: number;
}

interface Props {
  user: any;
  certification: any;
  questions: Question[];
  scoring: any;
}

export default function CertificationAssessmentClient({ user, certification, questions, scoring }: Props) {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'quiz' | 'submitting' | 'result'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [visitedQuestions, setVisitedQuestions] = useState<string[]>([questions[0]?.id]);
  const [timeLeft, setTimeLeft] = useState(certification.durationMinutes * 60 || 60 * 60);
  const [isTabActive, setIsTabActive] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showNavigator, setShowNavigator] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleClaimCertificate = async () => {
    setIsClaiming(true);
    setClaimError(null);
    try {
      const orderRes = await fetch('/api/certifications/create-claim-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificationId: certification.id,
          attemptId: activeAttemptId,
          totalScore: score,
          accuracy: score
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to initialize claim order');

      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error('Payment gateway failed to load.');

      const options: any = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SARTHI',
        description: `Certificate Claim: ${sanitizedTitle}`,
        image: '/images/sarthi_logo.jpg',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/certifications/verify-claim-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                certificationId: certification.id,
                attemptId: activeAttemptId
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed.');
            
            setVerificationId(verifyData.verificationId);
            setIsClaiming(false);
          } catch (err: any) {
            setClaimError(err.message || 'Payment verification failed.');
            setIsClaiming(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#059669' },
        modal: { ondismiss: () => setIsClaiming(false), escape: false },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setClaimError(resp.error?.description || 'Payment Failed');
        setIsClaiming(false);
      });
      rzp.open();
    } catch (err: any) {
      setClaimError(err.message || 'Claim process failed to initialize');
      setIsClaiming(false);
    }
  };

  const sanitizedTitle = (certification?.title || '')
    .replace(/\s*-\s*Set\s*[A-Z0-9]/gi, '')
    .replace(/\s*Set\s*[A-Z0-9]/gi, '')
    .replace(/\s*-\s*Variant\s*[A-Z0-9]/gi, '')
    .replace(/\s*Variant\s*[A-Z0-9]/gi, '');

  // Load existing attempt on mount
  useEffect(() => {
    const checkAttempt = async () => {
      try {
        const attempt = await getCertificationAttempt(certification.id);
        if (attempt) {
          setActiveAttemptId(attempt.id);
          setAnswers(JSON.parse(attempt.answers as string || '{}'));
          setTabSwitchCount(attempt.tabSwitchCount || 0);
          const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedState) {
            const parsed = JSON.parse(savedState) as AssessmentState;
            setTimeLeft(parsed.timeLeft || (certification.durationMinutes * 60));
            setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
          }
        }
      } catch (e) {
        console.error("Failed to fetch attempt", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkAttempt();
  }, [certification.id, certification.durationMinutes]);

  // Persistence: Auto-save state to localStorage (UI only)
  useEffect(() => {
    if (currentStep === 'quiz') {
      const state: AssessmentState = {
        answers,
        markedForReview,
        visitedQuestions,
        timeLeft,
        currentQuestionIndex
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
  }, [answers, markedForReview, visitedQuestions, timeLeft, currentQuestionIndex, currentStep]);

  // DB Sync: Save answers to database
  const syncWithDB = useCallback(async (newAnswers: any, newTabCount?: number) => {
    if (!activeAttemptId) return;
    try {
      await updateCertificationAttempt(activeAttemptId, {
        answers: newAnswers,
        tabSwitchCount: newTabCount ?? tabSwitchCount,
        timeTaken: (certification.durationMinutes * 60) - timeLeft
      });
    } catch (e) {
      console.error("DB Sync failed", e);
    }
  }, [activeAttemptId, tabSwitchCount, timeLeft, certification.durationMinutes]);

  const handleFinalSubmit = useCallback(async () => {
    if (!activeAttemptId) return;
    setShowConfirmSubmit(false);
    setCurrentStep('submitting');
    
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correctCount++;
    });
    const finalScore = Math.round((correctCount / questions.length) * 100);
    const isPassed = finalScore >= scoring.passingScore;

    try {
      await submitCertificationAttempt(activeAttemptId, {
        answers,
        score: finalScore,
        passed: isPassed,
        timeTaken: (certification.durationMinutes * 60) - timeLeft,
        tabSwitchCount
      });
      
      setScore(finalScore);
      setPassed(isPassed);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setCurrentStep('result');
    } catch (e) {
      console.error("Submission failed", e);
      setCurrentStep('quiz');
    }
  }, [activeAttemptId, answers, questions, scoring.passingScore, certification.durationMinutes, timeLeft, tabSwitchCount]);

  // Security Logic
  useEffect(() => {
    if (currentStep === 'quiz') {
      const handleContextMenu = (e: MouseEvent) => e.preventDefault();
      const handleCopyPaste = (e: ClipboardEvent) => e.preventDefault();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === 'F11' || 
          (e.ctrlKey && (e.key === 't' || e.key === 'n' || e.key === 'u')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))
        ) {
          e.preventDefault();
        }
      };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('copy', handleCopyPaste);
      document.addEventListener('paste', handleCopyPaste);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('copy', handleCopyPaste);
        document.removeEventListener('paste', handleCopyPaste);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [currentStep]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabActive(false);
        if (currentStep === 'quiz') {
          const newCount = tabSwitchCount + 1;
          setTabSwitchCount(newCount);
          syncWithDB(answers, newCount);
          if (newCount >= 3) {
            handleFinalSubmit();
          }
        }
      } else {
        setIsTabActive(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentStep, tabSwitchCount, answers, syncWithDB, handleFinalSubmit]);

  useEffect(() => {
    if (currentStep !== 'quiz') return;
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [currentStep, timeLeft, handleFinalSubmit]);

  // Fulscreen Enforcement
  const enterFullScreen = useCallback(() => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullScreen(isFull);
      
      if (!isFull && currentStep === 'quiz') {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        syncWithDB(answers, newCount);
        if (newCount >= 3) {
          handleFinalSubmit();
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [currentStep, tabSwitchCount, answers, syncWithDB, handleFinalSubmit]);

  const handleStart = async () => {
    try {
      const attempt = await startCertificationAttempt(certification.id);
      setActiveAttemptId(attempt.id);
      setAnswers(JSON.parse(attempt.answers as string || '{}'));
      setCurrentStep('quiz');
      setTimeout(enterFullScreen, 100);
    } catch (e) {
      console.error("Failed to start attempt", e);
    }
  };

  const handleOptionSelect = (questionId: string, letter: string) => {
    const newAnswers = { ...answers, [questionId]: letter };
    setAnswers(newAnswers);
    syncWithDB(newAnswers);
  };

  const toggleMarkForReview = () => {
    const qid = questions[currentQuestionIndex].id;
    setMarkedForReview(prev => 
      prev.includes(qid) ? prev.filter(id => id !== qid) : [...prev, qid]
    );
  };

  const navigateTo = (index: number) => {
    setCurrentQuestionIndex(index);
    const qid = questions[index].id;
    if (!visitedQuestions.includes(qid)) {
      setVisitedQuestions(prev => [...prev, qid]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      navigateTo(currentQuestionIndex + 1);
    } else {
      setShowConfirmSubmit(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) navigateTo(currentQuestionIndex - 1);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const attemptedCount = Object.keys(answers).length;
  const remainingCount = questions.length - attemptedCount;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="w-12 h-12 border-t-2 border-emerald-600 border-solid rounded-full animate-spin" />
      </div>
    );
  }

  // Format code helper to parse simple markdown code block syntax
  const parseAndRenderTableClient = (tableText: string, keyId: any) => {
    try {
      const lines = tableText.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('+') && !l.startsWith('+-'));
      if (lines.length === 0) return null;

      const headerLine = lines[0];
      let cleanHeader = headerLine;
      if (cleanHeader.startsWith('|')) cleanHeader = cleanHeader.substring(1).trim();
      if (cleanHeader.endsWith('|')) cleanHeader = cleanHeader.substring(0, cleanHeader.length - 1).trim();
      const headers = cleanHeader.split(' | ').map(h => h.trim());

      const rows = lines.slice(1).map(line => {
        let cleanLine = line.trim();
        if (cleanLine.startsWith('|')) cleanLine = cleanLine.substring(1).trim();
        if (cleanLine.endsWith('|')) cleanLine = cleanLine.substring(0, cleanLine.length - 1).trim();
        return cleanLine.split(' | ').map(c => c.trim());
      });

      return (
        <div key={`html-table-${keyId}`} className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 my-4 shadow-inner">
          <table className="min-w-full divide-y divide-slate-200 text-left text-[13px] font-mono">
            <thead className="bg-[#FAF9F6] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className="px-5 py-3 border-b border-slate-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-5 py-3 whitespace-nowrap font-medium border-slate-100">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } catch (e) {
      console.error("Failed to parse ASCII table:", e);
      return null;
    }
  };

  const renderQuestionText = (text: string) => {
    if (certification.slug === 'advanced-excel-certification-exam') {
      const lines = text.split('\n');
      const elements: React.ReactNode[] = [];
      let inCodeBlock = false;
      let codeBlockLines: string[] = [];

      let i = 0;
      while (i < lines.length) {
        const line = lines[i];

        if (line.startsWith('```')) {
          if (inCodeBlock) {
            inCodeBlock = false;
            const codeText = codeBlockLines.join('\n');
            const parsedTable = parseAndRenderTableClient(codeText, i);
            elements.push(
              parsedTable || (
                <pre key={`code-${i}`} className="my-4 p-5 rounded-2xl font-mono text-[12px] md:text-sm overflow-x-auto leading-relaxed border border-slate-200 bg-slate-900 text-slate-100 shadow-inner select-text">
                  <code className="font-mono text-slate-100">{codeText}</code>
                </pre>
              )
            );
            codeBlockLines = [];
          } else {
            inCodeBlock = true;
          }
          i++;
          continue;
        }

        if (inCodeBlock) {
          codeBlockLines.push(line);
          i++;
          continue;
        }

        const trimmed = line.trim();
        if (!trimmed) {
          i++;
          continue;
        }

        if (trimmed.startsWith('###')) {
          elements.push(
            <h3 key={`h3-${i}`} className="text-lg font-black text-emerald-700 border-b border-slate-150 pb-2.5 mb-2 flex items-center gap-2">
              {trimmed.replace('###', '').trim()}
            </h3>
          );
          i++;
          continue;
        }

        if (trimmed.startsWith('🎯')) {
          const content = trimmed.replace(/🎯\s*\*\*Context:\*\*/, '').replace(/🎯\s*Context:/, '').trim();
          elements.push(
            <div key={`context-${i}`} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-1 my-3">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>🎯</span> Context
              </div>
              <p className="text-[14px] font-semibold leading-relaxed text-slate-600">
                {content}
              </p>
            </div>
          );
          i++;
          continue;
        }

        if (trimmed.startsWith('⚠️') || trimmed.startsWith('📌')) {
          const isReq = trimmed.startsWith('📌');
          const content = trimmed
            .replace(/⚠️\s*\*\*Business Problem:\*\*/, '')
            .replace(/📌\s*\*\*Business Requirement:\*\*/, '')
            .replace(/⚠️\s*\*\*Business Problem\*\*/, '')
            .replace(/📌\s*\*\*Business Requirement\*\*/, '')
            .trim();
          
          elements.push(
            <div key={`prob-${i}`} className={`border rounded-2xl p-5 space-y-1 my-3 ${
              isReq ? 'bg-blue-50/40 border-blue-200/50' : 'bg-amber-50/40 border-amber-200/50'
            }`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${
                isReq ? 'text-blue-600' : 'text-amber-700'
              }`}>
                <span>{isReq ? '📌' : '⚠️'}</span> {isReq ? 'Business Requirement' : 'Business Problem'}
              </div>
              <p className="text-[14px] font-semibold leading-relaxed text-slate-600">
                {content}
              </p>
            </div>
          );
          i++;
          continue;
        }

        if (trimmed.startsWith('❓')) {
          let content = trimmed.replace(/❓\s*\*\*Question:\*\*/, '').replace(/❓\s*Question:/, '').trim();
          while (i + 1 < lines.length && !lines[i+1].startsWith('```') && !lines[i+1].startsWith('###') && !lines[i+1].startsWith('🎯') && !lines[i+1].startsWith('⚠️') && !lines[i+1].startsWith('📌')) {
            content += '\n' + lines[i+1].trim();
            i++;
          }
          elements.push(
            <div key={`q-${i}`} className="pt-4 border-t border-slate-100 my-3">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                <span>❓</span> Question
              </div>
              <p className="font-extrabold text-[18px] md:text-[20px] tracking-wide leading-snug text-slate-800 whitespace-pre-wrap">
                {content}
              </p>
            </div>
          );
          i++;
          continue;
        }

        elements.push(
          <p key={`text-${i}`} className="text-slate-600 font-semibold text-[14px] leading-relaxed my-1.5">
            {trimmed}
          </p>
        );
        i++;
      }

      return <div className="space-y-3">{elements}</div>;
    }

    const codeBlockRegex = /```(?:python|javascript|cpp|json|sql|bash|html)?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex} className="whitespace-pre-wrap">{text.substring(lastIndex, match.index)}</span>);
      }
      const code = match[1].trim();
      parts.push(
        <pre key={match.index} className="my-6 p-5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl font-mono text-sm text-[#1E293B] overflow-x-auto leading-relaxed shadow-inner select-text">
          <code className="font-mono text-[#0F172A]">{code}</code>
        </pre>
      );
      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex} className="whitespace-pre-wrap">{text.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div ref={containerRef} className="assessment-container min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans relative flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .assessment-container { font-family: 'Inter', -apple-system, sans-serif; user-select: none; }
        .exam-option-button { transition: all 0.2s ease-in-out; }
        .exam-option-button:hover:not(.selected) { border-color: #CBD5E1; }
        .exam-option-button.selected { border-color: #10B981; background-color: rgba(16, 185, 129, 0.02); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>

      <AnimatePresence mode="wait">
        {currentStep === 'welcome' && (
          <motion.div key="welcome" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="flex-1 flex items-center justify-center p-6 relative z-10">
            <div className="bg-white rounded-3xl p-10 md:p-16 max-w-2xl w-full border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.03)] text-center">
               <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-emerald-100/65">
                  <Shield className="w-8 h-8 text-emerald-600" />
               </div>
               <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4 tracking-tight uppercase italic">{sanitizedTitle} Assessment</h1>
               <p className="text-[#64748B] text-sm md:text-base max-w-lg mx-auto mb-10 font-medium leading-relaxed">
                  You are starting the proctored {sanitizedTitle} certification gate. 
                  This test consists of exactly {questions.length} questions to validate your expertise.
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
                  <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-start gap-4">
                     <Clock className="w-5 h-5 text-[#64748B] mt-0.5 shrink-0" />
                     <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{certification.durationMinutes} Minutes</h4>
                        <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Time-restricted exam session.</p>
                     </div>
                  </div>
                  <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-start gap-4">
                     <Monitor className="w-5 h-5 text-[#64748B] mt-0.5 shrink-0" />
                     <div>
                        <h4 className="font-semibold text-slate-800 text-sm">Strictly Proctored</h4>
                        <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Keep tab focus to avoid lockouts.</p>
                     </div>
                  </div>
               </div>

               <button onClick={handleStart} className="w-full md:w-auto px-10 py-4.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3.5 mx-auto shadow-md shadow-emerald-600/10 cursor-pointer">
                  {activeAttemptId ? 'Resume Exam Gate' : 'Initialize Assessment'}
                  <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 flex-1 flex flex-col min-h-screen">
            {/* Header: Zero distractions, minimal layout */}
            <header className="sticky top-0 z-40 h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-2 md:px-10">
                <div className="flex items-center gap-1.5 md:gap-4">
                    <span className="text-[10px] md:text-sm font-bold tracking-tight text-emerald-600">TT GATE</span>
                    <div className="w-[1px] h-4 bg-slate-200 hidden min-[360px]:block" />
                    <span className="text-[9px] min-[360px]:text-[10px] md:text-xs font-semibold text-[#64748B] max-w-[60px] min-[400px]:max-w-[120px] sm:max-w-[150px] md:max-w-none truncate">{sanitizedTitle}</span>
                </div>

                <div className="flex items-center gap-1.5 md:gap-6">
                    {/* Header Progress Counter */}
                    <span className="text-[9px] min-[360px]:text-[10px] md:text-xs font-semibold text-[#64748B]">
                      <span className="hidden sm:inline">Question </span>{currentQuestionIndex + 1}/{questions.length}
                    </span>

                    {/* Proctor Violation Indicator */}
                    {tabSwitchCount > 0 && (
                      <div className="flex items-center gap-0.5 px-1 py-0.5 md:px-3 md:py-1.5 rounded-lg border border-rose-100 bg-rose-50 text-rose-600 text-[8px] min-[360px]:text-[9px] md:text-xs font-bold">
                        <ShieldAlert className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                        <span className="hidden md:inline">Violations: </span><span>{tabSwitchCount}/3</span>
                      </div>
                    )}

                    {/* Timer */}
                    <div className={`flex items-center gap-1 md:gap-2 text-[9px] min-[360px]:text-[10px] md:text-xs font-bold transition-all ${timeLeft < 300 ? 'text-red-500 font-extrabold' : 'text-[#64748B]'}`}>
                       <Timer className="w-3 h-3 md:w-3.5 md:h-3.5" />
                       <span className="font-mono text-xs md:text-sm">{formatTime(timeLeft)}</span>
                    </div>

                    {/* Question Navigator Toggle Button */}
                    <button 
                      onClick={() => setShowNavigator(!showNavigator)} 
                      className={`p-1 md:p-2 rounded-lg border transition-all cursor-pointer ${showNavigator ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B]'}`}
                      title="Toggle Question Grid"
                    >
                      <Grid className="w-3 h-3 md:w-4 md:h-4" />
                    </button>

                    <button onClick={() => setShowConfirmSubmit(true)} className="px-2 py-1 md:px-4 md:py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-lg font-bold text-[9px] md:text-xs transition-all cursor-pointer">Submit</button>
                </div>
            </header>
 
            {/* Central Canvas: Centered & Absolute Focus */}
            <main className="flex-1 flex justify-center py-3 px-2 md:py-10 md:px-6 relative">
              <div className="w-full max-w-[850px] flex flex-col gap-3 md:gap-8">
                  {/* Invisible container context holding the question */}
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 md:p-12 shadow-[0_4px_25px_rgba(0,0,0,0.01)] text-left space-y-4 md:space-y-8 flex-1">
                      <div className="space-y-3 md:space-y-6">
                          {/* Top Question Difficulty Meta */}
                          <div className="flex items-center gap-1.5 md:gap-3">
                            <span className="text-[8px] md:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md border border-emerald-100 uppercase tracking-wider">Milestone Gate</span>
                            {questions[currentQuestionIndex].difficulty && (
                              <span className="text-[8px] md:text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md border border-slate-100 uppercase tracking-wider">{questions[currentQuestionIndex].difficulty}</span>
                            )}
                          </div>
                          
                          {/* Question Text */}
                          <h2 className="text-sm sm:text-base md:text-xl font-medium text-[#1E293B] leading-[1.6] select-text">
                            {renderQuestionText(questions[currentQuestionIndex].question)}
                          </h2>
                      </div>
 
                      {/* Tactile MCQ Options */}
                      <div className="grid grid-cols-1 gap-2.5 md:gap-4 pt-1">
                          {questions[currentQuestionIndex].options.map((option: string, idx: number) => {
                            const letter = String.fromCharCode(65 + idx);
                            const isSelected = answers[questions[currentQuestionIndex].id] === letter;
                            return (
                              <button 
                                key={idx} 
                                onClick={() => handleOptionSelect(questions[currentQuestionIndex].id, letter)} 
                                className={`exam-option-button w-full text-left p-3 md:p-5 rounded-xl border flex items-center gap-2.5 md:gap-5 group cursor-pointer bg-white ${isSelected ? 'selected' : 'border-[#E2E8F0]'}`}
                              >
                                  {/* Custom minimal selector indicator ring */}
                                  <div className={`w-3.5 h-3.5 md:w-5 md:h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white group-hover:border-slate-400'}`}>
                                      {isSelected && <Check className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 stroke-[3]" />}
                                  </div>
                                  <span className={`font-medium text-xs sm:text-sm md:text-base leading-snug ${isSelected ? 'text-emerald-950 font-semibold' : 'text-[#334155]'}`}>{option}</span>
                              </button>
                            );
                          })}
                      </div>
                  </div>
 
                  {/* Actions Footer Bar - Sticky on Mobile */}
                  <div className="sticky bottom-0 bg-white border-t border-[#E2E8F0] py-3 px-3 flex items-center justify-between -mx-2 -mb-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] md:shadow-none md:bg-transparent md:border-none md:relative md:bottom-auto md:mb-0 md:mx-0 md:py-0 md:px-4 z-40 flex-shrink-0">
                      <button 
                        onClick={handlePrev} 
                        disabled={currentQuestionIndex === 0} 
                        className="flex items-center gap-1 font-bold text-[10px] md:text-xs uppercase tracking-wider text-[#64748B] hover:text-[#1E293B] disabled:opacity-20 transition-all hover:-translate-x-0.5 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                        <span>Prev</span>
                      </button>
 
                      <button 
                        onClick={toggleMarkForReview} 
                        className={`group flex items-center gap-1 px-2.5 py-2 md:px-5 md:py-3.5 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${markedForReview.includes(questions[currentQuestionIndex].id) ? 'bg-amber-50 text-amber-700 border border-amber-250 shadow-sm' : 'bg-transparent text-[#64748B] hover:text-[#1E293B]'}`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${markedForReview.includes(questions[currentQuestionIndex].id) ? 'fill-amber-600 stroke-amber-600' : ''}`} /> 
                        <span className="hidden sm:inline">{markedForReview.includes(questions[currentQuestionIndex].id) ? 'Flagged' : 'Flag for Review'}</span>
                        <span className="inline sm:hidden">{markedForReview.includes(questions[currentQuestionIndex].id) ? 'Flagged' : 'Flag'}</span>
                      </button>
 
                      <button 
                        onClick={handleNext} 
                        className="px-3 py-2 md:px-8 md:py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-wider shadow-sm transition-all hover:-translate-y-0.5 active:scale-98 flex items-center gap-1 cursor-pointer"
                      >
                        <span>
                          {currentQuestionIndex === questions.length - 1 ? 'Review' : 'Next'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                  </div>
              </div>
            </main>

            {/* Collapsible Overlay Drawer for Question Navigator */}
            <AnimatePresence>
              {showNavigator && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    onClick={() => setShowNavigator(false)} 
                    className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px]"
                  />
                  <motion.div 
                    initial={{ x: '100%' }} 
                    animate={{ x: 0 }} 
                    exit={{ x: '100%' }} 
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-16 right-0 bottom-0 z-50 w-80 bg-white border-l border-[#E2E8F0] p-6 flex flex-col shadow-2xl"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-6">
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Question Grid</h3>
                      <button onClick={() => setShowNavigator(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                      <div className="grid grid-cols-4 gap-3">
                         {questions.map((q, idx) => {
                           const isCurrent = currentQuestionIndex === idx;
                           const isAttempted = answers[q.id];
                           const isMarked = markedForReview.includes(q.id);
                           
                           let statusClass = 'border-slate-200 text-[#64748B] hover:border-slate-350';
                           if (isCurrent) statusClass = 'border-emerald-600 text-emerald-600 bg-emerald-50/20 font-bold';
                           else if (isMarked) statusClass = 'bg-amber-500 border-amber-500 text-white font-bold';
                           else if (isAttempted) statusClass = 'bg-emerald-600 border-emerald-600 text-white font-bold';
                           
                           return (
                             <button 
                               key={q.id} 
                               onClick={() => { navigateTo(idx); setShowNavigator(false); }} 
                               className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xs transition-all cursor-pointer ${statusClass}`}
                             >
                               {idx + 1}
                             </button>
                           );
                         })}
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[#F1F5F9] space-y-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                        <span>Progress Map</span>
                        <span>{attemptedCount}/{questions.length} Done</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${(attemptedCount / questions.length) * 100}%` }} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] font-bold text-[#64748B] uppercase">
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" /><span>Attempted</span></div>
                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-amber-500 rounded-full" /><span>Flagged</span></div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {currentStep === 'submitting' && (
          <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center p-6 bg-[#F8FAFC]">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 border-t-2 border-emerald-600 border-solid rounded-full animate-spin mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-[#1E293B] tracking-tight mb-1">Evaluating Performance</h2>
                <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">Finalizing verification matrix...</p>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center p-6 py-16 bg-[#F8FAFC]">
            <div className="bg-white rounded-3xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
                <div className={`flex-1 p-12 text-center text-white flex flex-col items-center justify-center relative ${passed ? 'bg-gradient-to-br from-[#1B4332] to-[#0A2619]' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`}>
                    <div className="relative z-10 space-y-6">
                       <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20">
                          {passed ? <Trophy className="w-8 h-8 text-emerald-400" /> : <RotateCcw className="w-8 h-8 text-slate-300" />}
                       </div>
                       <div>
                          <h2 className="text-3xl font-extrabold tracking-tight uppercase italic leading-none">{passed ? 'Expert Certified' : 'Assessment Failed'}</h2>
                          <p className="text-white/40 font-bold text-[9px] tracking-widest uppercase mt-2">Verified: {user.name || 'Student'}</p>
                       </div>
                       <div className="inline-flex items-center bg-white/5 rounded-2xl p-6 gap-8 border border-white/10">
                          <div><span className="block text-3xl font-bold leading-none mb-0.5">{score}%</span><span className="text-[9px] font-bold uppercase opacity-40">Your Score</span></div>
                          <div className="w-[1px] h-8 bg-white/10" />
                          <div><span className="block text-3xl font-bold leading-none mb-0.5">{scoring.passingScore}%</span><span className="text-[9px] font-bold uppercase opacity-40">Passing Score</span></div>
                       </div>
                    </div>
                </div>
                <div className="flex-1.2 p-12 bg-white flex flex-col justify-between text-left">
                   <div className="space-y-8">
                      <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Evaluation Metrics Summary</h3>
                      <div className="grid grid-cols-2 gap-6 text-sm">
                         <div><span className="block text-xs font-semibold text-slate-400 uppercase mb-0.5">Attempt Status</span><span className="text-base font-bold text-[#1E293B]">Attempt #1</span></div>
                         <div><span className="block text-xs font-semibold text-slate-400 uppercase mb-0.5">Time Spent</span><span className="text-base font-bold text-[#1E293B]">{Math.round((certification.durationMinutes * 60 - timeLeft) / 60)} Mins</span></div>
                         <div><span className="block text-xs font-semibold text-slate-400 uppercase mb-0.5">Violations</span><span className={`text-base font-bold ${tabSwitchCount > 0 ? 'text-red-500' : 'text-[#1E293B]'}`}>{tabSwitchCount}</span></div>
                         <div><span className="block text-xs font-semibold text-slate-400 uppercase mb-0.5">Correct Answers</span><span className="text-base font-bold text-[#1E293B]">{Math.round((score/100) * questions.length)} / {questions.length}</span></div>
                      </div>
                      {claimError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-semibold mb-4">
                          ⚠️ {claimError}
                        </div>
                      )}
                      <div className="flex gap-4 mt-10">
                         {passed ? (
                           verificationId ? (
                             <Link 
                               href={`/certification-exams/verify/${verificationId}`}
                               className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/10 text-center"
                             >
                               View Verified Certificate
                             </Link>
                           ) : (
                             <button 
                               onClick={handleClaimCertificate}
                               disabled={isClaiming}
                               className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-75 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-2"
                             >
                               {isClaiming ? (
                                 <>
                                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                   Processing...
                                 </>
                               ) : (
                                 'Claim Certificate (₹2000)'
                               )}
                             </button>
                           )
                         ) : (
                           <button onClick={() => window.location.reload()} className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/10 cursor-pointer">Retry Gate Exam</button>
                         )}
                         <button onClick={() => window.location.href = '/certification-exams'} className="flex-[1] py-4 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">Exit Portal</button>
                      </div>
                   </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proctor Fullscreen Mode Enforcement Alert */}
      <AnimatePresence>
        {!isFullScreen && currentStep === 'quiz' && (
          <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-10 max-w-md shadow-2xl text-center border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
                <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-6" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">FULLSCREEN REQUIRED</h2>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                  You have exited proctored fullscreen mode. To ensure assessment integrity, returning to fullscreen is mandatory.<br/><br/>
                  <span className="text-rose-500 font-bold uppercase text-xs">Accumulating 3 violations triggers automatic submission.</span>
                </p>
                <button onClick={enterFullScreen} className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/10 cursor-pointer">
                    Resume Secure Mode <Maximize className="w-4 h-4" />
                </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
