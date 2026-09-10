'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { fetchJsonWithRetry } from '@/lib/dashboard-api';
import type { DashboardQuizDetail } from '@/lib/types/dashboard';

export default function QuizAssessmentPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<DashboardQuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
  } | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      const response = await fetchJsonWithRetry<DashboardQuizDetail>(`/api/quiz/${quizId}`, {
        cache: 'no-store',
        headers: {},
      });

      if (!response.success || !response.data) {
        setError(response.error || 'Failed to load quiz');
        setLoading(false);
        return;
      }

      setQuiz(response.data);
      if (response.data.submission) {
        const percentage = response.data.submission.maxScore > 0
          ? Math.round((response.data.submission.score / response.data.submission.maxScore) * 100)
          : 0;
        setResult({
          score: response.data.submission.score,
          maxScore: response.data.submission.maxScore,
          percentage,
          passed: response.data.submission.passed,
        });
      }
      setLoading(false);
    }

    loadQuiz();
  }, [quizId]);

  const totalPossible = useMemo(
    () => quiz?.questions.reduce((sum, question) => sum + question.points, 0) || 0,
    [quiz]
  );

  async function handleSubmit() {
    if (!quiz) return;

    setSubmitting(true);
    setError(null);

    const response = await fetchJsonWithRetry<{
      submissionId: string;
      score: number;
      maxScore: number;
      percentage: number;
      passed: boolean;
    }>(`/api/quiz/${quiz.id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });

    if (!response.success || !response.data) {
      setError(response.error || 'Failed to submit quiz');
      setSubmitting(false);
      return;
    }

    setResult(response.data);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[#174F3A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-black text-[#174F3A] uppercase tracking-[0.3em] animate-pulse">Initializing Assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-10">
        <div className="max-w-2xl w-full text-center space-y-10 bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter font-outfit italic">Protocol <span className="text-red-500">Unavailable</span></h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                {error || 'We could not load this assessment right now. Telemetry failed.'}
            </p>
          </div>
          <div className="pt-6">
            <Link
              href="/dashboard/quiz"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#174F3A] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-[#174F3A]/20 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              RETURN TO HUB
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-[3rem] p-16 border border-gray-100 shadow-sm text-center space-y-10">
          <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center shadow-inner ${result.passed ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter font-outfit italic leading-none">{result.passed ? 'Objective Cleared' : 'Protocol Submitted'}</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance Metrics Logged Successfully</p>
          </div>
          
          <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 inline-block mx-auto min-w-[200px] shadow-inner">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Yield percentage</p>
            <p className="text-6xl font-black text-[#174F3A] font-outfit italic tracking-tighter">{result.percentage}%</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">({result.score} / {result.maxScore} PTS)</p>
          </div>

          <div className="flex justify-center gap-4 pt-6">
            <Link href="/dashboard/quiz" className="px-12 py-5 bg-[#174F3A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-[#174F3A]/20 hover:scale-105 transition-all">
              BACK TO QUIZ HUB
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-4 md:p-12 pb-32">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard/quiz" className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-[#174F3A] shadow-sm hover:shadow-md transition-all">
            <ArrowLeft className="w-4 h-4" />
            ABORT MISSION
          </Link>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[#174F3A]/5 border border-[#174F3A]/10 text-[10px] font-black uppercase tracking-widest text-[#174F3A] shadow-inner">
            <Clock className="w-4 h-4 text-[#174F3A]" />
            {quiz.timeLimit} MINUTES REMAINING
          </div>
        </div>

        <div className="bg-white rounded-[3.5rem] p-10 md:p-16 border border-gray-100 shadow-sm space-y-16">
          <div className="space-y-4 border-b border-gray-50 pb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#174F3A] opacity-50">{quiz.courseName}</p>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter font-outfit uppercase italic leading-none">{quiz.title}</h1>
            <div className="flex flex-wrap gap-4 pt-2">
                <span className="px-4 py-2 bg-gray-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">{quiz.questionCount} QUESTIONS</span>
                <span className="px-4 py-2 bg-gray-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">{totalPossible} TOTAL PTS</span>
                <span className="px-4 py-2 bg-[#174F3A]/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#174F3A] border border-[#174F3A]/10">{quiz.passingScore}% REQUIRED</span>
            </div>
          </div>

          <div className="space-y-10" aria-busy={submitting}>
            {quiz.questions.map((question, index) => (
              <section key={question.id} className="rounded-[2.5rem] border border-gray-100 p-8 md:p-12 bg-white hover:shadow-xl hover:shadow-[#174F3A]/5 transition-all">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-300 shadow-inner border border-gray-100">
                        {index + 1}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Tactical Query</p>
                </div>
                
                <h2 className="text-2xl font-black text-gray-900 mb-10 font-outfit italic tracking-tight">{question.question}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((option, optionIndex) => {
                    const checked = answers[String(index)] === optionIndex;
                    return (
                      <label
                        key={`${question.id}-${optionIndex}`}
                        className={cn(
                            "group flex items-center gap-5 rounded-[1.5rem] border p-6 cursor-pointer transition-all active:scale-[0.98]",
                            checked 
                                ? 'border-[#174F3A] bg-[#174F3A] text-white shadow-xl shadow-[#174F3A]/20' 
                                : 'border-gray-50 bg-gray-50/50 text-gray-900 hover:border-gray-200 hover:bg-white'
                        )}
                      >
                        <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            checked ? 'border-white bg-white/20' : 'border-gray-200 group-hover:border-[#174F3A]/20'
                        )}>
                            {checked && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input
                          type="radio"
                          name={`question-${index}`}
                          checked={checked}
                          onChange={() => setAnswers((prev) => ({ ...prev, [String(index)]: optionIndex }))}
                          className="hidden"
                          aria-label={`Select answer ${optionIndex + 1} for question ${index + 1}`}
                        />
                        <span className="text-[13px] font-black uppercase tracking-widest">{option}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="flex justify-end pt-8 border-t border-gray-50">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length === 0}
              className={cn(
                  "px-12 py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] flex items-center gap-4 transition-all active:scale-95 shadow-2xl",
                  submitting || Object.keys(answers).length === 0
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                    : "bg-[#174F3A] text-white shadow-[#174F3A]/20 hover:scale-105"
              )}
            >
              {submitting ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Transmitting...
                </>
              ) : 'Submit Protocol'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
