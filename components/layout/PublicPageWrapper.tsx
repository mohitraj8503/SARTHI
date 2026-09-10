'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PublicPageWrapperProps {
  children: React.ReactNode;
  className?: string;
  withPatterns?: boolean;
}

export default function PublicPageWrapper({
  children,
  className = "",
  withPatterns = true
}: PublicPageWrapperProps) {
  return (
    <div className={`relative min-h-[calc(100vh-72px)] overflow-hidden ${className}`} style={{ backgroundColor: '#F9F8F5' }}>
      {/* Shared Background Patterns */}
      {withPatterns && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(26,58,42,0.04)' }} />
          <div 
            className="absolute inset-0 opacity-[0.012]"
            style={{ 
              backgroundImage: 'radial-gradient(#1A3A2A 0.5px, transparent 0.5px)', 
              backgroundSize: '32px 32px' 
            }} 
          />
        </div>
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

