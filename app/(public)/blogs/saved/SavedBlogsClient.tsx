'use client';

import { useEffect, useState } from 'react';
import BlogsClient from '../BlogsClient';

export default function SavedBlogsClient({ allBlogs, user, dbBookmarkedIds }: { allBlogs: any[], user: any, dbBookmarkedIds: string[] }) {
  const [savedBlogs, setSavedBlogs] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setSavedBlogs(allBlogs.filter(b => dbBookmarkedIds.includes(b.id)));
    } else {
      const localBookmarks = JSON.parse(localStorage.getItem('saved_blogs') || '[]');
      setSavedBlogs(allBlogs.filter(b => localBookmarks.includes(b.id)));
    }
  }, [allBlogs, user, dbBookmarkedIds]);

  return (
    <BlogsClient 
      initialBlogs={savedBlogs} 
      initialTotal={savedBlogs.length} 
      featured={null}
      user={user} 
      title="Saved Library"
      subtitle="Your bookmarked and favorited programming articles."
      badgeText="Bookmarks"
      hideFeatured={true}
    />
  );
}
