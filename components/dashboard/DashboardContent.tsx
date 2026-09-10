'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';

import TabDashboard from './tabs/TabDashboard';
import TabExplore from './tabs/TabExplore';
import TabMyCourses from './tabs/TabMyCourses';
import TabAssignments from './tabs/TabAssignments';
import TabQA from './tabs/TabQA';
import TabAchievements from './tabs/TabAchievements';
import TabSettings from './tabs/TabSettings';

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const mainHeadingRef = useRef<HTMLHeadingElement>(null);

  // Focus management and scroll reset on tab change
  useEffect(() => {
    if (user) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
          mainHeadingRef.current?.focus();
      }, 100);
    }
  }, [currentTab, user]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto pt-4 pb-20">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'explore': return <TabExplore />;
      case 'dashboard': return <TabDashboard />;
      case 'my-courses': return <TabMyCourses />;
      case 'assignments': return <TabAssignments />;
      case 'qa': return <TabQA />;
      case 'achievements': return <TabAchievements />;
      case 'settings': return <TabSettings />;
      default: return <TabDashboard />;
    }
  };

  return (
    <div id="dashboard-content" className="w-full max-w-[1200px] mx-auto pt-4 pb-20 outline-none pointer-events-auto">
       <div tabIndex={-1} ref={mainHeadingRef} className="outline-none focus:ring-none pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
       </div>
    </div>
  );
}

