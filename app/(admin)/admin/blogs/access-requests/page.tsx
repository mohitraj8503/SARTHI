import React from 'react';
import AccessRequestsClient from './AccessRequestsClient';

export const metadata = {
  title: 'Blog Access Requests | SARTHI Admin',
  description: 'Manage and review blog access requests for premium content.',
};

export default function BlogAccessRequestsPage() {
  return <AccessRequestsClient />;
}
