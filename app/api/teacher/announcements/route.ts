import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateTeacher, AuthenticationError, AuthorizationError } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);

    const announcements = await prisma.announcement.findMany({
      where: { teacherId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return API.ok({ announcements });
  } catch (error: any) {
    console.error('Announcements GET error:', error);
    
    if (error instanceof AuthenticationError) return API.unauthorized();
    if (error instanceof AuthorizationError) return API.forbidden(error.message);

    return API.server('Internal Server Error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);

    const { title, message, targetAudience, courseId, scheduledFor } = await request.json();

    const announcement = await prisma.announcement.create({
      data: {
        teacherId: userId,
        title,
        content: message,
        targetAudience: targetAudience || 'all',
        courseId: courseId || null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: scheduledFor ? 'scheduled' : 'published',
      },
    });

    // REALTIME: Emit event to notify students
    try {
      const { eventBus } = await import('@/lib/realtime/event-bus');
      eventBus.emitEvent({
        eventId: `ann-${announcement.id}`,
        version: '1.0',
        source: 'api/teacher/announcements',
        timestamp: new Date().toISOString(),
        type: 'ANNOUNCEMENT_CREATED',
        metadata: { actorId: userId },
        payload: {
          entity: 'announcement',
          action: 'CREATE',
          id: announcement.id,
          after: announcement
        }
      });
    } catch (e) {
      console.warn('Realtime event emission failed:', e);
    }

    return API.created(announcement, "Announcement published successfully.");
  } catch (error: any) {
    console.error('Announcements POST error:', error);
    
    if (error instanceof AuthenticationError) return API.unauthorized();
    if (error instanceof AuthorizationError) return API.forbidden(error.message);

    return API.server('Internal Server Error');
  }
}

