import { authenticateStudent } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { API } from '@/lib/api/response';
import { logError } from '@/lib/logger';
import { calculateCourseProgress, isLessonUnlocked, isCertificateEligible } from '@/lib/learning/utils';
import { getGoogleDriveDirectUrl } from '@/lib/video-utils';
import crypto from 'crypto';

/**
 * Reliable Course Content Delivery API
 * Fetches lessons, calculates progress, and generates secure media tokens.
 */
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = await authenticateStudent(request);
    
    // Verify enrollment atomically with content and progress
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId: params.id, status: 'active' },
      include: { 
        course: { 
          include: { 
            lessons: { 
              where: { isPublished: true },
              orderBy: { position: 'asc' } 
            } 
          } 
        },
        progress: {
          include: { lesson: { select: { position: true } } }
        }
      }
    });
    
    if (!enrollment) return API.err('Course access not found', 'NOT_ENROLLED', 404);
    
    // Determine the next lesson to continue from
    const completedLessonIds = new Set(enrollment.progress.filter(p => p.completed).map(p => p.lessonId));
    const nextLesson = enrollment.course.lessons.find(l => !completedLessonIds.has(l.id));
    
    const lessons = await Promise.all(enrollment.course.lessons.map(async (lesson) => {
      const isVideo = lesson.type === 'VIDEO';
      const isLocked = !isLessonUnlocked(lesson, enrollment.progress);
      
      return {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type.toLowerCase(),
        duration: lesson.duration,
        // Securely sign video URLs if it's a video lesson
        contentUrl: (isVideo && !isLocked) 
          ? await getSecureVideoUrl(lesson.videoUrl || lesson.youtube_video_id || '') 
          : lesson.videoUrl,
        isLocked,
        isCompleted: completedLessonIds.has(lesson.id),
        isNext: lesson.id === nextLesson?.id
      };
    }));
    
    return API.ok({
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        thumbnail: enrollment.course.thumbnail,
        progressPercentage: enrollment.progressPercentage,
        isCertificateEligible: isCertificateEligible(enrollment)
      },
      lessons,
      meta: { 
        canContinue: !!nextLesson,
        nextLessonId: nextLesson?.id,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    await logError('CONTENT_LOAD_ERROR', { courseId: params.id, error: error.message });
    return API.err('Failed to load course content', 'CONTENT_ERROR', 500);
  }
}

/**
 * Generates a time-limited signed URL for video streaming
 * Prevents unauthorized sharing and downloading.
 */
async function getSecureVideoUrl(videoId: string) {
  if (!videoId) return null;
  if (videoId.startsWith('http')) return getGoogleDriveDirectUrl(videoId);

  const expires = Math.floor(Date.now() / 1000) + 7200; // 2 hours
  const signature = crypto.createHmac('sha256', process.env.VIDEO_SIGNING_KEY || 'tt_secret_key')
    .update(`${videoId}:${expires}`).digest('hex');
  
  const cdnUrl = process.env.CDN_URL || 'https://cdn.sarthi-woad.vercel.app';
  return `${cdnUrl}/videos/${videoId}.m3u8?sig=${signature}&exp=${expires}`;
}
