'use client';

import React from 'react';
import { LucideIcon, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon = Search,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full py-24 text-center overflow-hidden" 
    >
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="w-20 h-20 flex items-center justify-center mx-auto mb-8"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Icon className="w-8 h-8" style={{ color: '#1A3A2A' }} />
      </motion.div>
      
      <h3 
        className="mb-3"
        style={{ fontSize: '18px', fontWeight: 600, color: '#1A3A2A', letterSpacing: '-0.01em' }}
      >
        {title}
      </h3>
      
      <p 
        className="max-w-sm mx-auto px-4"
        style={{ fontSize: '15px', lineHeight: 1.75, color: '#6B7280', fontWeight: 500 }}
      >
        {description}
      </p>
      
      {action && (
        <button 
          onClick={action.onClick}
          className="mt-10 mx-auto flex items-center justify-center gap-3 transition-all duration-200 active:scale-95"
          style={{
            padding: '12px 32px',
            backgroundColor: '#1A3A2A',
            color: '#FFFFFF',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

