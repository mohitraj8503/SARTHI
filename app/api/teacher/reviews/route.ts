import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateTeacher, AuthenticationError, AuthorizationError } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);

    const teacher = await prisma.teacher.findUnique({
      where: { userId: userId },
      select: { id: true }
    });

    if (!teacher) {
      return API.notFound('Teacher profile not found');
    }

    const reviews = await prisma.courseReview.findMany({
      where: {
        course: {
          instructorId: userId
        }
      },
      include: {
        user: {
          select: { name: true, image: true, email: true }
        },
        course: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return API.ok({ reviews });
  } catch (error: any) {
    console.error('[Reviews GET] Error:', error);
    
    if (error instanceof AuthenticationError) return API.unauthorized();
    if (error instanceof AuthorizationError) return API.forbidden(error.message);

    return API.server('Internal Server Error');
  }
}

