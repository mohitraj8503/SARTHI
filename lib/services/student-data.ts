import { prisma } from "@/lib/prisma";

/**
 * Domain-specific student data access service.
 * Separates Main student data access from Junior student data access to provide
 * strict logical boundary isolation and enable potential physical partitioning.
 */

export interface MainStudentData {
  userId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    college: string | null;
    educationLevel: string | null;
  };
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    progressPercentage: number;
  }>;
  internships: Array<{
    id: string;
    status: string;
    domain: string | null;
  }>;
  certificates: Array<{
    id: string;
    title: string | null;
    certificateNumber: string;
  }>;
  ambassadorProfile: any | null;
}

export interface JuniorStudentData {
  userId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    school: string | null;
    educationLevel: string | null;
  };
  juniorCourses: Array<{
    id: string;
    title: string;
    slug: string;
    progressPercentage: number;
  }>;
  schoolProfile: any | null;
  juniorSubmissions: Array<any>;
  olympiadBadges: Array<any>;
}

/**
 * Repository boundary for Main student data.
 * Does NOT query junior submissions, school profiles, or junior Olympiads.
 */
export async function getMainStudentData(userId: string): Promise<MainStudentData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      college: true,
      educationLevel: true,
      platformSegment: true,
      enrollments: {
        where: {
          course: {
            category: { not: "JUNIOR_TRAINING_PROGRAM" },
          },
        },
        select: {
          id: true,
          progressPercentage: true,
          course: {
            select: { id: true, title: true, slug: true },
          },
        },
      },
      internshipApplications: {
        select: { id: true, status: true, domain: true },
      },
      certificates: {
        select: { id: true, title: true, certificateNumber: true },
      },
    },
  });

  if (!user) return null;

  return {
    userId: user.id,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      college: user.college,
      educationLevel: user.educationLevel,
    },
    courses: user.enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      slug: e.course.slug,
      progressPercentage: e.progressPercentage,
    })),
    internships: user.internshipApplications,
    certificates: user.certificates,
    ambassadorProfile: null,
  };
}

/**
 * Repository boundary for Junior student data.
 * Does NOT query college internships or ambassador programs.
 */
export async function getJuniorStudentData(userId: string): Promise<JuniorStudentData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      college: true,
      educationLevel: true,
      platformSegment: true,
      schoolProfile: true,
      olympiadBadges: true,
      enrollments: {
        where: {
          course: {
            category: "JUNIOR_TRAINING_PROGRAM",
          },
        },
        select: {
          id: true,
          progressPercentage: true,
          course: {
            select: { id: true, title: true, slug: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  return {
    userId: user.id,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      school: user.college,
      educationLevel: user.educationLevel,
    },
    juniorCourses: user.enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      slug: e.course.slug,
      progressPercentage: e.progressPercentage,
    })),
    schoolProfile: user.schoolProfile,
    juniorSubmissions: [],
    olympiadBadges: user.olympiadBadges,
  };
}
