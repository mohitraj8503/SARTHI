export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse, handleApiError } from "@/lib/admin/core";
import { authenticateTeacher } from "@/lib/auth/middleware";

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticateTeacher(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const quizzes = await prisma.quiz.findMany({
      where: {
        course: {
          instructorId: userId
        }
      },
      include: {
        questions: true,
        course: { select: { id: true, title: true } }
      }
    });

    const allQuestions = quizzes.flatMap(q => 
      q.questions.map(quest => ({
        ...quest,
        quizTitle: q.title,
        courseTitle: q.course.title,
        courseId: q.course.id
      }))
    );

    const filtered = search
      ? allQuestions.filter(q => q.question.toLowerCase().includes(search.toLowerCase()))
      : allQuestions;

    return ApiResponse.success({ questions: filtered, total: filtered.length });
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
      return ApiResponse.error("Quiz ID, Question, and Options are required.", "VALIDATION_ERROR", 400);
    }

    // Verify Quiz ownership
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        course: { instructorId: userId }
      }
    });

    if (!quiz) {
      return ApiResponse.error("Quiz not found or unauthorized.", "NOT_FOUND", 404);
    }

    const lastQ = await prisma.quizQuestion.findFirst({
      where: { quizId },
      orderBy: { orderNumber: 'desc' }
    });

    const orderNumber = (lastQ?.orderNumber || 0) + 1;

    const createdQuestion = await prisma.quizQuestion.create({
      data: {
        quizId,
        question: question.trim(),
        options: typeof options === 'string' ? options : JSON.stringify(options),
        correctAnswer: parseInt(correctAnswer || '0') || 0,
        points: parseInt(points || '10') || 10,
        orderNumber
      }
    });

    return ApiResponse.success(createdQuestion, "Question added to Question Bank & Quiz.");
  } catch (error: any) {
    return handleApiError(error);
  }
}
