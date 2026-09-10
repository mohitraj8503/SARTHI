'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageSquare, ArrowLeft, Send, CheckCircle2, ThumbsUp, Loader2, User } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface DiscussionQuestion {
  id: string;
  question: string;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
  answers: Array<{
    id: string;
    answer: string;
    upvotes: number;
    createdAt: string;
    user: {
      name: string;
      image?: string;
      role?: string;
    };
  }>;
}

export default function CourseDiscussionsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { addToast } = useToast();

  const [questions, setQuestions] = useState<DiscussionQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) fetchDiscussions();
  }, [courseId]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/discussions`);
      if (res.ok) {
        const json = await res.json();
        setQuestions(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnswer = async (questionId: string) => {
    const text = replyText[questionId];
    if (!text || !text.trim()) return;

    setSubmittingId(questionId);
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer: text.trim() }),
      });

      if (res.ok) {
        addToast({ message: 'Answer posted successfully!', type: 'success' });
        setReplyText((prev) => ({ ...prev, [questionId]: '' }));
        fetchDiscussions();
      } else {
        throw new Error('Failed to post answer');
      }
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 md:px-10 py-6 md:py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">COURSE FORUM</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            STUDENT <span className="text-blue-600">DISCUSSIONS & Q&A</span>
          </h1>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 md:px-10 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading discussions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-xl mx-auto">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 uppercase">No Discussions Yet</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">When students post questions in this course, they will appear here for your feedback.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200">
                      {q.user?.name ? q.user.name.charAt(0) : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{q.user?.name || 'Student'}</h4>
                      <p className="text-[10px] font-bold text-slate-400">
                        {new Date(q.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                    {q.answers.length} Answers
                  </span>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">{q.question}</p>
                </div>

                {/* Answers List */}
                <div className="space-y-3 pl-4 border-l-2 border-slate-100">
                  {q.answers.map((ans) => (
                    <div key={ans.id} className="bg-white p-4 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{ans.user?.name || 'Faculty'}</span>
                          {ans.user?.role === 'TEACHER' || ans.user?.role === 'ADMIN' || ans.user?.role === 'INSTRUCTOR' ? (
                            <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Instructor</span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <ThumbsUp className="w-3 h-3 text-blue-500" /> {ans.upvotes}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{ans.answer}</p>
                    </div>
                  ))}
                </div>

                {/* Teacher Reply Input */}
                <div className="flex gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Write an official instructor answer..."
                    value={replyText[q.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [q.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handlePostAnswer(q.id)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handlePostAnswer(q.id)}
                    disabled={submittingId === q.id || !replyText[q.id]?.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md"
                  >
                    {submittingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
