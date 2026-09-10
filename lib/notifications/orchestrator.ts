import { prisma } from '@/lib/prisma'
import { sendClassScheduledEmail, sendClassReminderEmail } from './email'
import { sendPushToUser } from './push'

// Called when teacher creates/schedules a LIVE lesson
export async function onClassScheduled(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        include: {
          enrollments: {
            include: { user: true },
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
  })

  if (!lesson || !lesson.scheduledAt) return

  const course = lesson.course
  const students = course.enrollments.map(e => e.user)
  const teacherName = 'Your Instructor'

  // For each enrolled student:
  for (const student of students) {
    // 1. Create in-app notification
    await prisma.notification.create({
      data: {
        userId: student.id,
        type: 'LIVE_CLASS_SCHEDULED',
        title: `New Live Class: ${lesson.title}`,
        body: `Scheduled for ${lesson.scheduledAt.toLocaleString('en-IN', {
          dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'
        })}`,
        data: { lessonId: lesson.id, courseId: course.id },
      }
    })

    // 2. Send email
    await sendClassScheduledEmail({
      studentEmail: student.email!,
      studentName: student.name || 'Student',
      teacherName,
      lessonTitle: lesson.title,
      courseName: course.title,
      scheduledAt: lesson.scheduledAt,
      lessonId: lesson.id,
    })

    // 3. Send push notification
    await sendPushToUser(student.id, {
      title: `📡 New Live Class: ${lesson.title}`,
      body: `${course.title} · ${lesson.scheduledAt.toLocaleString('en-IN', {
        timeStyle: 'short', timeZone: 'Asia/Kolkata'
      })} IST`,
      url: `/live/${lesson.id}`,
    })
  }

  // Schedule the 1-hour-before reminder in DB
  const reminderTime = new Date(lesson.scheduledAt.getTime() - 60 * 60 * 1000)
  await prisma.scheduledNotification.create({
    data: {
      lessonId: lesson.id,
      scheduledFor: reminderTime,
      type: '1_HOUR_BEFORE',
      sent: false,
    }
  })
}

// Called by cron job every minute
export async function processScheduledReminders() {
  const now = new Date()
  const due = await prisma.scheduledNotification.findMany({
    where: {
      sent: false,
      scheduledFor: { lte: now },
    },
    include: {
      lesson: {
        include: {
          course: {
            include: {
              enrollments: {
                include: { user: true },
                where: { status: 'ACTIVE' }
              }
            }
          }
        }
      }
    }
  })

  for (const scheduled of due) {
    const lesson = scheduled.lesson
    const students = lesson.course.enrollments.map(e => e.user)

    for (const student of students) {
      // In-app notification
      await prisma.notification.create({
        data: {
          userId: student.id,
          type: 'LIVE_CLASS_REMINDER',
          title: `⏰ Starting in 1 hour: ${lesson.title}`,
          body: `Don't miss your live class for ${lesson.course.title}`,
          data: { lessonId: lesson.id },
        }
      })

      // Email reminder
      await sendClassReminderEmail({
        studentEmail: student.email!,
        studentName: student.name || 'Student',
        lessonTitle: lesson.title,
        courseName: lesson.course.title,
        scheduledAt: lesson.scheduledAt!,
        lessonId: lesson.id,
      })

      // Push reminder
      await sendPushToUser(student.id, {
        title: `⏰ Class in 1 hour: ${lesson.title}`,
        body: 'Tap to join when class starts',
        url: `/live/${lesson.id}`,
      })
    }

    // Mark as sent
    await prisma.scheduledNotification.update({
      where: { id: scheduled.id },
      data: { sent: true, sentAt: new Date() }
    })
  }
}

// Called when teacher starts a LIVE session
export async function onClassStarted(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        include: {
          enrollments: {
            include: { user: true },
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
  })

  if (!lesson) return

  const students = lesson.course.enrollments.map(e => e.user)

  for (const student of students) {
    // 1. In-app notification
    await prisma.notification.create({
      data: {
        userId: student.id,
        type: 'LIVE_CLASS_STARTED',
        title: 'Class is LIVE! 📡',
        body: `${lesson.title} has started. Join now!`,
        data: { lessonId: lesson.id, courseId: lesson.course.id },
      }
    }).catch(console.error)

    // 2. Push notification
    await sendPushToUser(student.id, {
      title: 'Class is LIVE! 📡',
      body: `${lesson.title} is now streaming.`,
      url: `/live/${lesson.id}`,
    }).catch(console.error)
  }
}

