'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on dashboard, course player, and onboarding pages
  const hidePaths = [
    '/dashboard',
    '/courses/',
    '/onboarding',
    '/verify',
    '/login',
    '/signup'
  ];

  const shouldHide = hidePaths.some(path => pathname?.startsWith(path));

  if (shouldHide) return null;

  return <Footer />;
}

