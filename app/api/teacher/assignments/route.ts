import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateTeacher, AuthenticationError, AuthorizationError } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/assignments
 * List all assignments for courses owned by the authenticated teacher.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);

    const teacher = await prisma.teacher.findUnique({
      where: { userId: userId }
    });

    if (!teacher) {
      return API.notFound('Teacher profile not found');
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        course: { teacherId: teacher.id }
      },
      include: {
        course: { select: { title: true } },
        lesson: { select: { title: true } },
        module: { select: { title: true } },
        attempts: { select: { score: true, maxScore: true } },
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate basic stats
    const totalAssignments = assignments.length;
    const activeAssignments = assignments.filter(a => a.status === 'RELEASED').length;
    
    // Average score across all attempts
    let totalScore = 0;
    let totalMaxScore = 0;
    assignments.forEach(a => {
      a.attempts.forEach(att => {
        totalScore += att.score;
        totalMaxScore += att.maxScore;
      });
    });
    const avgScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

    return API.ok({
      assignments: assignments.map(a => ({
        id: a.id,
        title: a.title,
        courseTitle: a.course?.title,
        lessonTitle: a.lesson?.title,
        status: a.status,
        questionCount: a._count.questions,
        attemptCount: a._count.attempts,
        createdAt: a.createdAt,
        dueAt: a.dueAt
      })),
      stats: {
        total: totalAssignments,
        active: activeAssignments,
        avgScore: avgScore
      }
    });
  } catch (error: any) {
    console.error('[API/Teacher/Assignments] GET Error:', error);
    
    if (error instanceof AuthenticationError) return API.unauthorized();
    if (error instanceof AuthorizationError) return API.forbidden(error.message);

    return API.server('Internal Server Error');
  }
}

/**
 * POST /api/teacher/assignments
 * Create a new assignment in DRAFT state.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);

    const teacher = await prisma.teacher.findUnique({
      where: { userId: userId }
    });

    if (!teacher) {
      return API.notFound('Teacher profile not found');
    }

    const body = await request.json();
    const { 
      courseId, 
      moduleId, 
      lessonId, 
      title, 
      description,
      totalQuestions = 10,
      dueAt,
      timeLimit
    } = body;

    if (!courseId || !title) {
      return API.badRequest("Required fields: 'courseId' and 'title'.");
    }

    // Verify course ownership
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: teacher.id }
    });

    if (!course) {
      return API.forbidden('Course not found or unauthorized access');
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        courseId,
        moduleId: moduleId || null,
        lessonId: lessonId || '', 
        totalQuestions: parseInt(totalQuestions),
        dueAt: dueAt ? new Date(dueAt) : null,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        status: 'DRAFT',
        createdBy: teacher.id
      }
    });

    // Audit Event
    await prisma.assignmentEvent.create({
      data: {
        assignmentId: assignment.id,
        actorType: 'TEACHER',
        actorId: teacher.id,
        eventType: 'CREATED',
        payload: JSON.stringify({ title: assignment.title })
      }
    });

    // REALTIME: Emit event to notify students
    try {
      const { eventBus } = await import('@/lib/realtime/event-bus');
      eventBus.emitEvent({
        eventId: `asgn-${assignment.id}`,
        version: '1.0',
        source: 'api/teacher/assignments',
        timestamp: new Date().toISOString(),
        type: 'ASSIGNMENT_CREATED',
        metadata: { actorId: userId },
        payload: {
          entity: 'assignment',
          action: 'CREATE',
          id: assignment.id,
          after: assignment
        }
      });
    } catch (e) {
      console.warn('Realtime event emission failed:', e);
    }

    return API.created(assignment, "Assignment draft synthesized successfully.");
  } catch (error: any) {
    console.error('[API/Teacher/Assignments] POST Error:', error);
    
    if (error instanceof AuthenticationError) return API.unauthorized();
    if (error instanceof AuthorizationError) return API.forbidden(error.message);

    return API.server('Internal Server Error');
  }
}
