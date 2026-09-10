export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, handleApiError } from '@/lib/admin/core';
import { authenticateTeacher } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticateTeacher(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const courseId = searchParams.get('courseId');

    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: { id: true }
    });

    // Fetch courses owned by teacher
    const teacherCourses = await prisma.course.findMany({
      where: {
        OR: [
          { instructorId: userId },
          ...(teacher ? [{ teacherId: teacher.id }] : [])
        ]
      },
      select: { id: true }
    });

    const teacherCourseIds = teacherCourses.map(c => c.id);

    const where: any = {
      quiz: {
        courseId: courseId ? courseId : { in: teacherCourseIds }
      }
    };

    if (search) {
      where.question = { contains: search };
    }

    const questions = await prisma.quizQuestion.findMany({
      where,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            course: {
              select: { id: true, title: true }
            }
          }
        }
      },
      orderBy: { id: 'desc' },
      take: 50
    });

    return ApiResponse.success(questions);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateTeacher(req);
    const body = await req.json();

    const { quizId, question, options, correctAnswer, points } = body;

    if (!quizId || !question || !options) {
      return ApiResponse.error("Quiz ID, question text, and options are required.", "VALIDATION_ERROR", 400);
    }

    // Verify ownership of quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: { select: { instructorId: true } } }
    });

    if (!quiz || quiz.course.instructorId !== userId) {
      return ApiResponse.unauthorized("Unauthorized to modify this quiz.");
    }

    const newQuestion = await prisma.quizQuestion.create({
      data: {
        quizId,
        question: question.trim(),
        options: typeof options === 'string' ? options : JSON.stringify(options),
        correctAnswer: parseInt(correctAnswer) || 0,
        points: parseInt(points) || 10,
        orderNumber: (await prisma.quizQuestion.count({ where: { quizId } })) + 1
      }
    });

    return ApiResponse.success(newQuestion, "Question added to bank successfully.");
  } catch (error: any) {
    return handleApiError(error);
  }
}
