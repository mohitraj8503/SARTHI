import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, handleApiError } from '@/lib/admin/core';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/live/hand-raise?liveClassId=XYZ
// Get all raised hands (unresolved)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const { searchParams } = new URL(request.url);
    const liveClassId = searchParams.get('liveClassId');

    if (!liveClassId) {
      return ApiResponse.error('liveClassId is required', 'VALIDATION_ERROR', 400);
    }

    const raisedHands = await prisma.liveClassRaisedHand.findMany({
      where: {
        liveClassId,
        resolvedAt: null
      },
      include: {
        student: { select: { id: true, name: true } }
      },
      orderBy: { raisedAt: 'asc' }
    });

    return ApiResponse.success({ raisedHands });
  } catch (error: any) {
    return handleApiError(error);
  }
}

// POST /api/live/hand-raise
// Student raises a hand, or teacher resolves all hands
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const body = await request.json();
    const { liveClassId, action, handRaiseId } = body;

    if (!liveClassId) {
      return ApiResponse.error('liveClassId is required', 'VALIDATION_ERROR', 400);
    }

    if (action === 'raise') {
      // Check if student already has an active raised hand
      const existing = await prisma.liveClassRaisedHand.findFirst({
        where: {
          liveClassId,
          studentId: user.id,
          resolvedAt: null
        }
      });

      if (existing) {
        return ApiResponse.success(existing, 'Hand already raised.');
      }

      const raisedHand = await prisma.liveClassRaisedHand.create({
        data: {
          liveClassId,
          studentId: user.id
        }
      });

      return ApiResponse.success(raisedHand, 'Hand raised.');
    } else if (action === 'resolve') {
      // Only teachers/admins can resolve
      if (user.role !== 'TEACHER' && user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
        return ApiResponse.error('Forbidden', 'FORBIDDEN', 403);
      }

      if (handRaiseId) {
        const resolved = await prisma.liveClassRaisedHand.update({
          where: { id: handRaiseId },
          data: { resolvedAt: new Date() }
        });
        return ApiResponse.success(resolved, 'Hand raise resolved.');
      } else {
        // Resolve all
        await prisma.liveClassRaisedHand.updateMany({
          where: { liveClassId, resolvedAt: null },
          data: { resolvedAt: new Date() }
        });
        return ApiResponse.success(null, 'All raised hands resolved.');
      }
    }

    return ApiResponse.error('Invalid action', 'VALIDATION_ERROR', 400);
  } catch (error: any) {
    return handleApiError(error);
  }
}
