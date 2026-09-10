export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentUser } from '../../../../lib/auth';

/**
 * GET /api/enrollments/status?courseId=xxx
 * Checks real-time enrollment status from database
 * Returns enrollment data if user is enrolled, null otherwise
 */
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({
                enrolled: false,
                error: 'Not authenticated'
            }, { status: 401 });
        }

        const userId = user.id;

        // Get courseId from query params
        const url = new URL(req.url);
        const courseId = url.searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json({
                enrolled: false,
                error: 'Missing courseId parameter'
            }, { status: 400 });
        }

        // ADMIN and TEACHER roles can bypass enrollment checks
        const isAdminOrTeacher = ['ADMIN', 'TEACHER', 'INSTRUCTOR'].includes(user.role?.toUpperCase() || '');

        // Check enrollment in database
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            },
            include: {
                course: true
            }
        });

        if (!enrollment && !isAdminOrTeacher) {
            return NextResponse.json({
                enrolled: false,
                enrollment: null,
                shouldShow: 'enroll_now'
            });
        }

        // Fetch last watched lesson (if enrollment exists)
        const lastProgress = enrollment ? await prisma.progress.findFirst({
            where: {
                enrollmentId: enrollment.id
            },
            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                lesson: {
                    select: {
                        id: true,
                        title: true,
                        orderNumber: true
                    }
                }
            }
        }) : null;

        // Check if enrollment is active and not expired
        const now = new Date();
        let isExpired = false;
        let isActive = isAdminOrTeacher;

        if (enrollment) {
            isExpired = !!(enrollment.expiryDate && enrollment.expiryDate < now);
            const statusUpper = (enrollment.status || '').toUpperCase();
            isActive = isAdminOrTeacher || ((statusUpper === 'ACTIVE' || statusUpper === 'COMPLETED') && !isExpired);
        }

        // User is enrolled
        return NextResponse.json({
            enrolled: isActive,
            isEnrolled: isActive,
            enrollment: enrollment ? {
                id: enrollment.id,
                userId: enrollment.userId,
                courseId: enrollment.courseId,
                status: isExpired ? 'expired' : enrollment.status,
                enrolledAt: enrollment.createdAt,
                enrolledBy: enrollment.enrolledBy,
                progressPercentage: enrollment.progressPercentage,
                lastAccessedAt: enrollment.lastAccessedAt,
                expiryDate: enrollment.expiryDate,
                completedAt: enrollment.completedAt,
                course: enrollment.course
            } : null,
            lastWatched: lastProgress?.lesson ? {
                id: lastProgress.lesson.id,
                title: lastProgress.lesson.title,
                orderNumber: lastProgress.lesson.orderNumber
            } : null,
            accessGranted: isActive,
            shouldShow: isActive ? 'continue_learning' : 'enroll_now',
            message: !isActive ? (
                isExpired ? 'Your access has expired' :
                    enrollment?.status === 'revoked' ? 'Access has been revoked' :
                        enrollment?.status === 'pending' ? 'Enrollment pending approval' :
                            'Enrollment not active'
            ) : undefined
        });

    } catch (error: unknown) {
        console.error('[EnrollmentStatus] Error:', error);
        return NextResponse.json({
            enrolled: false,
            error: error instanceof Error ? error.message : 'Failed to check enrollment status'
        }, { status: 500 });
    }
}

