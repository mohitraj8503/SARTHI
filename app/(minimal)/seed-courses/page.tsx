'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// Removed direct import to avoid Prisma client in browser

export default function SeedCoursesPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'idle' | 'seeding' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSeed = useCallback(async () => {
        setStatus('seeding');
        setMessage('Seeding courses...');

        try {
            const response = await fetch('/api/seed', { method: 'POST' });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to seed courses');
            }

            setStatus('success');
            setMessage(`Successfully seeded ${data.count} courses!`);

            // Redirect to courses page after 2 seconds
            setTimeout(() => {
                router.push('/courses');
            }, 2000);
        } catch (error) {
            setStatus('error');
            setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, [router]);

    useEffect(() => {
        // Auto-seed on page load
        handleSeed();
    }, [handleSeed]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full text-center">
                <div className="mb-6">
                    {status === 'seeding' && (
                        <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
                    )}
                    {status === 'success' && (
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-brand-dark mb-4">
                    {status === 'idle' && 'Preparing Courses...'}
                    {status === 'seeding' && 'Seeding Courses...'}
                    {status === 'success' && 'Courses Seeded!'}
                    {status === 'error' && 'Seeding Failed'}
                </h1>

                <p className="text-gray-600 mb-6">{message}</p>

                {status === 'success' && (
                    <p className="text-sm text-gray-500">Redirecting to courses page...</p>
                )}

                {status === 'error' && (
                    <button
                        onClick={handleSeed}
                        aria-label="Try seeding courses again"
                        className="bg-brand-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}

