'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, Flag, RefreshCw } from 'lucide-react';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredCount: number;
  getQuestionStatus: (index: number) => 'answered' | 'review' | 'not-answered';
  onSelectQuestion: (index: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function QuestionNavigator({
  totalQuestions,
  currentQuestion,
  answeredCount,
  getQuestionStatus,
  onSelectQuestion,
  onSubmit,
  isSubmitting
}: QuestionNavigatorProps) {
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(27,67,50,0.1)] p-8 border border-white">
      <div className="mb-8">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          Live Navigator
        </h4>
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-[#1A3C2E]">Overview</div>
          <div className="px-3 py-1 bg-gradient-to-r from-[#1B4332]/10 to-[#40916C]/10 text-[#1B4332] text-xs font-bold rounded-lg border border-[#1B4332]/10">
            {answeredCount}/{totalQuestions}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[#1B4332] to-[#40916C]"
          />
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const status = getQuestionStatus(i);
          const isCurrent = i === currentQuestion;

          return (
            <button
              key={i}
              onClick={() => onSelectQuestion(i)}
              className={cn(
                "aspect-square rounded-xl text-[11px] font-bold transition-all border-2 flex items-center justify-center",
                isCurrent ? "border-[#1B4332] shadow-md scale-105" : "border-transparent hover:scale-105",
                status === 'answered' 
                  ? "bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white" 
                  : status === 'review' 
                  ? "bg-amber-100 text-amber-700 border-amber-300" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-3 p-5 bg-gray-50/80 rounded-2xl mb-8">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <div className="w-3 h-3 rounded-md bg-gradient-to-br from-[#1B4332] to-[#2D6A4F]" />
          Answered
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <div className="w-3 h-3 rounded-md bg-amber-200" />
          In Review
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <div className="w-3 h-3 rounded-md bg-gray-200" />
          Not Visited
        </div>
      </div>

      {/* Finalize Button */}
      <button 
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-5 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-[#1B4332]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
      >
        {isSubmitting ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <RefreshCw className="w-4 h-4" />
          </motion.div>
        ) : (
          <CheckCircle2 className="w-4 h-4" />
        )}
        Finalize Assessment
      </button>
    </div>
  );
}

