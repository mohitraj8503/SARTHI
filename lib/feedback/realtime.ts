import { prisma } from '../prisma';

/**
 * Enterprise Feedback Service
 * Connects teachers and students via automated notifications and WebSocket broadcasts.
 */
export class FeedbackService {
  /**
   * Notifies teacher of a new student submission
   */
  static async notifyTeacherOfSubmission(submissionId: string) {
    try {
      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: { 
          user: { select: { name: true } },
          assignment: { 
            include: { 
              lesson: { include: { course: { include: { instructor: true } } } } 
            } 
          } 
        }
      });
      
      if (!submission?.assignment?.lesson?.course?.instructor?.id) return;
      
      const teacherId = submission.assignment.lesson.course.instructor.id;
      const studentName = submission.user?.name || 'A student';
      const assignmentTitle = submission.assignment.title;
      
      // Persistent record
      await prisma.notification.create({
        data: {
          userId: teacherId,
          type: 'SUBMISSION_RECEIVED',
          title: 'Review Required',
          message: `${studentName} submitted ${assignmentTitle}`,
          data: JSON.stringify({ submissionId, type: 'assignment' }),
          priority: 'high'
        }
      });
      
      // Live notification
      const io = (global as any).websocketServer;
      if (io) {
        io.to(`teacher:${teacherId}`).emit('notification', {
          type: 'NEW_SUBMISSION',
          title: 'New Submission',
          message: `${studentName} submitted ${assignmentTitle}`,
          submissionId
        });
      }
    } catch (err) {
      console.error('Feedback service error:', err);
    }
  }

  /**
   * Dispatches teacher feedback to the student
   */
  static async deliverFeedback(submissionId: string, feedback: { score: number; comments: string }) {
    try {
      const submission = await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          status: 'graded',
          score: feedback.score,
          feedback: feedback.comments,
          gradedAt: new Date()
        },
        include: { user: true, assignment: { select: { title: true } } }
      });
      
      const studentId = submission.userId;
      
      // Persistent record
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: 'FEEDBACK_RECEIVED',
          title: 'Work Graded',
          message: `Score: ${feedback.score}% for ${submission.assignment.title}`,
          data: JSON.stringify({ submissionId, score: feedback.score }),
          priority: 'high'
        }
      });
      
      // Live notification
      const io = (global as any).websocketServer;
      if (io) {
        io.to(`student:${studentId}`).emit('feedback:received', {
          submissionId,
          score: feedback.score,
          comments: feedback.comments,
          timestamp: Date.now()
        });
      }
      
      return submission;
    } catch (err) {
      console.error('Feedback delivery error:', err);
      throw err;
    }
  }

  /**
   * Notifies teacher when a student is struggling with a quiz
   */
  static async notifyTeacherOfStruggle(studentId: string, lessonId: string, score: number) {
    try {
      const student = await prisma.user.findUnique({ where: { id: studentId }, select: { name: true } });
      const lesson = await prisma.lesson.findUnique({ 
        where: { id: lessonId }, 
        include: { course: { include: { instructor: true } } } 
      });
      
      if (!lesson?.course?.instructor?.id) return;
      
      await prisma.notification.create({
        data: {
          userId: lesson.course.instructor.id,
          type: 'STUDENT_STRUGGLE',
          title: 'Student Needs Help',
          message: `${student?.name} failed quiz in ${lesson.title} with ${score}%`,
          data: JSON.stringify({ studentId, lessonId, score }),
          priority: 'high'
        }
      });
    } catch (err) {
      console.error('Struggle notification error:', err);
    }
  }
}
