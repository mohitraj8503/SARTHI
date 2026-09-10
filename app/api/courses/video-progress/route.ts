export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { recordLearningSession } from '@/lib/services/progress';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) return NextResponse.json({ error: 'Video ID required' }, { status: 400 });

  try {
    const progress = await prisma.videoProgress.findUnique({
      where: {
        user_id_video_id: {
          user_id: user.id,
          video_id: videoId,
        },
      },
    });
    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { courseId, lessonId, progress } = await req.json();

    if (!courseId || !lessonId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isCompleted = progress >= 0.95;

    // Use transaction for atomic progress update
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find enrollment
      const enrollment = await tx.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId } }
      });

      if (!enrollment) throw new Error('Enrollment not found');

      // 2. Upsert lesson progress
      await tx.progress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId: lessonId
          }
        },
        update: {
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : undefined
        },
        create: {
          userId: user.id,
          enrollmentId: enrollment.id,
          lessonId: lessonId,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : undefined
        }
      });

      // 3. Calculate new total progress for course
      const [totalLessons, completedLessons] = await Promise.all([
        tx.lesson.count({ where: { courseId, isPublished: true } }),
        tx.progress.count({ where: { enrollmentId: enrollment.id, completed: true } })
      ]);

      const totalProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      // 4. Update enrollment
      return await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progressPercentage: totalProgress,
          completedAt: totalProgress === 100 ? new Date() : enrollment.completedAt,
        }
      });
    });

    // 5. Update Streak (non-blocking)
    recordLearningSession(user.id, courseId, lessonId, 60).catch(console.error);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Video progress error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update progress' }, { status: 500 });
  }
}

