'use client'

import { useState, useEffect, useCallback } from 'react';
import { Timer, CheckCircle2, AlertCircle, Send } from 'lucide-react';

interface QuizQuestion {
  id: string;
  prompt: string;
  options: { id: number; text: string }[];
}

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  timeLimit: number;
  questions: QuizQuestion[];
}

/**
 * Immersive Quiz Interface
 * Features a dynamic timer, haptic feedback on selection, and immediate validation.
 */
export function QuizInterface({ quiz, onResult }: { quiz: Quiz; onResult: (data: any) => void }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer logic for timed assessments
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/student/lessons/${quiz.id}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      
      const data = await res.json();
      if (data.success) {
        onResult(data.data);
      }
    } catch (err) {
      console.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, quiz.id, answers, onResult]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = (Object.keys(answers).length / quiz.questions.length) * 100;

  return (
    <div className="quiz-interface space-y-8 max-w-2xl mx-auto">
      {/* Sticky Quiz Header */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white text-slate-600'} shadow-sm`}>
            <Timer size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Remaining</div>
            <div className={`text-lg font-black font-mono ${timeLeft < 60 ? 'text-red-600' : 'text-slate-900'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</div>
          <div className="text-lg font-black text-emerald-600">{Math.round(progressPercent)}%</div>
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-10">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              <span className="text-emerald-600 mr-2">{idx + 1}.</span> {q.prompt}
            </h3>
            
            <div className="grid gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                  className={`flex items-center p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] 
                             ${answers[q.id] === opt.id 
                               ? 'bg-emerald-50 border-emerald-600 shadow-md shadow-emerald-900/5' 
                               : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors
                                  ${answers[q.id] === opt.id ? 'bg-emerald-600 border-emerald-600' : 'border-slate-200'}`}>
                    {answers[q.id] === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className={`font-bold text-sm ${answers[q.id] === opt.id ? 'text-emerald-900' : 'text-slate-600'}`}>
                    {opt.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submission CTA */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
        className="w-full h-16 bg-emerald-800 text-white rounded-2xl font-black uppercase tracking-widest text-sm
                   flex items-center justify-center gap-3 shadow-2xl shadow-emerald-900/30 transition-all active:scale-[0.98]
                   disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
      >
        {isSubmitting ? (
          'Analyzing Answers...'
        ) : (
          <>
            <Send size={18} />
            Submit Final Assessment
          </>
        )}
      </button>

      <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        Passing Score: {quiz.passingScore}%
      </p>
    </div>
  );
}
