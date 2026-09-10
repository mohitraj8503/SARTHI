'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, ShieldCheck, Zap, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CourseEnrollPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [fetchingCourse, setFetchingCourse] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);

          // Check if already enrolled to prevent redundant UI
          if (data.isEnrolled) {
            router.replace(`/courses/${slug}/learn`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch course details');
      } finally {
        setFetchingCourse(false);
      }
    };
    fetchCourse();
  }, [slug, router]);

  const handleEnroll = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId: course?.id 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/courses/${slug}/learn`);
      } else {
        alert(data.message || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCourse) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1B4332] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(27,67,50,0.05)] border border-gray-100 overflow-hidden"
      >
        <div className="p-10 md:p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <BookOpen className="w-10 h-10 text-[#1B4332]" />
            </div>
            
            <h1 className="text-3xl font-black text-[#1B4332] mb-3 uppercase italic tracking-tighter">Initialize_Curriculum</h1>
            <p className="text-gray-500 font-medium text-lg mb-10">
                Enroll in <span className="text-[#1B4332] font-black italic">&quot;{course?.title || 'this course'}&quot;</span> to unlock the complete technical curriculum and start your evolution.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Zap className="text-[#D4915C]" size={20} />
                    <span className="text-[10px] font-black text-[#1B4332] uppercase tracking-widest">Instant Access</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <ShieldCheck className="text-[#40916C]" size={20} />
                    <span className="text-[10px] font-black text-[#1B4332] uppercase tracking-widest">Secure Learning</span>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <button
                    onClick={handleEnroll}
                    disabled={loading}
                    className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-black py-5 px-8 rounded-2xl shadow-xl shadow-[#1B4332]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>Begin Learning <ArrowRight size={18} /></>}
                </button>

                <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#1B4332] uppercase tracking-widest py-3 transition-colors"
                >
                    <ChevronLeft size={14} /> Revert to Previous Node
                </button>
            </div>
        </div>

        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Need assistance? <Link href="/support" className="text-[#1B4332] hover:underline underline-offset-4">Contact Terminal Support</Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
}
