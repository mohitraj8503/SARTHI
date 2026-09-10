'use client';

import { motion } from 'framer-motion';
import { XCircle, ArrowRight, RotateCcw, BookOpen, Award } from 'lucide-react';
import Link from 'next/link';

interface FailedResultViewProps {
  score: number;
  passingScore: number;
  certificationId: string;
  certificationTitle: string;
}

export default function FailedResultView({ 
  score, 
  passingScore, 
  certificationId,
  certificationTitle
}: FailedResultViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F8F5F0] to-[#FDFBF7] relative overflow-hidden flex flex-col">
      {/* Floating Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 right-1/4 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          {/* Result Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_30px_80px_-20px_rgba(27,67,50,0.12)] p-8 md:p-12 border border-white text-center">
            
            {/* Icon & Status */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center shadow-lg"
            >
              <XCircle className="w-12 h-12 text-red-500" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-3">
              Test Not Passed
            </h1>
            
            <p className="text-gray-500 mb-8">
              You need a score of at least {passingScore}% to pass this certification.
            </p>

            {/* Score Display */}
            <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F8F5F0] rounded-2xl p-8 mb-8 border border-gray-100">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Your Assessment Score
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="text-7xl font-extrabold text-red-500"
                >
                  {score}
                </motion.span>
                <span className="text-2xl font-bold text-gray-400">%</span>
              </div>
              
              {/* Score Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                  <span>Your Score</span>
                  <span>Passing: {passingScore}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className={`h-full rounded-full ${
                      score >= 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                      score >= 50 ? 'bg-gradient-to-r from-orange-400 to-red-400' :
                      'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Improvement Tips */}
            <div className="bg-blue-50/50 rounded-2xl p-6 mb-8 text-left border border-blue-100">
              <div className="flex items-start gap-4">
                <BookOpen className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">💡 Tips to Improve</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      Review the topics you struggled with in the assessment
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      Revisit the course materials for {certificationTitle}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      Take practice quizzes before your next attempt
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#1B4332]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-5 h-5" />
                Retry Test
              </button>
              
              <Link 
                href="/certification-exams"
                className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:border-[#1B4332] hover:text-[#1B4332] transition-all flex items-center justify-center gap-2"
              >
                Explore Other Certifications
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Certificate Preview (Faded) */}
          <div className="mt-8 text-center opacity-50">
            <div className="inline-flex items-center gap-2 text-gray-400">
              <Award className="w-5 h-5" />
              <span className="text-sm font-semibold">Certification will be issued upon passing</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

