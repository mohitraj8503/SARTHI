export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (type && type !== 'all') {
      where.type = type;
    }
    if (search) {
      where.OR = [
        { description: { contains: search } },
        { data: { contains: search } }, // Assuming userName is often in data JSON string
      ];
      // If PlatformActivity had a direct userName field, we'd search that too.
      // Based on stats API, it seems it might not, or we parse it from JSON.
      // Let's check schema if possible, but assuming standard structure.
    }

    const [activities, total] = await Promise.all([
      prisma.platformActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.platformActivity.count({ where }),
    ]);

    // Parse data field if it's a string
    const parsedActivities = activities.map((activity) => {
      let parsedData = {};
      try {
        parsedData = typeof activity.data === 'string' ? JSON.parse(activity.data) : activity.data;
      } catch (e) {}

      return {
        ...activity,
        data: parsedData,
      };
    });

    return ApiResponse.success(parsedActivities, undefined, {
      total,
      totalPages: Math.ceil(total / limit),
      page,
      pageSize: limit,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

