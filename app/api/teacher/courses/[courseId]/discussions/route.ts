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

    const questions = await prisma.question.findMany({
      where: { courseId },
      include: {
        user: {
          select: { id: true, name: true, image: true, role: true }
        },
        answers: {
          include: {
            user: {
              select: { id: true, name: true, image: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        lesson: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return ApiResponse.success({ questions });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await authenticateTeacher(req);
    const { courseId } = await params;

    const body = await req.json();
    const { questionId, answer, text, lessonId } = body;

    // Post an Answer to an existing Question
    if (questionId && answer) {
      const createdAnswer = await prisma.answer.create({
        data: {
          questionId,
          userId,
          answer: answer.trim()
        },
        include: {
          user: { select: { id: true, name: true, image: true, role: true } }
        }
      });
      return ApiResponse.success(createdAnswer, "Answer posted successfully.");
    }

    // Post a New Question
    if (text) {
      const createdQuestion = await prisma.question.create({
        data: {
          courseId,
          userId,
          question: text.trim(),
          lessonId: lessonId || null
        },
        include: {
          user: { select: { id: true, name: true, image: true, role: true } },
          answers: []
        }
      });
      return ApiResponse.success(createdQuestion, "Discussion thread created.");
    }

    return ApiResponse.error("Invalid discussion body", "VALIDATION_ERROR", 400);
  } catch (error: any) {
    return handleApiError(error);
  }
}
