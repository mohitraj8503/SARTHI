export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse, handleApiError } from "@/lib/admin/core";
import { authenticateTeacher } from "@/lib/auth/middleware";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await authenticateTeacher(req);
    const { courseId } = await params;

    // Fetch original course with modules & lessons
    const sourceCourse = await prisma.course.findFirst({
      where: { id: courseId, instructorId: userId },
      include: {
        modules: {
          include: {
            lessons: true
          }
        },
        quizzes: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!sourceCourse) {
      return ApiResponse.error("Source course not found or unauthorized.", "NOT_FOUND", 404);
    }

    const newTitle = `${sourceCourse.title} (Copy)`;
    const newSlug = `${sourceCourse.slug}-copy-${Math.floor(1000 + Math.random() * 9000)}`;

    const duplicatedCourse = await prisma.$transaction(async (tx) => {
      // 1. Create duplicated course base
      const newCourse = await tx.course.create({
        data: {
          title: newTitle,
          slug: newSlug,
          category: sourceCourse.category,
          description: sourceCourse.description,
          level: sourceCourse.level,
          instructorId: userId,
          price: sourceCourse.price,
          pricing_type: sourceCourse.pricing_type,
          thumbnail: sourceCourse.thumbnail,
          isPublished: false,
          publish_state: 'draft',
          isActive: true
        }
      });

      // 2. Duplicate modules and lessons
      for (let mIdx = 0; mIdx < sourceCourse.modules.length; mIdx++) {
        const origMod = sourceCourse.modules[mIdx];
        const newMod = await tx.module.create({
          data: {
            title: origMod.title,
            orderIndex: origMod.orderIndex,
            courseId: newCourse.id
          }
        });

        for (let lIdx = 0; lIdx < origMod.lessons.length; lIdx++) {
          const origLesson = origMod.lessons[lIdx];
          await tx.lesson.create({
            data: {
              title: origLesson.title,
              description: origLesson.description,
              videoUrl: origLesson.videoUrl,
              contentType: origLesson.contentType,
              duration: origLesson.duration,
              position: origLesson.position,
              orderNumber: origLesson.orderNumber,
              courseId: newCourse.id,
              moduleId: newMod.id
            }
          });
        }
      }

      // 3. Duplicate quizzes & questions
      for (const origQuiz of sourceCourse.quizzes) {
        const newQuiz = await tx.quiz.create({
          data: {
            title: origQuiz.title,
            timeLimit: origQuiz.timeLimit,
            passingScore: origQuiz.passingScore,
            courseId: newCourse.id
          }
        });

        for (const origQ of origQuiz.questions) {
          await tx.quizQuestion.create({
            data: {
              quizId: newQuiz.id,
              question: origQ.question,
              options: origQ.options,
              correctAnswer: origQ.correctAnswer,
              points: origQ.points,
              orderNumber: origQ.orderNumber
            }
          });
        }
      }

      return newCourse;
    });

    return ApiResponse.success(duplicatedCourse, "Course structure duplicated successfully.");
  } catch (error: any) {
    return handleApiError(error);
  }
}
