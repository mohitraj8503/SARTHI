export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (
      !session ||
      ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUPER_ADMIN')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const {
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
    } = data;

    if (!title || price === undefined) {
      return NextResponse.json({ error: 'Title and Price are required' }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        thumbnail,
        level: level || 'Beginner',
        syllabusUrl,
        introVideoUrl,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        deviceLimit: deviceLimit ? parseInt(deviceLimit) : null,
        instructorId: session.user.id, // Assign to the admin who created it for now
      },
    });

    return NextResponse.json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

