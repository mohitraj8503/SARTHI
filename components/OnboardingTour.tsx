'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOUR_STEPS = [
  {
    target: '#dashboard-welcome',
    title: 'Welcome!',
    content: 'This is your personal dashboard where you can see your overview.',
    position: 'bottom',
  },
  {
    target: '#learning-stats',
    title: 'Track Progress',
    content: 'See your enrolled courses, active hours, and completed lessons here.',
    position: 'right',
  },
  {
    target: '#continue-learning',
    title: 'Jump Back In',
    content: 'Quickly access your most recent courses.',
    position: 'top',
  },
];

export default function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if tour has been seen
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour_v1');
    if (!hasSeenTour) {
      // Small delay to let page render
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenOnboardingTour_v1', 'true');
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed bottom-10 right-10 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border border-gray-100 p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{step.title}</h3>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <span className="sr-only">Close</span>
            &times;
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-6 leading-relaxed">{step.content}</p>

        <div className="flex justify-between items-center">
          <button
            onClick={handleClose}
            className="text-sm font-semibold text-gray-500 hover:text-gray-800"
          >
            Skip Tour
          </button>
          <button
            onClick={handleNext}
            className="bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:shadow-xl hover:bg-black transition-all"
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

