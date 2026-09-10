'use client';

import { useEffect, useReducer, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { storage } from '../../../../lib/storage';
import { cn } from '../../../../lib/utils';
import { useAuth } from '../../../../components/AuthProvider';
import { useEnrollmentStatus } from '../../../../hooks/useEnrollmentStatus';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import {
  Play,
  CheckCircle,
  Star,
  Award,
  ChevronDown,
  Globe,
  PlayCircle,
  Share2,
  Heart,
  FileText,
  Users,
  X,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Mail,
  TrendingUp,
  Code2,
  MessageSquare,
  Sparkles,
  Check,
  Ticket,
  Clock,
  Flame,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useToast } from '../../../../components/ToastProvider';
import { UnifiedVideoPlayer } from '../../../../components/UnifiedVideoPlayer';
import { format, isValid, parseISO } from 'date-fns';
import MobileCourseHeader from '../../../../components/courses/MobileCourseHeader';
import MobileVideoPreview from '../../../../components/courses/MobileVideoPreview';
import MobileWhatYouLearn from '../../../../components/courses/MobileWhatYouLearn';
import MobileStickyCTA from '../../../../components/courses/MobileStickyCTA';
import { ContentRenderer } from '../../../../components/common/ContentRenderer';
import CourseComparisonTable from '../../../../components/courses/CourseComparisonTable';
import ShareModal from '../../../../components/ShareModal';

type TabType = 'Overview' | 'Curriculum' | 'Reviews';

const getCourseDurationShort = (title: string, duration?: number | null) => {
  const lowercaseTitle = title.toLowerCase();
  if (lowercaseTitle.includes('microsoft') || lowercaseTitle.includes('devops')) {
    return "15 Days";
  }
  return "2 Months";
};

interface CourseDetailClientProps {
  course: any;
}

// 🧠 PHASE 1: STATE REFACTOR (Centralized Logic)
type State = {
  activeTab: TabType;
  expandedSections: Set<string>;
  showIntroVideo: boolean;
};

type Action =
  | { type: 'SET_TAB'; payload: TabType }
  | { type: 'TOGGLE_SECTION'; payload: string }
  | { type: 'SET_VIDEO'; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'TOGGLE_SECTION': {
      const next = new Set(state.expandedSections);
      if (next.has(action.payload)) next.delete(action.payload);
      else next.add(action.payload);
      return { ...state, expandedSections: next };
    }
    case 'SET_VIDEO':
      return { ...state, showIntroVideo: action.payload };
    default:
      return state;
  }
}

// ⚠️ PHASE 5: ERROR HANDLING
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-12 text-center bg-[#F5F0E8] font-nunito">
      <div className="w-20 h-20 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
        <X className="w-10 h-10 stroke-[3]" />
      </div>
      <h2 className="text-[28px] font-black text-brand-dark mb-4 font-outfit uppercase">System Error</h2>
      <p className="text-[15px] font-medium text-premium-muted max-w-[400px] leading-relaxed mb-8">{error.message}</p>
      <button onClick={resetErrorBoundary} className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-brand-orange transition-all">
        Retry Load
      </button>
    </div>
  );
}

export default function CourseDetailClientWrapper(props: CourseDetailClientProps) {
  // 🔐 PHASE 7: SECURITY (Slug Validation)
  if (props.course?.slug && !/^[a-z0-9-]+$/.test(props.course.slug)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black text-brand-dark mb-4 font-outfit uppercase">Invalid Resource</h1>
        <p className="text-premium-muted">The requested course URL is malformed.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <CourseDetailClientContent {...props} />
    </ErrorBoundary>
  );
}

const SUMMER_CAMP_CURRICULUM = {
  track1: {
    title: "AI & Automation Bootcamp",
    description: "Learn Python, beginner AI concepts, automation tools, and basic data analytics with hands-on practical projects.",
    badges: ["Beginner Friendly", "Hands-on Projects"],
    modules: [
      {
        id: "sc-t1-m1",
        title: "MODULE 1 — Computer & AI Foundations",
        topics: [
          "Introduction to computers",
          "What is AI?",
          "Real-world AI tools",
          "Internet productivity",
          "Using ChatGPT properly",
          "Beginner tech confidence"
        ]
      },
      {
        id: "sc-t1-m2",
        title: "MODULE 2 — Python for Absolute Beginners",
        topics: [
          "Variables",
          "Input/output",
          "Conditions",
          "Loops",
          "Functions",
          "Mini practice exercises",
          "Logic building"
        ]
      },
      {
        id: "sc-t1-m3",
        title: "MODULE 3 — Automation Basics",
        topics: [
          "Everyday task automation",
          "AI productivity tools",
          "Browser automation basics",
          "Simple workflows",
          "Time-saving tools",
          "AI-assisted work"
        ]
      },
      {
        id: "sc-t1-m4",
        title: "MODULE 4 — Beginner Data Analytics",
        topics: [
          "Intro to NumPy",
          "Intro to Pandas",
          "Reading CSV files",
          "Simple charts",
          "Data cleaning basics",
          "Understanding trends"
        ]
      },
      {
        id: "sc-t1-m5",
        title: "MODULE 5 — Mini AI Projects",
        topics: [
          "AI chatbot basics",
          "Automation mini projects",
          "Productivity tools",
          "Portfolio-ready beginner projects",
          "Team project showcase"
        ]
      }
    ]
  },
  track2: {
    title: "Communication & Confidence Mastery",
    description: "Improve spoken English, confidence, communication skills, personality, and public speaking through practical sessions.",
    badges: ["Beginner Friendly", "Live Practice Sessions"],
    modules: [
      {
        id: "sc-t2-m1",
        title: "MODULE 1 — Spoken English Foundations",
        topics: [
          "Daily English speaking",
          "Vocabulary building",
          "Sentence formation",
          "Grammar basics",
          "Everyday conversations",
          "Pronunciation improvement"
        ]
      },
      {
        id: "sc-t2-m2",
        title: "MODULE 2 — Confidence Building",
        topics: [
          "Removing hesitation",
          "Speaking without fear",
          "Body language basics",
          "Confidence exercises",
          "Personality development",
          "Stage confidence"
        ]
      },
      {
        id: "sc-t2-m3",
        title: "MODULE 3 — Communication Skills",
        topics: [
          "Public speaking basics",
          "Group discussions",
          "Interview communication",
          "Active listening",
          "Presentation skills",
          "Professional communication"
        ]
      },
      {
        id: "sc-t2-m4",
        title: "MODULE 4 — Smart Personality Development",
        topics: [
          "Leadership basics",
          "Discipline & consistency",
          "Professional behavior",
          "Networking basics",
          "Team collaboration",
          "Digital etiquette"
        ]
      },
      {
        id: "sc-t2-m5",
        title: "MODULE 5 — Real Practice Sessions",
        topics: [
          "Mock speaking sessions",
          "Group activities",
          "English conversation practice",
          "Team presentations",
          "Live interaction sessions",
          "Confidence challenges"
        ]
      }
    ]
  }
};

const EXECUTIVE_COURSE_SYLLABI: Record<string, {
  pdfUrl: string;
  creditBadge: string;
  modules: Array<{
    id: string;
    title: string;
    description?: string;
    sessions: Array<{
      sessionNumber: number;
      title: string;
      keyContent: string;
    }>;
  }>;
}> = {};

