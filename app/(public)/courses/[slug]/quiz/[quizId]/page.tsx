'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle, AlertTriangle, Timer } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  question: string;
  options: string[];
  // Correct answer kept hidden ideally, but simplified here we might just have question logic backend
}

/* ─── Helper Functions ───────────────────────────────────────────────── */

// Parse and format code from question text - returns parts to be rendered
const parseQuestionParts = (text: string): Array<{ type: 'text' | 'code'; content: string }> => {
  if (!text) return [];
  
  // Normalize literal \\n to actual newlines
  const processedText = text.replace(/\\n/g, '\n');
  
  const parts: Array<{ type: 'text' | 'code'; content: string }> = [];
  const codeBlockRegex = /```(?:\w+)?(?:\n)?([\s\S]*?)```/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = codeBlockRegex.exec(processedText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: processedText.substring(lastIndex, match.index).trim()
      });
    }
    parts.push({
      type: 'code',
      content: match[1].trim()
    });
    lastIndex = codeBlockRegex.lastIndex;
  }
  
  if (lastIndex < processedText.length) {
    const remainingText = processedText.substring(lastIndex).trim();
    if (remainingText) {
      parts.push({
        type: 'text',
        content: remainingText
      });
    }
  }
  
  return parts;
};

const formatInlineCode = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 text-brand-orange rounded font-mono text-sm">$1</code>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
};

/* ─── Code Block Component ───────────────────────────────────────────── */

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-gray-200 bg-[#1a1b26]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#24283b] border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-[#a9b1d6]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  maxScore: number;
  content: string; // JSON string of questions
  timeLimit?: number; // In minutes, optional
}

