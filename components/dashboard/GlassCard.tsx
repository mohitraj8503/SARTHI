
"use client";
import React from 'react';

export function GlassCard({ children, className = "", hover = false }: { children: React.ReactNode, className?: string, hover?: boolean }) {
    return (
        <div
            className={`
                backdrop-blur-md rounded-2xl p-6 transition-all animate-normal ease-out
                shadow-md
                ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
                ${className}
            `}
            style={{
                backgroundColor: 'rgba(15, 20, 36, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
        >
            {children}
        </div>
    );
}

