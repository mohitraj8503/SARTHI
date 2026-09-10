'use client';

import { motion } from 'framer-motion';
import { ChevronRight, BookOpen, Star, Target, Lightbulb, Medal, FileText, Check, Trophy, GraduationCap, Wrench, Factory, Mic, Brain, Zap, Rocket, Users, Building2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

// Map icons dynamically
const iconMap: Record<string, any> = {
    BookOpen, Star, Target, Lightbulb, Medal, FileText, Check, Trophy, GraduationCap, Wrench, Factory, Mic, Brain, Zap, Rocket, Users, Building2
};

interface SubItem {
    label: string;
    href: string;
    icon: string;
    iconColor: string;
    desc: string;
    badge?: string;
}

interface CategoryNavHubProps {
    categoryLabel: string;
    categoryEmoji: string;
    categorySubtitle: string;
    subItems: SubItem[];
    featuredData: {
        title: string;
        icon: string;
        iconColor: string;
        meta: string;
        badge: string;
        ctaText: string;
        ctaHref: string;
    };
}

export default function CategoryNavHub({
    categoryLabel,
    categoryEmoji,
    categorySubtitle,
    subItems,
    featuredData
}: CategoryNavHubProps) {
    const pathname = usePathname();
    const FeatIcon = iconMap[featuredData.icon] || BookOpen;

    return (
        <div className="min-h-[85vh] bg-[#FCFBF8] flex items-center justify-center p-6 md:p-12 relative overflow-hidden select-none">
            {/* Ambient luxury glows */}
            <div className="absolute top-1/4 left-1/12 w-[350px] h-[350px] rounded-full bg-[#16A34A]/[0.02] blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/12 w-[450px] h-[450px] rounded-full bg-[#E8B84B]/[0.02] blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[760px] bg-white border border-[#ECECEC] rounded-[32px] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative z-10"
            >
                {/* Header Information */}
                <div className="text-left mb-6 border-b border-[#ECECEC]/60 pb-5">
                    <h1 className="text-[26px] md:text-[32px] font-extrabold text-[#111111] tracking-tight leading-none">
                        SARTHI <span className="text-[#16A34A]">{categoryLabel}</span> {categoryEmoji}
                    </h1>
                    <p className="text-[#6B7280] text-[14px] font-medium mt-2 leading-relaxed">
                        {categorySubtitle}
                    </p>
                </div>

                {/* Sub-Items Grid */}
                <div className={cn(
                    "grid gap-4 mb-6",
                    subItems.length > 4 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
                )}>
                    {subItems.map((sub, idx) => {
                        const SubIcon = iconMap[sub.icon] || BookOpen;
                        const isSubActive = pathname === sub.href;
                        const showBadge = sub.badge === 'LIVE' || sub.badge === 'NEW' || sub.badge === 'HOT';

                        return (
                            <motion.div
                                key={sub.label}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <Link
                                    href={sub.href}
                                    onClick={() => triggerHaptic('light')}
                                    className={cn(
                                        "group relative flex flex-col p-5 rounded-2xl border min-h-[120px] justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-md cursor-pointer outline-none bg-white",
                                        isSubActive
                                            ? "border-[#16A34A] shadow-sm"
                                            : "border-[#ECECEC] hover:border-[#16A34A]/40"
                                    )}
                                >
                                    {/* Sub-item Icon */}
                                    <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 border border-black/[0.02] shadow-sm flex-shrink-0 mb-3 group-hover:scale-105 transition-transform duration-300">
                                        <SubIcon 
                                            className="w-4.5 h-4.5" 
                                            style={{ color: sub.iconColor }} 
                                        />
                                    </span>

                                    {/* Text Block */}
                                    <div className="flex flex-col text-left">
                                        <span className="text-[14px] font-bold text-[#111111] group-hover:text-[#16A34A] transition-colors flex items-center gap-1.5 leading-none">
                                            <span>{sub.label}</span>
                                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300 text-[#16A34A]" />
                                        </span>
                                        <span className="text-[11px] font-medium text-[#6B7280] mt-2 leading-relaxed">
                                            {sub.desc}
                                        </span>
                                    </div>

                                    {/* Action Badge */}
                                    {showBadge && (
                                        <span className="absolute top-4 right-4 text-[8px] font-extrabold px-1.5 py-0.5 rounded leading-none tracking-wider bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20">
                                            {sub.badge}
                                        </span>
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom Featured Banner */}
                <div className="p-4.5 rounded-2xl bg-[#FCFBF8] border border-[#ECECEC] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none text-left">
                    <div className="flex items-start md:items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-white border border-[#ECECEC] flex items-center justify-center shadow-sm shrink-0">
                            <FeatIcon className="w-5 h-5" style={{ color: featuredData.iconColor }} />
                        </span>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/25 tracking-wider">
                                    {featuredData.badge}
                                </span>
                                <span className="text-[13px] font-bold text-[#111111]">
                                    {featuredData.title}
                                </span>
                            </div>
                            <span className="text-[11px] font-medium text-[#6B7280]">
                                {featuredData.meta}
                            </span>
                        </div>
                    </div>

                    <Link href={featuredData.ctaHref} className="shrink-0 w-full md:w-auto">
                        <div className="h-10 px-5 bg-[#16A34A] hover:bg-[#1A3C2E] text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all w-full md:w-auto">
                            <span>{featuredData.ctaText}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
