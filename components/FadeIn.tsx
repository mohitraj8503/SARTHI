
"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "none";
  className?: string;
}

export default function FadeIn({ children, delay = 0, direction = "up", className = "" }: FadeInProps) {
  const variants: Variants = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

