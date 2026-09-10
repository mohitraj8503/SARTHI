'use client';

import { useRouter } from 'next/navigation';

import { useAuth } from './AuthProvider';

export default function StickyCTA() {
  const router = useRouter();
  const { user } = useAuth();

  const handleStartLearning = () => {
    if (user) {
      router.push('/courses');
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 md:hidden gpu-accelerated stable-layout">
      <div className="mx-auto max-w-screen-md px-4 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <button
          onClick={handleStartLearning}
          className="h-12 w-full grid place-items-center rounded-2xl bg-[#FF3A00] text-white font-semibold shadow-lg transform-gpu smooth-animation"
        >
          Start Learning
        </button>
      </div>
    </div>
  );
}

