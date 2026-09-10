'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Target,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  Award,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useParams, useRouter } from 'next/navigation';

export default function CertificationResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const attemptId = searchParams.get('attemptId');
  
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        if (!attemptId) {
          setLoading(false);
          return;
        }
        const res = await fetch(`/api/certifications/attempts/${attemptId}`);
        const data = await res.json();
        if (data && !data.error) {
          setAttempt(data);
          if (data.passed) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 8000);
          }
        }
      } catch (err) {
        console.error("Failed to fetch result:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F2920] via-[#1B4332] to-[#0D2418] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D4915C] animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-semibold tracking-widest uppercase text-sm">Analyzing Performance...</p>
        </div>
      </div>
    );
  }

  // Handle missing data
  if (!attempt && !searchParams.get('score')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F2920] via-[#1B4332] to-[#0D2418] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-[20px] rounded-[32px] p-12 text-center border border-white/10 shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Report Unavailable</h2>
          <p className="text-white/60 mb-8 font-medium">We couldn&apos;t retrieve your assessment analytics. Please return to the certification hub.</p>
          <Link href="/certification-exams" className="inline-flex w-full justify-center items-center py-4 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white rounded-2xl font-bold hover:shadow-lg transition-all">
            Back to Hub
          </Link>
        </div>
      </div>
    );
  }

  const score = attempt ? Math.round(attempt.score) : parseFloat(searchParams.get('score') || '0');
  const passed = attempt ? attempt.passed : score >= 85;

  const detailedResults = {
    totalQuestions: attempt?.totalQuestions || 15,
    correctAnswers: attempt ? Math.round((attempt.score / 100) * attempt.totalQuestions) : Math.floor((score / 100) * 15),
    timeSpent: attempt ? `${Math.floor(attempt.timeTaken / 60)}:${(attempt.timeTaken % 60).toString().padStart(2, '0')}` : '42:15',
    breakdown: [
      { category: 'Technical Logic', correct: Math.ceil(score / 20), total: 5, percentage: score > 80 ? 90 : 60 },
      { category: 'Implementation', correct: Math.ceil(score / 25), total: 4, percentage: score > 85 ? 95 : 70 },
      { category: 'Security & Optimization', correct: Math.ceil(score / 33), total: 3, percentage: score > 90 ? 100 : 50 },
      { category: 'Architecture', correct: Math.ceil(score / 33), total: 3, percentage: score > 70 ? 80 : 40 },
    ],
    improvementTips: passed ? [] : [
      {
        title: 'Deep Dive into Concepts',
        description: 'Review the fundamental principles and specialized modules of this certification path.',
        priority: 'high'
      },
      {
        title: 'Security Best Practices',
        description: 'Focus on production-grade security implementations and error handling strategies.',
        priority: 'medium'
      },
      {
        title: 'Hands-on Projects',
        description: 'Apply these concepts in real-world scenarios to strengthen your practical understanding.',
        priority: 'medium'
      },
    ]
  };

  const getStatusColor = () => passed ? 'from-green-500 to-emerald-600' : 'from-red-500 to-red-700';
  const getStatusText = () => passed ? 'text-green-500' : 'text-red-500';
  const getStatusBg = () => passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2920] via-[#1B4332] to-[#0D2418] relative overflow-hidden font-sans flex justify-center py-12 px-4 sm:px-6">
      
      {/* Animated Backgrounds */}
      <div className="fixed inset-0 pointer-events-none">
        {passed && showConfetti && (
          <>
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -20, 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{ 
                  y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100,
                  rotate: 360,
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear'
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#D4915C', '#40916C', '#F59E0B', '#EF4444', '#3B82F6'][Math.floor(Math.random() * 5)],
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </>
        )}
        <motion.div 
          animate={{ y: [-30, 30, -30], x: [-30, 30, -30], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-[#D4915C]/15 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ y: [30, -30, 30], x: [30, -30, 30], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-[#40916C]/15 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-[800px]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] backdrop-blur-[20px] border border-white/10 rounded-[32px] p-8 md:p-12 shadow-[0_25px_50px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <motion.div 
                animate={{ scale: [1, 1.05, 1], opacity: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${getStatusColor()}`}
              />
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-[#1B4332] to-[#0F2920] flex items-center justify-center z-10">
                {passed ? <Trophy className="w-8 h-8 text-green-500" /> : <X className="w-8 h-8 text-red-500" />}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
              {passed ? 'Congratulations!' : 'Almost There!'}
            </h1>
            <p className="text-white/60 text-lg font-medium">
              {passed ? `You have successfully earned this certification.` : `You need a score of at least 85% to pass this certification.`}
            </p>
          </div>

          {/* Score Section */}
          <div className={`relative overflow-hidden rounded-3xl p-10 text-center mb-8 border ${getStatusBg()}`}>
            <div className={`absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_30%_30%,${passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'},transparent_50%)] pointer-events-none`} />
            <div className="text-xs font-semibold text-white/50 uppercase tracking-[2px] mb-4 relative z-10">
              Assessment Analytics
            </div>
            <div className={`text-7xl font-extrabold leading-none mb-2 relative z-10 inline-flex items-baseline ${getStatusText()}`}>
              {score}<span className="text-4xl font-semibold opacity-70">%</span>
            </div>
            
            <div className="w-full max-w-[400px] mx-auto mt-6 relative z-10">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${getStatusColor()}`}
                />
              </div>
              <div className="flex justify-between mt-2 text-[11px] text-white/40 font-medium">
                <span>Your Performance</span>
                <span>Benchmark: 85%</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-[20px] p-6 text-center hover:bg-white/10 hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-green-500/15 text-green-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{detailedResults.correctAnswers}/{detailedResults.totalQuestions}</div>
              <div className="text-[11px] text-white/50 uppercase tracking-widest font-semibold">Correct Answers</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[20px] p-6 text-center hover:bg-white/10 hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-blue-500/15 text-blue-500">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{detailedResults.timeSpent}</div>
              <div className="text-[11px] text-white/50 uppercase tracking-widest font-semibold">Time Taken</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[20px] p-6 text-center hover:bg-white/10 hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-red-500/15 text-red-500">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{score}%</div>
              <div className="text-[11px] text-white/50 uppercase tracking-widest font-semibold">Accuracy Rate</div>
            </div>
          </div>

          {/* Competency Analysis */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-[2px] mb-6">
              <BookOpen className="w-4 h-4" /> Competency Analysis
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {detailedResults.breakdown.map((cat, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-white/80">{cat.category}</span>
                    <span className="text-xs font-bold text-white/60">{cat.correct}/{cat.total}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className={`h-full rounded-full ${
                        cat.percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        cat.percentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                        'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Plan (if failed) */}
          {!passed && detailedResults.improvementTips.length > 0 && (
            <div className="bg-gradient-to-br from-[#40916C]/10 to-[#1B4332]/5 border border-[#40916C]/20 rounded-[20px] p-6 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#40916C]/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#40916C]" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">Personalized Growth Plan</div>
                  <div className="text-xs text-white/50">Master these critical areas to unlock your certification</div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {detailedResults.improvementTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      tip.priority === 'high' ? 'bg-red-500' :
                      tip.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <h4 className="text-xs font-semibold text-white/90 uppercase tracking-[0.5px] mb-1">{tip.title}</h4>
                      <p className="text-xs text-white/50 leading-relaxed">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-4">
            {!passed ? (
              <button 
                onClick={() => router.push(`/certification-exams/${slug}/exam`)}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white shadow-[0_8px_24px_rgba(27,67,50,0.4)] hover:shadow-[0_12px_32px_rgba(27,67,50,0.5)] hover:-translate-y-0.5 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                Re-Attempt Test
              </button>
            ) : (
              <button 
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-gradient-to-br from-[#D4915C] to-orange-500 text-white shadow-[0_8px_24px_rgba(212,145,92,0.4)] hover:shadow-[0_12px_32px_rgba(212,145,92,0.5)] hover:-translate-y-0.5 transition-all"
              >
                <Award className="w-5 h-5" />
                Download Certificate
              </button>
            )}
            
            <Link 
              href="/certification-exams"
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-transparent border border-white/10 text-white/60 hover:bg-white/5 hover:text-white/90 transition-all"
            >
              Back to Hub
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>

          {/* Footer */}
          {!passed && (
            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-xs text-white/40 leading-relaxed">
                <strong className="text-white/70">Don&apos;t give up!</strong> You&apos;re closer than you think. Review the incorrect answers in your dashboard analytics and come back stronger.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
