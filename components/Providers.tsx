'use client';

import { AuthProvider } from './AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RealTimeProvider } from './RealTimeProvider';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from './ToastProvider';
import { LazyMotion, domAnimation } from 'framer-motion';
import dynamic from 'next/dynamic';

// Defer Lenis smooth scroll — loads AFTER page is interactive, saving ~90ms TBT
const SmoothScrollProvider = dynamic(() => import('./SmoothScrollProvider'), {
  ssr: false,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation}>
        <SmoothScrollProvider>
          <AuthProvider>
            <RealTimeProvider>
              <ToastProvider>{children}</ToastProvider>
            </RealTimeProvider>
          </AuthProvider>
        </SmoothScrollProvider>
      </LazyMotion>
    </QueryClientProvider>
  );
}

