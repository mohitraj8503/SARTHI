'use client';

import React from 'react';
import ErrorBoundary from '../ErrorBoundary';

const SectionErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default SectionErrorBoundary;

