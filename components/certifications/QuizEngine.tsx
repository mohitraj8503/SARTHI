"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock, Award, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import * as Progress from "@radix-ui/react-progress";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer?: number;
}

interface QuizEngineProps {
  certificationId: string;
  title: string;
  durationMinutes: number;
  questions: Question[];
}

export default function QuizEngine({ certificationId, title, durationMinutes, questions }: QuizEngineProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleAutoSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleOptionSelect = (optionIndex: number) => {
    triggerHaptic('light');
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    triggerHaptic('light');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    triggerHaptic('light');
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    // Confirm submission
    if (!confirm("Are you sure you want to submit your assessment?")) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/certifications/${certificationId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          timeTaken: durationMinutes * 60 - timeLeft,
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/certification-exams/${certificationId}/result?attemptId=${data.attemptId}`);
      } else {
        alert("Submission failed: " + data.error);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong during submission.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, certificationId, answers, durationMinutes, timeLeft, router]);

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    // Silent auto-submit on timer expiry
    try {
      const response = await fetch(`/api/certifications/${certificationId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          timeTaken: durationMinutes * 60,
        }),
      });
      const data = await response.json();
      if (data.success && data.attemptId) {
        router.push(`/certification-exams/${certificationId}/result?attemptId=${data.attemptId}`);
      } else {
        // Fallback to result page with attempt lookup
        router.push(`/certification-exams/${certificationId}/result`);
      }
    } catch (error) {
      console.error("Auto-submit error:", error);
      router.push(`/certification-exams/${certificationId}/result`);
    }
  }, [isSubmitting, certificationId, answers, durationMinutes, router]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col">
      {/* Quiz Header */}
      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                 <Award className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="hidden md:block">
                 <h2 className="text-sm font-bold text-slate-100">{title}</h2>
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mt-1">Professional Certification</p>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                 <div className="flex items-center gap-2 text-emerald-400">
                    <Clock className="w-5 h-5" />
                    <span className="text-2xl font-black tabular-nums">{formatTime(timeLeft)}</span>
                 </div>
                 <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Time remaining</span>
              </div>
              
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-sm font-bold rounded-xl transition-all shadow-xl shadow-emerald-900/20"
              >
                {isSubmitting ? "Submitting..." : "Submit Exam"}
              </button>
           </div>
        </div>
      </header>

      {/* Main Quiz Area */}
      <main className="flex-grow flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#020617] to-[#020617]">
         <div className="w-full max-w-3xl space-y-12 pb-20">
            
            {/* Progress and Question Counter */}
            <div className="space-y-4">
               <div className="flex items-end justify-between">
                  <div>
                     <span className="text-emerald-500 font-black text-4xl">Q{currentIndex + 1}</span>
                     <span className="text-slate-600 font-bold text-lg ml-2">/ {questions.length}</span>
                  </div>
                  <div className="text-right">
                     <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{Math.round(progress)}% Completed</span>
                  </div>
               </div>
               <Progress.Root value={progress} className="h-1.5 bg-slate-800 overflow-hidden rounded-full">
                  <Progress.Indicator 
                    className="h-full bg-emerald-500 transition-transform duration-500 ease-out" 
                    style={{ transform: `translateX(-${100 - progress}%)` }} 
                  />
                </Progress.Root>
            </div>

            {/* Question Card */}
            <motion.div 
               key={currentIndex}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-8"
            >
               <h1 className="text-2xl md:text-3xl font-bold text-slate-100 leading-snug">
                  {currentQuestion.text}
               </h1>

               <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`group flex items-center text-left p-6 rounded-3xl border transition-all duration-200 ${
                        answers[currentQuestion.id] === idx 
                          ? "bg-emerald-600/10 border-emerald-500/50 shadow-inner" 
                          : "bg-slate-950/40 border-slate-800/60 hover:bg-slate-900/40 hover:border-slate-700/60"
                      }`}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-xl border text-sm font-black mr-6 transition-colors ${
                        answers[currentQuestion.id] === idx 
                          ? "bg-emerald-500 text-black border-transparent" 
                          : "bg-slate-900 text-slate-500 border-slate-700 group-hover:bg-slate-800"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-lg transition-colors ${
                        answers[currentQuestion.id] === idx ? "text-emerald-400 font-semibold" : "text-slate-300"
                      }`}>
                        {option}
                      </span>
                    </button>
                  ))}
               </div>
            </motion.div>
         </div>
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent">
         <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button 
              onClick={handlePrev} 
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-slate-200 disabled:opacity-0 transition-all font-bold group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              PREVIOUS
            </button>

            <div className="flex items-center gap-1">
               {questions.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                      i === currentIndex ? "bg-emerald-500 w-4" : i < currentIndex ? "bg-emerald-900" : "bg-slate-800"
                    }`} 
                  />
               ))}
            </div>

            {currentIndex === questions.length - 1 ? (
               <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg transition-all shadow-xl shadow-emerald-900/40 active:scale-95"
               >
                 FINISH EXAM
               </button>
            ) : (
               <button 
                onClick={handleNext} 
                className="flex items-center gap-2 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-black rounded-lg transition-all group active:scale-95"
               >
                 NEXT
                 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
            )}
         </div>
      </footer>

      {/* Exit Safety Guard */}
      <div className="fixed bottom-4 right-4 z-[60]">
         <div className="flex items-center gap-2 text-slate-700 bg-slate-950/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800/30">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">SARTHI Assessment Monitoring Enabled</span>
         </div>
      </div>
    </div>
  );
}

