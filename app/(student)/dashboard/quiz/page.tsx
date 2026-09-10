import { getQuizzes, getQuizStats } from '@/app/actions/quizzes';
import { Sparkles, Clock, Trophy, Target, BookOpen, ChevronRight, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Quiz {
  id: string;
  title: string;
  course: string;
  questions: number;
  duration: number;
  status: 'pending' | 'completed' | 'overdue';
  dueDate?: Date | null;
  attempts: number;
  bestScore: number | null;
  score?: number;
}

export default async function QuizPage() {
  const quizzesData = await getQuizzes();
  const quizzes = quizzesData ?? [];
  const stats = await getQuizStats();

  const pendingQuizzes = quizzes.filter((q: Quiz) => q.status === 'pending');
  const completedQuizzes = quizzes.filter((q: Quiz) => q.status === 'completed');
  const overdueQuizzes = quizzes.filter((q: Quiz) => q.status === 'overdue');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 md:p-8 p-4 gpu-accelerated">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground/90 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            Academy Intelligence
          </h1>
          <p className="text-muted-foreground mt-3 font-medium text-sm md:text-lg">Measure your technical proficiency and claim XP</p>
        </div>

        {/* Filter Tabs - Scrollable on Mobile */}
        <div className="flex bg-secondary rounded-2xl p-1.5 border border-border backdrop-blur-sm w-full lg:w-auto overflow-x-auto hide-scrollbar">
          <button className="flex-1 lg:flex-none px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all whitespace-nowrap">
            All Units ({quizzes.length})
          </button>
          <button className="flex-1 lg:flex-none px-6 py-3 text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-foreground transition-all active:scale-95 whitespace-nowrap">
            Pending ({pendingQuizzes.length})
          </button>
          <button className="flex-1 lg:flex-none px-6 py-3 text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-foreground transition-all active:scale-95 whitespace-nowrap">
            Archived ({completedQuizzes.length})
          </button>
        </div>
      </div>

      {/* Stats Quick View - Optimized for Mobile Scroll */}
      <div className="flex lg:grid lg:grid-cols-4 gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar snap-x-mandatory lg:snap-none -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { icon: Target, label: 'Ongoing', val: stats.pending, sub: 'Assignments', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
          { icon: Clock, label: 'Overdue', val: stats.overdue, sub: 'Missed Fix', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
          { icon: Trophy, label: 'Proficiency', val: `${stats.averageScore}%`, sub: 'Global Avg', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { icon: Sparkles, label: 'Capital', val: stats.totalPoints, sub: 'Total XP', color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map((stat, i) => (
          <div key={i} className="flex-none w-[160px] md:w-auto snap-center p-6 rounded-[2rem] bg-secondary border border-border shadow-sm backdrop-blur-sm active:scale-95 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center border`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-3xl font-black text-foreground/90 tracking-tight">{stat.val}</p>
            <p className="text-[10px] font-black text-muted-foreground/20 mt-1 uppercase tracking-[0.2em]">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Pending Quizzes */}
      {pendingQuizzes.length > 0 && (
        <section className="gpu-accelerated">
          <h2 className="text-xl font-black text-foreground/90 mb-6 flex items-center gap-3 uppercase tracking-tight">
            <Clock className="w-5 h-5 text-primary" /> Active Missions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingQuizzes.map((quiz: Quiz) => (
              <div key={quiz.id} className="p-8 rounded-[2.5rem] bg-secondary border border-border hover:border-primary/30 transition-all backdrop-blur-sm group active:scale-[0.99]">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
                  <div className="flex-1">
                    <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">
                      {quiz.status === 'overdue' ? 'Critical' : 'Priority'}
                    </span>
                    <h3 className="font-black text-foreground mt-4 text-xl group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">{quiz.title}</h3>
                    <p className="text-[11px] font-black text-muted-foreground/40 mt-1 uppercase tracking-widest">{quiz.course}</p>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-4 text-xs font-black text-muted-foreground uppercase tracking-widest">
                    <p className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-xl border border-border/50">
                      <BookOpen className="w-4 h-4 text-primary" /> {quiz.questions} INTS
                    </p>
                    <p className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-xl border border-border/50">
                      <Clock className="w-4 h-4 text-primary" /> {quiz.duration} MIN
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">
                      {quiz.dueDate ? `DEADLINE: ${new Date(quiz.dueDate).toLocaleDateString().toUpperCase()}` : 'OPEN ACCESS'}
                    </p>
                  </div>
                  <Link 
                    href={`/dashboard/quiz/${quiz.id}/assessment`}
                    className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 active:scale-95 text-center flex items-center justify-center"
                  >
                    INITIALIZE
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed Quizzes */}
      {completedQuizzes.length > 0 && (
        <section className="gpu-accelerated">
          <h2 className="text-xl font-black text-foreground/90 mb-6 flex items-center gap-3 uppercase tracking-tight">
            <Trophy className="w-5 h-5 text-emerald-500" /> Completed Cycles
          </h2>
          <div className="space-y-4">
            {completedQuizzes.map((quiz: Quiz) => (
              <div key={quiz.id} className="p-6 rounded-[2rem] bg-secondary border border-border hover:bg-secondary/80 transition-all flex flex-col md:flex-row items-center gap-6 shadow-sm backdrop-blur-sm group active:scale-[0.99]">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shrink-0 ${(quiz.bestScore || 0) >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' :
                  (quiz.bestScore || 0) >= 60 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-red-500/10 border-red-500/20'
                  }`}>
                  <Trophy className={`w-8 h-8 ${(quiz.bestScore || 0) >= 80 ? 'text-emerald-500' :
                    (quiz.bestScore || 0) >= 60 ? 'text-orange-500' : 'text-red-500'
                    }`} />
                </div>
                <div className="flex-1 text-center md:text-left min-w-0">
                  <h3 className="font-black text-foreground/90 group-hover:text-primary transition-colors uppercase tracking-tight text-lg truncate">{quiz.title}</h3>
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{quiz.course}</p>
                </div>
                <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto justify-center">
                  <div className="text-center">
                    <p className={`text-2xl font-black tracking-tighter ${(quiz.bestScore || 0) >= 80 ? 'text-emerald-400' :
                      (quiz.bestScore || 0) >= 60 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                      {quiz.bestScore}%
                    </p>
                    <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest">{quiz.attempts} ATTEMPTS</p>
                  </div>
                  <Link 
                    href={`/dashboard/quiz/${quiz.id}/analysis`}
                    className="px-8 py-3.5 bg-background hover:bg-secondary text-muted-foreground hover:text-foreground rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border border-border active:scale-95"
                  >
                    ANALYSIS <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {quizzes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 bg-secondary rounded-[3rem] border border-border border-dashed gpu-accelerated">
          <div className="w-24 h-24 bg-background rounded-[2rem] flex items-center justify-center mb-8 text-muted-foreground/10 border border-border shadow-inner">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight">No Protocols Assigned</h3>
          <p className="text-muted-foreground text-sm font-medium">Continue your curriculum to unlock assessments.</p>
        </div>
      )}
    </div>
  );
}

