'use client';

import { useScroll, motion, useSpring } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Don't render for reduced motion users
  if (shouldReduceMotion) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 origin-left z-[9999]"
      style={{ 
        scaleX,
        opacity: 0.9,
      }}
    />
  );
}

