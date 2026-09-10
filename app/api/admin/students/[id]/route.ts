import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isIilmUniversity } from '@/lib/utils/iilm';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/students/[id]
 * Returns detailed information about a specific student
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: studentId } = await params;

    // Fetch student with rich intelligence data
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        avatar_url: true,
        avatar_version: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        lastActive: true,
        enrollmentNumber: true,
        loginCount: true,
        failedLoginAttempts: true,
        emailVerified: true,
        location: true,
        authProvider: true,
        college: true,
        currentCourse: true,
        lastQualification: true,
        onboarded: true,
        onboardingStatus: true,
        bio: true,
        studentId: true,
        _count: {
          select: {
            enrollments: true,
            videoProgress: true,
            quizSubmissions: true,
          },
        },
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                level: true,
              }
            }
          }
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Fetch internship applications submitted by this student (by studentId or email)
    const applications = await prisma.internshipApplication.findMany({
      where: {
        OR: [
          { studentId: studentId },
          { email: student.email }
        ]
      },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    });

    // Get comprehensive activity logs (System Logs)
    const recentActivity = await prisma.platformActivity.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: 'desc' },
      take: 50, // More logs for the intelligence view
    });

    // Calculate Learning Intelligence Metrics
    const activeEnrollments = student.enrollments.filter(e => e.status === 'active');
    const avgProgress = student.enrollments.length > 0 
      ? Math.round(student.enrollments.reduce((acc, e) => acc + (e.progressPercentage || 0), 0) / student.enrollments.length)
      : 0;

    // Simulate/Estimate Watch Time (based on video progress entries)
    // 1 progress entry ~ 15 mins of avg watch time for estimation
    const estimatedWatchTimeHrs = Math.round((student._count.videoProgress * 15) / 60);

    const isIilmStudent = isIilmUniversity(student.college) || applications.some(a => isIilmUniversity(a.college));

    const sanitizedApplications = applications.map(app => {
      if (isIilmStudent || isIilmUniversity(app.college)) {
        return {
          ...app,
          status: 'NOT APPLIED',
        };
      }
      return app;
    });

    return NextResponse.json({
      student: {
        ...student,
        phone: isIilmStudent ? null : student.phone,
        applications: sanitizedApplications,
        stats: {
          enrolledCourses: student._count.enrollments,
          activeCourses: activeEnrollments.length,
          avgProgress,
          totalWatchTime: `${estimatedWatchTimeHrs}h`,
          engagementScore: Math.min(100, (student.loginCount * 2) + (student._count.videoProgress * 5)),
          attendanceRate: student.enrollments.length > 0 
            ? Math.round(student.enrollments.reduce((acc, e) => acc + (e.liveAttendanceRate || 0), 0) / student.enrollments.length)
            : 0
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Failed to fetch student details:', error);
    return NextResponse.json({ error: 'Failed to fetch student details' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/students/[id]
 * Update student information
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: studentId } = await params;
    const { name, email, phone, status } = await request.json();

    // Check if student exists
    const existingStudent = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingStudent.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
    }

    // Update student
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(status && { status }),
      },
    });

    // Log activity
    await prisma.platformActivity.create({
      data: {
        type: 'STUDENT_UPDATED',
        userId: session?.id,
        data: JSON.stringify({
          description: `Student updated: ${name || existingStudent.name}`,
          changes: { name, email, phone, status },
        }),
      },
    });

    return NextResponse.json({
      success: true,
      student: updatedStudent,
    });
  } catch (error) {
    console.error('Failed to update student:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}
