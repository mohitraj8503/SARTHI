'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import BlogEditorWorkspace from '@/components/blogs/BlogEditorWorkspace';

export default function AdminBlogEdit() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : undefined;

  return <BlogEditorWorkspace mode="admin" blogId={id} />;
}
