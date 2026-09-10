"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  badge?: string;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
  isCoursesPage?: boolean;
}

export default function PageHeader({
  badge = "SARTHI LEARNING",
  title,
  description,
  className = "",
  children,
  isCoursesPage = false
}: PageHeaderProps) {
  const isCertPage = title.toLowerCase().includes('cert');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "w-full mx-auto px-6",
        isCoursesPage ? "pt-[60px] pb-[48px]" : "py-16 md:py-24",
        className
      )}
      style={{ maxWidth: '1200px' }}
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="flex-1" style={{ maxWidth: '600px' }}>
          {/* Section Label */}
          <p
            className="mb-6 flex items-center gap-3 uppercase"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#6B7280',
            }}
          >
            {isCertPage ? (
              <Award className="w-4 h-4" style={{ color: '#1A3A2A' }} />
            ) : (
              <span
                className="rounded-full animate-pulse"
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#1A3A2A',
                  boxShadow: '0 0 10px rgba(26,58,42,0.5)',
                }}
              />
            )}
            {badge}
          </p>

          {/* Main Heading — sentence case, clamp sizing */}
          <h1
            className="mb-6"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#1A3A2A',
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.75,
              color: '#374151',
              maxWidth: isCoursesPage ? '540px' : '640px',
              fontWeight: 500,
            }}
          >
            {description}
          </p>
        </div>
        
        {children && (
          <div className="flex-shrink-0 pb-1">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}

