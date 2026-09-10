'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isMinimalLayout = pathname?.includes('/assessment') || pathname?.includes('/register');
    // Public pages should have consistent padding to accommodate fixed header
    // Sticky header is in-flow — no top padding needed
    const mainPaddingTop = 'pt-0';
    // Most public pages render a full footer below main content, so adding bottom
    // padding here creates the visible cream gap above the footer.
    // Keep mobile spacing only for minimal flows where the footer is hidden.
    const bottomPadding = isMinimalLayout ? 'pb-24 lg:pb-0' : 'pb-0';

    return (
        <main
            id="main-content"
            className={`${mainPaddingTop} flex-1 w-full bg-transparent min-h-[75vh] ${bottomPadding}`}
        >
            <div className="w-full h-full">
                {children}
            </div>
        </main>
    );
}

