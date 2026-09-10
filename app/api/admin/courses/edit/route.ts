import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const role = (session?.user as { role?: string })?.role;
    if (
      !session ||
      (role !== 'ADMIN' && role !== 'SUPER_ADMIN')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const {
      id,
      title,
      description,
      price,
      category,
      thumbnail,
      level,
      syllabusUrl,
      introVideoUrl,
      startDate,
      endDate,
      deviceLimit,
      isPublished,
      isFeatured
    } = data;

    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        category,
        thumbnail,
        level,
        syllabusUrl,
        introVideoUrl,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        deviceLimit: deviceLimit ? parseInt(deviceLimit.toString()) : undefined,
        isPublished,
        isFeatured
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

