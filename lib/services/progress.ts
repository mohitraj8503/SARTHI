import { prisma } from '@/lib/prisma';
import { trackStudentActivity } from './growth';
import { invalidateDashboardCache } from './dashboard';

/**
 * Updates a student's progress for a specific lesson and recalculates course progress.
 */
export async function updateLessonProgress(userId: string, courseId: string, lessonId: string, progress: number) {
    return await prisma.$transaction(async (tx) => {
        // 1. Get Enrollment
        const enrollment = await tx.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
            include: { course: { include: { lessons: { where: { isPublished: true } } } } }
        });

        if (!enrollment) throw new Error('Enrollment not found');

        const isCompleted = progress >= 0.9 || progress === 1; // 90% threshold or explicit 100%

        // 2. Upsert Lesson Progress
        await tx.progress.upsert({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId: enrollment.id,
                    lessonId: lessonId
                }
            },
            update: {
                lastPosition: progress,
                watchedTime: progress,
                completed: isCompleted ? true : undefined,
                completedAt: isCompleted ? new Date() : undefined,
            },
            create: {
                userId,
                enrollmentId: enrollment.id,
                lessonId,
                lastPosition: progress,
                watchedTime: progress,
                completed: isCompleted,
                completedAt: isCompleted ? new Date() : undefined,
            }
        });

        // 3. Recalculate Overall Progress
        const totalLessons = enrollment.course.lessons.length;
        const completedLessons = await tx.progress.count({
            where: { enrollmentId: enrollment.id, completed: true }
        });

        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        const isCourseJustCompleted = progressPercentage === 100 && !enrollment.completedAt;

        // 4. Update Enrollment
        const updatedEnrollment = await tx.enrollment.update({
            where: { id: enrollment.id },
            data: {
                progressPercentage,
                lastAccessedAt: new Date(),
                status: progressPercentage === 100 ? 'completed' : 'active',
                completedAt: isCourseJustCompleted ? new Date() : enrollment.completedAt
            }
        });

        // 5. Trigger Completion Flow
        if (isCourseJustCompleted) {
            await handleCourseCompletion(userId, courseId, tx);
        }

        // 6. Track Activity
        if (isCompleted) {
            await trackStudentActivity(userId, 'LESSON_COMPLETE', { courseId, lessonId });
        }

        invalidateDashboardCache(userId);

        return {
            progressPercentage,
            isCompleted,
            courseCompleted: !!updatedEnrollment.completedAt
        };
    });
}

/**
 * Tracks daily learning time and updates streak
 */
export async function recordLearningSession(userId: string, courseId: string, lessonId: string, durationSec: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Record the session
    await prisma.learningSession.create({
        data: {
            userId,
            courseId,
            type: 'lesson_study',
            durationSec,
            date: today
        }
    });

    // 2. Update Streak Logic
    const streak = await prisma.userStreak.findUnique({ where: { userId } });
    
    if (!streak) {
        await prisma.userStreak.create({
            data: {
                userId,
                currentStreak: 1,
                longestStreak: 1,
                lastActiveDate: new Date(),
                totalXP: 10 // Bonus for first session
            }
        });
    } else {
        const lastActive = new Date(streak.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);
        
        const diff = (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diff === 1) {
            // Consecutive day
            await prisma.userStreak.update({
                where: { userId },
                data: {
                    currentStreak: { increment: 1 },
                    longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
                    lastActiveDate: new Date(),
                    totalXP: { increment: 5 }
                }
            });
        } else if (diff > 1) {
            // Streak broken
            await prisma.userStreak.update({
                where: { userId },
                data: {
                    currentStreak: 1,
                    lastActiveDate: new Date(),
                    totalXP: { increment: 5 }
                }
            });
        }
        // If diff === 0, already active today, no streak change
    }
}

/**
 * Handles certificate generation and notifications on completion
 */
async function handleCourseCompletion(userId: string, courseId: string, tx: any) {
    // 1. Check if certificate already exists
    const existing = await tx.certificate.findFirst({
        where: { userId, courseId }
    });

    if (!existing) {
        const certNumber = `TT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        
        await tx.certificate.upsert({
            where: { userId_courseId: { userId, courseId } },
            update: {},
            create: {
                userId,
                courseId,
                certificateNumber: certNumber,
                issuedAt: new Date(),
                status: 'VALID'
            }
        });

        // 2. Notify Student
        await tx.notification.create({
            data: {
                userId,
                title: '🎓 Course Completed!',
                body: 'Congratulations! You have successfully completed the course. Your certificate is now available.',
                type: 'ACHIEVEMENT',
                href: `/dashboard/certificates`
            }
        });
    }
}

/**
 * Returns the best point to resume learning for a course.
 * Priority: 
 * 1. The most recently accessed INCOMPLETE lesson.
 * 2. If all accessed lessons are complete, the first UNTOUCHED lesson by orderNumber.
 * 3. If all lessons are complete, the first lesson.
 */
export async function getResumePoint(userId: string, courseId: string) {
    // 1. Get all progress for this user/course
    const userProgress = await prisma.progress.findMany({
        where: { userId, enrollment: { courseId } },
        orderBy: { updatedAt: 'desc' },
        include: { lesson: true }
    });

    // 2. Try to find the most recently touched lesson that isn't finished yet
    const incompleteProgress = userProgress.find(p => !p.completed);
    if (incompleteProgress) {
        return {
            lessonId: incompleteProgress.lessonId,
            lessonTitle: incompleteProgress.lesson.title,
            progress: incompleteProgress.lastPosition
        };
    }

    // 3. If all touched lessons are complete, find the next one in sequence
    const completedLessonIds = userProgress.filter(p => p.completed).map(p => p.lessonId);
    
    // Find first lesson NOT in completedLessonIds
    const nextLesson = await prisma.lesson.findFirst({
        where: { 
            courseId, 
            isPublished: true,
            id: { notIn: completedLessonIds }
        },
        orderBy: { orderNumber: 'asc' }
    });

    if (nextLesson) {
        return {
            lessonId: nextLesson.id,
            lessonTitle: nextLesson.title,
            progress: 0
        };
    }

    // 4. Default/Fallback: First lesson
    const firstLesson = await prisma.lesson.findFirst({
        where: { courseId, isPublished: true },
        orderBy: { orderNumber: 'asc' }
    });

    return {
        lessonId: firstLesson?.id,
        lessonTitle: firstLesson?.title,
        progress: 0
    };
}
