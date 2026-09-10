export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse, handleApiError } from "@/lib/admin/core";
import { authenticateTeacher } from "@/lib/auth/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await authenticateTeacher(req);
    const { courseId } = await params;

    // Verify course ownership
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId: userId },
      select: { id: true, title: true }
    });

    if (!course) {
      return ApiResponse.error("Course not found or unauthorized.", "NOT_FOUND", 404);
    }

    // Fetch enrollments, assignments, quizzes
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: 'active' },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    const [assignments, quizzes] = await Promise.all([
      prisma.assignment.findMany({
        where: { courseId },
        select: { id: true, title: true, maxScore: true }
      }),
      prisma.quiz.findMany({
        where: { courseId },
        select: { id: true, title: true, passingScore: true }
      })
    ]);

    const studentIds = enrollments.map(e => e.userId);

    const [submissions, quizSubmissions] = await Promise.all([
      prisma.assignmentSubmission.findMany({
        where: {
          assignmentId: { in: assignments.map(a => a.id) },
          userId: { in: studentIds }
        }
      }),
      prisma.quizSubmission.findMany({
        where: {
          quizId: { in: quizzes.map(q => q.id) },
          userId: { in: studentIds }
        }
      })
    ]);

    // Calculate Gradebook
    const studentGrades = enrollments.map(enrollment => {
      const uSubmissions = submissions.filter(s => s.userId === enrollment.userId);
      const uQuizSubs = quizSubmissions.filter(q => q.userId === enrollment.userId);

      const assignmentScore = uSubmissions.length > 0
        ? Math.round(uSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / uSubmissions.length)
        : 0;

      const quizScore = uQuizSubs.length > 0
        ? Math.round(uQuizSubs.reduce((sum, q) => sum + (q.score || 0), 0) / uQuizSubs.length)
        : 0;

      // Default Weighting: 50% Assignments, 50% Quizzes
      const weightedAverage = Math.round((assignmentScore * 0.5) + (quizScore * 0.5));

      let letterGrade = 'F';
      if (weightedAverage >= 90) letterGrade = 'A+';
      else if (weightedAverage >= 80) letterGrade = 'A';
      else if (weightedAverage >= 70) letterGrade = 'B';
      else if (weightedAverage >= 60) letterGrade = 'C';
      else if (weightedAverage >= 50) letterGrade = 'D';

      return {
        userId: enrollment.user.id,
        name: enrollment.user.name || 'Student',
        email: enrollment.user.email,
        image: enrollment.user.image,
        enrolledAt: enrollment.createdAt,
        assignmentScore,
        quizScore,
        weightedAverage,
        letterGrade,
        status: weightedAverage >= 60 ? 'PASSING' : 'NEEDS_ATTENTION'
      };
    });

    return ApiResponse.success({
      course,
      studentGrades,
      summary: {
        totalStudents: studentGrades.length,
        averageClassGrade: studentGrades.length > 0
          ? Math.round(studentGrades.reduce((s, g) => s + g.weightedAverage, 0) / studentGrades.length)
          : 0,
        passingStudents: studentGrades.filter(g => g.status === 'PASSING').length
      }
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
