import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, handleApiError } from '@/lib/admin/core';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/live/chat?liveClassId=XYZ&since=2026-06-20T18:10:15.000Z
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const { searchParams } = new URL(request.url);
    const liveClassId = searchParams.get('liveClassId');
    const since = searchParams.get('since');

    if (!liveClassId) {
      return ApiResponse.error('liveClassId is required', 'VALIDATION_ERROR', 400);
    }

    const whereClause: any = { liveClassId };
    if (since) {
      whereClause.createdAt = { gt: new Date(since) };
    }

    const messages = await prisma.liveClassChatMessage.findMany({
      where: whereClause,
      include: {
        student: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return ApiResponse.success({ messages });
  } catch (error: any) {
    return handleApiError(error);
  }
}

// POST /api/live/chat
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const body = await request.json();
    const { liveClassId, message } = body;

    if (!liveClassId || !message) {
      return ApiResponse.error('liveClassId and message are required', 'VALIDATION_ERROR', 400);
    }

    const chatMessage = await prisma.liveClassChatMessage.create({
      data: {
        liveClassId,
        studentId: user.id,
        message
      },
      include: {
        student: { select: { name: true, role: true } }
      }
    });

    return ApiResponse.success(chatMessage, 'Message sent.');
  } catch (error: any) {
    return handleApiError(error);
  }
}
