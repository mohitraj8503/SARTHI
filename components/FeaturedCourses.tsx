'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';

const IMD_FEATURED_COURSES = [
  {
    id: 'ai-ml-numerical-weather-prediction',
    slug: 'ai-ml-numerical-weather-prediction',
    title: 'AI & Deep Learning for Numerical Weather Prediction (NWP)',
    instructor: 'Dr. Arvind K. Sharma (Scientist \'G\', IMD)',
    thumbnail: '/courses/ai-ml-weather-prediction.png',
    level: 'Adv.',
    lessons: '12 Lessons',
    duration: '53h 20m',
    rating: '4.9 ★',
  },
  {
    id: 'doppler-weather-radar-nowcasting',
    slug: 'doppler-weather-radar-nowcasting',
    title: 'Doppler Weather Radar (DWR) Operations & Severe Weather Nowcasting',
    instructor: 'Dr. Meenakshi Sundaram (Director, Radar Met)',
    thumbnail: '/courses/doppler-radar-nowcasting.png',
    level: 'Inter.',
    lessons: '10 Lessons',
    duration: '46h 40m',
    rating: '4.9 ★',
  },
  {
    id: 'satellite-meteorology-insat-3d',
    slug: 'satellite-meteorology-insat-3d',
    title: 'Satellite Meteorology: INSAT-3D/3DR Multispectral Imagery Analysis',
    instructor: 'Dr. Vikramaditya Sen (Scientist \'F\', SatMet)',
    thumbnail: '/courses/satellite-meteorology-insat.png',
    level: 'Adv.',
    lessons: '11 Lessons',
    duration: '50h 00m',
    rating: '4.9 ★',
  },
];

