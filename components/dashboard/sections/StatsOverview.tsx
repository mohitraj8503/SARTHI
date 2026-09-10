import { BookOpen, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatsOverviewProps {
    stats: {
        activeCourses: number;
        completedCourses: number;
        avgProgress: number;
        totalLearningTime: number;
    };
}

export default function StatsOverview({
    stats
}: StatsOverviewProps) {
    // Defensive fallbacks
    const activeCourses = stats?.activeCourses || 0;
    const avgProgress = stats?.avgProgress || 0;
    const totalLearningTime = stats?.totalLearningTime || 0;

    const items = [
        {
            label: 'Active Courses',
            value: activeCourses,
            icon: BookOpen,
            iconColor: 'text-[#D4915C]',
            iconBg: 'bg-[#D4915C]/10',
            subText: 'Currently enrolled'
        },
        {
            label: 'Overall Progress',
            value: `${Math.round(avgProgress)}%`,
            icon: TrendingUp,
            iconColor: 'text-[#1B4332]',
            iconBg: 'bg-[#1B4332]/10',
            subText: 'Course average'
        },
        {
            label: 'Time Studied',
            value: `${(totalLearningTime / 60).toFixed(1)}h`,
            icon: Clock,
            iconColor: 'text-green-700',
            iconBg: 'bg-green-100',
            subText: 'This week'
        }
    ];

    return (
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {items.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="bg-white p-4 md:p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-default flex flex-col justify-between h-full"
                    >
                        <div className="flex flex-col gap-3">
                            <div className={cn(
                                "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", 
                                stat.iconBg, 
                                stat.iconColor
                            )}>
                                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest italic opacity-80">
                                {stat.label}
                            </p>
                        </div>
                        <div className="mt-4">
                            <p className="text-[22px] md:text-3xl font-black text-[#1B4332] tracking-tighter italic leading-none">
                                {stat.value}
                            </p>
                            <p className="text-[9px] md:text-sm text-gray-400 font-bold uppercase tracking-wider mt-1 opacity-60">{stat.subText}</p>
                        </div>
                    </motion.div>
                );
            })}
        </section>
    );
}

