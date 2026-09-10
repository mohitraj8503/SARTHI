import { Suspense } from 'react';
import IndustryAutomationClient from './IndustryAutomationClient';

function PageSkeleton() {
  return (
    <div className="relative min-h-screen bg-[#F5F0E8] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#2D6A4F]/5 rounded-full blur-[100px]" />
      </div>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-16 pb-32 relative z-10">
        <div className="mb-12 pt-0">
          <div className="h-4 w-32 bg-[#2D6A4F]/20 rounded animate-pulse mb-3" />
          <div className="h-14 w-full max-w-[500px] bg-[#1A3C2E]/10 rounded animate-pulse mb-4" />
          <div className="h-6 w-full max-w-[400px] bg-[#5D705C]/20 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-[#E8E2D9] rounded-[20px] p-6 h-[280px] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Industry Automation Freelance Hub | SARTHI",
  description: "Connect with industry automation experts. Post projects or find freelance opportunities in PLC, SCADA, robotics, and more.",
};

export default function IndustryAutomationPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <IndustryAutomationClient />
    </Suspense>
  );
}
// Force rebuild: 1776773325

