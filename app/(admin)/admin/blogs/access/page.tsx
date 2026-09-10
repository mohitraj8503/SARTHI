import React from 'react';
import BlogRequestsClient from './BlogRequestsClient';
import PageHeader from '@/components/PageHeader';

export const metadata = {
  title: 'Blog Access Management | Admin',
  description: 'Manage blog writer permissions and requests.',
};

export default function BlogAccessPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader 
        title="Blog Access Control" 
        subtitle="Manage user permissions for writing and publishing blogs"
        showBackButton={true}
      />
      <BlogRequestsClient />
    </div>
  );
}
