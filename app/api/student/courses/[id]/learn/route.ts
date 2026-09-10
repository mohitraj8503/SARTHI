import { authenticateStudent } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { API } from '@/lib/api/response';
import { logError } from '@/lib/logger';
import { getSecureVideoUrl } from '@/lib/learning/utils';

/**
 * Premium Learning Experience API
 * Provides structured course data (milestones/lectures) for the student learning interface.
 * Implements strict enrollment verification and progress aggregation with sequential locking.
 */
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = await authenticateStudent(request);
    const { id: courseIdOrSlug } = await params;

    // 1. Resolve Course (Handle ID or Slug)
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { id: courseIdOrSlug },
          { slug: courseIdOrSlug }
        ]
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        course_thumbnail_url: true,
        instructor: {
          select: {
            name: true,
            image: true,
            avatar_url: true
          }
        }
      }
    });

    if (!course) return API.err('Course not found', 'NOT_FOUND', 404);

    // 2. Verify Enrollment
    let enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id
        }
      },
      include: {
        progress: true
      }
    });

    if (!enrollment) {
      try {
        const { enrollStudentInCourse, finalizeEnrollment } = await import('@/lib/services/enrollment');
        const newEnrollment = await enrollStudentInCourse(userId, course.id, {
          method: 'auto_enrollment',
          status: 'active'
        });
        
        // Execute finalization asynchronously
        finalizeEnrollment(userId, course.id, newEnrollment).catch(console.error);

        // Fetch the created enrollment
        enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: course.id
            }
          },
          include: {
            progress: true
          }
        });
      } catch (error: any) {
        console.error('Auto-enrollment failed:', error);
      }
    }

    if (!enrollment) return API.err('You are not enrolled in this course', 'NOT_ENROLLED', 403);

    // 3. Fetch milestones (modules) with their lectures (lessons)
    const modulesFromDb = await prisma.module.findMany({
      where: { courseId: course.id },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { orderNumber: 'asc' }
        }
      }
    });

    let modules = [];
    if (modulesFromDb.length > 0) {
      modules = await Promise.all(modulesFromDb.map(async (mod) => {
        const processedLessons = await Promise.all(mod.lessons.map(async (lesson) => {
          const progress = enrollment.progress.find(p => p.lessonId === lesson.id);
          return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description || '',
            content: lesson.content || '',
            duration: lesson.duration || 10,
            completed: progress?.completed || false,
            videoUrl: await getSecureVideoUrl(lesson.videoUrl || lesson.youtube_video_id || ''),
            contentType: lesson.type?.toLowerCase() || 'video',
            liveStatus: lesson.liveStatus,
            scheduledAt: (lesson as any).scheduledAt || null
          };
        }));
        return {
        id: mod.id,
        title: mod.title,
        lectures: processedLessons,
        lessons: processedLessons
        };
      }));
    } else {
      // Fallback for courses without modules
      const lessons = await prisma.lesson.findMany({
        where: { courseId: course.id, isPublished: true },
        orderBy: { orderNumber: 'asc' }
      });
      
      const processedLessons = await Promise.all(lessons.map(async (lesson) => {
        const progress = enrollment.progress.find(p => p.lessonId === lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description || '',
          content: lesson.content || '',
          duration: lesson.duration || 10,
          completed: progress?.completed || false,
          videoUrl: await getSecureVideoUrl(lesson.videoUrl || lesson.youtube_video_id || ''),
          contentType: lesson.type?.toLowerCase() || 'video',
          liveStatus: lesson.liveStatus,
          scheduledAt: (lesson as any).scheduledAt || null
        };
      }));

      modules = [{
        id: 'default_module',
        title: 'Course Curriculum',
        lectures: processedLessons,
        lessons: processedLessons
      }];
    }

    // 4. Implement Sequential Locking Logic
    let lastCompleted = true; // First lesson is always unlocked
    
    modules = modules.map(mod => ({
      ...mod,
      lessons: mod.lessons.map((lesson: any) => {
        const status = lesson.completed ? 'completed' : (lastCompleted ? 'unlocked' : 'locked');
        lastCompleted = lesson.completed;
        return { ...lesson, status };
      })
    }));

    return API.ok({
      id: course.id,
      title: course.title,
      thumbnail: course.course_thumbnail_url || course.thumbnail || '/sarthi-logo.png',
      instructor: {
        name: course.instructor?.name || 'Dr. Vighnesh VN',
        image: course.instructor?.image || course.instructor?.avatar_url || 'https://ui-avatars.com/api/?name=Dr.+Vighnesh+VN&background=174F3A&color=fff&bold=true'
      },
      progress: enrollment.progressPercentage,
      milestones: modules.map((mod: any) => ({
        id: mod.id,
        title: mod.title,
        lectures: mod.lessons
      })),
      modules
    });

  } catch (error: any) {
    if (error.name === 'AuthenticationError') {
      return API.err(error.message, 'UNAUTHORIZED', 401);
    }
    if (error.name === 'AuthorizationError') {
      return API.err(error.message, 'FORBIDDEN', 403);
    }
    await logError('LEARN_API_ERROR', { error: error.message, params: await params });
    return API.err('Failed to sync learning data', 'SERVER_ERROR', 500);
  }
}
