import { Metadata } from 'next';
import { Suspense } from 'react';
import SavedBlogsClient from './SavedBlogsClient';
import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Saved Library | SARTHI',
  description: 'Your bookmarked and favorited programming articles.',
};

export const dynamic = 'force-dynamic';

async function getSavedPageData() {
  return withResiliency(
    async () => {
      const user = await getCurrentUser();
      
      const allBlogs = await prisma.blogPost.findMany({
        where: { status: 'published' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          thumbnail: true,
          tags: true,
          publishedAt: true,
          readTime: true,
          views: true,
          author: {
            select: {
              name: true,
              avatar_url: true,
              image: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
      });

      const formatBlog = (blog: any) => ({
        ...blog,
        author: {
          name: blog.author?.name || 'SARTHI Expert',
          avatar: blog.author?.avatar_url || blog.author?.image || '/sarthi-logo.png',
        },
        tags: blog.tags ? blog.tags.split(',').map((t: string) => t.trim()) : [],
      });

      const formattedBlogs = allBlogs.map(formatBlog);

      let dbBookmarkedIds: string[] = [];
      if (user) {
        const bookmarks = await prisma.blogBookmark.findMany({
          where: { userId: user.id },
          select: { postId: true }
        });
        dbBookmarkedIds = bookmarks.map(b => b.postId);
      }

      return { allBlogs: formattedBlogs, dbBookmarkedIds, user };
    },
    'public-blogs-saved'
  );
}

export default async function SavedBlogsPage() {
  const res = await getSavedPageData();
  const data = res.data;
  
  if (!res.success || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[#1A3C2E] mb-4">Temporarily Unavailable</h2>
        <p className="text-[#5D705C] max-w-md">We&apos;re updating our blog archive. Please try again in a few minutes.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SavedBlogsClient 
        allBlogs={data.allBlogs} 
        dbBookmarkedIds={data.dbBookmarkedIds} 
        user={data.user} 
      />
    </Suspense>
  );
}