function FeaturedCourses({ initialCourses }: { initialCourses?: any[] }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialCourses && initialCourses.length > 0) {
      setCourses(initialCourses);
      setLoading(false);
      return;
    }

    async function fetchFeatured() {
      try {
        const res = await fetch('/api/courses?limit=6&sort=popular');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const list = data.data || data.courses || [];
        setCourses(list.length > 0 ? list : IMD_FEATURED_COURSES);
      } catch (error) {
        setCourses(IMD_FEATURED_COURSES);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, [initialCourses]);

  const displayCourses = useMemo(() => {
    if (!courses || courses.length === 0) return IMD_FEATURED_COURSES;
    return courses.slice(0, 3);
  }, [courses]);

  if (loading) {
    return (
      <section className="py-16 bg-[#FAF9F6] flex items-center justify-center min-h-[250px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0c211d]" />
      </section>
    );
  }

  return (
    <section className="py-20 sm:py-28 lg:py-32 bg-[#FAF9F6] relative overflow-hidden">
      <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16 lg:mb-20">
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2.5 mb-3">
              <span className="w-3 h-3 rounded-[3px] bg-[#f0a535]" />
              <span className="text-[13px] font-bold tracking-[0.2em] uppercase text-[#606b68]">
                FEATURED CLASS
              </span>
            </div>
            <h2 className="text-[38px] sm:text-[48px] lg:text-[54px] font-bold text-[#0c211d] tracking-tight font-instrument leading-[1.12]">
              Featured Training Courses
            </h2>
          </div>

          <Link href="/courses" className="shrink-0">
            <button className="px-8 py-3.5 sm:py-4 rounded-[12px] bg-[#0c211d] hover:bg-[#1a3c2e] text-white font-medium text-[15px] sm:text-[15.5px] transition-all duration-200 active:scale-95 shadow-sm flex items-center justify-center cursor-pointer font-instrument">
              View All Courses
            </button>
          </Link>
        </div>

        {/* 3-Column Responsive Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 xl:gap-11">
          {displayCourses.map((course: any, idx: number) => {
            const levelLabel = course.level
              ? course.level.toLowerCase().includes('adv')
                ? 'Adv.'
                : course.level.toLowerCase().includes('inter')
                  ? 'Inter.'
                  : 'Basic'
              : idx === 0
                ? 'Basic'
                : idx === 1
                  ? 'Inter.'
                  : 'Adv.';

            const thumbnailSrc =
              course.thumbnail && !course.thumbnail.includes('placeholder')
                ? course.thumbnail
                : `/images/course-thumbnail-img-0${(idx % 3) + 5}.jpg`;

            const instructorName =
              typeof course.instructor === 'string'
                ? course.instructor
                : course.instructor?.name ||
                  (idx === 0
                    ? 'Dr. R. K. Sharma (Scientist-F, IMD)'
                    : idx === 1
                      ? 'Dr. S. K. Roy (Scientist-E, MoES)'
                      : 'Dr. Ananya Verma (Director, NWP)');

            const lessonsCount = course.lessons || (course.lessonCount ? `${course.lessonCount} Lessons` : `${10 + idx * 4} Lessons`);
            const durationText = course.duration || (course.totalDuration ? `${Math.round(course.totalDuration / 60)}h` : `${8 + idx * 3}h 30m`);
            const ratingText = course.rating ? `${course.rating} ★` : `${(4.9 - idx * 0.2).toFixed(1)} ★`;

            return (
              <motion.div
                key={course.id || idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div>
                  {/* Thumbnail area: exact 16:9 aspect ratio */}
                  <div className="aspect-[16/9] w-full rounded-[20px] overflow-hidden relative shrink-0 bg-slate-100 mb-6">
                    <Link href={`/courses/${course.slug || course.id}`} className="block w-full h-full">
                      <img
                        src={thumbnailSrc}
                        alt={course.title}
                        className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-500 absolute inset-0"
                        loading="lazy"
                      />
                    </Link>
                    {/* Level Badge in top-left */}
                    <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
                      <span className="px-3.5 py-1.5 rounded-[10px] text-[13px] font-semibold bg-white/95 backdrop-blur-md text-[#0c211d] shadow-sm tracking-wide">
                        Level:{levelLabel}
                      </span>
                    </div>
                  </div>

                  {/* Title and Instructor */}
                  <div className="mb-6">
                    <Link href={`/courses/${course.slug || course.id}`}>
                      <h3 className="text-[21px] sm:text-[22px] lg:text-[23.5px] font-bold text-[#0c211d] font-instrument leading-snug tracking-tight group-hover:text-emerald-800 transition-colors line-clamp-2 min-h-[3.6rem]">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-[14px] sm:text-[14.5px] text-[#606b68] line-clamp-1 mt-2 font-normal">
                      {instructorName}
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Metadata and Action Button */}
                <div className="pt-2">
                  {/* Meta Strip */}
                  <div className="flex items-center justify-between py-3.5 border-t border-slate-100 text-[13.5px] sm:text-[14px] text-[#606b68] font-normal">
                    <div className="flex items-center gap-1.5">
                      <img
                        src="/images/course-icon-01.svg"
                        alt="Notes"
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span>{lessonsCount}</span>
                    </div>
                    <div className="w-[1px] h-3.5 bg-slate-200" />
                    <div>
                      <span>{durationText}</span>
                    </div>
                    <div className="w-[1px] h-3.5 bg-slate-200" />
                    <div className="font-semibold text-[#0c211d]">
                      <span>{ratingText}</span>
                    </div>
                  </div>

                  {/* Enroll Now Button */}
                  <Link href={`/courses/${course.slug || course.id}`} className="mt-5 block w-full">
                    <button className="w-full py-3.5 sm:py-4 rounded-[14px] border border-[#0c211d]/30 hover:border-[#0c211d] hover:bg-[#0c211d] hover:text-white text-[#0c211d] font-semibold text-[15px] sm:text-[15.5px] transition-all duration-200 active:scale-[0.98] flex items-center justify-center cursor-pointer font-instrument">
                      Enroll Now
                    </button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default memo(FeaturedCourses);
