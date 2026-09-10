import Image from 'next/image';
import { Play, Heart, Share2, Star, Users, Award, RefreshCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileVideoPreviewProps {
  course: any;
  onPlay: () => void;
  onEnroll: () => void;
  onWishlist: () => void;
  onShare?: () => void;
  isWishlisted: boolean;
  enrollLoading: boolean;
  enrollment: any;
}

export default function MobileVideoPreview({
  course,
  onPlay,
  onEnroll,
  onWishlist,
  onShare,
  isWishlisted,
  enrollLoading,
  enrollment
}: MobileVideoPreviewProps) {
  return (
    <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-gray-900 overflow-hidden cursor-pointer" onClick={onPlay}>
        {course.thumbnail && (
           
          <img
            src={course.thumbnail.startsWith('http') || course.thumbnail.startsWith('/') ? course.thumbnail : `/${course.thumbnail}`}
            alt="Course Preview"
            className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-700 absolute inset-0"
          />
        )}
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1E3A8A]">
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 left-0 right-0 text-center">
          <span className="text-white text-[10px] font-bold tracking-widest uppercase bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full">
            Preview Course
          </span>
        </div>
      </div>

      {/* Access Info */}
      <div className="p-6 text-center font-plus-jakarta">
        <div className="flex flex-col items-center justify-center gap-1 mb-2">
          {course.price === 0 || course.pricing_type === 'FREE' ? (
            <div className="text-3xl font-bold text-[#1A3C2E]">Free Access</div>
          ) : (
            <div className="flex items-baseline gap-2 justify-center w-full">
              <span className="text-[32px] font-bold text-[#1A1916]">₹{course.price.toLocaleString()}</span>
              {course.originalPrice && (
                <span className="text-sm text-gray-400 line-through font-medium">₹{course.originalPrice.toLocaleString()}</span>
              )}
            </div>
          )}
          {course.price > 0 && (
            <div className="mt-2 bg-[#FFF3E0] border border-[#FFF3E0] rounded-xl p-2.5 w-full max-w-xs mx-auto">
              <p className="text-[11px] font-semibold text-[#B45309]">
                🔥 High demand: Only 3 spots left!
              </p>
            </div>
          )}
        </div>
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mt-2">
          Full Lifetime Access Included
        </p>
      </div>

      {/* CTA Button */}
      <div className="px-6 pb-6">
        <button 
          onClick={onEnroll}
          disabled={enrollLoading}
          className="w-full h-14 bg-[#1A3C2E] hover:bg-[#153025] text-white font-semibold text-[17px] tracking-[0.03em] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm cursor-pointer"
        >
          {enrollLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {enrollment ? 'Continue Learning' : 
                 (course.slug === 'summer-camp-2026' ? 'Reserve Your Seat' : 'Enroll Now')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-8 flex gap-3">
        <button 
          onClick={onWishlist}
          className={cn(
            "flex-1 h-12 rounded-xl border border-[#E0DDD6] bg-[#F7F6F2] text-[#4A4A44] text-[14px] font-medium flex items-center justify-center gap-2 transition-all hover:border-[#1A3C2E] hover:text-[#1A3C2E] cursor-pointer",
            isWishlisted && "bg-red-50 border-red-100 text-red-500 hover:text-red-500 hover:border-red-100"
          )}
        >
          <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          {isWishlisted ? 'Saved' : 'Wishlist'}
        </button>
        <button 
          onClick={onShare}
          className="flex-1 h-12 rounded-xl border border-[#E0DDD6] bg-[#F7F6F2] text-[#4A4A44] text-[14px] font-medium flex items-center justify-center gap-2 transition-all hover:border-[#1A3C2E] hover:text-[#1A3C2E] cursor-pointer active:scale-95"
        >
          <Share2 className="w-4 h-4 text-[#1A3C2E]" />
          Share
        </button>
      </div>

      {/* Course Guarantees */}
      <div className="px-6 pb-8 pt-6 border-t border-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <span className="text-[11px] font-bold text-gray-700">Top Rated</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-700">Global Peer Network</span>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-700">Official Certification</span>
          </div>
          <div className="flex items-center gap-3">
            <RefreshCcw className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-700">Lifetime Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}

