'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function SeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Seed Page Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Database Seeding Failed</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        An error occurred while attempting to seed courses into the system. 
        This is likely due to duplicate slugs or connection issues.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
        >
          Try Again
        </button>
        <Link
          href="/admin"
          className="px-6 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50"
        >
          Back to Admin
        </Link>
      </div>
    </div>
  );
}

