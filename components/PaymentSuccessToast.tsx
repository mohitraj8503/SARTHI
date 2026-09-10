'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle, X } from 'lucide-react';

/**
 * Payment Success Toast - Shows celebration when payment=success in URL
 * Auto-dismisses after 5 seconds
 */
export default function PaymentSuccessToast() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const paymentStatus = searchParams?.get('payment');
    const orderId = searchParams?.get('orderId');

    if (paymentStatus === 'success' && orderId) {
      setShow(true);

      // 🎉 CONFETTI CELEBRATION!
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire from multiple points
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      // Auto-dismiss after 5 seconds
      const timeout = setTimeout(() => {
        setShow(false);
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [searchParams]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[9998] max-w-md w-full mx-4"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-green-100 p-6 relative overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-50" />

            {/* Content */}
            <div className="relative flex items-start gap-4">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
              </div>

              <div className="flex-1 pt-1">
                <h3 className="text-xl font-black text-brand-dark mb-1">
                  Payment Successful! 🎉
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  Welcome to the course! Your enrollment is now active. Start learning immediately.
                </p>
              </div>

              <button
                onClick={() => setShow(false)}
                className="shrink-0 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-green-500"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