function CourseDetailClientContent({ course }: CourseDetailClientProps) {
  const [imageError, setImageError] = useState(false);
  const params = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // 📱 Touch optimizations for mobile
  const { useTouchOptimizations } = require('../../../../hooks/useTouchOptimizations');
  useTouchOptimizations();

  const { status: enrollmentStatus, loading: enrollmentLoading } = useEnrollmentStatus(course?.id || null, user?.id || null);
  const enrollment = enrollmentStatus?.enrolled ? enrollmentStatus.enrollment : null;

  // Coupon States for Price Card
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);

  // Set default premium prices (Option 3 initial values)
  const initialOriginal = Number(course?.originalPrice ?? course?.price ?? 999);
  const initialLaunch = Number(course?.price ?? 999);
  const initialLaunchDiscount = Math.max(0, initialOriginal - initialLaunch);

  const [originalPriceVal, setOriginalPriceVal] = useState(initialOriginal);
  const [displayPrice, setDisplayPrice] = useState(initialLaunch); 
  const [displaySavings, setDisplaySavings] = useState(initialLaunchDiscount); 
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  const animateNumber = (start: number, end: number, setter: (val: number) => void) => {
    let current = start;
    const range = end - start;
    const duration = 1200; // ms
    const stepTime = 16;
    const steps = duration / stepTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easedProgress = progress * (2 - progress);
      const val = Math.round(start + range * easedProgress);
      setter(val);

      if (step >= steps) {
        clearInterval(timer);
        setter(end);
      }
    }, stepTime);
  };

  const triggerFireParticles = () => {
    const list = Array.from({ length: 28 }).map((_, idx) => ({
      id: idx,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1 + Math.random() * 1.5
    }));
    setParticles(list);
    setTimeout(() => setParticles([]), 2800);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplying(true);
    setCouponError('');
    setShakeInput(false);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon: couponCode, courseId: course?.id })
      });
      const data = await res.json();

      if (data.valid) {
        if (typeof window !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        setAppliedCoupon(data);
        setOriginalPriceVal(data.originalPrice);
        triggerFireParticles();
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4500);

        animateNumber(data.originalPrice, data.newPrice, setDisplayPrice);
        animateNumber(0, data.discountAmount, setDisplaySavings);
        addToast('Offer Unlocked Successfully!', 'success');
      } else {
        setCouponError(data.message || 'Coupon not found');
        setShakeInput(true);
        setTimeout(() => setShakeInput(false), 500);
      }
    } catch (err) {
      setCouponError('Verification failed');
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    if (!course) return;
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');

    animateNumber(displayPrice, originalPriceVal, setDisplayPrice);
    animateNumber(displaySavings, 0, setDisplaySavings);
    addToast('Coupon removed', 'success');
  };

  // State initialization with useReducer
  const [state, dispatch] = useReducer(reducer, {
    activeTab: 'Overview',
    expandedSections: new Set<string>(
      course?.slug === 'summer-camp-2026'
        ? ['sc-t1-m1', 'sc-t2-m1']
        : EXECUTIVE_COURSE_SYLLABI[course?.slug]?.modules?.[0]
          ? [EXECUTIVE_COURSE_SYLLABI[course.slug].modules[0].id]
          : course?.curriculum?.[0] ? [course.curriculum[0].id] : []
    ),
    showIntroVideo: false,
  });

  const { activeTab, expandedSections, showIntroVideo } = state;
  const isSoumyaCourse = 
    course?.slug?.includes('fintech') || 
    course?.slug?.includes('financial-risk') || 
    course?.slug?.includes('ai-and-machine-learning-in-banking') || 
    course?.slug?.includes('ai-powered-startup') ||
    course?.instructor?.name?.toLowerCase().includes('soumya');

  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [isVerticalVideo, setIsVerticalVideo] = useState(() => {
    const src = (course as any)?.introVideoUrl || '';
    return src.includes('SoumyaDasgupta') || src.includes('916') || src.includes('9-16') || src.includes('reel') || src.endsWith('.mp4');
  });

  useEffect(() => {
    const src = (course as any)?.introVideoUrl || '';
    if (src.includes('SoumyaDasgupta') || src.includes('916') || src.includes('9-16') || src.includes('reel') || src.endsWith('.mp4')) {
      setIsVerticalVideo(true);
    }
  }, [course]);

  // Broadcast video playing state when intro video modal opens or closes
  useEffect(() => {
    if (showIntroVideo) {
      window.dispatchEvent(new CustomEvent('video-play-state', { detail: { isPlaying: true } }));
      document.body.classList.add('video-playing');
    } else {
      window.dispatchEvent(new CustomEvent('video-play-state', { detail: { isPlaying: false } }));
      document.body.classList.remove('video-playing');
    }
    return () => {
      document.body.classList.remove('video-playing');
    };
  }, [showIntroVideo]);

  // ⭐️ WRITE REVIEW STATE & HANDLERS
  const [localSubmittedReviews, setLocalSubmittedReviews] = useState<any[]>([]);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState(user?.name || '');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // ⚡ PHASE 2: DATA FETCHING FIX (React Query)
  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = useQuery({
    queryKey: ['course-reviews', course?.id],
    queryFn: async () => {
      if (!course?.id) return [];
      const res = await fetch(`/api/course-reviews?courseId=${course.id}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const fetchedReviews = Array.isArray(reviewsData) ? reviewsData : (course?.staticReviews || []);
  const reviews = [...localSubmittedReviews, ...fetchedReviews];

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    const newReview = {
      id: `local-rev-${Date.now()}`,
      rating: reviewRating,
      review: reviewComment.trim(),
      createdAt: new Date().toISOString(),
      user: {
        name: reviewName.trim() || user?.name || 'Verified Student',
        image: user?.image || null
      }
    };

    try {
      const res = await fetch('/api/course-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          rating: reviewRating,
          review: reviewComment.trim()
        })
      });

      if (res.ok) {
        refetchReviews?.();
      } else {
        setLocalSubmittedReviews(prev => [newReview, ...prev]);
      }
    } catch (err) {
      setLocalSubmittedReviews(prev => [newReview, ...prev]);
    } finally {
      setIsSubmittingReview(false);
      setReviewSuccessMsg(true);
      setTimeout(() => {
        setReviewSuccessMsg(false);
        setShowWriteReviewModal(false);
        setReviewComment('');
      }, 1500);
    }
  };

  const { data: isWishlisted } = useQuery({
    queryKey: ['wishlist-status', course?.id, user?.id],
    queryFn: async () => {
      if (!user || !course?.id) return false;
      const res = await fetch('/api/student/wishlist');
      if (!res.ok) throw new Error('Failed to fetch wishlist');
      const data = await res.json();
      return data.wishlist?.some((item: any) => item.course.id === course.id);
    },
    enabled: !!user && !!course?.id,
  });


  // Removed scattered useEffects

  // ❤️ PHASE 3: WISHLIST FIX (Optimistic UI via React Query)
  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/student/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course?.id })
      });
      if (!res.ok) throw new Error('API Error');
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['wishlist-status', course?.id, user?.id] });
      const previous = queryClient.getQueryData(['wishlist-status', course?.id, user?.id]);
      queryClient.setQueryData(['wishlist-status', course?.id, user?.id], !previous);
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['wishlist-status', course?.id, user?.id], context?.previous);
      addToast({ type: 'error', title: 'Network Error', message: 'Failed to update wishlist.' });
    },
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: data.status === 'added' ? 'Added to Wishlist' : 'Removed from Wishlist',
        message: data.status === 'added' ? 'Course saved for later.' : 'Course removed from your collection.'
      });
    }
  });

  // Local wishlist fallback state for guest users
  const [localWishlisted, setLocalWishlisted] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !course?.id) return false;
    try {
      const stored = localStorage.getItem(`local_wishlist_${course.id}`);
      return stored === 'true';
    } catch (e) {
      return false;
    }
  });

  const isWishlistedEffective = user ? !!isWishlisted : localWishlisted;

  const toggleWishlist = () => {
    if (user) {
      toggleWishlistMutation.mutate();
    } else {
      const nextState = !localWishlisted;
      setLocalWishlisted(nextState);
      try {
        localStorage.setItem(`local_wishlist_${course.id}`, nextState.toString());
      } catch (e) {}
      addToast({
        type: 'success',
        title: nextState ? 'Saved to Wishlist' : 'Removed from Wishlist',
        message: nextState ? 'Course saved in your collection.' : 'Course removed from your collection.',
      });
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/courses/enroll', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Enrollment failed');
      return data;
    },
    onSuccess: (data) => {
      addToast({ type: 'success', title: 'Enrolled!', message: 'Taking you to your learning path.' });
      setTimeout(() => {
        const targetId = data.invoiceId || data.enrollmentId || 'success';
        router.push(`/enrollment-confirmed/${targetId}?courseId=${course.id}`);
      }, 1000);
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'System Error', message: error.message || 'Something went wrong.' });
    }
  });
  const enrollLoading = enrollMutation.isPending;

  const handleEnroll = async () => {
    if (!course) return;
    if (!user) {
      storage.set('pendingPurchase', { courseId: course.id, title: course.title, price: course.price }, false);
      router.push(`/login?redirect=/courses/${course.slug || course.id}`);
      return;
    }
    if (enrollment) {
      const isMsCourse = course.slug === 'devops-engineering-microsoft-learn' || course.slug === 'cloud-fundamentals-microsoft';
      if (isMsCourse) {
        let externalUrl = 'https://learn.microsoft.com/en-us/plans/30xb6t40g18ey?sharingId=87043F3FB9BF8147&wt.mc_id=studentamb_511525';
        if (course.slug === 'cloud-fundamentals-microsoft') {
          externalUrl = 'https://learn.microsoft.com/en-us/plans/y36setm5126mj?sharingId=87043F3FB9BF8147&wt.mc_id=studentamb_511525';
        }
        window.location.href = externalUrl;
        return;
      }
      router.push(`/courses/${course.slug || course.id}/learn`);
      return;
    }

    if (course.price === 0 || course.pricing_type === 'FREE') {
      enrollMutation.mutate();
    } else {
      fetch('/api/student/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CHECKOUT_START', metadata: { courseId: course.id, title: course.title } })
      }).catch(() => { });
      router.push(`/checkout/${course.slug || course.id}`);
    }
  };

  const setActiveTab = (tab: TabType) => dispatch({ type: 'SET_TAB', payload: tab });
  const toggleSection = (id: string) => dispatch({ type: 'TOGGLE_SECTION', payload: id });
  const setShowIntroVideo = (show: boolean) => dispatch({ type: 'SET_VIDEO', payload: show });

  // 🎈 BUBBLE PARALLAX EFFECT
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const orbs = document.querySelectorAll('.orb-animate');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (0.5 - x) * speed;
        const yOffset = (0.5 - y) * speed;
        (orb as HTMLElement).style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);


  if (enrollmentLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center font-nunito">
        <div className="w-14 h-14 border-4 border-brand-dark/20 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center p-6 text-center font-nunito">
        <div className="max-w-md bg-white p-12 rounded-[3rem] shadow-sm border border-premium-border/40">
          <div className="text-6xl mb-8">🏜️</div>
          <h1 className="text-3xl font-black text-brand-dark mb-4 font-outfit uppercase">Course Retired</h1>
          <p className="text-premium-muted font-medium mb-10">
            This learning path is currently unavailable. Explore our active curriculum to find your next challenge.
          </p>
          <button
            onClick={() => router.push('/courses')}
            className="w-full bg-brand-dark text-white py-5 rounded-2xl font-black uppercase tracking-[2px] hover:bg-brand-orange transition-all font-outfit shadow-xl shadow-brand-dark/10"
          >
            Browse Catalog
          </button>
        </div>
      </div>
    );
  }

  const averageRating = course.rating || 0;
  const reviewCount = reviews.length || course.ratingCount || 0;
  const studentsCount = (course as any).studentsEnrolled || (course as any).students_enrolled || 0;
  const totalLessons = 1000;
  const totalDuration = course.totalDuration || "12h 45m";

  return (
    <div
      className={cn(
        "min-h-screen selection:bg-[#1A3C2E] selection:text-white pb-20 font-plus-jakarta relative overflow-hidden",
        course.slug !== 'summer-camp-2026' && "bg-[#F7F6F2]"
      )}
      style={{
        zoom: 1.25,
        ...(course.slug === 'summer-camp-2026' ? {
          backgroundImage: "linear-gradient(rgba(247, 246, 242, 0.85), rgba(247, 246, 242, 0.85)), url('https://pixabay.com/images/download/foyu-tree-7619534_1920.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        } : {})
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        .font-plus-jakarta {
            font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        .floating-orbs {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        }

        .orb {
            position: absolute;
            border-radius: 50%;
            opacity: 0.08;
            animation: float 20s infinite ease-in-out;
            transition: transform 0.1s ease-out;
        }

        .orb-1 {
            width: 600px;
            height: 600px;
            background: #1A3C2E;
            top: -200px;
            right: -100px;
            animation-delay: 0s;
        }

        .orb-2 {
            width: 400px;
            height: 400px;
            background: #40916C;
            bottom: -100px;
            left: -100px;
            animation-delay: 5s;
        }

        @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 30px) scale(0.9); }
        }
      `}</style>

      <div className="floating-orbs">
        <div className="orb orb-animate orb-1"></div>
        <div className="orb orb-animate orb-2"></div>
      </div>

      {/* 📱 MOBILE LAYOUT - Stack Everything */}
      <div className="lg:hidden">
        <div className="px-4 pt-6">
          <button
            onClick={() => router.push('/courses')}
            className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </button>
        </div>
        <div className="px-4 pb-8 space-y-8">
          <MobileCourseHeader
            course={course}
            averageRating={averageRating}
            reviewCount={reviewCount}
            studentsCount={studentsCount}
            totalLessons={totalLessons}
            onInstructorClick={() => setShowInstructorModal(true)}
          />

          <MobileVideoPreview
            course={course}
            onPlay={() => setShowIntroVideo(true)}
            onEnroll={handleEnroll}
            onWishlist={toggleWishlist}
            onShare={handleShare}
            isWishlisted={isWishlistedEffective}
            enrollLoading={enrollLoading}
            enrollment={enrollment}
          />

          <MobileWhatYouLearn
            benefits={(course as any).what_you_learn || []}
          />

          <div className="space-y-6">
            <div className="flex gap-4 border-b border-gray-200 overflow-x-auto no-scrollbar pb-2">
              {((course.slug === 'summer-camp-2026' ? ['Overview', 'Curriculum', 'Reviews'] : ['Curriculum', 'Reviews']) as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-bold pb-3 px-1 transition-all ${activeTab === tab ? 'text-[#1A3C2E] border-b-4 border-[#1A3C2E]' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={course.slug === 'summer-camp-2026' ? activeTab : (activeTab === 'Overview' ? 'Curriculum' : activeTab)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {activeTab === 'Overview' && course.slug === 'summer-camp-2026' && (
                  <div className="space-y-6 text-left">
                    <div className="text-sm text-[#555550] leading-relaxed px-1">
                      <ContentRenderer content={course.description} />
                    </div>
                  </div>
                )}

                {((activeTab === 'Overview' && course.slug !== 'summer-camp-2026') || activeTab === 'Curriculum') && (
                  <div className="space-y-6">
                    {course.slug === 'summer-camp-2026' ? (
                      /* Custom Mobile Dual-Track Curriculum */
                      <div className="space-y-8 text-left">
                        {/* Section Header */}
                        <div className="space-y-2">
                          <h2 className="text-xl font-extrabold text-[#1A1916] tracking-tight font-plus-jakarta flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#1A3C2E] shrink-0" />
                            Summer Camp Learning Journey
                          </h2>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            Build future-ready AI skills while improving communication, confidence, and English speaking.
                          </p>
                        </div>

                        {/* Track 1 Mobile Card */}
                        <div className="bg-white rounded-2xl border border-[#EEECE6] p-5 shadow-sm space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1A3C2E] flex items-center justify-center shrink-0">
                              <Code2 className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-[#1A1916]">{SUMMER_CAMP_CURRICULUM.track1.title}</h3>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">AI & Tech Track</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed font-normal">{SUMMER_CAMP_CURRICULUM.track1.description}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {SUMMER_CAMP_CURRICULUM.track1.badges.map((badge, idx) => (
                              <span key={idx} className="bg-emerald-50 text-[#1A3C2E] border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
                                {badge}
                              </span>
                            ))}
                          </div>
                          <div className="space-y-3 pt-2">
                            {SUMMER_CAMP_CURRICULUM.track1.modules.map((mod) => (
                              <div key={mod.id} className="border border-gray-100 rounded-xl overflow-hidden bg-[#FBFBFA]">
                                <button
                                  onClick={() => toggleSection(mod.id)}
                                  className="w-full flex justify-between items-center p-3 text-left"
                                >
                                  <span className="text-xs font-bold text-gray-800 uppercase tracking-tight">{mod.title}</span>
                                  <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform", expandedSections.has(mod.id) && "rotate-180")} />
                                </button>
                                {expandedSections.has(mod.id) && (
                                  <div className="p-3 bg-white border-t border-gray-100 space-y-2">
                                    {mod.topics.map((topic, ti) => (
                                      <div key={ti} className="flex items-center gap-2.5">
                                        <div className="w-4.5 h-4.5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                          <Check className="w-3 text-[#1A3C2E]" />
                                        </div>
                                        <span className="text-xs text-gray-600 font-medium">{topic}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Track 2 Mobile Card */}
                        <div className="bg-white rounded-2xl border border-[#EEECE6] p-5 shadow-sm space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-[#1A1916]">{SUMMER_CAMP_CURRICULUM.track2.title}</h3>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Growth & Spoken English Track</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed font-normal">{SUMMER_CAMP_CURRICULUM.track2.description}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {SUMMER_CAMP_CURRICULUM.track2.badges.map((badge, idx) => (
                              <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
                                {badge}
                              </span>
                            ))}
                          </div>
                          <div className="space-y-3 pt-2">
                            {SUMMER_CAMP_CURRICULUM.track2.modules.map((mod) => (
                              <div key={mod.id} className="border border-gray-100 rounded-xl overflow-hidden bg-[#FBFBFA]">
                                <button
                                  onClick={() => toggleSection(mod.id)}
                                  className="w-full flex justify-between items-center p-3 text-left"
                                >
                                  <span className="text-xs font-bold text-gray-800 uppercase tracking-tight">{mod.title}</span>
                                  <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform", expandedSections.has(mod.id) && "rotate-180")} />
                                </button>
                                {expandedSections.has(mod.id) && (
                                  <div className="p-3 bg-white border-t border-gray-100 space-y-2">
                                    {mod.topics.map((topic, ti) => (
                                      <div key={ti} className="flex items-center gap-2.5">
                                        <div className="w-4.5 h-4.5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                          <Check className="w-3 text-indigo-700" />
                                        </div>
                                        <span className="text-xs text-gray-600 font-medium">{topic}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* What Students Will Gain Mobile Section */}
                        <div className="pt-6 border-t border-gray-100 space-y-4">
                          <div>
                            <h2 className="text-lg font-bold text-[#1C1C1A] tracking-tight font-plus-jakarta">What Students Will Gain</h2>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Key skills and outcomes unlocked during this 4-week experience.</p>
                          </div>
                          <div className="grid gap-3">
                            {[
                              { title: "AI Literacy", desc: "Understand and leverage real-world generative AI and automation tools confidently.", emoji: "🤖" },
                              { title: "Beginner Coding Confidence", desc: "Build logic, read files, clean data, and construct basic scripts in Python from scratch.", emoji: "💻" },
                              { title: "Communication Confidence", desc: "Express thoughts clearly, eliminate hesitation, and speak confidently.", emoji: "🗣️" },
                              { title: "English Fluency Improvement", desc: "Daily conversational practice to speak English naturally and build vocabulary.", emoji: "🇬🇧" },
                              { title: "Public Speaking Exposure", desc: "Gain comfort presenting to groups, mock speaking, and removal of stage fear.", emoji: "🎤" },
                              { title: "Productivity Mindset", desc: "Master digital etiquette, time-management, discipline, and digital workflows.", emoji: "🚀" },
                              { title: "Team Collaboration", desc: "Work with peers on team-based mini projects and group activities.", emoji: "👥" },
                              { title: "Portfolio Projects", desc: "Build and showcase real, portfolio-ready mini projects from Day 1.", emoji: "📁" },
                              { title: "Future-Ready Skills", desc: "The perfect blend of code and conversation to stand out in the future.", emoji: "🌟" }
                            ].map((gain, gi) => (
                              <div key={gi} className="bg-white rounded-xl p-4 border border-[#EEECE6] shadow-sm flex items-start gap-3">
                                <div className="text-xl pt-0.5">{gain.emoji}</div>
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold text-gray-900 leading-none">{gain.title}</h4>
                                  <p className="text-[11px] text-gray-500 leading-normal font-medium">{gain.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      course.curriculum?.length > 0 ? (
                        course.curriculum.map((section: any) => (
                          <div key={section.id} className="mobile-card !p-0 overflow-hidden">
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="w-full flex justify-between items-center p-5 bg-white text-left"
                            >
                              <span className="text-sm font-black uppercase tracking-tight font-outfit">{section.title}</span>
                              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.has(section.id) ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.has(section.id) && (
                              <div className="border-t border-gray-50 bg-gray-50/30">
                                {section.lessons?.map((lesson: any) => (
                                  <div key={lesson.id} className="p-4 border-b border-gray-100 last:border-0 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <PlayCircle className="w-4 h-4 text-gray-400" />
                                      <span className="text-xs font-bold text-gray-700">{lesson.title}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400">{lesson.duration || 15}m</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        /* Dummy Curriculum for Mobile */
                        <div className="space-y-3">
                          {[
                            { id: "m1", title: "MODULE 1: Fundamentals", lessons: [{ title: "Installation", duration: 15 }] },
                            { id: "m2", title: "MODULE 2: Control Flow", lessons: [{ title: "Loops", duration: 30 }] }
                          ].map((section: any) => (
                            <div key={section.id} className="mobile-card !p-0 overflow-hidden">
                              <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex justify-between items-center p-5 bg-white text-left"
                              >
                                <span className="text-sm font-black uppercase tracking-tight font-outfit">{section.title}</span>
                                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.has(section.id) || section.id === "m1" ? 'rotate-180' : ''}`} />
                              </button>
                              {(expandedSections.has(section.id) || section.id === "m1") && (
                                <div className="border-t border-gray-50 bg-gray-50/30">
                                  {section.lessons.map((lesson: any, li: number) => (
                                    <div key={li} className="p-4 border-b border-gray-100 last:border-0 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <PlayCircle className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs font-bold text-gray-700">{lesson.title}</span>
                                      </div>
                                      <span className="text-[10px] font-black text-gray-400">{lesson.duration}m</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                )}

                {activeTab === 'Reviews' && (
                  (course.instructorId === 'UNKNOWN' || course.instructor?.id === 'UNKNOWN' || course.instructor?.name === 'Unknown') ? (
                    <div className="p-6 text-center">
                      <p className="text-lg font-bold text-gray-800 leading-relaxed tracking-wide uppercase">
                        REVIEWS NOT AVAILABLE AS TEACHER IS NOT DECIDED YET
                      </p>
                    </div>
                  ) : (
                    course.slug === 'summer-camp-2026' ? (
                      <div className="space-y-4 text-left">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-bold text-[#1C1C1A] tracking-tight font-plus-jakarta">Why Students Are Joining</h2>
                          <span className="text-[9px] font-black text-[#1F5C1F] bg-[#E8F4E8] px-2 py-0.5 rounded border border-[#C8DFC8]">FILLED FAST</span>
                        </div>
                        <div className="space-y-3">
                          {[
                            { name: "Aarav K.", role: "Interested Student", text: "I always wanted to learn coding but most courses felt confusing. This summer camp looks beginner friendly and exciting." },
                            { name: "Riya Sharma", role: "Parent", text: "The curriculum looks practical and structured. I like that students will build projects instead of just watching videos." },
                            { name: "Kabir Patel", role: "Aspiring Developer", text: "The AI and automation part caught my attention. Excited to join and build something real this summer." }
                          ].map((review, i) => (
                            <div key={i} className="bg-white border border-[#EEECE6] rounded-xl p-4 shadow-sm">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-[#1A3C2E] text-white flex items-center justify-center font-bold text-xs">
                                  {review.name[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-xs leading-none">{review.name}</p>
                                  <p className="text-[#1A3C2E] text-[9px] font-bold mt-1 uppercase leading-none">{review.role}</p>
                                </div>
                              </div>
                              <p className="text-gray-600 text-xs italic font-medium leading-relaxed">&quot;{review.text}&quot;</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mobile-card text-center p-6 space-y-3">
                          <div className="text-4xl font-black text-gray-900 font-outfit">{averageRating || '—'}</div>
                          <div className="flex justify-center gap-1 text-[#FFD700]">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-4 h-4 ${i <= averageRating ? 'fill-[#FFD700]' : ''}`} />)}
                          </div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{reviewCount} Verified Reviews</p>
                          <button
                            onClick={() => setShowWriteReviewModal(true)}
                            className="w-full mt-2 py-3 bg-[#1A3C2E] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                          >
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span>Write a Review</span>
                          </button>
                        </div>
                        {reviews.length === 0 ? (
                          <div className="mobile-card text-center p-6 space-y-3">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Be the first to review this course</p>
                            <button
                              onClick={() => setShowWriteReviewModal(true)}
                              className="w-full py-2.5 bg-[#1A3C2E] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span>Add Your Review</span>
                            </button>
                          </div>
                        ) : (
                          reviews.slice(0, 5).map((review: any) => (
                            <div key={review.id} className="mobile-card">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black">
                                  {review.user?.name?.[0] || 'S'}
                                </div>
                                <div>
                                  <p className="text-[11px] font-black text-gray-900 leading-none">{review.user?.name || 'Student'}</p>
                                  <p className="text-[9px] text-gray-400 font-bold mt-1">Recently</p>
                                </div>
                              </div>
                              <p className="text-xs font-medium text-gray-600 italic">&quot;{review.review || 'Excellent course!'}&quot;</p>
                            </div>
                          ))
                        )}
                      </div>
                    )
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <MobileStickyCTA
          course={course}
          onEnroll={handleEnroll}
          enrollLoading={enrollLoading}
          enrollment={enrollment}
        />
      </div>

      {/* 💻 DESKTOP LAYOUT */}
      <main className="hidden lg:block max-w-[1200px] mx-auto px-6 pt-20 lg:pt-28">

        {/* BREADCRUMB / BACK BUTTON */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/courses')}
            className="flex items-center gap-2 text-[#9A9A9A] hover:text-[#1A1A1A] transition-all text-xs font-semibold cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Courses</span>
          </button>
        </div>

        {/* HERO SECTION */}
        <div className="grid lg:grid-cols-[1fr_520px] gap-20 items-center mb-20 relative">
          <div className="space-y-6">
            <span className="inline-block bg-[#E8F4E8] text-[#1F5C1F] border border-[#E8F4E8] rounded-[6px] px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em]">
              {course.category || 'Development'}
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[54px] font-semibold text-[#1A1916] leading-[1.15] tracking-tight font-plus-jakarta"
            >
              {course.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[18px] font-normal text-[#6B6860] leading-[1.8] max-w-[480px]"
            >
              {course.shortDescription && course.shortDescription !== 'undefined' && course.shortDescription !== 'undefined...' ? (
                course.shortDescription
              ) : course.description && course.description !== 'undefined' && course.description !== 'undefined...' ? (
                course.description.replace(/<[^>]*>/g, '').split('.')[0] + '.'
              ) : 'Course by: SARTHI'}
            </motion.p>
            {/* Instructor, Language, Level, Duration, Program type as floating pills */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center gap-2.5 text-xs text-[#9A9A9A]"
            >
              {/* Instructor / Provider Badge */}
              {(() => {
                const isMsCourse = course.slug === 'devops-engineering-microsoft-learn' || course.slug === 'cloud-fundamentals-microsoft';
                if (isMsCourse) {
                  return (
                    <div className="bg-white px-[18px] h-11 flex items-center justify-center rounded-[20px] border-[1.5px] border-[#E0DDD6] shadow-[0_4px_12px_rgba(0,0,0,0.02)] gap-2">
                      <div className="w-[20px] h-[20px] rounded bg-white flex items-center justify-center overflow-hidden shrink-0 relative">
                        <Image
                          src="/images/microsoft-logo.svg"
                          alt="Microsoft"
                          width={20}
                          height={20}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="font-semibold text-[#0078D4] text-[14px]">Microsoft</span>
                    </div>
                  );
                }
                if (course.instructor?.name || course.title.toLowerCase().includes('python')) {
                  return (
                    <button
                      type="button"
                      onClick={() => setShowInstructorModal(true)}
                      className="bg-white px-[18px] h-11 flex items-center justify-center rounded-[20px] border-[1.5px] border-[#E0DDD6] hover:border-[#1A3C2E] shadow-[0_4px_12px_rgba(0,0,0,0.02)] gap-2 transition-all hover:scale-[1.02] cursor-pointer group"
                      title="View Instructor Profile"
                    >
                      <div className="w-[22px] h-[22px] rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 relative border border-gray-200">
                        <Image
                          src={course.instructor?.image || "/sarthi-logo.png"}
                          alt={course.instructor?.name || "Instructor"}
                          width={22}
                          height={22}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-semibold text-[#1A3C2E] text-[14px] group-hover:underline">
                        {course.instructor?.name || 'SARTHI'}
                      </span>
                    </button>
                  );
                }
                return null;
              })()}
              <div className="bg-white px-[18px] h-11 flex items-center justify-center rounded-[20px] border-[1.5px] border-[#E0DDD6] shadow-[0_4px_12px_rgba(0,0,0,0.02)] gap-2">
                <span className="font-medium text-[#4A4A4A] text-[14px] uppercase">{course.level || 'Beginner'}</span>
              </div>
              <div className="bg-white px-[18px] h-11 flex items-center justify-center rounded-[20px] border-[1.5px] border-[#E0DDD6] shadow-[0_4px_12px_rgba(0,0,0,0.02)] gap-2">
                <span className="font-medium text-[#4A4A4A] text-[14px]">{getCourseDurationShort(course.title, course.duration)}</span>
              </div>
              <div className="bg-white px-[18px] h-11 flex items-center justify-center rounded-[20px] border-[1.5px] border-[#E0DDD6] shadow-[0_4px_12px_rgba(0,0,0,0.02)] gap-2">
                <span className="font-medium text-[#4A4A4A] text-[14px]">Self-Paced Learning Program</span>
              </div>
              {isSoumyaCourse && (
                <div className="bg-[#E8F4E8] px-[18px] h-11 flex items-center justify-center rounded-[20px] border-[1.5px] border-[#C8DFC8] shadow-[0_4px_12px_rgba(0,0,0,0.02)] gap-2">
                  <span className="font-extrabold text-[#1F5C1F] text-[14px]">🎓 IIM Graduate x Faculty</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Preview Video */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div
              className="relative aspect-video bg-gray-900 cursor-pointer group overflow-hidden rounded-[28px] border border-white/30"
              style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 40px rgba(0,0,0,0.08), 0 40px 80px rgba(0,0,0,0.06)' }}
              onClick={() => setShowIntroVideo(true)}
            >
              {course.thumbnail && !imageError ? (
                 
                <img
                  src={course.thumbnail.startsWith('http') || course.thumbnail.startsWith('/') ? course.thumbnail : `/${course.thumbnail}`}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out opacity-100 absolute inset-0"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1A3C2E] to-[#40916C] flex items-center justify-center">
                  <span className="text-white/20 font-bold text-3xl font-plus-jakarta tracking-wide">SARTHI</span>
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1A3C2E]">
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  </div>
                </div>
              </div>

              <div className="absolute top-4 left-4 z-10 bg-white/92 backdrop-blur-[8px] py-[5px] px-[12px] rounded-[20px]">
                <span className="text-[#1A1916] text-[11px] font-semibold tracking-wider uppercase">
                  Preview
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ALUMNI WORK AT */}
        <div className="text-center text-[11px] text-[#AAAAAA] tracking-[0.12em] uppercase my-12">
          Our alumni work at &nbsp;Microsoft &middot; Google &middot; Amazon &middot; Meta
        </div>

        {/* 2 COLUMN GRID */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-16 pb-12 mb-24 items-start">

          {/* LEFT COLUMN */}
          <div className="min-w-0 max-w-[820px]">
            {/* TAB NAVIGATION — Premium Bridge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-10 border-b border-gray-100 mb-10 overflow-x-auto no-scrollbar max-w-full"
            >
              {(['Overview', 'Curriculum', 'Reviews'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-4 text-[14px] font-medium transition-all duration-300 whitespace-nowrap outline-none ${activeTab === tab
                    ? 'text-[#1A1A1A]'
                    : 'text-[#9A9A9A] hover:text-[#1A1A1A]'
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabIndicatorDetail"
                      className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#1A3C2E]"
                      transition={{ type: "spring", stiffness: 350, damping: 35 }}
                    />
                  )}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'Overview' && (
                  course.slug === 'summer-camp-2026' ? (
                    /* Custom Summer Camp 2026 Overview */
                    <div className="space-y-8 text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-[2px] bg-[#1A3C2E]" />
                        <h2 className="text-[24px] font-semibold text-[#1C1C1A] tracking-tight font-plus-jakarta">Course Overview</h2>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-5">
                        {((course as any).what_you_learn || [
                          'Master Python foundations and logic building from absolute scratch',
                          'Build automation scripts to make computers do manual work',
                          'Integrate generative AI APIs to build smart utilities',
                          'Develop communication confidence and spoken English clarity',
                        ]).map((benefit: string, i: number) => (
                          <div key={i} className="bg-white rounded-[20px] p-6 flex gap-4 min-h-[100px] border border-[#EEECE6] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-[#C8DFC8] hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] transition-all duration-300 text-left">
                            <div className="w-[20px] h-[20px] rounded-full bg-[#1A3C2E] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                              <Check className="w-3 h-3 text-white stroke-[3.5]" />
                            </div>
                            <p className="text-[15px] font-normal text-[#3A3A36] leading-[1.6]">{benefit}</p>
                          </div>
                        ))}
                      </div>
                      <div className="text-[16px] text-[#555550] leading-[1.8] max-w-[680px] pt-4 text-left font-normal">
                        <ContentRenderer content={course.description} />
                      </div>
                      <CourseComparisonTable />
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <section>
                        <h2 className="text-[24px] font-semibold text-[#1C1C1A] mb-8 tracking-tight font-plus-jakarta">What You&apos;ll Learn</h2>
                        <div className="grid sm:grid-cols-2 gap-4 mb-12">
                          {((course as any).what_you_learn || [
                            'Master production-grade techniques from India\'s leading practitioners',
                            'Direct exposure to industry workflows and specialized implementation focus',
                            'Build complex, portfolio-ready systems using the SARTHI methodology',
                            'Accelerate career growth by mastering the nuances of high-performance work',
                          ]).map((benefit: string, i: number) => (
                            <div key={i} className="bg-white rounded-[20px] p-7 flex gap-5 min-h-[120px] border border-[#EEECE6] shadow-[0_8px_40px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:border-[#C8DFC8] hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)] transition-all duration-300 cursor-default">
                              <div className="w-[22px] h-[22px] rounded-full bg-[#1A3C2E] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                <svg className="w-3.5 h-3.5 text-white stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <p className="text-[16px] font-normal text-[#3A3A36] leading-[1.7]">{benefit}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="pt-[60px] border-t border-gray-100">
                        <h2 className="text-[30px] font-bold text-[#1C1C1A] mb-4 font-plus-jakarta">About this course</h2>
                        <div className="h-[1.5px] bg-[#E8E2D9] w-full mb-6" />
                        <div className="text-[16px] text-[#555550] leading-[1.85] max-w-[620px] space-y-6">
                          <ContentRenderer content={course.description} />
                          {!course.description?.includes('practically') && (
                            <p>This masterclass is designed for those who want to skip the noise and get straight to the implementation. We focus on &quot;The Industry Standard&quot; — ensuring that everything you learn translates directly to professional output and high-bandwidth contributions.</p>
                          )}
                        </div>
                      </section>
                      <CourseComparisonTable />
                    </div>
                  )
                )}

                {activeTab === 'Curriculum' && (
                  <div className="space-y-12">
                    {course.slug === 'summer-camp-2026' ? (
                      /* Redesigned Dual-Track Curriculum for Summer Camp 2026 */
                      <div className="space-y-12">
                        {/* Section Header */}
                        <div className="text-center md:text-left space-y-3 pb-6 border-b border-gray-200/50">
                          <h2 className="text-3xl font-extrabold text-[#1A1916] tracking-tight font-plus-jakarta flex items-center gap-2 justify-center md:justify-start">
                            <Sparkles className="w-6 h-6 text-[#1A3C2E] animate-pulse" />
                            Summer Camp Learning Journey
                          </h2>
                          <p className="text-[16px] text-gray-500 font-medium max-w-2xl leading-relaxed">
                            Build future-ready AI skills while improving communication, confidence, and English speaking.
                          </p>
                        </div>

                        {/* Dual Tracks Columns */}
                        <div className="grid md:grid-cols-2 gap-8 items-start">
                          {/* Track 1: AI & Automation Bootcamp */}
                          <div className="bg-white rounded-3xl border border-[#EEECE6] p-7 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col min-h-[500px]">
                            {/* Track Header */}
                            <div className="space-y-4 mb-6 text-left">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1A3C2E] flex items-center justify-center shadow-inner">
                                <Code2 className="w-6 h-6" />
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-xl font-bold text-[#1A1916] tracking-tight">{SUMMER_CAMP_CURRICULUM.track1.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-normal">{SUMMER_CAMP_CURRICULUM.track1.description}</p>
                              </div>
                              {/* Badges */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {SUMMER_CAMP_CURRICULUM.track1.badges.map((badge, idx) => (
                                  <span key={idx} className="bg-emerald-50 text-[#1A3C2E] border border-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase">
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Track Modules Accordion */}
                            <div className="space-y-4 flex-1 text-left">
                              {SUMMER_CAMP_CURRICULUM.track1.modules.map((mod) => (
                                <div key={mod.id} className="border border-gray-100 rounded-2xl overflow-hidden bg-[#FBFBFA] shadow-sm">
                                  <button
                                    onClick={() => toggleSection(mod.id)}
                                    className={cn(
                                      "w-full flex justify-between items-center p-4 text-left transition-colors",
                                      expandedSections.has(mod.id) ? "bg-emerald-50/20" : "hover:bg-gray-100/30"
                                    )}
                                  >
                                    <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">{mod.title}</span>
                                    <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", expandedSections.has(mod.id) && "rotate-180")} />
                                  </button>
                                  {expandedSections.has(mod.id) && (
                                    <div className="p-4 bg-white border-t border-gray-100 space-y-3">
                                      {mod.topics.map((topic, ti) => (
                                        <div key={ti} className="flex items-center gap-3">
                                          <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                            <Check className="w-3 text-[#1A3C2E]" />
                                          </div>
                                          <span className="text-sm text-gray-600 font-medium">{topic}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Track 2: Growth & Spoken English Track */}
                          <div className="bg-white rounded-3xl border border-[#EEECE6] p-7 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col min-h-[500px]">
                            {/* Track Header */}
                            <div className="space-y-4 mb-6 text-left">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-inner">
                                <MessageSquare className="w-6 h-6" />
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-xl font-bold text-[#1A1916] tracking-tight">{SUMMER_CAMP_CURRICULUM.track2.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-normal">{SUMMER_CAMP_CURRICULUM.track2.description}</p>
                              </div>
                              {/* Badges */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {SUMMER_CAMP_CURRICULUM.track2.badges.map((badge, idx) => (
                                  <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase">
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Track Modules Accordion */}
                            <div className="space-y-4 flex-1 text-left">
                              {SUMMER_CAMP_CURRICULUM.track2.modules.map((mod) => (
                                <div key={mod.id} className="border border-gray-100 rounded-2xl overflow-hidden bg-[#FBFBFA] shadow-sm">
                                  <button
                                    onClick={() => toggleSection(mod.id)}
                                    className={cn(
                                      "w-full flex justify-between items-center p-4 text-left transition-colors",
                                      expandedSections.has(mod.id) ? "bg-indigo-50/20" : "hover:bg-gray-100/30"
                                    )}
                                  >
                                    <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">{mod.title}</span>
                                    <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", expandedSections.has(mod.id) && "rotate-180")} />
                                  </button>
                                  {expandedSections.has(mod.id) && (
                                    <div className="p-4 bg-white border-t border-gray-100 space-y-3">
                                      {mod.topics.map((topic, ti) => (
                                        <div key={ti} className="flex items-center gap-3">
                                          <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                            <Check className="w-3 text-indigo-700" />
                                          </div>
                                          <span className="text-sm text-gray-600 font-medium">{topic}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* What Students Will Gain Section */}
                        <div className="pt-12 border-t border-gray-100 space-y-8">
                          <div className="text-center md:text-left space-y-2">
                            <h2 className="text-2xl font-bold text-[#1C1C1A] tracking-tight font-plus-jakarta">What Students Will Gain</h2>
                            <p className="text-sm text-gray-500 font-medium">Key skills and outcomes unlocked during this 4-week experience.</p>
                          </div>
                          <div className="grid md:grid-cols-3 gap-6 text-left">
                            {[
                              { title: "AI Literacy", desc: "Understand and leverage real-world generative AI and automation tools confidently.", emoji: "🤖" },
                              { title: "Beginner Coding Confidence", desc: "Build logic, read files, clean data, and construct basic scripts in Python from scratch.", emoji: "💻" },
                              { title: "Communication Confidence", desc: "Express thoughts clearly, eliminate hesitation, and speak confidently.", emoji: "🗣️" },
                              { title: "English Fluency Improvement", desc: "Daily conversational practice to speak English naturally and build vocabulary.", emoji: "🇬🇧" },
                              { title: "Public Speaking Exposure", desc: "Gain comfort presenting to groups, mock speaking, and removal of stage fear.", emoji: "🎤" },
                              { title: "Productivity Mindset", desc: "Master digital etiquette, time-management, discipline, and digital workflows.", emoji: "🚀" },
                              { title: "Team Collaboration", desc: "Work with peers on team-based mini projects and group activities.", emoji: "👥" },
                              { title: "Portfolio Projects", desc: "Build and showcase real, portfolio-ready mini projects from Day 1.", emoji: "📁" },
                              { title: "Future-Ready Skills", desc: "The perfect blend of code and conversation to stand out in the future.", emoji: "🌟" }
                            ].map((gain, gi) => (
                              <div key={gi} className="bg-white rounded-2xl p-6 border border-[#EEECE6] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4">
                                <div className="text-2xl pt-0.5">{gain.emoji}</div>
                                <div className="space-y-1.5">
                                  <h4 className="text-sm font-bold text-gray-900 leading-none">{gain.title}</h4>
                                  <p className="text-[12px] text-gray-500 leading-normal font-medium">{gain.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : EXECUTIVE_COURSE_SYLLABI[course.slug] ? (
                      /* Executive Masterclass 20-Session Brochure Syllabus Breakdown */
                      <div className="space-y-6 text-left">
                        {/* Brochure Header Banner */}
                        <div className="bg-gradient-to-br from-[#1A3C2E] via-[#153025] to-[#0D1F18] rounded-3xl p-6 md:p-8 text-white shadow-xl space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h3 className="text-2xl font-black font-plus-jakarta tracking-tight text-white">
                                Full 20-Session Executive Syllabus Breakdown
                              </h3>
                              <p className="text-stone-300 text-xs font-medium max-w-xl">
                                Official curriculum structure aligned with B-School credit standards and corporate learning outcomes.
                              </p>
                            </div>
                            {(course.syllabusUrl || EXECUTIVE_COURSE_SYLLABI[course.slug].pdfUrl) && (
                              <a
                                href={course.syllabusUrl || EXECUTIVE_COURSE_SYLLABI[course.slug].pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-[#1A3C2E] font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
                              >
                                <FileText className="w-4 h-4 text-red-600" />
                                <span>Download PDF Brochure</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Modules Accordion */}
                        <div className="space-y-4">
                          {EXECUTIVE_COURSE_SYLLABI[course.slug].modules.map((mod) => (
                            <div key={mod.id} className="border border-[#EEECE6] rounded-2xl overflow-hidden bg-white shadow-sm hover:border-[#1A3C2E] transition-all">
                              <button
                                onClick={() => toggleSection(mod.id)}
                                className={cn(
                                  "w-full flex justify-between items-center p-5 text-left transition-colors cursor-pointer",
                                  expandedSections.has(mod.id) ? "bg-[#E8F4E8]/40" : "hover:bg-gray-50"
                                )}
                              >
                                <div>
                                  <span className="text-base font-extrabold text-[#1C1C1A] tracking-tight block font-plus-jakarta">
                                    {mod.title}
                                  </span>
                                  {mod.description && (
                                    <span className="text-xs text-gray-500 font-medium block mt-0.5">
                                      {mod.description}
                                    </span>
                                  )}
                                </div>
                                <ChevronDown className={cn("w-5 h-5 text-[#1A3C2E] transition-transform shrink-0 ml-3", expandedSections.has(mod.id) && "rotate-180")} />
                              </button>

                              {expandedSections.has(mod.id) && (
                                <div className="border-t border-[#EEECE6] divide-y divide-gray-100 bg-[#FBFAF7] p-4 space-y-3">
                                  {mod.sessions.map((s) => (
                                    <div key={s.sessionNumber} className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs space-y-1.5">
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <span className="px-2.5 py-0.5 bg-[#1A3C2E] text-white rounded-md text-[10px] font-black uppercase tracking-wider">
                                            Session {s.sessionNumber}
                                          </span>
                                          <h4 className="text-sm font-bold text-gray-900 leading-snug">
                                            {s.title}
                                          </h4>
                                        </div>
                                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                                          90 Mins
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600 font-normal leading-relaxed pl-1">
                                        <span className="font-semibold text-gray-700">Key Content:</span> {s.keyContent}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : course.curriculum?.length > 0 ? (
                        <div className="space-y-4">
                          {course.curriculum.map((section: any) => (
                            <div key={section.id} className="border border-gray-100 rounded-2xl overflow-hidden bg-[#FBFBFA] shadow-sm">
                              <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex justify-between items-center p-6 text-left"
                              >
                                <span className="text-base font-bold text-gray-800 uppercase tracking-tight">{section.title}</span>
                                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", expandedSections.has(section.id) && "rotate-180")} />
                              </button>
                              {expandedSections.has(section.id) && (
                                <div className="border-t border-gray-50 divide-y divide-gray-50">
                                  {section.lessons.map((lesson: any, li: number) => (
                                    <div key={li} className="flex items-center justify-between p-5">
                                      <div className="flex items-center gap-4">
                                        <PlayCircle className="w-4 h-4 text-gray-300" />
                                        <span className="text-sm font-semibold text-gray-700">{lesson.title}</span>
                                      </div>
                                      <span className="text-xs font-bold text-gray-400">{lesson.duration}m</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No curriculum available</p>
                        </div>
                      )}
                    </div>
                )}

                {activeTab === 'Reviews' && (
                  (course.instructorId === 'UNKNOWN' || course.instructor?.id === 'UNKNOWN' || course.instructor?.name === 'Unknown') ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center min-h-[250px]">
                      <p className="text-3xl md:text-4xl font-extrabold text-[#1A1916] leading-relaxed tracking-wider uppercase max-w-3xl">
                        REVIEWS NOT AVAILABLE AS TEACHER IS NOT DECIDED YET
                      </p>
                    </div>
                  ) : (
                    course.slug === 'summer-camp-2026' ? (
                      /* Custom Reviews for Summer Camp 2026 */
                      <div className="space-y-8 font-normal">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                          <div className="space-y-1">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-[2px] bg-[#1A3C2E]" />
                              <h2 className="text-[24px] font-semibold text-[#1C1C1A] tracking-tight font-plus-jakarta">Why Students Are Joining</h2>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Hear from parents and students who have already reserved their spots.</p>
                          </div>
                          <div className="inline-flex items-center px-4 py-2 rounded-xl bg-[#E8F4E8] border border-[#C8DFC8] text-[#1F5C1F] font-bold text-sm">
                            🔥 Summer Batch Filling Fast
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 text-left">
                          {[
                            { name: "Aarav K.", role: "Interested Student", text: "I always wanted to learn coding but most courses felt confusing. This summer camp looks beginner friendly and exciting." },
                            { name: "Riya Sharma", role: "Parent", text: "The curriculum looks practical and structured. I like that students will build projects instead of just watching videos." },
                            { name: "Kabir Patel", role: "Aspiring Developer", text: "The AI and automation part caught my attention. Excited to join and build something real this summer." },
                            { name: "Sneha Verma", role: "School Student", text: "I liked how the course starts slowly from basics. The weekly projects make it more fun." }
                          ].map((review, i) => (
                            <div key={i} className="bg-white border border-[#EEECE6] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[#1A3C2E] text-white flex items-center justify-center font-bold text-sm">
                                  {review.name[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                                  <p className="text-[#1A3C2E] text-[10px] font-bold uppercase tracking-wider mt-0.5">{review.role}</p>
                                </div>
                              </div>
                              <p className="text-gray-600 text-[14px] leading-relaxed italic">&quot;{review.text}&quot;</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm space-y-3">
                          <div className="text-5xl font-extrabold text-gray-900">
                            {averageRating > 0 ? averageRating : '—'}
                          </div>
                          <div className="flex justify-center gap-1.5 text-[#FFD700]">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${i <= Math.round(averageRating) ? 'fill-[#FFD700]' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                            {reviewCount > 0 ? `${reviewCount} Verified Reviews` : 'No Feedback Yet'}
                          </p>
                          <div className="pt-2">
                            <button
                              onClick={() => setShowWriteReviewModal(true)}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A3C2E] hover:bg-[#153025] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span>Write a Review</span>
                            </button>
                          </div>
                        </div>

                        {reviewsLoading ? (
                          <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1A3C2E] rounded-full animate-spin" />
                          </div>
                        ) : reviews.length > 0 ? (
                          <div className="grid md:grid-cols-2 gap-6">
                            {reviews.map((review, i) => (
                              <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-10 h-10 rounded-xl bg-[#1A3C2E] text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                                    {review.user?.image || review.user?.avatar_url ? (
                                      <Image
                                        src={review.user.image || review.user.avatar_url}
                                        alt={review.user.name || 'Student'}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span>{review.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'S'}</span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">{review.user?.name || 'Verified Student'}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                      {(() => {
                                        const d = typeof review.createdAt === 'string' ? parseISO(review.createdAt) : review.createdAt;
                                        return isValid(d) ? format(d as Date, 'MMM d, yyyy') : 'Recently';
                                      })()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1 text-[#FFD700] mb-3">
                                  {[1, 2, 3, 4, 5].map(j => (
                                    <Star key={j} className={`w-3 h-3 ${j <= review.rating ? 'fill-[#FFD700]' : 'text-gray-200'}`} />
                                  ))}
                                </div>
                                {review.review && (
                                  <p className="text-base text-gray-800 leading-relaxed font-medium">
                                    &quot;{review.review}&quot;
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Be the first to review this course</p>
                            <button
                              onClick={() => setShowWriteReviewModal(true)}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A3C2E] hover:bg-[#153025] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span>Add Your Review</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN — Sticky Enrollment Card */}
          <div className="lg:sticky lg:top-28 z-40 self-start">
            {/* CSS Keyframe Animations for Course Detail Price Card */}
            <style jsx global>{`
              @keyframes rise-spark {
                0% { transform: translateY(100%) scale(0.3); opacity: 0; }
                20% { opacity: 0.9; }
                100% { transform: translateY(-130px) scale(1.3); opacity: 0; }
              }
              @keyframes path-glow {
                0%, 100% { box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.1); }
                50% { box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.35); }
              }
              @keyframes slide-pop {
                0% { transform: scale(0.95); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
              }
              .spark-particle {
                position: absolute;
                bottom: 0;
                width: 8px;
                height: 8px;
                background: linear-gradient(to top, #f97316, #fbbf24);
                border-radius: 50%;
                filter: blur(1px);
                animation: rise-spark 1.8s ease-in infinite;
              }
              .card-premium-glow {
                animation: path-glow 3s infinite ease-in-out;
                border-color: rgba(16, 185, 129, 0.3) !important;
              }
              .animate-shimmer-btn {
                background: linear-gradient(90deg, #1a3c2e 25%, #0d9488 50%, #1a3c2e 75%);
                background-size: 200% 100%;
                animation: shine 2.5s infinite linear;
              }
              .animate-pop-in {
                animation: slide-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}</style>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={cn(
                "bg-white rounded-[24px] border border-[#EEECE6] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 relative",
                course.slug === 'summer-camp-2026' ? "p-6.5 space-y-5" : "p-8 space-y-6",
                appliedCoupon ? "card-premium-glow" : ""
              )}
            >
              {/* Dynamic rising fire sparks */}
              <div className="absolute inset-x-0 bottom-0 h-28 overflow-hidden pointer-events-none z-10">
                {particles.map(p => (
                  <div 
                    key={p.id}
                    className="spark-particle"
                    style={{
                      left: `${p.left}%`,
                      animationDelay: `${p.delay}s`,
                      animationDuration: `${p.duration}s`
                    }}
                  />
                ))}
              </div>

              {/* Price card Header */}
              {course.price === 0 || course.pricing_type === 'FREE' ? (
                <div className="space-y-2 mb-6">
                  <div className="text-[42px] font-bold text-[#1A1916] tracking-tight leading-none font-plus-jakarta">
                    Free Access
                  </div>
                  <div className="text-[#6B6860] text-[14px] font-medium space-y-1.5 mt-2">
                    <p>📅 Duration: {getCourseDurationShort(course.title, course.duration)}</p>
                    <p>⚡ Self-Paced Learning Program</p>
                  </div>
                  <div className="border-t border-[#F0EDE6] pt-4" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[42px] font-bold text-[#1A1916] tracking-tight leading-none font-plus-jakarta flex items-baseline">
                      ₹{displayPrice.toLocaleString()}
                    </div>
                    {appliedCoupon ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-500 ml-auto animate-pulse">
                        🔥 EXTRA {appliedCoupon.discountValue}% OFF
                      </span>
                    ) : (
                      initialLaunchDiscount > 0 && (
                        <span className="bg-[#FFF3E0] text-[#B45309] text-[13px] font-semibold px-2.5 py-0.5 rounded-full border border-[#FFF3E0] ml-auto">
                          {Math.round((initialLaunchDiscount / initialOriginal) * 100)}% Off
                        </span>
                      )
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] text-[#9A9A94] line-through font-normal">
                      ₹{originalPriceVal.toLocaleString()}
                    </span>
                    {appliedCoupon && (
                      <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">
                        Offer Unlocked
                      </span>
                    )}
                  </div>

                  <div className="text-[#6B6860] text-[14px] font-medium space-y-1.5 pt-1">
                    <p>📅 Duration: {getCourseDurationShort(course.title, course.duration)}</p>
                    <p>⚡ Self-Paced Learning Program</p>
                  </div>
                  <div className="border-t border-[#F0EDE6]" />
                </div>
              )}

              {/* Celebration Overlay Alert Banner */}
              {showCelebration && (
                <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-xl text-xs font-bold space-y-1 animate-pop-in z-20 relative">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                    <p className="uppercase tracking-wider text-[10px]">🔥 Offer Unlocked</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col justify-start items-start gap-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">One-Time Payment</span>
                      <div className="text-[52px] font-black text-[#1A1916] tracking-tighter leading-none font-plus-jakarta flex items-baseline">
                        ₹{displayPrice.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-[#9A9A94] line-through font-normal">
                        ₹{originalPriceVal.toLocaleString()}
                      </span>
                      {appliedCoupon ? (
                        <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full animate-pulse">
                          🔥 VERIFIED PARTNER OFFER - {appliedCoupon.discountValue}% OFF
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          LIMITED LAUNCH OFFER
                        </span>
                      )}
                    </div>

                    <div className="text-[#6B6860] text-[13px] font-medium space-y-1.5 pt-1 border-t border-slate-100">
                      <p>📅 Duration: {getCourseDurationShort(course.title, course.duration)}</p>
                      <p>⚡ Self-Paced Learning Program</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Class availability Progress Bar */}
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-[11px] text-[#7A7A74] font-bold uppercase tracking-wider">
                  <span>Class availability</span>
                  <span>85% full</span>
                </div>
                <div className="w-full h-[6px] bg-[#EDE9E0] rounded-[3px] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#2D6A2D] to-[#52A852] rounded-[3px]" style={{ width: '85%' }} />
                </div>
              </div>

              {/* Secure Checkout / Enroll Button */}
              <button
                onClick={() => {
                  if (appliedCoupon) {
                    router.push(`/checkout/${course.slug || course.id}?ref=${appliedCoupon.code}&token=${appliedCoupon.validatedCouponToken}&price=${appliedCoupon.newPrice}&original=${appliedCoupon.originalPrice}`);
                  } else {
                    handleEnroll();
                  }
                }}
                disabled={enrollLoading}
                className={cn(
                  "w-full text-white rounded-[16px] font-black uppercase text-xs tracking-widest cursor-pointer active:scale-[0.98] transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] relative z-10 p-[18px]",
                  appliedCoupon ? "animate-shimmer-btn" : "bg-[#1A3C2E] hover:bg-[#153025]"
                )}
              >
                {enrollLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{enrollment ? '🚀 Start Course' : '🚀 Register Now'}</span>
                  </>
                )}
              </button>

              {/* Trust Indicators Checklist */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 pt-2 border-t border-slate-100 z-10 relative">
                <div>✓ GST Invoice</div>
                <div>✓ Razorpay Secure</div>
                <div>✓ Lifetime Access</div>
                <div>✓ Verified Certificate</div>
                <div>✓ 14-Day Support</div>
                <div>✓ Instant Enrollment</div>
              </div>



              {/* 6. Wishlist + Share row */}
              <div className="flex gap-3 z-10 relative">
                <button
                  onClick={toggleWishlist}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 h-11 bg-transparent border border-[#E0DDD6] rounded-[10px] text-[14px] font-medium text-[#4A4A44] hover:bg-gray-50 hover:border-[#1A3C2E] hover:text-[#1A3C2E] transition-all cursor-pointer",
                    isWishlistedEffective && "text-red-500 border-red-200 bg-red-50/50 hover:bg-red-50/50"
                  )}
                >
                  <Heart className={cn("w-4 h-4", isWishlistedEffective && "fill-current text-red-500")} />
                  <span>{isWishlistedEffective ? 'Saved' : 'Wishlist'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-transparent border border-[#E0DDD6] rounded-[10px] text-[14px] font-medium text-[#4A4A44] hover:bg-gray-50 hover:border-[#1A3C2E] hover:text-[#1A3C2E] transition-all cursor-pointer active:scale-95"
                >
                  <Share2 className="w-4 h-4 text-[#1A3C2E]" />
                  <span>Share</span>
                </button>
              </div>

              {/* 6b. Download Course Brochure PDF Button */}
              {course.syllabusUrl && (
                <a
                  href={course.syllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border-2 border-[#1A3C2E] bg-[#E8F4E8] text-[#1A3C2E] font-bold text-sm hover:bg-[#1A3C2E] hover:text-white transition-all shadow-sm group z-10 relative"
                >
                  <FileText className="w-4 h-4 text-[#1A3C2E] group-hover:text-white" />
                  <span>Download Course Brochure (PDF)</span>
                </a>
              )}

              {/* 7. Guarantee text */}
              <div className="text-center py-2 text-[13px] text-[#9A9A9A] font-medium border-t border-gray-55 mt-4 pt-4 z-10 relative">
                SSL secured &middot; 14-day guarantee
              </div>

              {/* 8. This course includes list */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <p className="text-[12px] text-gray-500 text-center font-medium">This course includes</p>
                <div className="divide-y divide-[#F0EDE6]">
                  <div className="flex items-center gap-3.5 py-2.5 text-[#3A3A36]">
                    <PlayCircle className="w-4 h-4 text-[#1A3C2E] shrink-0" />
                    <span className="text-[16px] font-normal leading-none">
                      {totalLessons > 0 ? `${totalLessons} practical video lessons` : 'Practical video lessons'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3.5 py-2.5 text-[#3A3A36]">
                    <Award className="w-4 h-4 text-[#1A3C2E] shrink-0" />
                    <span className="text-[16px] font-normal leading-none">Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3.5 py-2.5 text-[#3A3A36]">
                    <Globe className="w-4 h-4 text-[#1A3C2E] shrink-0" />
                    <span className="text-[16px] font-normal leading-none">Lifetime course access</span>
                  </div>
                  <div className="flex items-center gap-3.5 py-2.5 text-[#3A3A36]">
                    <Users className="w-4 h-4 text-[#1A3C2E] shrink-0" />
                    <span className="text-[16px] font-normal leading-none">Access on mobile & desktop</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {showIntroVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 sm:backdrop-blur-2xl flex items-center justify-center p-2 sm:p-6 md:p-10"
            onClick={() => setShowIntroVideo(false)}
          >
            {/* Top-Right Floating Glass Close Button */}
            <button
              onClick={() => setShowIntroVideo(false)}
              className="fixed top-4 right-4 sm:top-8 sm:right-8 text-white z-[130] bg-black/70 hover:bg-black backdrop-blur-xl p-3 rounded-full border border-white/20 transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xl"
              aria-label="Close video preview"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "bg-black overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.9)] relative transition-all duration-300 flex items-center justify-center",
                isVerticalVideo
                  ? "w-full max-h-[100%] h-full sm:h-[88vh] sm:max-h-[840px] sm:max-w-[440px] sm:aspect-[9/16] sm:rounded-3xl sm:border sm:border-white/15"
                  : "w-full max-w-6xl aspect-video rounded-3xl border border-white/15"
              )}
            >
              {(course.instructorId === 'UNKNOWN' || course.instructor?.id === 'UNKNOWN' || course.instructor?.name === 'Unknown') ? (
                <div className="w-full h-full bg-[#030712] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-[40%] h-[40%] bg-[#f59e0b]/[0.03] blur-[100px] absolute top-10 left-10" />
                    <div className="w-[40%] h-[40%] bg-[#1A3C2E]/[0.03] blur-[100px] absolute bottom-10 right-10" />
                  </div>

                  <div className="w-20 h-20 bg-white/[0.02] border border-white/10 rounded-full flex items-center justify-center mb-8 shadow-2xl backdrop-blur-md">
                    <span className="text-4xl text-[#f59e0b] animate-pulse">🎬</span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider mb-4 font-plus-jakarta">
                    PREVIEW UNAVAILABLE
                  </h3>

                  <p className="text-slate-400 text-base md:text-lg font-bold max-w-lg leading-relaxed uppercase tracking-widest">
                    NO VIDEO CAUSE NO TEACHER
                  </p>
                </div>
              ) : (
                <UnifiedVideoPlayer
                  src={(course as any).introVideoUrl}
                  youtubeId={(course as any).youtubeVideoId}
                  muxPlaybackId={(course as any).muxPlaybackId}
                  title={`Masterclass Preview: ${course.title}`}
                  autoplay={true}
                  muted={false}
                  controls={false}
                  playsInline={true}
                  enableHaptics={true}
                  enableKeyboardShortcuts={true}
                  enableMobileControls={true}
                  onAspectRatioDetect={(isVert) => setIsVerticalVideo(isVert)}
                  captions={[]}
                  className="w-full h-full"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INSTRUCTOR MODAL */}
      <AnimatePresence>
        {showInstructorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={() => setShowInstructorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl relative border border-[#E0DDD6] max-h-[85vh] overflow-y-auto pb-6 sm:pb-8 text-left"
            >
              <button
                onClick={() => setShowInstructorModal(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-1.5 sm:p-2 rounded-full transition-colors z-20 cursor-pointer shadow-sm"
                aria-label="Close profile"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex flex-row sm:flex-row items-center sm:items-start gap-3 sm:gap-6 mb-4 sm:mb-6 pt-1 sm:pt-0 pr-8 sm:pr-0">
                <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg border-2 border-[#1A3C2E] shrink-0 relative bg-slate-100">
                  <Image
                    src={course.instructor?.image || "/teachers/soumya-dasgupta.png"}
                    alt={course.instructor?.name || "Instructor"}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="text-left space-y-0.5 sm:space-y-1 min-w-0">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F4E8] text-[#1F5C1F] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-0.5">
                    <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Verified Lead Instructor
                  </div>
                  <h3 className="text-base sm:text-2xl font-black text-[#1C1C1A] font-plus-jakarta truncate">
                    {course.instructor?.name || "Soumya Dasgupta"}
                  </h3>
                  <p className="text-[11px] sm:text-sm font-bold text-[#1A3C2E] line-clamp-2 leading-tight">
                    {course.instructor?.headline || "MBA (IIM Calcutta) · FRM® · TOGAF 9 · ITIL V3"}
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 truncate">
                    {course.instructor?.company || "CBO & Co-Founder, Connectingdot Consultancy Pvt Ltd"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 text-left border-t border-gray-100 pt-3.5 sm:pt-5">
                <h4 className="text-[11px] sm:text-sm font-bold text-[#1C1C1A] uppercase tracking-wider font-plus-jakarta">About the Facilitator</h4>
                <div className="text-[11px] sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed font-normal bg-[#FBFAF7] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-[#EEECE6] max-h-[35vh] sm:max-h-none overflow-y-auto">
                  {course.instructor?.bio || `MBA (IIM Calcutta) · FRM® · TOGAF 9 · ITIL V3
CBO & Co-Founder, Connectingdot Consultancy Pvt Ltd
• 20+ Years Global Experience across FinTech, Financial Risk, AI in Banking, and Startup Incubation.
• 500+ Professionals & Students Trained | Visiting Guest Faculty across 6 IIMs (IIM Calcutta, Udaipur, Sirmaur, Lucknow, Vizag, Shillong), ICSI, and AIMK.
• Creator of LADA AI/ML credit risk platform deployed live in banks and NBFCs across India & Bangladesh (Patent Pending No. 202331054743, Winner — Global Banking & Finance Excellence Award 2025).
• Banking Training Delivered: BIRD (NABARD), IndusInd Bank, Axis Bank (Risk Academy & Corporate Banking), Hero Fincorp, SEMS Welfare Foundation.
• Global Experience: Accenture Financial Risk Advisory (US, Saudi Arabia), Credit Suisse Singapore (Cognizant), TCS, IRIS Software.
• Contact: soumyacdpl@gmail.com | (+91) 98865 96800`}
                </div>

                <h4 className="text-[11px] sm:text-sm font-bold text-[#1C1C1A] uppercase tracking-wider font-plus-jakarta pt-2 sm:pt-3">Related Specialized IMD Programs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    {
                      title: "AI & Deep Learning for NWP",
                      slug: "ai-ml-numerical-weather-prediction",
                      badge: "AI/ML Modeling"
                    },
                    {
                      title: "Doppler Weather Radar (DWR) Nowcasting",
                      slug: "doppler-weather-radar-nowcasting",
                      badge: "Radar Operations"
                    },
                    {
                      title: "Satellite Meteorology: INSAT-3D/3DR",
                      slug: "satellite-meteorology-insat-3d",
                      badge: "Satellite Imagery"
                    },
                    {
                      title: "Tropical Cyclone Early Warning Systems",
                      slug: "tropical-cyclone-warning-systems",
                      badge: "Disaster Warning"
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white border border-[#EEECE6] rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 shadow-sm hover:border-[#1A3C2E] transition-all flex flex-col justify-between">
                      <span className="font-bold text-[11px] sm:text-xs text-[#1C1C1A] mb-1.5">{item.title}</span>
                      <div className="flex items-center gap-2 mt-auto pt-1.5 border-t border-gray-100">
                        <a
                          href={`/courses/${item.slug}`}
                          className="text-[10px] sm:text-[11px] font-bold text-[#1A3C2E] hover:underline"
                        >
                          View Course →
                        </a>
                        <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 ml-auto">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WRITE REVIEW MODAL */}
        <AnimatePresence>
          {showWriteReviewModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setShowWriteReviewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-gray-100 overflow-hidden text-left"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 font-plus-jakarta">Write a Course Review</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">{course.title}</p>
                  </div>
                  <button
                    onClick={() => setShowWriteReviewModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {reviewSuccessMsg ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                      ✓
                    </div>
                    <h4 className="text-lg font-black text-gray-900">Thank You!</h4>
                    <p className="text-xs text-gray-600 font-medium">Your course review has been submitted successfully.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    {/* Rating Stars */}
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-2">
                        Overall Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setReviewRating(star)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= (hoverRating || reviewRating)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-300'
                              } transition-colors`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-bold text-gray-500 font-mono">
                          {hoverRating || reviewRating} / 5
                        </span>
                      </div>
                    </div>

                    {/* Name Input */}
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#1A3C2E] focus:outline-none transition-all"
                      />
                    </div>

                    {/* Review Comment Textarea */}
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                        Your Feedback / Review <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share what you liked about this course, key takeaways, or feedback..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#1A3C2E] focus:outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !reviewComment.trim()}
                      className="w-full py-3.5 bg-[#1A3C2E] hover:bg-[#143025] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      {isSubmittingReview ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>Submit Review</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={course.title}
          url={typeof window !== 'undefined' ? window.location.href : `https://sarthi-woad.vercel.app/courses/${course.slug}`}
          description={course.shortDescription || course.description?.substring(0, 120)}
          image={course.thumbnail}
          badge={course.category || 'Masterclass'}
        />

    </div>
  );
}

function IncludeItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3.5 py-2.5 border-b border-[#F5F0E8] last:border-0 h-11">
      <div className="text-[#2D6A4F] shrink-0">{icon}</div>
      <span className="text-[14px] font-medium text-[#1A3C2E]">{text}</span>
    </div>
  );
}
