'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { RefreshCw, AlertCircle, Home, Wrench } from 'lucide-react';
import Link from 'next/link';
import { performFullSARTHICacheReset } from '@/lib/client-cache-reset';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });

    // Log error to service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
          userId: 'anonymous'
        })
      });
    } catch (logError) {
      console.error('[ErrorBoundary] Failed to log error:', logError);
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-xl font-black text-gray-900 mb-2">Something went wrong</h2>

            <p className="text-sm text-gray-500 mb-6">
              We encountered an unexpected error. This has been logged and our team will
              investigate.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-xs font-bold text-gray-400 cursor-pointer mb-2">
                  Error Details (Dev Only)
                </summary>
                <pre className="text-xs bg-gray-50 p-4 rounded-xl overflow-auto max-h-40 text-red-600">
                  {this.state.error.message}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-orange-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>

                <Link
                  href={typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') ? '/admin' : '/student/courses'}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
              </div>

              <button
                onClick={() => performFullSARTHICacheReset()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-600 transition-colors"
                title="Clears all site cache, cookies, and local data, then reloads clean session"
              >
                <Wrench className="w-4 h-4" />
                Fix System & Clear Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
