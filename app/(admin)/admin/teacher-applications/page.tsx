import React from 'react';
import ApplicationsClient from './ApplicationsClient';

export const metadata = {
  title: 'Teacher Applications | SARTHI Admin',
  description: 'Manage and review teacher applications for the SARTHI platform.',
};

export default function ApplicationsPage() {
  return <ApplicationsClient />;
}

