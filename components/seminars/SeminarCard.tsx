"use client";
 

import Link from "next/link";
import { motion } from 'framer-motion';
import { Calendar, Monitor, Video, ArrowRight, Clock, CheckCircle2 } from "lucide-react";

interface SeminarCardProps {
    seminar: {
        id: string;
        title: string;
        slug: string;
        description?: string | null;
        isLive?: boolean;
        date?: string | null;
        speakerName?: string | null;
        thumbnailUrl?: string | null;
        price?: number | null;
        type?: 'seminar' | 'workshop';
    };
    index?: number;
}

export default function SeminarCard({ seminar, index = 0 }: SeminarCardProps) {
    const isUpcoming = !seminar.isLive && seminar.date && (new Date(seminar.date) > new Date() || new Date(seminar.date).getFullYear() === 1970);
    const finalThumbnail = seminar.thumbnailUrl || (seminar as any).thumbnail;
    const detailHref = seminar.type === 'workshop' 
        ? `/workshops/${seminar.slug || seminar.id}` 
        : `/seminars/${seminar.slug || seminar.id}`;

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
            className="group bg-white rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(27,67,50,0.08)] border border-white flex flex-col h-full"
        >
            {/* Image Area (Mirrored from Certifications) */}
            <div className="relative aspect-ratio-16-9 overflow-hidden bg-gray-50 border-b border-gray-100 w-full">
                <style jsx>{`
                    .aspect-ratio-16-9 {
                        aspect-ratio: 16 / 9;
                    }
                `}</style>

                


                {finalThumbnail ? (
                    <img
                        src={finalThumbnail}
                        alt={seminar.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Video className="w-20 h-20" />
                    </div>
                )}
            </div>

            {/* Content Area (Mirrored from Certifications) */}
            <div className="p-8 flex flex-col flex-1">
                <Link href={detailHref}>
                    <h2 className="text-[1.5rem] font-bold text-[#1F2937] leading-[1.3] tracking-[-0.3px] mb-4 group-hover:text-[#1B4332] transition-colors line-clamp-2 min-h-[3.9rem]">
                        {seminar.title}
                    </h2>
                </Link>

                <p className="text-[0.95rem] text-[#6B7280] leading-[1.7] mb-7 line-clamp-3 min-h-[4.9rem]">
                    {seminar.description || "Join this interactive masterclass to dive deep into industry concepts with expert mentors."}
                </p>

                {/* Metadata Row */}
                <div className="flex flex-wrap gap-4 pb-7 mb-7 border-bottom border-gray-100 border-b">
                    <div className="flex items-center gap-2 text-[0.875rem] font-semibold text-[#6B7280]">
                        <Calendar className="w-[18px] h-[18px] text-[#40916C]" />
                        <span>{seminar.date && new Date(seminar.date).getFullYear() !== 1970 ? new Date(seminar.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Coming Soon"}</span>
                    </div>
                    {seminar.speakerName && (
                        <div className="flex items-center gap-2 text-[0.875rem] font-semibold text-[#6B7280]">
                            <CheckCircle2 className="w-[18px] h-[18px] text-[#40916C]" />
                            <span>{seminar.speakerName}</span>
                        </div>
                    )}
                </div>

                {/* CTA Button (Mirrored from Certifications) */}
                <Link 
                    href={detailHref}
                    className="flex items-center justify-center gap-[0.75rem] w-full py-[1.125rem] px-8 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white text-[1rem] font-bold rounded-[14px] shadow-[0_4px_12px_rgba(27,67,50,0.3)] hover:shadow-[0_12px_24px_rgba(27,67,50,0.4)] transition-all group/btn"
                >
                    {seminar.isLive ? "Join Stream" : isUpcoming ? "Reserve Seat" : "Watch Replay"}
                    <ArrowRight className="w-[18px] h-[18px] transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
            </div>
        </motion.article>
    );
}

