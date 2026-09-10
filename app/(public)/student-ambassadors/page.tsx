'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/student-ambassadors/Hero';
import StartSomethingBig from '@/components/student-ambassadors/StartSomethingBig';
import GrowAndLead from '@/components/student-ambassadors/GrowAndLead';
import WhatToExpect from '@/components/student-ambassadors/WhatToExpect';
import Milestones from '@/components/student-ambassadors/Milestones';
import StudentResources from '@/components/student-ambassadors/StudentResources';
import FAQ from '@/components/student-ambassadors/FAQ';
import Footer from '@/components/student-ambassadors/Footer';

export default function StudentAmbassadorsPage() {
  const router = useRouter();

  const handleApplyClick = () => {
    router.push('/student-ambassadors/apply');
  };

  return (
    <main id="main-content" className="min-h-screen bg-[#FCFBF8] text-[#111111] selection:bg-[#16A34A]/10 selection:text-[#16A34A]">
      {/* Hero Section */}
      <Hero onApplyClick={handleApplyClick} />

      {/* Start Something Big section */}
      <StartSomethingBig />

      {/* Grow And Lead section */}
      <GrowAndLead />

      {/* What To Expect section */}
      <WhatToExpect onLearnMoreClick={handleApplyClick} />

      {/* Milestones / Milestone levels section */}
      <Milestones />

      {/* Student Resources section */}
      <StudentResources />

      {/* FAQ section */}
      <FAQ />

      {/* Custom Footer */}
      <Footer />
    </main>
  );
}
