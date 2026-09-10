export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/blogs/internal-search?q=AI
 * Action: Quick search for existing published articles to insert internal links
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const blogs = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        OR: [
          { title: { contains: q } },
          { slug: { contains: q } },
          { category: { contains: q } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        publishedAt: true
      },
      take: 8,
      orderBy: { publishedAt: 'desc' }
    });

    const results = blogs.map(b => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      url: `/blogs/${b.slug}`,
      category: b.category
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching internal blog links:', error);
    return NextResponse.json({ results: [] });
  }
}
