export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { category: true },
      distinct: ['category'],
    });

    const formattedCategories = categories
      .map(c => c.category)
      .filter(Boolean)
      .sort();

    return NextResponse.json(['All', ...formattedCategories]);
  } catch (error) {
    console.error('[BLOG_CATEGORIES_GET]', error);
    // Return safe fallback during SSG/DB unavailable
    return NextResponse.json(['All']);
  }
}

