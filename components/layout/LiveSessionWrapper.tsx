'use client';

import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  topHeader?: React.ReactNode;
  bottomNav?: React.ReactNode;
  sidebarWidth?: string; // e.g. "lg:ml-[280px]" or "marginLeft: '280px'"
}

export default function LiveSessionWrapper({ 
  children, 
  sidebar, 
  topHeader, 
  bottomNav, 
  sidebarWidth = "280px" 
}: Props) {
  const pathname = usePathname();
  const isLiveSession = pathname?.includes('/live/') || pathname?.includes('/live-class/');
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLiveSession) {
    return (
      <main id="main-content" className="fixed inset-0 z-[9999] w-full h-full flex flex-col overflow-hidden bg-[#090a0f]">
        {children}
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full flex-1">
      {topHeader && React.isValidElement(topHeader) ? React.cloneElement(topHeader as any, { key: 'top-header' }) : topHeader}
      {sidebar && React.isValidElement(sidebar) ? React.cloneElement(sidebar as any, { key: 'main-sidebar' }) : sidebar}
      <main 
        id="main-content" 
        className={cn(
          "flex-1 min-h-screen overflow-auto pt-20 lg:pt-0 transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          sidebarWidth === "280px" ? "lg:ml-[280px]" : (sidebarWidth.startsWith('lg:') ? sidebarWidth : "")
        )}
        style={!sidebarWidth.startsWith('lg:') && sidebarWidth !== "280px" ? { marginLeft: isMobile ? '0px' : sidebarWidth } : {}}
      >
        {children}
      </main>
      {bottomNav}
    </div>
  );
}

