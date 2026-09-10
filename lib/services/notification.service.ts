import { prisma } from '@/lib/prisma';
import { eventBus, RealtimeEvent } from '@/lib/realtime/event-bus';

/**
 * Enterprise Notification Service
 * Orchestrates cross-platform notifications based on real-time system events.
 */
export class NotificationService {
  private static isInitialized = false;

  /**
   * Initialize the notification listener
   */
  static init() {
    if (this.isInitialized) return;
    
    // Listen for database changes via the event bus
    eventBus.on('db_change', async (event: RealtimeEvent) => {
      await this.handleRealtimeEvent(event);
    });

    this.isInitialized = true;
    console.log('🔔 Notification Service Listener Active');
  }

  /**
   * Main event handler for real-time triggers
   */
  private static async handleRealtimeEvent(event: RealtimeEvent) {
    try {
      const { type, payload, metadata } = event;

      switch (type) {
        case 'COURSE_PURCHASE':
        case 'ENROLLMENT_CREATED':
          await this.notifyTeacherOnEnrollment(payload.id);
          break;

        case 'REVIEW_CREATED':
          await this.notifyTeacherOnReview(payload.id);
          break;

        case 'ASSIGNMENT_SUBMITTED':
          await this.notifyTeacherOnSubmission(payload.id);
          break;

        case 'QUESTION_CREATED':
          await this.notifyTeacherOnQuestion(payload.id);
          break;
      }
    } catch (error) {
      console.error('[NotificationService] Event handle error:', error);
    }
  }

  /**
   * Notify teacher when a new student enrolls
   */
  private static async notifyTeacherOnEnrollment(enrollmentId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true, instructorId: true } }
      }
    });

    if (enrollment && enrollment.course.instructorId) {
      await this.createNotification({
        userId: enrollment.course.instructorId,
        title: 'New Student Enrolled',
        message: `${enrollment.user.name || 'A student'} joined your course "${enrollment.course.title}"`,
        type: 'ENROLLMENT',
        link: `/teacher/students?id=${enrollment.userId}`
      });
    }
  }

  /**
   * Notify teacher when a review is posted
   */
  private static async notifyTeacherOnReview(reviewId: string) {
    const review = await prisma.courseReview.findUnique({
      where: { id: reviewId },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true, instructorId: true } }
      }
    });

    if (review && review.course.instructorId) {
      await this.createNotification({
        userId: review.course.instructorId,
        title: 'New Course Review',
        message: `${review.user.name || 'A student'} left a ${review.rating}-star review for "${review.course.title}"`,
        type: 'REVIEW',
        link: `/teacher/reviews`
      });
    }
  }

  /**
   * Notify teacher on assignment submission
   */
  private static async notifyTeacherOnSubmission(submissionId: string) {
    const submission = await prisma.assignmentAttempt.findUnique({
      where: { id: submissionId },
      include: {
        user: { select: { name: true } },
        assignment: { 
          include: { 
            course: { select: { instructorId: true } } 
          } 
        }
      }
    });

    const instructorId = (submission?.assignment as any)?.course?.instructorId;

    if (instructorId) {
      await this.createNotification({
        userId: instructorId,
        title: 'Assignment Submitted',
        message: `${submission.user.name || 'A student'} submitted the assignment "${submission.assignment.title}"`,
        type: 'ASSIGNMENT',
        link: `/teacher/assignments/${submission.assignmentId}`
      });
    }
  }

  /**
   * Notify teacher on new student question
   */
  private static async notifyTeacherOnQuestion(questionId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true, instructorId: true } }
      }
    });

    if (question && question.course?.instructorId) {
      await this.createNotification({
        userId: question.course.instructorId,
        title: 'New Student Question',
        message: `${question.user.name || 'A student'} asked a question in "${question.course.title}"`,
        type: 'QUESTION',
        link: `/teacher/questions/${question.id}`
      });
    }
  }

  /**
   * Centralized notification creator
   */
  private static async createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: string;
    link?: string;
  }) {
    try {
      await prisma.notification.create({
        data: {
          userId: params.userId,
          title: params.title,
          message: params.message,
          type: params.type,
          link: params.link || '#',
          isRead: false
        }
      });

      // Push notification integration would go here (e.g. WebPush)
      console.log(`[Notification] Created for user ${params.userId}: ${params.title}`);
    } catch (err) {
      console.error('[NotificationService] Create failed:', err);
    }
  }
}
