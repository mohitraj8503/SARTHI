
"use client";
import { GlassCard } from './GlassCard';
import { Flame, Zap, Target, Clock, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export function StatRow({ dailyGoal, streak, xp, focusStats }: any) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Daily Goal */}
            <GlassCard hover>
                <div className="flex justify-between items-start mb-2">
                    <div
                        className="p-2 rounded-lg"
                        style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--color-primary-400)'
                        }}
                    >
                        <Target className="w-5 h-5" />
                    </div>
                    <span
                        className="text-xs font-medium"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    >
                        DAILY GOAL
                    </span>
                </div>
                <div className="flex items-end gap-2">
                    <h3
                        className="text-2xl font-bold"
                        style={{ color: 'var(--color-text-inverse)' }}
                    >
                        {dailyGoal.currentMinutes}/{dailyGoal.targetMinutes}
                    </h3>
                    <span
                        className="text-sm mb-1"
                        style={{ color: 'var(--color-text-disabled)' }}
                    >
                        mins
                    </span>
                </div>
                <div
                    className="w-full h-1.5 rounded-full mt-3 overflow-hidden"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (dailyGoal.currentMinutes / dailyGoal.targetMinutes) * 100)}%` }}
                        className="h-full rounded-full"
                        style={{
                            background: 'linear-gradient(to right, var(--color-primary-500), #06b6d4)'
                        }}
                    />
                </div>
            </GlassCard>

            {/* Streak */}
            <GlassCard hover>
                <div className="flex justify-between items-start mb-2">
                    <div
                        className="p-2 rounded-lg"
                        style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            color: 'var(--color-warning-500)'
                        }}
                    >
                        <Flame className="w-5 h-5" style={{ fill: 'rgba(245, 158, 11, 0.2)' }} />
                    </div>
                    <span
                        className="text-xs font-medium"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    >
                        STREAK
                    </span>
                </div>
                <div className="flex items-end gap-2">
                    <h3
                        className="text-2xl font-bold"
                        style={{ color: 'var(--color-text-inverse)' }}
                    >
                        {streak.current}
                    </h3>
                    <span
                        className="text-sm mb-1"
                        style={{ color: 'var(--color-text-disabled)' }}
                    >
                        days
                    </span>
                </div>
                <p
                    className="text-xs mt-3 font-medium"
                    style={{ color: 'var(--color-warning-500)' }}
                >
                    Keep it up! 🔥
                </p>
            </GlassCard>

            {/* XP */}
            <GlassCard hover>
                <div className="flex justify-between items-start mb-2">
                    <div
                        className="p-2 rounded-lg"
                        style={{
                            backgroundColor: 'rgba(147, 51, 234, 0.1)',
                            color: '#a855f7'
                        }}
                    >
                        <Trophy className="w-5 h-5" />
                    </div>
                    <span
                        className="text-xs font-medium"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    >
                        TOTAL XP
                    </span>
                </div>
                <div className="flex items-end gap-2">
                    <h3
                        className="text-2xl font-bold"
                        style={{ color: 'var(--color-text-inverse)' }}
                    >
                        {(xp.total / 1000).toFixed(1)}k
                    </h3>
                    <span
                        className="text-sm mb-1"
                        style={{ color: 'var(--color-text-disabled)' }}
                    >
                        XP
                    </span>
                </div>
                <p
                    className="text-xs mt-3 font-medium"
                    style={{ color: '#a855f7' }}
                >
                    Top 5% 🚀
                </p>
            </GlassCard>

             {/* Focus */}
             <GlassCard hover>
                <div className="flex justify-between items-start mb-2">
                    <div
                        className="p-2 rounded-lg"
                        style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            color: 'var(--color-success-500)'
                        }}
                    >
                        <Clock className="w-5 h-5" />
                    </div>
                    <span
                        className="text-xs font-medium"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    >
                        FOCUS
                    </span>
                </div>
                <div className="flex items-end gap-2">
                    <h3
                        className="text-2xl font-bold"
                        style={{ color: 'var(--color-text-inverse)' }}
                    >
                        {Math.round(focusStats.totalMinutes)}
                    </h3>
                    <span
                        className="text-sm mb-1"
                        style={{ color: 'var(--color-text-disabled)' }}
                    >
                        mins (7d)
                    </span>
                </div>
                <p
                    className="text-xs mt-3 font-medium"
                    style={{ color: 'var(--color-success-500)' }}
                >
                    {focusStats.sessions} sessions
                </p>
            </GlassCard>
        </div>
    )
}

