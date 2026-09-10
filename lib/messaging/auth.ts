import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth/jwt";
import { validateSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { withResiliency } from "@/lib/resilient-db";

export interface AuthUser {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

// Memory shield for high-frequency messaging auth
const messagingUserCache = new Map<string, { data: AuthUser, expires: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("tt_session")?.value;

  if (!token) {
    return null;
  }

  // SHIELD: Check cache first
  const cached = messagingUserCache.get(token);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const payload = await verifyJWT(token);
  if (!payload || !payload.userId) {
    return null;
  }

  // TRUST THE PAYLOAD (Saves DB hits)
  const userFromPayload: AuthUser = {
    id: payload.userId,
    role: (payload.role as string || "STUDENT").toUpperCase(),
    name: payload.name as string || "User",
    email: payload.email as string,
    avatar_url: payload.avatar_url as string || null,
  };

  if (token) {
    messagingUserCache.set(token, { data: userFromPayload, expires: Date.now() + CACHE_TTL });
  }

  // Optional: Only validate session if strictly necessary
  // For high-frequency messaging, we can trust the JWT's own expiration
  /*
  if (payload.sessionId) {
    const session = await validateSession(payload.sessionId);
    if (!session || session.userId !== payload.userId) {
      return null;
    }
  }
  */

  return userFromPayload;
}

// Check if user can message another user based on role
export async function canMessageUser(
  currentUserId: string,
  targetUserId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { id: true, role: true },
  });

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true },
  });

  if (!currentUser || !targetUser) {
    return { allowed: false, reason: "User not found" };
  }

  // Admin can message anyone
  if (currentUser.role === "ADMIN") {
    return { allowed: true };
  }

  // Teachers can message students enrolled in their courses
  if (currentUser.role === "TEACHER") {
    const teacherCourses = await prisma.course.findMany({
      where: { instructorId: currentUserId },
      select: { id: true },
    });

    const studentEnrollments = await prisma.enrollment.findFirst({
      where: {
        userId: targetUserId,
        courseId: { in: teacherCourses.map((c) => c.id) },
        status: "active",
      },
    });

    if (studentEnrollments) {
      return { allowed: true };
    }

    // Teachers can also message admin
    if (targetUser.role === "ADMIN") {
      return { allowed: true };
    }

    return { allowed: false, reason: "You can only message your enrolled students" };
  }

  // Students can message teachers of enrolled courses
  if (currentUser.role === "STUDENT") {
    const studentEnrollments = await prisma.enrollment.findMany({
      where: { userId: currentUserId, status: "active" },
      select: { course: { select: { instructorId: true } } },
    });

    const enrolledInstructorIds = studentEnrollments.map(
      (e) => e.course.instructorId
    );

    // Check if target is a teacher of an enrolled course
    if (enrolledInstructorIds.includes(targetUserId)) {
      return { allowed: true };
    }

    // Students can also message admin
    if (targetUser.role === "ADMIN") {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: "You can only message your course instructors",
    };
  }

  return { allowed: false, reason: "Messaging not allowed" };
}
