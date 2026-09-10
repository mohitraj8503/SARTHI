export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth/session';
import { verifyJWT } from '../../../../../lib/auth/jwt';

/**
 * GET /api/courses/[id]/content
 * Returns course content (lessons) if user is enrolled
 * Protected endpoint - requires active enrollment
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseIdOrSlug } = await params;
        console.log(`[API] Fetching content for: ${courseIdOrSlug}`);

        // 1. Get Course ID from Slug/ID first
        const courseRef = await prisma.course.findFirst({
            where: { 
                OR: [
                    { id: courseIdOrSlug },
                    { slug: courseIdOrSlug }
                ]
            },
            select: { id: true, title: true }
        });

        if (!courseRef) {
            console.error(`[API] Course not found: ${courseIdOrSlug}`);
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const courseId = courseRef.id;
        console.log(`[API] Resolved ${courseIdOrSlug} -> ${courseId}`);

        // 2. Auth Check
        let session = await getSession();
        
        // Manual fallback for Bearer token (requested by user)
        if (!session) {
            const authHeader = req.headers.get('Authorization');
            const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
            if (token) {
                try {
                    const payload = await verifyJWT(token);
                    if (payload) {
                        session = {
                            id: payload.sessionId,
                            userId: payload.userId,
                            role: payload.role,
                            email: payload.email || '',
                            name: payload.name || ''
                        };
                        console.log(`[API] Authenticated via Bearer for user: ${session.userId}`);
                    }
                } catch (e) {
                    console.error('[API] Bearer token verification failed');
                }
            }
        }

        if (!session) {
            console.warn(`[API] Unauthorized access attempt for ${courseIdOrSlug}`);
            return NextResponse.json({ error: 'unauthorized', message: 'Session expired or invalid' }, { status: 401 });
        }

        const userId = session.userId;

        // 3. Check enrollment
        // ADMIN and TEACHER roles can bypass enrollment checks
        const isAdminOrTeacher = ['ADMIN', 'TEACHER', 'INSTRUCTOR'].includes(session.role?.toUpperCase() || '');

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            }
        });

        if (!enrollment && !isAdminOrTeacher) {
            console.warn(`[API] User ${userId} not enrolled in ${courseId}`);
            return NextResponse.json({
                error: 'enrollment_required',
                message: `You are not enrolled in ${courseRef.title}. Please enroll to access the technical curriculum.`,
                redirect_url: `/courses/${courseIdOrSlug}`
            }, { status: 403 });
        }

        // Check if enrollment is active (if not admin/teacher)
        if (enrollment && !isAdminOrTeacher) {
            const now = new Date();
            const isExpired = enrollment.expiryDate && enrollment.expiryDate < now;
            const statusUpper = (enrollment.status || '').toUpperCase();
            const isActive = statusUpper === 'ACTIVE' && !isExpired;

            if (!isActive) {
                return NextResponse.json({
                    error: 'enrollment_inactive',
                    message: isExpired ? 'Your access has expired' :
                        statusUpper === 'REVOKED' ? 'Access has been revoked' :
                            'Enrollment not active',
                    redirect_url: `/courses/${courseId}`
                }, { status: 403 });
            }
        }

        // Fetch course with lessons - Support both ID and Slug
        const course = await prisma.course.findFirst({
            where: { 
                OR: [
                    { id: courseId },
                    { slug: courseId }
                ]
            },
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        bio: true
                    }
                },
                lessons: {
                    where: { isPublished: true },
                    orderBy: { orderNumber: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        videoUrl: true,
                        contentType: true,
                        duration: true,
                        orderNumber: true,
                        isFreePreview: true
                    }
                }
            }
        });

        if (!course) {
            return NextResponse.json({
                error: 'Course not found'
            }, { status: 404 });
        }

        // Get user's progress for this course
        const progressEntries = enrollment ? await prisma.progress.findMany({
            where: {
                userId,
                enrollmentId: enrollment.id
            },
            select: {
                lessonId: true,
                completed: true
            }
        }) : [];

        const completedLessonIds = progressEntries.filter(p => p.completed).map(p => p.lessonId);
        const inProgressLessonIds = progressEntries.map(p => p.lessonId);

        // Map lessons with status
        const mappedLessons = course.lessons.map((lesson, idx) => {
            let status = 'locked';
            
            // Bypass logic for staff: All lessons are accessible
            if (isAdminOrTeacher) {
                status = 'active';
            } else if (completedLessonIds.includes(lesson.id)) {
                status = 'completed';
            } else if (idx === 0 || completedLessonIds.includes(course.lessons[idx-1]?.id)) {
                status = 'active';
            }
            
            return {
                ...lesson,
                status,
                duration: lesson.duration ? `${Math.floor(lesson.duration / 60)}m` : '10m'
            };
        });

        // Group into a default module for the UI
        const modules = [
            {
                id: 'mod_1',
                title: 'Core Curriculum',
                duration: `${Math.floor(course.lessons.reduce((acc, l) => acc + (l.duration || 0), 0) / 60)}m`,
                lessons: mappedLessons
            }
        ];

        // Update last accessed time if enrollment exists
        if (enrollment) {
            await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { lastAccessedAt: new Date() }
            });
        }

        // 5. Check for active live sessions for this course
        const activeLiveSession = await prisma.liveSession.findFirst({
            where: {
                courseId: courseId,
                status: 'live'
            },
            select: {
                id: true,
                title: true,
                meetingLink: true
            }
        });

        return NextResponse.json({
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            instructor: course.instructor?.name || 'Expert Faculty',
            progress: enrollment?.progressPercentage || 0,
            activeLiveSession,
            modules
        });

    } catch (error: any) {
        console.error('[CourseContent] Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to load course content'
        }, { status: 500 });
    }
}
