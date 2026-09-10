'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Code, Layout, Database, Terminal } from 'lucide-react';

export default function Hero3DIllustration() {
    const cards = [
        { icon: Code, color: '#F97316', label: 'Web Dev', delay: 0 },
        { icon: Layout, color: '#3B82F6', label: 'UI/UX', delay: 0.5 },
        { icon: Database, color: '#10B981', label: 'Data', delay: 1 },
        { icon: Terminal, color: '#8B5CF6', label: 'DevOps', delay: 1.5 },
    ];

    return (
        <div className="relative w-full max-w-[500px] h-[400px] flex items-center justify-center pointer-events-none">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-orange/5 blur-[120px] rounded-full" />

            <div className="relative grid grid-cols-2 gap-6 p-4">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{
                            opacity: 1,
                            y: [0, -20, 0],
                            transition: {
                                delay: card.delay,
                                y: {
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                },
                                opacity: { duration: 0.5, delay: card.delay }
                            }
                        }}
                        className="w-[140px] h-[160px] sm:w-[160px] sm:h-[180px] bg-white rounded-[24px] sm:rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-black/[0.03] p-4 sm:p-6 flex flex-col items-center justify-center gap-3 sm:gap-4 group"
                    >
                        <div
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                            style={{ backgroundColor: `${card.color}10` }}
                        >
                            <card.icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: card.color }} />
                        </div>
                        <span className="text-[12px] sm:text-[14px] font-bold text-[#111827] tracking-tight">{card.label}</span>

                        {/* Decorative floating lines */}
                        <div className="w-full flex flex-col gap-1.5 opacity-10">
                            <div className="h-1 bg-black rounded-full w-full" />
                            <div className="h-1 bg-black rounded-full w-2/3" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

