import { prisma } from './prisma';

/**
 * Robust session lookup that works with both curriculum lessons and standalone live sessions.
 * Matches by:
 * 1. Lesson ID
 * 2. Lesson liveRoomName
 * 3. LiveSession ID
 * 4. LiveSession roomId
 * 5. LiveSession meetingLink
 */
export async function findSessionByAnyId(identifier: string) {
  if (!identifier) return null;

  // 1. Try Lesson by ID
  let lesson = await prisma.lesson.findUnique({
    where: { id: identifier },
    include: {
      module: {
        include: {
          course: true
        }
      }
    }
  });

  if (lesson) {
    return {
      type: 'lesson' as const,
      data: lesson,
      courseId: lesson.courseId,
      liveRoomName: lesson.liveRoomName,
      title: lesson.title,
    };
  }

  // 2. Try Lesson by liveRoomName
  lesson = await prisma.lesson.findUnique({
    where: { liveRoomName: identifier },
    include: {
      module: {
        include: {
          course: true
        }
      }
    }
  });

  if (lesson) {
    return {
      type: 'lesson' as const,
      data: lesson,
      courseId: lesson.courseId,
      liveRoomName: lesson.liveRoomName,
      title: lesson.title,
    };
  }

  // 3. Try LiveSession by ID
  let liveSession = await prisma.liveSession.findUnique({
    where: { id: identifier },
    include: {
      course: true,
      lesson: {
        include: {
          module: {
            include: {
              course: true
            }
          }
        }
      }
    }
  });

  if (liveSession) {
    return {
      type: 'liveSession' as const,
      data: liveSession,
      courseId: liveSession.courseId,
      liveRoomName: liveSession.roomId || liveSession.meetingLink,
      title: liveSession.title,
    };
  }

  // 4. Try LiveSession by roomId or meetingLink
  liveSession = await prisma.liveSession.findFirst({
    where: {
      OR: [
        { roomId: identifier },
        { meetingLink: identifier }
      ]
    },
    include: {
      course: true,
      lesson: {
        include: {
          module: {
            include: {
              course: true
            }
          }
        }
      }
    }
  });

  if (liveSession) {
    return {
      type: 'liveSession' as const,
      data: liveSession,
      courseId: liveSession.courseId,
      liveRoomName: liveSession.roomId || liveSession.meetingLink,
      title: liveSession.title,
    };
  }

  return null;
}
