export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateQueryParams } from '@/lib/api-validator';
import { z } from 'zod';
import { rateLimit } from '@/lib/security/rate-limit';
import type { ApiResponse, PaginatedResponse } from '@/lib/types/dashboard';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().trim().optional(),
});

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req);
  if (!limited.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Too many requests', code: 'RATE_LIMITED' },
      { status: 429, headers: limited.headers }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401, headers: limited.headers }
    );
  }

  try {
    const query = validateQueryParams(req, querySchema);
    if (!query.success) return query.error;

    const { page, pageSize, q } = query.data;
    const assignments = await prisma.assignment.findMany({
      where: {
        ...(q ? { title: { contains: q } } : {}),
        lesson: {
          course: {
            enrollments: {
              some: { userId: user.id }
            }
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    const start = (page - 1) * pageSize;
    const data: PaginatedResponse<typeof assignments[number]> = {
      items: (assignments ?? []).slice(start, start + pageSize),
      meta: {
        page,
        pageSize,
        total: assignments?.length || 0,
        totalPages: Math.max(1, Math.ceil((assignments?.length || 0) / pageSize)),
      },
    };

    return NextResponse.json<ApiResponse<PaginatedResponse<typeof assignments[number]>>>(
      { success: true, data },
      { headers: limited.headers }
    );
  } catch (error) {
    console.error('Assignments API Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Assignments fetch failed', code: 'ASSIGNMENTS_FETCH_FAILED' },
      { status: 500, headers: limited.headers }
    );
  }
}

