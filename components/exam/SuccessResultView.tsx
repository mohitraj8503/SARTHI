'use client';

import { motion } from 'framer-motion';
import { Download, Share2, Trophy, Star, Calendar, ArrowRight, Award } from 'lucide-react';
import Link from 'next/link';

interface SuccessResultViewProps {
  score: number;
  passingScore: number;
  correctAnswersCount: number;
  totalQuestions: number;
  certificationTitle: string;
  userName: string;
  attemptId: string;
  // If the user already paid/claimed, we might want to handle that here,
  // but for now we'll match the design provided.
}

export default function SuccessResultView({
  score,
  passingScore,
  correctAnswersCount,
  totalQuestions,
  certificationTitle,
  userName,
  attemptId,
}: SuccessResultViewProps) {
  
  const certificateData = {
    name: userName || 'Student',
    course: certificationTitle,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    id: attemptId.slice(0, 15).toUpperCase(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F8F5F0] to-[#FDFBF7] relative overflow-hidden flex flex-col">
      {/* Floating Orbs - Celebration themed */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-20 right-1/4 w-[600px] h-[600px] bg-[#40916C]/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#1B4332]/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-yellow-400/10 rounded-full blur-[80px]"
        />
      </div>

      {/* Confetti Animation Overlay */}
      <ConfettiAnimation />

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl w-full"
        >
          {/* Result Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-[0_30px_80px_-20px_rgba(27,67,50,0.15)] p-8 md:p-12 border border-white text-center">
            
            {/* Trophy Icon & Status */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
              className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-100 to-amber-200 flex items-center justify-center shadow-2xl shadow-yellow-400/30"
            >
              <Trophy className="w-14 h-14 text-yellow-600" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 rounded-full text-sm font-bold mb-4">
                <Star className="w-4 h-4" />
                Congratulations!
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-[#1B4332] mb-3">
                Test Passed!
              </h1>
              
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You&apos;ve successfully completed the certification. Your digital certificate is ready!
              </p>
            </motion.div>

            {/* Score Display - Premium */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-2xl p-8 mb-8 text-white shadow-2xl shadow-[#1B4332]/30"
            >
              <p className="text-sm font-semibold text-green-200 uppercase tracking-wider mb-2">
                Your Assessment Score
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-7xl font-extrabold text-white">
                  {score}
                </span>
                <span className="text-2xl font-bold text-green-200">%</span>
              </div>
              
              {/* Excellence Badge */}
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                {score >= 90 ? 'Outstanding Performance!' : 
                 score >= 85 ? 'Great Job!' : 'Well Done!'}
              </div>
            </motion.div>

            {/* Certificate Preview */}
            <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F8F5F0] rounded-2xl p-8 mb-8 border-2 border-[#1B4332]/20 shadow-lg">
              <div className="relative overflow-hidden rounded-xl border border-[#1B4332]/10 bg-white p-6 md:p-8">
                {/* Decorative Corner Elements */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#1B4332] rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#1B4332] rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#1B4332] rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#1B4332] rounded-br-2xl" />
                
                <div className="text-center">
                  <Award className="w-12 h-12 text-[#1B4332] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#1B4332] mb-1">Certificate of Completion</h3>
                  <p className="text-2xl font-bold text-gray-800 mb-2">{certificateData.name}</p>
                  <p className="text-sm text-gray-600 mb-4">has successfully completed</p>
                  <p className="text-base font-semibold text-[#1B4332] mb-4">{certificateData.course}</p>
                  
                  <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {certificateData.date}
                    </div>
                    <div className="font-mono">ID: {certificateData.id}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href={`/api/certifications/${attemptId}/download-certificate`} target="_blank" className="py-4 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white rounded-2xl font-bold shadow-lg shadow-[#1B4332]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  <Download className="w-5 h-5" />
                  Download Certificate
                </Link>
                
                <button className="py-4 bg-white border-2 border-[#1B4332] text-[#1B4332] rounded-2xl font-bold hover:bg-[#1B4332] hover:text-white transition-all flex items-center justify-center gap-3">
                  <Share2 className="w-5 h-5" />
                  Share Achievement
                </button>
              </div>
              
              <Link 
                href="/certification-exams"
                className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-[#1B4332] font-semibold transition-all"
              >
                Explore More Certifications
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1B4332]">{score}%</p>
                <p className="text-xs text-gray-500 font-semibold uppercase">Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1B4332]">{correctAnswersCount}/{totalQuestions}</p>
                <p className="text-xs text-gray-500 font-semibold uppercase">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1B4332]">{passingScore}%</p>
                <p className="text-xs text-gray-500 font-semibold uppercase">Pass Mark</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Confetti Animation Component
function ConfettiAnimation() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: -20, 
            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1000,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000,
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
            backgroundColor: ['#1B4332', '#40916C', '#F59E0B', '#EF4444', '#3B82F6'][Math.floor(Math.random() * 5)],
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

