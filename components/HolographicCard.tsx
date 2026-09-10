import React, { ReactNode } from 'react';

interface HolographicCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function HolographicCard({ children, className = '', onClick }: HolographicCardProps) {
  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-md border border-cyan-500/30 rounded-[2rem] shadow-xl relative overflow-hidden group ${className}`}
      onClick={onClick || undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      {children}
    </div>
  );
}

