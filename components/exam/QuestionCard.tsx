'use client';

import { motion } from 'framer-motion';
import { Flag, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionCardProps {
  questionNumber: number;
  question: {
    id: string;
    text: string;
    weight: number;
    options: string[];
  };
  selectedOption: number | null;
  isMarked: boolean;
  onSaveAnswer: (optionIndex: number) => void;
  onMarkReview: () => void;
  onClear: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSubmit: () => void;
}

export default function QuestionCard({
  questionNumber,
  question,
  selectedOption,
  isMarked,
  onSaveAnswer,
  onMarkReview,
  onClear,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  onSubmit,
}: QuestionCardProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(27,67,50,0.1)] p-6 md:p-12 border border-white flex flex-col h-full min-h-[500px]"
    >
      {/* Question Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <span className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-[#1B4332]/10 to-[#40916C]/10 text-[#1B4332] rounded-full text-xs md:text-sm font-bold tracking-wider">
            QUESTION {questionNumber + 1}
          </span>
          <span className="text-xs md:text-sm font-semibold text-gray-400 tracking-widest uppercase">
            WEIGHT: {question.weight} PTS
          </span>
        </div>
        
        <button
          onClick={onMarkReview}
          className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all border ${
            isMarked 
              ? 'bg-amber-50 text-amber-700 border-amber-200' 
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Flag className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isMarked ? 'fill-current' : ''}`} />
          <span className="text-xs md:text-sm font-semibold hidden sm:inline">
            {isMarked ? 'Under Review' : 'Mark Review'}
          </span>
        </button>
      </div>

      {/* Question Text */}
      <h2 className="text-xl md:text-3xl font-bold text-[#1F2937] mb-8 leading-relaxed break-words">
        {question.text}
      </h2>

      {/* Options */}
      <div className="space-y-3 md:space-y-4 mb-10 flex-grow max-w-4xl">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSaveAnswer(index)}
              className={`w-full p-4 md:p-6 rounded-2xl border-2 text-left transition-all duration-300 group ${
                isSelected
                  ? 'border-[#1B4332] bg-gradient-to-r from-[#1B4332]/5 to-[#40916C]/5 shadow-sm'
                  : 'border-gray-100 hover:border-[#40916C]/40 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4 md:gap-6">
                <span className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl font-bold text-xs md:text-sm transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-[#40916C]/20'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={`text-sm md:text-lg py-1 ${
                  isSelected ? 'font-semibold text-[#1B4332]' : 'text-gray-600'
                }`}>
                  {option.replace(/^[A-D][\):\.]\s*/, '')}
                </span>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#1B4332] ml-auto shrink-0" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between pt-6 border-t border-gray-100 gap-4 mt-auto">
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className="flex items-center gap-2 px-4 py-3 md:px-6 md:py-3 rounded-xl font-semibold text-gray-500 hover:text-[#1B4332] hover:bg-gray-50 disabled:opacity-30 disabled:grayscale transition-all text-sm md:text-base"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          Previous
        </button>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <button 
            onClick={onClear}
            className="px-4 py-3 md:px-6 md:py-3 rounded-xl font-bold text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all text-xs md:text-sm uppercase tracking-wider"
          >
            Clear
          </button>
          <button
            onClick={isLast ? onSubmit : onNext}
            className="flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white rounded-xl font-bold text-xs md:text-sm uppercase tracking-widest shadow-lg shadow-[#1B4332]/20 hover:shadow-xl hover:shadow-[#1B4332]/30 active:scale-95 transition-all"
          >
            {isLast ? 'Finish' : 'Next'}
            {!isLast && <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

