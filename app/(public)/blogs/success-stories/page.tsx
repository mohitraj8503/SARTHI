import { Metadata } from 'next';
import { Suspense } from 'react';
import BlogsClient from '../BlogsClient';
import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Success Stories | SARTHI',
  description: 'Inspirational journeys of student developers, career milestones, and placement highlights at SARTHI.',
};

export const dynamic = 'force-dynamic';

async function getSuccessBlogsData(searchParams: { q?: string; page?: string }) {
  const q = searchParams.q;
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  return withResiliency(
    async () => {
      const where: any = { 
        status: 'published',
        category: 'Success Stories'
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
    'public-blogs-success'
  );
}

export default async function SuccessBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const [res, user] = await Promise.all([
    getSuccessBlogsData(resolvedSearchParams),
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
        title="Student Spotlight & Success Stories"
        subtitle="Read about real career transitions, building foundations, and placements of SARTHI learners."
        badgeText="Community Milestones"
        hideFeatured={true}
      />
    </Suspense>
  );
}
