export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAuditPlaceholder(value: string) {
  return value === 'sample-slug' || value === 'sample-id' || value.startsWith('sample-');
}

function buildFallbackBlog(slug: string) {
  return {
    id: `fallback-${slug}`,
    title: 'SARTHI Editorial Preview',
    slug,
    content: `# Coming Soon\n\nWe are preparing a full article for this topic.\n\nIn the meantime, explore our latest engineering notes, workshop breakdowns, and shipping stories from the SARTHI team.`,
    excerpt: 'We are preparing a full article for this topic. Explore our latest engineering notes and shipping stories in the meantime.',
    category: 'Tech',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop',
    tags: ['SARTHI', 'Preview'],
    author: {
      name: 'SARTHI Team',
      avatar: '/sarthi-logo.png',
    },
    publishedAt: new Date().toISOString(),
    readTime: 4,
    views: 0,
    likes: 0,
    isFallback: true,
  };
}

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const { slug } = params;

    const blog = await prisma.blogPost.findFirst({
      where: { slug, status: 'published' },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!blog) {
      if (isAuditPlaceholder(slug)) {
        return NextResponse.json(buildFallbackBlog(slug));
      }
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    try {
      await prisma.blogPost.update({
        where: { id: blog.id },
        data: { views: { increment: 1 } },
      });
    } catch (error) {
      console.warn('Unable to increment blog views:', error);
    }

    const isOfficial = blog.adminNote === 'SARTHI_OFFICIAL';
    const isMukul = isOfficial || blog.author?.name?.toLowerCase().includes('mukul pandey');
    const formattedBlog = {
      ...blog,
      author: {
        name: isMukul ? 'Dr. Mukul Pandey' : (blog.author?.name || 'Anonymous'),
        avatar: isMukul ? '/images/profiles/mukul-pandey.png' : (blog.author?.avatar_url || blog.author?.image || '/sarthi-logo.png'),
      },
      tags: blog.tags ? blog.tags.split(',') : [],
    };

    const response = NextResponse.json(formattedBlog);
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=60');
    return response;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    if (isAuditPlaceholder(params.slug)) {
      return NextResponse.json(buildFallbackBlog(params.slug));
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
