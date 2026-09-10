import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(24, Math.max(1, parseInt(searchParams.get('pageSize') || '12', 10)));
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const skip = (page - 1) * pageSize;

    const where = {
      status: 'PUBLISHED',
      ...(category ? { category } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search as const } },
          { description: { contains: search as const } },
          { instructorName: { contains: search as const } },
        ]
      } : {})
    };

    const [workshops, total] = await Promise.all([
      prisma.workshop.findMany({
        where,
        orderBy: { date: 'asc' },
        skip,
        take: pageSize,
      }),
      prisma.workshop.count({ where }),
    ]);

    return NextResponse.json({
      workshops,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    });
  } catch (error) {
    console.error('[WORKSHOPS_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch workshops' }, { status: 500 });
  }
}

