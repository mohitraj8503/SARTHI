import { authenticateStudent } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { API } from '@/lib/api/response';

/**
 * Student Quiz Retrieval API
 * Returns questions without sensitive correct-answer data.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await authenticateStudent(request);
    const { id: lessonId } = await params;
    
    let quiz = await prisma.quiz.findFirst({
      where: { id: lessonId },
      include: {
        questions: {
          orderBy: { orderNumber: 'asc' }
        }
      }
    });

    // Fallback: search by courseId of the lesson
    if (!quiz) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { courseId: true }
      });
      if (lesson) {
        quiz = await prisma.quiz.findFirst({
          where: { courseId: lesson.courseId },
          include: {
            questions: {
              orderBy: { orderNumber: 'asc' }
            }
          }
        });
      }
    }
    
    if (!quiz) return API.ok({ available: false });
    
    return API.ok({
      available: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        questions: quiz.questions.map(q => ({
          id: q.id,
          prompt: q.question,
          // Parsing options if they are stored as JSON strings
          options: JSON.parse(q.options || '[]').map((o: any, idx: number) => ({ id: idx, text: o })),
        }))
      }
    });
    
  } catch (error) {
    console.error('Quiz Fetch Error:', error);
    return API.server();
  }
}

/**
 * Quiz Submission & Auto-Grading Engine
 * Server-side validation to prevent tampering.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await authenticateStudent(request);
    const { id: lessonId } = await params;
    const { answers } = await request.json(); // { questionId: number }
    
    const result = await prisma.$transaction(async (tx) => {
      let quiz = await tx.quiz.findUnique({
        where: { id: lessonId },
        include: { questions: true }
      });

      // Fallback: search by courseId of the lesson
      if (!quiz) {
        const lesson = await tx.lesson.findUnique({
          where: { id: lessonId },
          select: { courseId: true }
        });
        if (lesson) {
          quiz = await tx.quiz.findFirst({
            where: { courseId: lesson.courseId },
            include: { questions: true }
          });
        }
      }
      
      if (!quiz) throw new Error('Quiz not found');
      
      let correctCount = 0;
      const feedback = quiz.questions.map(q => {
        const userAnswer = answers[q.id];
        const isCorrect = Number(userAnswer) === q.correctAnswer;
        if (isCorrect) correctCount++;
        
        return {
          questionId: q.id,
          correct: isCorrect,
          correctAnswer: q.correctAnswer
        };
      });
      
      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const passed = score >= quiz.passingScore;
      
      // Atomic recording of the attempt
      const attempt = await tx.quizSubmission.create({
        data: {
          quizId: quiz.id,
          userId,
          score,
          maxScore: 100,
          passed,
          answer: JSON.stringify(answers),
        }
      });
      
      return { attempt, feedback, passed, score };
    });
    
    return API.ok(result);
    
  } catch (error) {
    console.error('Quiz Submission Error:', error);
    return API.server();
  }
}
