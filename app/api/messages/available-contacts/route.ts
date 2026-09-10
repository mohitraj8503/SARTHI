export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/messaging/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let availableContacts: Array<{
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      role: string;
      courseTitle?: string;
    }> = [];

    if (user.role === "ADMIN") {
      // Admin can contact anyone
      availableContacts = await prisma.user.findMany({
        where: {
          id: { not: user.id },
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    } else if (user.role === "TEACHER") {
      // Teachers can contact students enrolled in their courses + admin
      const teacherCourses = await prisma.course.findMany({
        where: { instructorId: user.id },
        select: { id: true, title: true },
      });

      const courseIds = teacherCourses.map((c) => c.id);

      // Get enrolled students
      const enrolledStudents = await prisma.enrollment.findMany({
        where: {
          courseId: { in: courseIds },
          status: "active",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
      });

      // Get admin users
      const admins = await prisma.user.findMany({
        where: {
          role: "ADMIN",
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      });

      // Format students with course info
      const students = enrolledStudents.map((e) => ({
        ...e.user,
        courseTitle: e.course.title,
      }));

      availableContacts = [...admins, ...students];
    } else if (user.role === "STUDENT") {
      // Get enrolled courses with their instructors
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userId: user.id,
          status: "active",
        },
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      // Get unique instructors
      const instructorMap = new Map();
      enrollments.forEach((e) => {
        if (e.course.instructor && !instructorMap.has(e.course.instructor.id)) {
          instructorMap.set(e.course.instructor.id, {
            ...e.course.instructor,
            courseTitle: e.course.title,
          });
        }
      });

      // Get admin users
      const admins = await prisma.user.findMany({
        where: {
          role: "ADMIN",
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      });

      // Get the student's internship batch memberships and their mentors
      const batchMembers = await prisma.batchMember.findMany({
        where: { userId: user.id },
        include: {
          batch: true,
        },
      });

      const mentorEmails = batchMembers
        .map((bm) => bm.batch?.mentorEmail)
        .filter(Boolean);

      const mentors = await prisma.user.findMany({
        where: {
          email: { in: mentorEmails },
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      });

      const formattedMentors = mentors.map((m) => ({
        ...m,
        courseTitle: "Internship Mentor",
      }));

      // Combine and filter duplicates
      const uniqueContactsMap = new Map();

      // Add instructors
      Array.from(instructorMap.values()).forEach((c: any) => {
        uniqueContactsMap.set(c.id, c);
      });

      // Add mentors
      formattedMentors.forEach((c) => {
        uniqueContactsMap.set(c.id, c);
      });

      // Add admins
      admins.forEach((c) => {
        uniqueContactsMap.set(c.id, c);
      });

      availableContacts = Array.from(uniqueContactsMap.values());
    } else if (user.role === "MENTOR") {
      // Mentors can contact interns assigned to their batches + admins
      const mentorBatches = await prisma.internshipBatch.findMany({
        where: { mentorEmail: user.email || "" },
        select: { id: true }
      });
      const batchIds = mentorBatches.map((b) => b.id);

      const batchMembers = await prisma.batchMember.findMany({
        where: { batchId: { in: batchIds } },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true
            }
          }
        }
      });

      const interns = batchMembers
        .map((bm) => bm.user)
        .filter(Boolean)
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email ? u.email : "",
          image: u.image,
          role: u.role,
          courseTitle: "Internship Member"
        }));

      const admins = await prisma.user.findMany({
        where: {
          role: "ADMIN",
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      });

      const formattedAdmins = admins.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email ? a.email : "",
        image: a.image,
        role: a.role,
        courseTitle: "System Support"
      }));

      const uniqueContactsMap = new Map();
      interns.forEach((c) => uniqueContactsMap.set(c.id, c));
      formattedAdmins.forEach((c) => uniqueContactsMap.set(c.id, c));
      availableContacts = Array.from(uniqueContactsMap.values());
    }

    return NextResponse.json({ contacts: availableContacts });
  } catch (error) {
    console.error("Error fetching available contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

