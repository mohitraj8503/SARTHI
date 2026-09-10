'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, Plus, Search, Filter, BookOpen, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface QuestionItem {
  id: string;
  question: string;
  options: string;
  correctAnswer: number;
  points: number;
  quiz?: {
    id: string;
    title: string;
    course?: {
      id: string;
      title: string;
    };
  };
}

export default function TeacherQuestionBankPage() {
  const { addToast } = useToast();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [search]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const url = search ? `/api/teacher/questions?search=${encodeURIComponent(search)}` : '/api/teacher/questions';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setQuestions(json.data || json.questions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 md:px-10 py-6 md:py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-4 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">ASSESSMENT MANAGEMENT</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                QUESTION <span className="text-emerald-600">BANK</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-2">Manage, reuse, and audit assessment questions across all your active courses.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-10 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Question Bank...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-xl mx-auto">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 uppercase">No Questions Found</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">Create quizzes in your courses to automatically populate your centralized question repository.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((q) => {
              let parsedOptions: string[] = [];
              try {
                parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options || [];
              } catch {
                parsedOptions = [];
              }

              return (
                <div key={q.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full">
                        {q.quiz?.course?.title || 'Course Question'}
                      </span>
                      <span className="text-[10px] font-black text-slate-400">{q.points} Points</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{q.question}</h4>

                    {parsedOptions.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {parsedOptions.map((opt, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                              idx === q.correctAnswer
                                ? 'bg-emerald-50/50 border-emerald-500 text-emerald-950 font-bold'
                                : 'bg-slate-50 border-slate-100 text-slate-700'
                            }`}
                          >
                            <span>{opt}</span>
                            {idx === q.correctAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>Quiz: {q.quiz?.title || 'General'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
