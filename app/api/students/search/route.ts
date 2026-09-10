import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';

export const dynamic = 'force-dynamic';

/**
 * GET /api/students/search?q=<term>
 * Searches students by name, email, enrollmentNumber, studentId, or id.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q || q.length < 2) {
      return ApiResponse.success([]);
    }

    const students = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { enrollmentNumber: { contains: q } },
          { studentId: { contains: q } },
          { id: { contains: q } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        enrollmentNumber: true,
        studentId: true,
        status: true,
        role: true,
        image: true
      },
      take: 8
    });

    const transformed = students.map((s) => ({
      id: s.id,
      name: s.name || 'Unnamed Student',
      email: s.email,
      enrollmentId: s.enrollmentNumber || s.studentId || s.id,
      status: s.status || 'ACTIVE',
      role: s.role,
      image: s.image,
      paidStatus: 'PAID & VERIFIED'
    }));

    return ApiResponse.success(transformed);
  } catch (error) {
    return handleApiError(error);
  }
}
