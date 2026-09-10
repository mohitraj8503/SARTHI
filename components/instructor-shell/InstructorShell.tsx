'use client';

import { useState } from 'react';
import { InstructorSidebar } from './InstructorSidebar';
import { TopNav } from '@/components/dashboard-shell/TopNav';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';
import Link from 'next/link';

export function InstructorShell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-sidebar-bg flex">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
                <InstructorSidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar-bg z-50 lg:hidden border-r border-sidebar-border shadow-2xl"
                        >
                            <div className="flex justify-end p-4">
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-muted rounded-full">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                            <InstructorSidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background transition-all duration-300">
                <TopNav onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