export default function QuizRunnerPage(
  props: {
    params: Promise<{ slug: string; quizId: string }>;
  }
) {
  const params = use(props.params);
  const { slug, quizId } = params;
  const router = useRouter();
  const { addToast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  // Fetch Quiz Content
  const { data: quiz, isLoading } = useQuery<QuizData & { timeLimit?: number }>({
    queryKey: ['start-quiz', quizId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/courses/${slug}/content`);
        if (!res.ok) return null;
        const data = await res.json();
        const lesson = data.lessons?.find((l: any) => l.id === quizId);
        if (!lesson) return null;
        return lesson;
      } catch {
        return null;
      }
    },
  });

  const questions: Question[] = quiz?.content ? JSON.parse(quiz.content) : [];

  // Initialize timer
  useEffect(() => {
    if (quiz?.timeLimit && !isStarted) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  }, [quiz, isStarted]);

  const handleSubmit = useCallback(async () => {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${slug}/quiz/${quizId}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          addToast({ message: 'Please log in to submit the quiz.', type: 'error' });
        } else {
          throw new Error('Submission failed');
        }
      } else {
        const data = await res.json();
        setResult(data);
        addToast({
          message: `Quiz Completed: ${data.passed ? 'PASSED' : 'FAILED'}`,
          type: data.passed ? 'success' : 'warning',
        });
      }
    } catch (error: any) {
      addToast({ message: error.message, type: 'error' });
      setSubmitting(false);
    }
  }, [submitting, result, slug, quizId, answers, addToast]);

  // Accurate Timer
  useEffect(() => {
    if (!isStarted || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, result, handleSubmit]);


  const saveProgress = () => {
    localStorage.setItem(
      `quiz-progress-${quizId}`,
      JSON.stringify({ answers, currentQuestionIndex, timeLeft })
    );
    addToast({ message: 'Progress saved! You can continue later.', type: 'info' });
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
      </div>
    );

  if (!quiz)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Available</h1>
          <p className="text-gray-600 mb-6">Please log in to access this quiz.</p>
          <a href="/login" className="bg-brand-orange text-white px-6 py-3 rounded-lg">Login</a>
        </div>
      </div>
    );

  if (!isStarted)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-xl w-full text-center border-4 border-white"
        >
          <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Timer className="w-10 h-10 text-brand-orange" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">{quiz?.title}</h1>
          <p className="text-gray-500 font-medium mb-10">{quiz?.description}</p>
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-gray-400">Time Limit</p>
              <p className="text-xl font-black text-gray-900">{quiz?.timeLimit} Mins</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-gray-400">Questions</p>
              <p className="text-xl font-black text-gray-900">{questions.length}</p>
            </div>
          </div>
          <button
            onClick={() => setIsStarted(true)}
            className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-orange transition-all shadow-xl shadow-brand-orange/20"
          >
            Start Assessment
          </button>
        </motion.div>
      </div>
    );

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24 lg:pb-0">
      {/* Result Overlay remains same... (skipping for brevity but including in final) */}
      {result && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full text-center shadow-2xl">
            <div
              className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}
            >
              {result.passed ? (
                <CheckCircle className="w-10 h-10" />
              ) : (
                <AlertTriangle className="w-10 h-10" />
              )}
            </div>
            <h2 className="text-3xl font-black mb-2">
              {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-2xl font-black text-brand-dark mb-8">Score: {result.percentage}%</p>
            <button
              onClick={() => router.push(`/courses/${slug}/learn`)}
              className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black"
            >
              Return to Course
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 md:p-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex gap-4 items-center">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2 gap-2">
              <h2 className="text-[10px] md:text-sm font-black text-gray-900 uppercase tracking-widest truncate">
                {quiz?.title}
              </h2>
              <span
                className={`text-xs md:text-sm font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full shrink-0 ${timeLeft < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-dark text-white'
                  }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand-orange"
                animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={saveProgress}
            className="p-2 md:px-4 md:py-2 border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:bg-gray-50 shrink-0"
          >
            <span className="hidden md:inline">Save & Exit</span>
            <span className="md:hidden">Save</span>
          </button>
        </div>
      </div>

      {/* Main Runner */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100"
          >
            <div className="flex justify-between items-center mb-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Question {currentQuestionIndex + 1} / {questions.length}
              </span>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i === currentQuestionIndex
                      ? 'bg-brand-orange'
                      : answers[i] !== undefined
                        ? 'bg-emerald-400'
                        : 'bg-gray-200'
                      }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {parseQuestionParts(currentQ?.question || '').map((part, index) => (
                part.type === 'text' ? (
                  <h3 
                    key={index}
                    className="text-xl md:text-2xl font-bold text-gray-900 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatInlineCode(part.content) }} 
                  />
                ) : (
                  <CodeBlock key={index} code={part.content} />
                )
              ))}
            </div>

            <div className="space-y-3 mt-8">
              {currentQ?.options.map((opt, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 cursor-pointer transition-all group ${answers[currentQuestionIndex] === i
                    ? 'border-brand-orange bg-brand-orange/5 shadow-lg shadow-brand-orange/5'
                    : 'border-gray-100 hover:border-brand-orange/30 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="radio"
                    checked={answers[currentQuestionIndex] === i}
                    onChange={() => setAnswers({ ...answers, [currentQuestionIndex]: i })}
                    className="w-6 h-6 accent-brand-orange"
                  />
                  <span
                    className={`text-base md:text-lg font-bold transition-colors ${answers[currentQuestionIndex] === i
                      ? 'text-gray-900'
                      : 'text-gray-600 group-hover:text-gray-900'
                      }`}
                  >
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Footer */}
      <footer className="bg-white border-t border-gray-100 p-4 md:p-6 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex gap-4">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex-1 md:flex-none px-6 md:px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest disabled:opacity-30"
          >
            Prev
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] md:flex-none md:px-12 py-4 bg-brand-orange text-white rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl shadow-brand-orange/20"
            >
              {submitting ? 'Sending...' : 'Finish'}
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
              }
              className="flex-[2] md:flex-none md:px-12 py-4 bg-brand-dark text-white rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-brand-orange transition-all"
            >
              Next
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
