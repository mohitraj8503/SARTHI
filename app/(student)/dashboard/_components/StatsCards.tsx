'use client';

import React from 'react';
import { BookOpen, CheckCircle, Award, Users } from 'lucide-react';


interface StatsCardsProps {
    stats?: any;
}

export default function StatsCards({ stats }: StatsCardsProps) {
    const statItems = [
        {
            label: 'Course in Progress',
            value: stats?.activeCourses || '0',
            icon: BookOpen,
            color: 'bg-orange-100',
            iconColor: 'text-orange-600',
            borderColor: 'border-orange-500',
            progress: stats?.avgProgress || 0,
        },
        {
            label: 'Course Completed',
            value: stats?.completedCourses || '0',
            icon: CheckCircle,
            color: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            borderColor: 'border-emerald-500',
            progress: 100,
        },
        {
            label: 'Learning Time (Min)',
            value: stats?.totalLearningTime || '0',
            icon: Award,
            color: 'bg-blue-100',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-500',
            progress: stats?.weeklyGoalProgress || 0,
        },
        {
            label: 'Learning Score',
            value: stats?.learningScore || '0',
            icon: Users,
            color: 'bg-purple-100',
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-500',
            progress: stats?.learningScore || 0,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statItems.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-transparent hover:border-current transition-all" style={{ borderColor: 'transparent' }}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl ${stat.color}`}>
                            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                    </div>
                    <div className={`mt-4 h-1 w-full rounded-full bg-gray-100 overflow-hidden`}>
                        <div className={`h-full ${stat.iconColor.replace('text', 'bg')}`} style={{ width: `${stat.progress}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}
