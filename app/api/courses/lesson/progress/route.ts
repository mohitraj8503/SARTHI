export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, lessonId, time, duration, completed } = await req.json();

    if (!courseId || !lessonId) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // 1. Get Enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      select: { id: true }
    });

    if (!enrollment) {
      return NextResponse.json({ message: 'Not enrolled' }, { status: 403 });
    }

    // 2. Upsert Progress Record
    await prisma.progress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: {
        watchedTime: time || 0,
        lastPosition: time || 0,
        completed: completed || false,
        completedAt: completed ? new Date() : undefined,
      },
      create: {
        userId: user.id,
        enrollmentId: enrollment.id,
        lessonId,
        watchedTime: time || 0,
        lastPosition: time || 0,
        completed: completed || false,
        completedAt: completed ? new Date() : undefined,
      },
    });

    // 2.2 LOG LEARNING SESSION (Real-time tracking)
    // Assume heartbeats send 'duration' which is the delta since last log, or use 30s as a default if not provided
    const sessionDuration = duration || 30; 
    const { StudentTracking } = await import('@/lib/student/tracking');
    await StudentTracking.logSession(user.id, courseId, 'video', sessionDuration);

    // 2.1 Update Real-time Video Session (Heartbeat for dashboard)
    // This allows the instructor dashboard to show "Active Learners"

    // BETTER APPROACH: Find active session or create new
    const activeSession = await prisma.videoSession.findFirst({
        where: {
            studentId: user.id,
            lessonId,
            courseId
        }
    });

    if (activeSession) {
        await prisma.videoSession.update({
            where: { id: activeSession.id },
            data: { lastHeartbeat: new Date(), isActive: true }
        });
    } else {
        await prisma.videoSession.create({
            data: {
                studentId: user.id,
                lessonId,
                courseId,
                isActive: true
            }
        });
    }

    // 3. Recalculate Course Progress Percentage
    // Count total published video lessons
    const totalLessons = await prisma.lesson.count({
      where: { 
        courseId, 
        isPublished: true,
        contentType: 'video' 
      }
    });

    // Count completed lessons for this enrollment
    const completedCount = await prisma.progress.count({
      where: {
        enrollmentId: enrollment.id,
        completed: true
      }
    });

    const newPercentage = totalLessons > 0 
      ? Math.min(Math.round((completedCount / totalLessons) * 100), 100)
      : 0;

    // Update Enrollment Percentage
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercentage: newPercentage,
        lastAccessedAt: new Date(),
        completedAt: newPercentage === 100 ? new Date() : null
      }
    });

    // 4. TRIGGER CERTIFICATE CREATION (If course is completed)
    if (newPercentage === 100) {
        try {
            // Check if already certified
            const existingCert = await prisma.certificate.findFirst({
                where: { userId: user.id, courseId: courseId }
            });

            if (!existingCert) {
                const { CertificateGenerator } = await import('@/lib/certificate-generator');
                const certNumber = CertificateGenerator.generateCertificateId(user.id, courseId);
                
                await prisma.certificate.upsert({
                    where: { userId_courseId: { userId: user.id, courseId } },
                    update: {},
                    create: {
                        certificateNumber: certNumber,
                        userId: user.id,
                        courseId: courseId,
                        status: 'VALID',
                        issuedAt: new Date(),
                        tier: 'free',
                        metadata: JSON.stringify({
                            type: 'course_completion',
                            completedAt: new Date().toISOString()
                        })
                    }
                });
                console.log(`[CERTIFICATE] Generated for user ${user.id} - course ${courseId}`);
            }
        } catch (certError) {
            console.error('[CERTIFICATE_TRIGGER_ERROR]', certError);
        }
    }

    return NextResponse.json({ success: true, progress: newPercentage });

  } catch (error) {
    console.error('Lesson Progress Error:', error);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');
    const courseId = searchParams.get('courseId');

    if (!lessonId || !courseId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId } },
        select: { id: true }
    });

    if (!enrollment) return NextResponse.json({ progress: null });

    const progress = await prisma.progress.findUnique({
        where: {
            enrollmentId_lessonId: {
                enrollmentId: enrollment.id,
                lessonId
            }
        },
        select: { lastPosition: true, completed: true }
    });

    return NextResponse.json(progress || { lastPosition: 0, completed: false });
}
