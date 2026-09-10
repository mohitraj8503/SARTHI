'use client';

import { WifiOff, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ConnectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-[#F5F3EF] to-[#FAF9F6] flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full relative z-10">
        {/* Animated Error Icon */}
        <div className="relative mb-8 flex justify-center">
          <div className="absolute inset-0 bg-red-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative w-32 h-32 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
            <WifiOff className="w-16 h-16 text-red-500" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1B4332] mb-3">
            Unable to Connect
          </h1>
          <p className="text-gray-600 leading-relaxed">
            We&apos;re having trouble reaching our servers. This could be due to your internet connection or a temporary server issue.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#1B4332]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Try Refreshing
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-[#1B4332] hover:text-[#1B4332] transition-all"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link 
              href="/contact"
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-[#1B4332] hover:text-[#1B4332] transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Support
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            If the problem persists, please contact our support team at{' '}
            <a href="mailto:support@sarthi.in" className="text-[#D4915C] font-semibold hover:underline">
              support@sarthi.in
            </a>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-[#D4915C]/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#1B4332]/10 rounded-full blur-3xl"></div>
      </div>
    </motion.div>
  );
}

