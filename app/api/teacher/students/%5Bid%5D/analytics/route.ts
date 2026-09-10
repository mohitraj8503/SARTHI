import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { subDays } from 'date-fns';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const studentId = params.id;

    // Fetch student info
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true, avatar_url: true, image: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Fetch enrollments for teacher's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: studentId,
        course: { instructorId: user.id }
      },
      include: {
        course: { select: { id: true, title: true } }
      }
    });

    // Fetch progress and activity
    const progress = await prisma.progress.findMany({
      where: {
        userId: studentId,
        lesson: { course: { instructorId: user.id } }
      }
    });

    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        userId: studentId,
        assignment: { lesson: { course: { instructorId: user.id } } }
      }
    });

    const totalWatchTime = progress.reduce((acc, p) => acc + (p.watchedTime || 0), 0);
    const avgScore = submissions.length > 0 
      ? submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length 
      : 0;

    // Risk Level Logic (Feature 11)
    let riskLevel = 'low';
    const riskFactors = [];

    const lastActive = studentId; // Replace with real activity tracking if available
    const daysSinceActive = 0; // Simplified for now

    if (avgScore < 60 && submissions.length > 0) {
      riskLevel = 'high';
      riskFactors.push('Low assignment scores');
    }

    return NextResponse.json({
      student,
      enrollments,
      activity: {
        totalWatchTime,
        lastActive: new Date(), // Replace with real data
        assignmentsSubmitted: submissions.length,
        avgAssignmentScore: Math.round(avgScore)
      },
      risk: {
        level: riskLevel,
        factors: riskFactors
      },
      insights: {
        strengthAreas: ['Theory'], // Example
        struggleAreas: ['Coding Practice'] // Example
      }
    });
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

