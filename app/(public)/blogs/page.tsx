import { Metadata } from 'next';
import { Suspense } from 'react';
import BlogsClient from './BlogsClient';
import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';

export const metadata: Metadata = {
  title: 'Tech & Engineering Blog | SARTHI',
  description: 'Master Python AI, Software Engineering, and more. Honest comparisons between traditional platforms like Physics Wallah/Allen and the future of tech learning at SARTHI.',
  keywords: [
    'Physics Wallah alternative tech', 
    'Allen career blog', 
    'best coding blog India', 
    'Python AI trends 2026',
    'SARTHI engineering blog'
  ],
};

export const dynamic = 'force-dynamic';


import { MOCK_BLOGS } from '@/lib/mock-data';

async function getBlogsData(searchParams: { q?: string; category?: string; page?: string } = {}) {
  const q = (searchParams?.q || '').toLowerCase();
  const category = searchParams?.category || '';
  const page = parseInt(searchParams?.page || '1') || 1;
  const limit = 200;
  const skip = (page - 1) * limit;

  return withResiliency(
    async () => {
      let blogs: any[] = [];
      let total = 0;
      let featuredBlog: any = null;

      if ((prisma as any).blogPost && typeof (prisma as any).blogPost.findMany === 'function') {
        try {
          const where: any = { status: 'published' };
          if (category && category !== 'All') {
            where.category = category;
          }
          if (q) {
            where.OR = [
              { title: { contains: q } },
              { excerpt: { contains: q } },
              { tags: { contains: q } }
            ];
          }

          const [dbBlogs, dbTotal, dbFeatured] = await Promise.all([
            (prisma as any).blogPost.findMany({
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
            (prisma as any).blogPost.count({ where }),
            (!q && (!category || category === 'All') && page === 1)
              ? (prisma as any).blogPost.findFirst({
                  where: { status: 'published', featured: true },
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
                    author: {
                      select: { name: true, avatar_url: true, image: true }
                    }
                  },
                  orderBy: { publishedAt: 'desc' }
                })
              : Promise.resolve(null)
          ]);

          blogs = dbBlogs || [];
          total = dbTotal || blogs.length;
          featuredBlog = dbFeatured || null;
        } catch (dbErr) {
          console.warn('[BLOGS] Database query fallback to mock blogs:', dbErr);
        }
      }

      if (!blogs || blogs.length === 0) {
        let filtered = [...(MOCK_BLOGS || [])];
        if (category && category !== 'All') {
          filtered = filtered.filter(b => b.category?.toLowerCase() === category.toLowerCase());
        }
        if (q) {
          filtered = filtered.filter(b => 
            b.title?.toLowerCase().includes(q) || 
            b.excerpt?.toLowerCase().includes(q) ||
            (Array.isArray(b.tags) && b.tags.some((t: string) => t.toLowerCase().includes(q)))
          );
        }
        blogs = filtered.slice(skip, skip + limit);
        total = filtered.length;
        featuredBlog = filtered.find(b => b.featured) || filtered[0] || null;
      }

      const formatBlog = (blog: any) => {
        if (!blog) return null;
        let parsedTags: string[] = [];
        if (Array.isArray(blog.tags)) {
          parsedTags = blog.tags;
        } else if (typeof blog.tags === 'string' && blog.tags.trim()) {
          parsedTags = blog.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
        }

        return {
          ...blog,
          author: {
            name: blog.author?.name || 'SARTHI Team',
            avatar: blog.author?.avatar_url || blog.author?.image || '/sarthi-logo.png',
          },
          tags: parsedTags,
          excerpt: blog.excerpt || (blog.content ? blog.content.substring(0, 160).replace(/<[^>]*>/g, '') : ''),
        };
      };

      const formattedBlogs = Array.isArray(blogs) ? blogs.map(formatBlog).filter(Boolean) : [];
      const formattedFeatured = featuredBlog ? formatBlog(featuredBlog) : null;

      return { blogs: formattedBlogs, total: total || formattedBlogs.length, featured: formattedFeatured };
    },
    'public-blogs-list'
  );
}

import { getCurrentUser } from '@/lib/auth';

export default async function BlogsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; page?: string }> | { q?: string; category?: string; page?: string };
}) {
  try {
    const resolvedSearchParams = (searchParams ? await searchParams : {}) || {};
    
    let res: any = null;
    let user: any = null;

    try {
      [res, user] = await Promise.all([
        getBlogsData(resolvedSearchParams),
        getCurrentUser().catch(() => null)
      ]);
    } catch (fetchErr) {
      console.warn('[BLOGS] Data fetch failed, using fallback:', fetchErr);
    }

    let data = res?.data;

    // Resilient fallback to mock blogs if database is empty or unavailable
    if (!data || !Array.isArray(data.blogs) || data.blogs.length === 0) {
      const mockList = MOCK_BLOGS.map((b: any) => ({
        ...b,
        author: {
          name: b.author?.name || 'SARTHI Admins',
          avatar: b.author?.avatar_url || b.author?.avatar || '/sarthi-logo.png',
        },
        tags: Array.isArray(b.tags) ? b.tags : [],
        views: b.views || 1200,
        readTime: b.readTime || '5 min',
      }));

      data = {
        blogs: mockList,
        total: mockList.length,
        featured: mockList[0] || null,
      };
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <BlogsClient 
          initialBlogs={data.blogs} 
          initialTotal={data.total} 
          featured={data.featured}
          user={user} 
        />
      </Suspense>
    );
  } catch (criticalErr) {
    console.error('[BLOGS] Critical error rendering blogs page:', criticalErr);
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[#1A3C2E] mb-4">SARTHI Knowledge Hub</h2>
        <p className="text-[#5D705C] max-w-md">Our technical articles and research publications are being refreshed. Please check back shortly.</p>
      </div>
    );
  }
}



