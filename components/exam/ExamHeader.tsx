'use client';

import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Maximize2, Eye, Terminal, RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamHeaderProps {
  timeRemaining: number;
  violations: number;
  isFullscreen: boolean;
  onToggleNavigator: () => void;
  certificationTitle?: string;
  currentQuestion: number;
  totalQuestions: number;
  progressPercentage: number;
  isSaving: boolean;
  lastSavedAt: Date | null;
  onSubmit: () => void;
}

export default function ExamHeader({
  timeRemaining,
  violations,
  isFullscreen,
  onToggleNavigator,
  certificationTitle = 'Assessment',
  currentQuestion,
  totalQuestions,
  progressPercentage,
  isSaving,
  lastSavedAt,
  onSubmit,
}: ExamHeaderProps) {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const isLowTime = timeRemaining < 300; // Less than 5 minutes

  const formatTime = () => {
    if (hours > 0) {
       return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left: Progress */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <Terminal className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Progress: {progressPercentage}%
              </p>
              <p className="text-xs md:text-sm font-bold text-[#1F2937] truncate max-w-[120px] sm:max-w-[200px]">
                Q{currentQuestion} of {totalQuestions}
              </p>
            </div>
          </div>

          {/* Center: Timer */}
          <motion.div 
            animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            className={cn(
               "px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 transition-all",
               isLowTime 
                ? "bg-red-100 text-red-700 border border-red-200" 
                : "bg-gradient-to-r from-[#1B4332]/10 to-[#40916C]/10 text-[#1B4332] border border-[#1B4332]/10"
            )}
          >
            <Clock className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-lg md:text-2xl font-mono font-bold tracking-tight">
              {formatTime()}
            </span>
          </motion.div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {violations > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-100 text-red-700 rounded-lg md:rounded-xl"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs md:text-sm font-bold">{violations} Warning{violations > 1 ? 's' : ''}</span>
              </motion.div>
            )}

            {isSaving ? (
                <div className="hidden lg:flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Saving...
                </div>
            ) : lastSavedAt && (
                <div className="hidden lg:flex items-center gap-2 text-gray-400 text-[10px] uppercase font-medium">
                  <Check className="w-3 h-3" />
                  Saved {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            )}
            
            <button
              onClick={onToggleNavigator}
              className="p-2 md:p-3 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors lg:hidden"
              title="Toggle Navigator"
            >
              <Eye className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </button>
            
            <button 
              onClick={onSubmit}
              className="hidden sm:block px-4 py-2 md:px-6 md:py-3 bg-white text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider border border-gray-200 transition-all hover:border-rose-200"
            >
              Finish Test
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

