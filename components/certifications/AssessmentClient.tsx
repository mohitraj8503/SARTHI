
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  options: any; // Json array
  marks: number;
}

interface Certification {
  id: string;
  title: string;
  assessmentDurationMinutes: number;
  passingScore: number;
}

interface AssessmentClientProps {
  certification: Certification;
  questions: Question[];
  userId: string;
}

export default function AssessmentClient({ certification, questions, userId }: AssessmentClientProps) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(certification.assessmentDurationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/certifications/${certification.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          timeTaken: (certification.assessmentDurationMinutes * 60) - timeLeft
        })
      });

      const result = await response.json();
      if (result.success) {
        router.push(`/certification-exams/${certification.id}/result?attemptId=${result.attemptId}`);
      } else {
        alert('Failed to submit assessment. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  }, [certification.id, certification.assessmentDurationMinutes, timeLeft, answers, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EEEEEE] flex flex-col md:flex-row justify-between items-center gap-6 sticky top-4 z-20">
        <div className="flex items-center gap-4">
            <div className="bg-[#2D7A6E]/10 p-3 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-[#2D7A6E]" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-[#1A1A1A]">{certification.title}</h1>
                <p className="text-sm text-[#666666]">Assessment In Progress</p>
            </div>
        </div>

        <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#374151]'}`}>
                <Clock className="w-5 h-5" />
                <span className="text-lg font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            <button 
                onClick={() => questions.length === answeredCount ? handleSubmit() : setIsWarningOpen(true)}
                disabled={isSubmitting}
                className="bg-[#1B4D3E] text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-[#163f33] transition-colors disabled:opacity-50"
            >
                {isSubmitting ? 'Submitting...' : 'Finish Assessment'}
            </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-[#2D7A6E]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Quiz Area */}
        <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-[#EEEEEE] min-h-[400px]"
                >
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-sm font-semibold text-[#2D7A6E] uppercase tracking-wider">
                            Question {currentIdx + 1} of {questions.length}
                        </span>
                        <span className="text-xs text-[#999999]">{currentQuestion.marks} Marks</span>
                    </div>

                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8 leading-tight">
                        {currentQuestion.questionText}
                    </h2>

                    <div className="space-y-4">
                        {(currentQuestion.options as string[]).map((option, index) => (
                            <button
                                key={index}
                                onClick={() => setAnswers({...answers, [currentQuestion.id]: index})}
                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                                    answers[currentQuestion.id] === index 
                                    ? 'border-[#2D7A6E] bg-[#2D7A6E]/5 text-[#1A1A1A]' 
                                    : 'border-[#F3F4F6] hover:border-[#2D7A6E]/30 text-[#4B5563]'
                                }`}
                            >
                                <span className="font-medium">{option}</span>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    answers[currentQuestion.id] === index 
                                    ? 'border-[#2D7A6E] bg-[#2D7A6E]' 
                                    : 'border-[#E5E7EB] group-hover:border-[#2D7A6E]/50'
                                }`}>
                                    {answers[currentQuestion.id] === index && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
                <button
                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentIdx === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#E5E7EB] text-[#374151] font-semibold hover:bg-gray-50 disabled:opacity-30 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" /> Previous
                </button>
                <div className="flex gap-4">
                    {currentIdx < questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentIdx(prev => prev + 1)}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#2D7A6E] text-white font-semibold hover:bg-[#235e55] transition-all"
                        >
                            Next Question <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#1B4D3E] text-white font-bold hover:bg-[#163f33] transition-all"
                        >
                            Submit Assessment
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="hidden lg:block">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EEEEEE] sticky top-32">
                <h3 className="font-bold text-[#1A1A1A] mb-4">Question Map</h3>
                <div className="grid grid-cols-4 gap-2">
                    {questions.map((q, idx) => (
                        <button
                            key={q.id}
                            onClick={() => setCurrentIdx(idx)}
                            className={`w-full aspect-square rounded-lg text-sm font-bold transition-all border ${
                                currentIdx === idx 
                                ? 'bg-[#2D7A6E] text-white border-[#2D7A6E]' 
                                : answers[q.id] !== undefined
                                    ? 'bg-[#2D7A6E]/10 text-[#2D7A6E] border-[#2D7A6E]/20'
                                    : 'bg-white text-[#666666] border-[#E5E7EB] hover:border-[#2D7A6E]/50'
                            }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
                <div className="mt-8 space-y-3 pt-6 border-t border-[#EEEEEE]">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-[#666666]">Answered</span>
                        <span className="font-bold text-[#1A1A1A]">{answeredCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-[#666666]">Remaining</span>
                        <span className="font-bold text-[#1A1A1A]">{questions.length - answeredCount}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Warning Modal */}
      {isWarningOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl"
              >
                  <div className="bg-yellow-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                      <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">Unfinished Assessment</h3>
                  <p className="text-[#666666] mb-8 leading-relaxed">
                      You have {questions.length - answeredCount} unanswered questions. Are you sure you want to submit your assessment now?
                  </p>
                  <div className="flex gap-4">
                      <button 
                        onClick={() => setIsWarningOpen(false)}
                        className="flex-1 px-6 py-3 rounded-xl border border-[#E5E7EB] font-semibold text-[#374151]"
                      >
                          Continue Quiz
                      </button>
                      <button 
                         onClick={handleSubmit}
                         className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold"
                      >
                          Submit Anyway
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
    </div>
  );
}

