'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BrainCircuit, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  Trophy, 
  CheckCircle2, 
  X, 
  PlusCircle, 
  Trash2,
  ChevronRight,
  Loader2,
  BookOpen,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';

import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';

export default function QuizzesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Creation State
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    courseId: '',
    timeLimit: '30',
    passingScore: '60',
    questions: [
      { question: '', options: ['', '', '', ''], correctAnswer: '0', points: '10' }
    ]
  });

  const { data: quizzesData, isLoading } = useQuery({
    queryKey: ['teacher-quizzes'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/quizzes');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  const { data: coursesData } = useQuery({
    queryKey: ['teacher-courses-minimal'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/courses?minimal=true');
      return res.json();
    }
  });

  const createQuiz = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/teacher/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-quizzes'] });
      setIsCreating(false);
      addToast('Quiz published successfully!', 'success');
      setNewQuiz({
        title: '',
        courseId: '',
        timeLimit: '30',
        passingScore: '60',
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '0', points: '10' }]
      });
    }
  });

  const quizzes = quizzesData?.quizzes || [];
  const courses = coursesData?.courses || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-4 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">ASSESSMENT ENGINE</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            QUIZ <span className="text-emerald-500">LAB</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-3">Design interactive assessments and track learner knowledge gaps in real-time.</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
           <div className="col-span-full py-40 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-slate-200 animate-spin" />
           </div>
        ) : quizzes.length === 0 ? (
           <div className="col-span-full bg-white p-20 rounded-[40px] border border-dashed border-slate-200 text-center">
              <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                 <BrainCircuit className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Assessments Built</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium mb-8">Build your first interactive quiz to test your students&apos; understanding of the course material.</p>
              <button
                 onClick={() => setIsCreating(true)}
                 className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all"
              >
                 Initialize First Quiz
              </button>
           </div>
        ) : (
          quizzes.map((quiz: any) => (
            <div key={quiz.id} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
               <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                     <HelpCircle className="w-6 h-6" />
                  </div>
                  <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                     <MoreVertical className="w-5 h-5 text-slate-300" />
                  </button>
               </div>

               <div className="space-y-1 mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{quiz.title}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quiz.course.title}</p>
               </div>

               <div className="grid grid-cols-2 gap-4 py-6 border-t border-slate-50">
                  <div className="space-y-1">
                     <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">TIME LIMIT</span>
                     </div>
                     <p className="text-sm font-black text-slate-900">{quiz.timeLimit}m</p>
                  </div>
                  <div className="space-y-1">
                     <div className="flex items-center gap-1.5 text-slate-400">
                        <Trophy className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">PASSING</span>
                     </div>
                     <p className="text-sm font-black text-slate-900">{quiz.passingScore}%</p>
                  </div>
               </div>

               <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                           <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">
                              {i}
                           </div>
                        ))}
                     </div>
                     <span className="text-[10px] font-bold text-slate-400">{quiz._count.submissions} Submissions</span>
                  </div>
                  <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
                     Analytics <ArrowUpRight className="w-3 h-3" />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Quiz Builder Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsCreating(false)} />
           <div className="bg-[#F8FAFC] w-full max-w-4xl max-h-[90vh] rounded-[48px] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
              {/* Modal Header */}
              <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                       <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Assessment Designer</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">v2.4 Logic Builder</p>
                    </div>
                 </div>
                 <button onClick={() => setIsCreating(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-12 space-y-12">
                 {/* Basic Config */}
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quiz Title</label>
                       <input 
                          value={newQuiz.title}
                          onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                          placeholder="e.g. Master Final Assessment" 
                          className="w-full bg-white border-none rounded-2xl p-5 text-lg font-black text-slate-900 focus:ring-2 focus:ring-emerald-600 shadow-sm transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Linked Course</label>
                       <select 
                          value={newQuiz.courseId}
                          onChange={(e) => setNewQuiz({...newQuiz, courseId: e.target.value})}
                          className="w-full bg-white border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-emerald-600 shadow-sm"
                       >
                          <option value="">Select a course...</option>
                          {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                       </select>
                    </div>
                 </div>

                 {/* Advanced Config */}
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Limit (Minutes)</label>
                       <input 
                          type="number"
                          value={newQuiz.timeLimit}
                          onChange={(e) => setNewQuiz({...newQuiz, timeLimit: e.target.value})}
                          className="w-full bg-white border-none rounded-2xl p-5 text-sm font-black focus:ring-2 focus:ring-emerald-600 shadow-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passing Score (%)</label>
                       <input 
                          type="number"
                          value={newQuiz.passingScore}
                          onChange={(e) => setNewQuiz({...newQuiz, passingScore: e.target.value})}
                          className="w-full bg-white border-none rounded-2xl p-5 text-sm font-black focus:ring-2 focus:ring-emerald-600 shadow-sm"
                       />
                    </div>
                 </div>

                 {/* Questions Section */}
                 <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Question Pool</h3>
                       <button 
                          onClick={() => setNewQuiz({
                             ...newQuiz, 
                             questions: [...newQuiz.questions, { question: '', options: ['', '', '', ''], correctAnswer: '0', points: '10' }]
                          })}
                          className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all"
                       >
                          <PlusCircle className="w-4 h-4" /> Add Question
                       </button>
                    </div>

                    <div className="space-y-8">
                       {newQuiz.questions.map((q, qIdx) => (
                          <div key={qIdx} className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm relative group">
                             <button 
                                onClick={() => {
                                   const newQs = newQuiz.questions.filter((_, i) => i !== qIdx);
                                   setNewQuiz({...newQuiz, questions: newQs});
                                }}
                                className="absolute top-8 right-8 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                             
                             <div className="space-y-6">
                                <div className="space-y-2">
                                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Question {qIdx + 1}</label>
                                   <input 
                                      value={q.question}
                                      onChange={(e) => {
                                         const newQs = [...newQuiz.questions];
                                         newQs[qIdx].question = e.target.value;
                                         setNewQuiz({...newQuiz, questions: newQs});
                                      }}
                                      placeholder="e.g. What is the fundamental concept of..." 
                                      className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-600 transition-all"
                                   />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                   {q.options.map((opt, oIdx) => (
                                      <div key={oIdx} className="relative">
                                         <div className={cn(
                                            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black",
                                            q.correctAnswer === String(oIdx) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                                         )}>
                                            {String.fromCharCode(65 + oIdx)}
                                         </div>
                                         <input 
                                            value={opt}
                                            onChange={(e) => {
                                               const newQs = [...newQuiz.questions];
                                               newQs[qIdx].options[oIdx] = e.target.value;
                                               setNewQuiz({...newQuiz, questions: newQs});
                                            }}
                                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} 
                                            className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-xs font-medium focus:ring-2 focus:ring-emerald-600 transition-all"
                                         />
                                         <button 
                                            type="button"
                                            onClick={() => {
                                               const newQs = [...newQuiz.questions];
                                               newQs[qIdx].correctAnswer = String(oIdx);
                                               setNewQuiz({...newQuiz, questions: newQs});
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest"
                                         >
                                            Correct
                                         </button>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-end gap-4">
                 <button onClick={() => setIsCreating(false)} className="px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                    Cancel Build
                 </button>
                 <button 
                    onClick={() => createQuiz.mutate(newQuiz)}
                    disabled={createQuiz.isPending || !newQuiz.courseId || !newQuiz.title}
                    className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                 >
                    {createQuiz.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Finalize Assessment
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

