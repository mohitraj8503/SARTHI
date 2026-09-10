'use client';

import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import { AlertCircle } from 'lucide-react';

const DashboardErrorFallback = () => (
  <div className="bg-white p-8 rounded-[20px] border border-[#EAE6DF] shadow-sm">
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 bg-[#F7F4EF] rounded-full flex items-center justify-center text-[#D4956A]">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-[#2A3828]">Dashboard Section Error</h3>
      <p className="text-sm text-[#5D705C] text-center">We encountered an issue loading this section. Our team has been notified.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-[#D4956A] text-white rounded-lg font-medium hover:bg-[#2A3828] transition-colors"
      >
        Reload Page
      </button>
    </div>
  </div>
);

const DashboardErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary fallback={<DashboardErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
};

export default DashboardErrorBoundary;

