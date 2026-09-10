export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const category = searchParams.get('category');

  try {
    const where: any = { isPublished: true };

    if (category) where.category = category;
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
      ];
    }

    const articles = await prisma.kBArticle.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        viewCount: true,
        updatedAt: true,
        // don't select full content for list
        content: false,
      },
      orderBy: { viewCount: 'desc' },
      take: 20,
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('[KB API]', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

