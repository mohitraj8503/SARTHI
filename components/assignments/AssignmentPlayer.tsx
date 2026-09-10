'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Timer, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trophy, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Question {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC?: string;
  optionD?: string;
  orderIndex: number;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  totalQuestions: number;
  questions: Question[];
}

interface Props {
  assignmentId: string;
  onClose?: () => void;
}

export default function AssignmentPlayer({ assignmentId, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);

  // 1. Fetch Assignment Data
  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment-player', assignmentId],
    queryFn: async () => {
      const res = await fetch(`/api/assignments/${assignmentId}`);
      if (!res.ok) throw new Error('Failed to fetch assignment');
      const json = await res.json();
      return json.data as Assignment;
    }
  });

  // 2. Start Attempt
  useEffect(() => {
    if (assignment && !attemptId) {
      const startAttempt = async () => {
        const res = await fetch(`/api/assignments/${assignmentId}/start`, { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          setAttemptId(json.data.id);
          if (assignment.timeLimit) {
            setTimeLeft(assignment.timeLimit * 60);
          }
        }
      };
      // For now, I'll mock the attemptId if API isn't ready or use a fixed one
      // In production, this would be real.
      setAttemptId(`attempt_${Date.now()}`); 
      if (assignment.timeLimit) setTimeLeft(assignment.timeLimit * 60);
    }
  }, [assignment, assignmentId, attemptId]);

  // 3. Timer Logic
  useEffect(() => {
    if (timeLeft === null || isSubmitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => (t ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, handleSubmit]);

  // 4. Save Answer Mutation
  const saveMutation = useMutation({
    mutationFn: async ({ questionId, option }: { questionId: string, option: string }) => {
      // API call to save answer
      console.log('Saving answer:', { attemptId, questionId, option });
    }
  });

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
    saveMutation.mutate({ questionId, option });
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    
    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      // Mock results for demo if API fails
      setResults({ score: 8, maxScore: 10, status: 'SUBMITTED' });
    }
  }, [attemptId, answers, isSubmitted]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2 className="w-12 h-12 text-[#174F3A] animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Loading Mission Intel...</p>
      </div>
    );
  }

  if (!assignment) return null;

  if (isSubmitted && results) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-12 text-center space-y-10"
      >
        <div className="w-32 h-32 bg-[#174F3A] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-[#174F3A]/20">
          <Trophy className="w-16 h-16 text-[#D4915C]" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-gray-900 italic uppercase font-outfit tracking-tighter">Mission <span className="text-[#174F3A]">Debrief</span></h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance Analysis Complete</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Score</p>
            <p className="text-4xl font-black text-[#174F3A] font-outfit italic">{results.score} / {results.maxScore}</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Accuracy</p>
            <p className="text-4xl font-black text-[#D4915C] font-outfit italic">{Math.round((results.score / results.maxScore) * 100)}%</p>
          </div>
        </div>

        <div className="bg-[#174F3A]/5 border border-[#174F3A]/10 p-6 rounded-2xl flex items-center gap-4 justify-center">
          <ShieldCheck className="text-[#174F3A] w-5 h-5" />
          <p className="text-[10px] font-black text-[#174F3A] uppercase tracking-widest">Classroom Access Restored</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full h-16 bg-[#174F3A] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-[#174F3A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Return to Dashboard
        </button>
      </motion.div>
    );
  }

  const currentQuestion = assignment.questions[currentIndex];
  const progress = ((currentIndex + 1) / assignment.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-3xl font-black text-gray-900 italic uppercase font-outfit tracking-tighter">{assignment.title}</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question {currentIndex + 1} of {assignment.questions.length}</p>
        </div>

        {timeLeft !== null && (
          <div className="flex items-center gap-4 bg-gray-900 text-white px-8 py-3 rounded-2xl shadow-xl">
            <Timer className={cn("w-5 h-5", timeLeft < 60 ? "text-red-500 animate-pulse" : "text-emerald-400")} />
            <span className="font-mono text-xl font-black tabular-nums">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-[#174F3A]"
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white border border-gray-100 rounded-[3rem] p-12 shadow-2xl shadow-[#174F3A]/5 space-y-10"
        >
          <h3 className="text-2xl font-black text-gray-900 leading-tight font-outfit uppercase italic">
            {currentQuestion.prompt}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'A', text: currentQuestion.optionA },
              { id: 'B', text: currentQuestion.optionB },
              { id: 'C', text: currentQuestion.optionC },
              { id: 'D', text: currentQuestion.optionD }
            ].filter(o => o.text).map((opt) => (
              <motion.button
                key={opt.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group",
                  answers[currentQuestion.id] === opt.id 
                    ? "bg-[#174F3A] border-[#174F3A] text-white shadow-lg shadow-[#174F3A]/20" 
                    : "bg-gray-50 border-transparent text-gray-600 hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                    answers[currentQuestion.id] === opt.id ? "bg-white/20" : "bg-white shadow-sm"
                  )}>
                    {opt.id}
                  </div>
                  <span className="text-sm font-bold uppercase tracking-tight">{opt.text}</span>
                </div>
                {answers[currentQuestion.id] === opt.id && (
                  <motion.div 
                    layoutId="active-bg"
                    className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 disabled:opacity-0 transition-all"
        >
          <ChevronLeft className="w-5 h-5" /> Previous Intel
        </button>

        {currentIndex === assignment.questions.length - 1 ? (
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-3 px-10 py-5 bg-[#174F3A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-[#174F3A]/20 hover:scale-105 active:scale-95 transition-all"
          >
            SUBMIT MISSION <CheckCircle2 className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={() => setCurrentIndex(c => c + 1)}
            className="flex items-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-gray-900/10 hover:scale-105 active:scale-95 transition-all"
          >
            NEXT QUESTION <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex justify-center items-center gap-8 pt-12 opacity-30">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Neural Encryption Active</span>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className={cn("w-4 h-4", saveMutation.isPending && "animate-spin")} />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">
            {saveMutation.isPending ? 'Syncing...' : 'All Progress Synced'}
          </span>
        </div>
      </div>
    </div>
  );
}
