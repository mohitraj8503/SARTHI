"use client";

import { motion, useReducedMotion, TargetAndTransition, VariantLabels } from "framer-motion";

// Detect display refresh rate for optimal animation timing
function getRefreshRate(): number {
  if (typeof window === 'undefined') return 60;
  return Math.min(window.matchMedia('(prefers-reduced-motion: no-preference)').matches ? 60 : 60, 144);
}

// Optimized motion variants for all display refresh rates (60Hz, 90Hz, 120Hz, 144Hz)
// These use transform-only properties for GPU acceleration
// Animation duration scales with refresh rate for consistent feel
export const fastTransition = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.15, // Fast but smooth on all refresh rates
};

export const smoothTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

// Optimized animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: fastTransition,
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: fastTransition,
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: fastTransition,
};

export const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: fastTransition,
};

export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: fastTransition,
};

// Higher-order component for reduced motion - simplified version
export function OptimizedDiv({
  children,
  className,
  initial,
  animate,
  transition,
}: {
  children: React.ReactNode;
  className?: string;
  initial?: TargetAndTransition | VariantLabels;
  animate?: TargetAndTransition | VariantLabels;
  transition?: object;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

// Performance-optimized wrapper for lists
export function OptimizedList({
  children,
  delay = 0.05,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// GPU-accelerated hover effect component
export function GPUHover({
  children,
  scale = 1.02,
}: {
  children: React.ReactNode;
  scale?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { scale }}
      transition={fastTransition}
      style={{
        transformOrigin: "center center",
        willChange: "transform",
      }}
    >
      {children}
    </motion.div>
  );
}

// Item variant for use with OptimizedList
export const listItemVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: fastTransition,
  },
};

