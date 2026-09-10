'use client';

import React from 'react';
import { motion, useReducedMotion, MotionProps, HTMLMotionProps } from 'framer-motion';

interface MotionContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export function MotionContainer({ children, ...props }: MotionContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, disable transitions/variants
  if (shouldReduceMotion) {
    return (
      <div className={props.className} style={props.style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div {...props}>
      {children}
    </motion.div>
  );
}

export function MotionCard({ children, ...props }: MotionContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={props.className} style={props.style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionButton({ children, ...props }: HTMLMotionProps<'button'>) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <button className={props.className} style={props.style} onClick={props.onClick as any}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
