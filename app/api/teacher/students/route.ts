import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateTeacher, AuthenticationError, AuthorizationError } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const teacherId = await authenticateTeacher(request);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const studentStatus = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {
      course: {
        instructorId: teacherId
      }
    };

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } }
        ]
      };
    }

    // Server-side status filtering for base statuses
    if (studentStatus === 'active') {
      where.progressPercentage = { lt: 100 };
    } else if (studentStatus === 'completed') {
      where.progressPercentage = 100;
    }

    const [total, enrollments] = await Promise.all([
      prisma.enrollment.count({ where }),
      prisma.enrollment.findMany({
        where,
        select: {
          id: true,
          status: true,
          progressPercentage: true,
          lastAccessedAt: true,
          createdAt: true,
          user: { 
            select: { 
              id: true, name: true, email: true, image: true 
            } 
          },
          course: { 
            select: { 
              id: true, title: true 
            } 
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    const transformed = enrollments.map((e) => {
      let status: 'active' | 'completed' | 'struggling' = 'active';
      if (e.progressPercentage === 100) status = 'completed';
      else {
        const createdAt = e.createdAt;
        if (createdAt.getTime() < Date.now() - 14 * 24 * 60 * 60 * 1000 && (e.progressPercentage || 0) < 20) {
          status = 'struggling';
        }
      }

      return {
        id: e.id,
        student: e.user,
        course: e.course,
        progress: e.progressPercentage || 0,
        status: status,
        lastActive: e.lastAccessedAt || e.createdAt,
        joinedAt: e.createdAt
      };
    });

    // Final filter for 'struggling' which is calculated in code
    let filtered = transformed;
    if (studentStatus === 'struggling') {
      filtered = transformed.filter(s => s.status === 'struggling');
    }

    return API.ok({ 
      students: filtered,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('[Teacher Students API] Error:', error);
    
    if (error instanceof AuthenticationError) return API.unauthorized();
    if (error instanceof AuthorizationError) return API.forbidden(error.message);

    return API.server('Internal Server Error');
  }
}


