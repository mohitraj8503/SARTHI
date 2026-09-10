import { Star, BookOpen } from 'lucide-react';
import Image from 'next/image';

const getCourseDurationShort = (title: string, duration?: number | null) => {
    return "2 Months";
};

interface MobileCourseHeaderProps {
  course: any;
  averageRating: number;
  reviewCount: number;
  studentsCount: number;
  totalLessons: number;
  onInstructorClick?: () => void;
}

export default function MobileCourseHeader({ 
  course, 
  averageRating, 
  reviewCount, 
  totalLessons,
  onInstructorClick
}: MobileCourseHeaderProps) {
  // Determine instructor / teacher details dynamically
  const isSoumyaCourse = 
    course?.slug?.includes('fintech') || 
    course?.slug?.includes('financial-risk') || 
    course?.slug?.includes('ai-and-machine-learning-in-banking') || 
    course?.slug?.includes('ai-powered-startup') ||
    course?.instructor?.name?.toLowerCase().includes('soumya');

  const instructorName = course?.instructor?.name || (isSoumyaCourse ? 'Soumya Dasgupta' : 'SARTHI');
  const instructorImage = course?.instructor?.image || (isSoumyaCourse ? '/teachers/soumya-dasgupta.png' : '/sarthi-logo.png');
  const instructorTitle = (course?.instructor?.name || isSoumyaCourse) ? 'Lead Instructor' : 'Course Provider';
  const instructorHeadline = course?.instructor?.headline || (isSoumyaCourse ? 'MBA (IIM Calcutta) · FRM® · TOGAF 9' : 'Official SARTHI Platform');

  return (
    <div className="space-y-5 font-plus-jakarta text-left">
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <span className="px-3.5 py-1.5 bg-[#E8F4E8] text-[#1F5C1F] text-[11px] font-semibold uppercase tracking-wider rounded-full">
          {course.category || 'Finance & Tech'}
        </span>
        <span className="px-3 py-1 bg-amber-50 text-[#FFD700] text-[11px] font-semibold rounded-full flex items-center gap-1 border border-amber-100">
          <Star className="w-3 h-3 fill-current text-[#FFD700]" />
          <span className="text-[#1A1916]">{averageRating > 0 ? averageRating : '4.8'}</span>
          <span className="text-gray-500 font-medium ml-1">({reviewCount > 0 ? reviewCount : 142} reviews)</span>
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-extrabold text-[#1A1916] leading-tight tracking-tight uppercase">
        {course.title?.split(' ').every((w: string) => w === w.toUpperCase()) 
          ? course.title.toLowerCase().split(' ').map((s: string) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')
          : course.title}
      </h1>

      {/* Subtitle */}
      {course.shortDescription && course.shortDescription !== 'undefined' && course.shortDescription !== 'undefined...' ? (
        <p className="text-[15px] text-[#555550] font-normal leading-relaxed">
          {course.shortDescription}
        </p>
      ) : course.description && course.description !== 'undefined' && course.description !== 'undefined...' ? (
        <p className="text-[15px] text-[#555550] font-normal leading-relaxed">
          {course.description.replace(/<[^>]*>/g, '').substring(0, 140) + '...'}
        </p>
      ) : null}

      {/* Stats Row */}
      <div className="flex flex-col gap-2 pt-1 text-xs text-gray-700 font-semibold text-left">
        <div className="flex items-center gap-2">
          <span>📅 Duration: {getCourseDurationShort(course.title, course.duration)}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span>⚡ Self-Paced Learning Program</span>
          {isSoumyaCourse && (
            <span className="px-2.5 py-1 bg-[#E8F4E8] text-[#1F5C1F] font-bold text-[11px] rounded-full border border-[#C8DFC8]">
              🎓 IIM Graduate x Faculty
            </span>
          )}
        </div>
      </div>

      {/* Teacher / Course Provider Badge Card */}
      <div 
        onClick={onInstructorClick}
        className="flex items-center gap-3.5 p-4 bg-[#E8F4E8]/60 hover:bg-[#E8F4E8] rounded-2xl border border-[#C8DFC8] shadow-sm transition-all text-left cursor-pointer active:scale-[0.99] group"
      >
        <div className="w-[46px] h-[46px] rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden shrink-0 relative border border-[#1A3C2E]">
          <Image 
            src={instructorImage} 
            alt={instructorName} 
            fill
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] text-[#1F5C1F] font-black uppercase tracking-widest leading-none">
              {instructorTitle}
            </span>
            <span className="text-[9px] font-black bg-[#1A3C2E] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              ✓ Verified
            </span>
          </div>
          <p className="font-extrabold text-[#1A3C2E] text-base truncate group-hover:underline">
            {instructorName}
          </p>
          <p className="text-[11px] font-semibold text-gray-600 truncate">
            {instructorHeadline}
          </p>
        </div>
      </div>
    </div>
  );
}

