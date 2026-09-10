'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import InternshipHero from '@/components/internship/InternshipHero';
import InternshipPriorityHiring from '@/components/internship/InternshipPriorityHiring';
import InternshipStartSomethingBig from '@/components/internship/InternshipStartSomethingBig';
import InternshipGrowAndLead from '@/components/internship/InternshipGrowAndLead';
import InternshipWhatToExpect from '@/components/internship/InternshipWhatToExpect';
import InternshipMilestones from '@/components/internship/InternshipMilestones';
import InternshipResources from '@/components/internship/InternshipResources';
import InternshipAttendancePolicy from '@/components/internship/InternshipAttendancePolicy';
import InternshipTerms from '@/components/internship/InternshipTerms';
import InternshipFAQ from '@/components/internship/InternshipFAQ';
import InternshipFooter from '@/components/internship/InternshipFooter';

export default function PublicInternshipPage() {
  const router = useRouter();

  const handleApplyClick = () => {
    router.push('/internship/apply');
  };

  return (
    <main id="main-content" className="min-h-screen bg-[#FCFBF8] text-[#111111] selection:bg-[#16A34A]/10 selection:text-[#16A34A]">
      {/* 1. Hero Section */}
      <InternshipHero onApplyClick={handleApplyClick} />

      {/* Priority Hiring Section */}
      <InternshipPriorityHiring />

      {/* 2 & 3. Become an Intern & Start Something Big section */}
      <InternshipStartSomethingBig />

      {/* 4 & 5. Your Growth & Feature cards section */}
      <InternshipGrowAndLead />

      {/* 6. What To Expect section */}
      <InternshipWhatToExpect onApplyClick={handleApplyClick} />

      {/* 7. Internship Program + Milestones section */}
      <InternshipMilestones />

      {/* 8. Intern resources section (5 cards) */}
      <InternshipResources />

      {/* 9. Attendance & Certification Policy section */}
      <InternshipAttendancePolicy />

      {/* 10. Terms & Conditions section */}
      <InternshipTerms />

      {/* 11. FAQ section */}
      <InternshipFAQ />

      {/* 12. Footer */}
      <InternshipFooter />
    </main>
  );
}
