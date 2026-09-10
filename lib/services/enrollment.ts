import { prisma } from '@/lib/prisma';
import { logPlatformActivity } from '@/lib/logger';
import { publishStudentEnrolled, logActivity } from '@/lib/events';
import { nextEnrollmentNo, nextEnrollmentCode, ensureUserEnrollmentNumber } from '@/lib/enrollment';
import { invalidateDashboardCache } from './dashboard';

/**
 * Handles the complete enrollment process for a student in a course.
 * This is used for both free and paid enrollments.
 */
export async function enrollStudentInCourse(userId: string, courseId: string, options: { 
    paymentId?: string; 
    amount?: number; 
    method?: string;
    status?: 'active' | 'pending';
} = {}) {
    const { paymentId, amount = 0, method = 'self_purchase', status = 'active' } = options;

    try {
        const enrollment = await prisma.$transaction(async (tx) => {
            // 1. Check if course exists (Minimal fetch)
            const course = await tx.course.findUnique({
                where: { id: courseId },
                select: { id: true, title: true, slug: true }
            });
            if (!course) throw new Error('Course not found');

            // 2. Check existing enrollment (Final safety check)
            const existing = await tx.enrollment.findUnique({
                where: { userId_courseId: { userId, courseId } }
            });
            if (existing) return existing;

            // 3. Setup enrollment credentials (Atomic via IdSequence)
            await ensureUserEnrollmentNumber(userId, tx);
            const n = await nextEnrollmentNo(tx);
            const enrollmentCode = await nextEnrollmentCode(n, tx);

            // 4. Create Enrollment
            const newEnrollment = await tx.enrollment.create({
                data: {
                    enrollmentNo: n,
                    enrollmentCode: enrollmentCode,
                    userId,
                    courseId,
                    status,
                    progressPercentage: 0,
                    enrolledBy: method,
                    paymentId: paymentId || (status === 'active' ? 'FREE_ACCESS' : 'PENDING'),
                }
            });

            // 5. Update Course Stats
            await tx.course.update({
                where: { id: courseId },
                data: { enrolledStudentsCount: { increment: 1 } }
            });

            return newEnrollment;
        }, { timeout: 15000 }); // Increased timeout for stability

        // 6. Post-Transaction Tasks (Non-blocking or outside lock)
        // These are important but shouldn't hold up the main enrollment lock
        Promise.all([
            prisma.notification.create({
                data: {
                    userId,
                    title: '🎉 Enrollment Success!',
                    body: `Welcome to your new course. Click here to start your journey.`,
                    type: 'SYSTEM',
                    href: `/courses/${courseId}/learn`
                }
            }).catch(e => console.error('[NotificationError]', e)),
            
            (async () => {
                invalidateDashboardCache(userId);
            })().catch(e => console.error('[CacheError]', e))
        ]);

        return enrollment;
    } catch (error: any) {
        console.error('[EnrollmentServiceError]', error);
        throw error;
    }
}

/**
 * Finalizes post-enrollment tasks (non-blocking)
 */
export async function finalizeEnrollment(userId: string, courseId: string, enrollment: any) {
    const [user, course] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
        prisma.course.findUnique({ where: { id: courseId }, select: { title: true, slug: true } })
    ]);

    const studentName = user?.name || 'Student';

    // 1. Log platform activity
    await logPlatformActivity({
        type: 'COURSE_ENROLLMENT',
        userId,
        description: `Enrolled in ${course?.title}`,
        metadata: { courseId, enrollmentCode: enrollment.enrollmentCode }
    });

    // 2. Real-time events
    await publishStudentEnrolled({
        studentId: userId,
        studentName,
        courseId,
        courseName: course?.title || '',
        teacherId: '', // Default or fetch
        amount: 0
    });

    // 3. Send Confirmation Email
    if (user?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app';
        const learnUrl = `${baseUrl}/courses/${course?.slug || courseId}/learn`;
        
        import('@/lib/email/index').then(({ sendEmail, templates }) => {
            sendEmail({
                to: user.email!,
                ...templates.enrollmentConfirmed(
                    studentName,
                    course?.title || '',
                    enrollment.enrollmentCode,
                    learnUrl,
                    enrollment.paymentId || 'FREE'
                )
            });
        }).catch(err => console.error('[Email] Enrollment fail:', err));
    }
}
