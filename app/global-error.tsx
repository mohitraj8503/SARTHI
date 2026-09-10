'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Wrench } from 'lucide-react';
import { performFullSARTHICacheReset } from '@/lib/client-cache-reset';
import './globals.css';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 font-sans p-6">
        <div className="text-center space-y-8 max-w-lg p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500 shadow-sm border border-red-200">
              <AlertTriangle className="w-12 h-12" />
            </div>

            <div className="space-y-4">
                <h1 className="text-3xl font-black tracking-tight text-gray-900">Critical System Exception</h1>
                <p className="text-lg text-gray-600 font-medium leading-relaxed">
                  The application encountered an unexpected state. Our self-healing tools can clear your local cache to restore access.
                </p>
                {error.digest && (
                    <div className="bg-gray-100 p-3 rounded-lg font-mono text-xs text-gray-500 break-all border border-gray-200">
                        Error ID: {error.digest}
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                 onClick={() => {
                    try {
                         const url = new URL(window.location.href);
                         url.searchParams.set('tt_refresh', Date.now().toString());
                         window.location.href = url.toString();
                    } catch (e) {
                         window.location.reload();
                    }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-95 text-sm"
              >
                <RefreshCcw className="w-5 h-5" />
                Try Again
              </button>

              <button
                onClick={() => performFullSARTHICacheReset()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all shadow-xl active:scale-95 text-sm"
              >
                <Wrench className="w-5 h-5" />
                Fix System & Clear Cache
              </button>
            </div>
        </div>
      </body>
    </html>
  );
}
