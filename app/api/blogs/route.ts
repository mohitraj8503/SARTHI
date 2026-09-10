export const dynamic = "force-dynamic";

import { MOCK_BLOGS } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const q = (searchParams.get('q') || '').toLowerCase();
    const featured = searchParams.get('featured') === 'true';
    const page = parseInt(searchParams.get('page') || '1') || 1;
    const limit = parseInt(searchParams.get('limit') || '9') || 9;
    const skip = (page - 1) * limit;

    let blogs: any[] = [];
    let total = 0;

    if ((prisma as any).blogPost && typeof (prisma as any).blogPost.findMany === 'function') {
      try {
        const where: any = {
          status: 'published',
        };

        if (category && category !== 'All') {
          where.category = category;
        }

        if (featured) {
          where.featured = true;
        }

        if (q) {
          where.OR = [
            { title: { contains: q } },
            { excerpt: { contains: q } },
            { content: { contains: q } },
            { tags: { contains: q } }
          ];
        }

        const [dbBlogs, dbTotal] = await Promise.all([
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
              featured: true,
              adminNote: true,
              author: {
                select: {
                  name: true,
                  image: true,
                  avatar_url: true,
                  role: true,
                },
              },
            },
            orderBy: {
              publishedAt: 'desc',
            },
            skip,
            take: limit,
          }),
          (prisma as any).blogPost.count({ where }),
        ]);

        blogs = dbBlogs || [];
        total = dbTotal || blogs.length;
      } catch (prismaError) {
        console.warn('[BLOGS_PRISMA_FALLBACK]', prismaError);
      }
    }

    if (!blogs || blogs.length === 0) {
      let filtered = [...(MOCK_BLOGS || [])];
      if (category && category !== 'All') {
        filtered = filtered.filter(b => b.category?.toLowerCase() === category.toLowerCase());
      }
      if (featured) {
        filtered = filtered.filter(b => b.featured);
      }
      if (q) {
        filtered = filtered.filter(b => 
          b.title?.toLowerCase().includes(q) || 
          b.excerpt?.toLowerCase().includes(q) ||
          (Array.isArray(b.tags) && b.tags.some((t: string) => t.toLowerCase().includes(q)))
        );
      }
      total = filtered.length;
      blogs = filtered.slice(skip, skip + limit);
    }

    const formattedBlogs = blogs.map((blog: any) => {
      const isOfficial = blog.adminNote === 'SARTHI_OFFICIAL';
      let authorName = blog.author?.name || 'SARTHI Expert';
      if (authorName.toLowerCase() === 'mukul pandey' || authorName.toLowerCase().includes('mukul pandey')) {
        authorName = 'Dr. Mukul Pandey';
      } else if (isOfficial) {
        authorName = 'Dr. Mukul Pandey';
      }
      let tags: string[] = [];
      if (Array.isArray(blog.tags)) {
        tags = blog.tags;
      } else if (typeof blog.tags === 'string' && blog.tags.trim()) {
        tags = blog.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }

      return {
        ...blog,
        author: {
          name: authorName,
          avatar: isOfficial ? '/sarthi-logo.png' : (blog.author?.avatar_url || blog.author?.image || '/sarthi-logo.png'),
        },
        tags,
      };
    });

    const response = NextResponse.json({
      blogs: formattedBlogs,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });

    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    return response;
  } catch (error) {
    console.error('[BLOGS_GET_ERROR]', error);
    return NextResponse.json({
      blogs: MOCK_BLOGS || [],
      total: (MOCK_BLOGS || []).length,
      page: 1,
      totalPages: 1
    });
  }
}


