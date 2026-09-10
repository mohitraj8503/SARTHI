import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const requests = await prisma.blogAccessRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            onboarded: true,
            phone: true,
            college: true,
            currentCourse: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    console.error('[ADMIN_BLOG_REQUESTS_GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
