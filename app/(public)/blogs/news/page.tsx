import { Metadata } from 'next';
import { Suspense } from 'react';
import BlogsClient from '../BlogsClient';
import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Tech & Engineering News | SARTHI',
  description: 'Stay updated with framework updates, core coding news, developments in AI, and engineering industry insights.',
};

export const dynamic = 'force-dynamic';

async function getNewsBlogsData(searchParams: { q?: string; page?: string }) {
  const q = searchParams.q;
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  return withResiliency(
    async () => {
      // Find blogs under 'Tech News' or 'News' categories
      const where: any = { 
        status: 'published',
        OR: [
          { category: 'Tech News' },
          { category: 'News' }
        ]
      };
      
      if (q) {
        where.AND = [
          {
            OR: [
              { title: { contains: q } },
              { excerpt: { contains: q } },
              { tags: { contains: q } }
            ]
          }
        ];
      }

      const [blogs, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
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
          skip,
          take: limit,
        }),
        prisma.blogPost.count({ where })
      ]);

      const formatBlog = (blog: any) => ({
        ...blog,
        author: {
          name: blog.author?.name || 'SARTHI Expert',
          avatar: blog.author?.avatar_url || blog.author?.image || '/sarthi-logo.png',
        },
        tags: blog.tags ? blog.tags.split(',').map((t: string) => t.trim()) : [],
      });

      const formattedBlogs = blogs.map(formatBlog);

      return { blogs: formattedBlogs, total };
    },
    'public-blogs-news'
  );
}

export default async function NewsBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const [res, user] = await Promise.all([
    getNewsBlogsData(resolvedSearchParams),
    getCurrentUser()
  ]);

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
      <BlogsClient 
        initialBlogs={data.blogs} 
        initialTotal={data.total} 
        featured={null}
        user={user} 
        title="Tech News Hub"
        subtitle="Get live broadcasts on programming frameworks, core software infrastructure updates, and AI breakthroughs."
        badgeText="Tech & Code Broadcast"
        hideFeatured={true}
      />
    </Suspense>
  );
}
