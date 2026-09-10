'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const VerifyEmailClient = dynamic(() => import('./VerifyEmailClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  ),
});

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}