export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { enrollStudentInCourse, finalizeEnrollment } from '@/lib/services/enrollment';
import { withResiliency } from '@/lib/resilient-db';

export async function POST(req: Request) {
  try {
    const { courseId } = await req.json();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!courseId) {
      return NextResponse.json({ message: 'Course ID required' }, { status: 400 });
    }

    // 1. Fetch course & existing enrollment with resiliency
    const [courseRes, enrollmentRes] = await Promise.all([
      withResiliency(
        () => prisma.course.findUnique({ where: { id: courseId } }),
        `enroll-course-${courseId}`
      ),
      withResiliency(
        () => prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: user.id, courseId } }
        }),
        `check-enroll-${user.id}-${courseId}`
      )
    ]);
    
    if (!courseRes.success || !courseRes.data) {
      return NextResponse.json({ message: courseRes.error === 'TIMEOUT' ? 'Database busy, try again' : 'Course not found' }, { status: courseRes.data ? 500 : 404 });
    }

    const course = courseRes.data;

    // Early return if already enrolled
    if (enrollmentRes.data) {
      return NextResponse.json({
        message: 'Already enrolled',
        enrollmentId: enrollmentRes.data.id,
        enrollmentCode: enrollmentRes.data.enrollmentCode,
        courseId: course.id
      });
    }

    // STRICTOR CHECK: Only allow self-enrollment if the course is FREE
    if (Number(course.price) > 0 && course.pricing_type !== 'FREE') {
      return NextResponse.json(
        { message: 'Payment required for this course' },
        { status: 402 }
      );
    }

    // 2. Transaction-Safe Enrollment via Service with Resiliency
    const finalEnrollmentRes = await withResiliency(
      () => enrollStudentInCourse(user.id, courseId, { 
        method: 'free_enrollment',
        status: 'active'
      })
    );

    if (!finalEnrollmentRes.success || !finalEnrollmentRes.data) {
       console.error('Enrollment failure:', finalEnrollmentRes.error);
       return NextResponse.json({ 
         message: 'Enrollment failed due to server congestion. Please try again in a moment.',
         error: finalEnrollmentRes.error 
       }, { status: 500 });
    }

    const enrollment = finalEnrollmentRes.data;

    // 3. Async Finalization (Logs, Emails, Realtime Dashboard)
    finalizeEnrollment(user.id, courseId, enrollment).catch(console.error);

    return NextResponse.json({
      message: 'Enrolled successfully',
      enrollmentId: enrollment.id,
      invoiceId: enrollment.id,
      enrollmentCode: enrollment.enrollmentCode,
      courseId: course.id
    });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

