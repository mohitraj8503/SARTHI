"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description?: string | null;
    thumbnail?: string | null;
    price: number;
    level: string;
    instructor: {
      name: string | null;
      image?: string | null;
    };
    _count: {
      lessons: number;
      enrollments: number;
    };
    category?: string | null;
    href?: string;
    ctaLabel?: string;
  };
  index: number;
}

export default function CourseCard({ course, index }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-[24px] border border-[#E8E2D9] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgba(26,60,46,0.08)] flex flex-col h-full cursor-pointer"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[16/10] overflow-hidden p-3 pb-0">
        <div className="relative w-full h-full rounded-[20px] overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 absolute inset-0"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          ) : (
            <div className="w-full h-full bg-[#1A3C2E] flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-white/20" />
            </div>
          )}

          {/* Level Badge (Top Left) */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[9px] font-black text-white uppercase tracking-[0.15em] shadow-sm">
              {course.level || "BEGINNER"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow bg-white">
        {/* Category */}
        <div className="mb-4 flex items-center gap-2 text-[#2D6A4F]">
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em]">
            {course.category || "DEVELOPMENT"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[22px] font-black text-[#1A3C2E] mb-3 leading-[1.2] tracking-tight group-hover:text-[#2D6A4F] transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-[14px] text-[#5D705C] font-medium leading-[1.6] line-clamp-2 mb-6">
          {course.description || "Master the fundamentals and build real-world projects with step-by-step guidance."}
        </p>

        {/* Separator */}
        <div className="h-px w-full bg-[#E8E2D9] my-auto pt-4" />

        {/* Bottom Section: Investment & Button */}
        <div className="mt-6 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.15em] mb-1">
              INVESTMENT
            </span>
            <span className="text-[20px] font-black text-[#1A3C2E]">
              {course.price === 0 
                ? "Free" 
                : (/GST\s*&\s*Income|GST\s*Filing|Python\s*(Beginners|Mastery)/i.test(course.title))
                  ? `₹${course.price.toLocaleString()} / Month`
                  : `₹${course.price.toLocaleString()}`
              }
            </span>
          </div>

          <Link
            href={course.href || `/courses/${course.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-[#1A3C2E] text-white rounded-full font-black uppercase tracking-[0.1em] text-[11px] transition-all duration-300 hover:bg-[#2D6A4F] active:scale-95 shadow-md"
          >
            {course.ctaLabel || "OPEN"} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

