import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getLiveLessons } from '@/app/actions/student-dashboard';
import { z } from 'zod';
import { validateQueryParams } from '@/lib/api-validator';
import { rateLimit } from '@/lib/security/rate-limit';
import type { ApiResponse, DashboardRecording, PaginatedResponse } from '@/lib/types/dashboard';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(9),
  q: z.string().trim().optional(),
  topic: z.string().trim().optional(),
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

  const query = validateQueryParams(req, querySchema);
  if (!query.success) return query.error;

  const { page, pageSize, q, topic } = query.data;
  const result = await getLiveLessons();
  const recordings = (result.recordings || []) as DashboardRecording[];

  const filtered = recordings.filter((item) => {
    const matchesQ =
      !q ||
      item.title.toLowerCase().includes(q.toLowerCase()) ||
      (item.courseName || '').toLowerCase().includes(q.toLowerCase());
    const matchesTopic =
      !topic ||
      topic.toLowerCase() === 'all' ||
      (item.courseName || '').toLowerCase() === topic.toLowerCase();
    return matchesQ && matchesTopic;
  });

  const start = (page - 1) * pageSize;
  const data: PaginatedResponse<DashboardRecording> = {
    items: filtered.slice(start, start + pageSize),
    meta: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    },
  };

  return NextResponse.json<ApiResponse<PaginatedResponse<DashboardRecording>>>(
    { success: true, data },
    {
      headers: {
        ...limited.headers,
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
      },
    }
  );
}

