'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId || null;
}

export async function getCertificates() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const [courseCerts, professionalCerts] = await Promise.all([
    prisma.certificate.findMany({
      where: { userId },
      include: {
        user: { select: { name: true } },
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    }),
    prisma.issuedCertificate.findMany({
      where: { userId },
      include: {
        user: { select: { name: true } },
        certification: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    })
  ]);

  const normalizedCourseCerts = courseCerts.map(cert => ({
    id: cert.id,
    studentName: cert.user.name,
    title: cert.course.title,
    thumbnail: cert.course.thumbnail,
    issuedAt: cert.issuedAt,
    certificateNumber: `TT-${cert.id.slice(0, 8).toUpperCase()}`,
    type: 'MASTERCLASS' as const,
    verificationUrl: `/verify/${cert.id}`
  }));

  const normalizedProfCerts = professionalCerts.map(cert => ({
    id: cert.id,
    studentName: cert.user?.name || 'Valid Holder',
    title: cert.certification.title,
    thumbnail: cert.certification.thumbnail,
    issuedAt: cert.issuedAt,
    certificateNumber: cert.verificationId,
    type: 'PROFESSIONAL' as const,
    verificationUrl: `/verify/${cert.verificationId}`
  }));

  return [...normalizedCourseCerts, ...normalizedProfCerts].sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  );
}

export async function verifyCertificate(certificateId: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      user: { select: { name: true } },
      course: { select: { title: true } }
    }
  });

  if (!certificate) {
    return { valid: false, message: 'Certificate not found' };
  }

  return {
    valid: true,
    studentName: certificate.user.name,
    courseName: certificate.course.title,
    issuedAt: certificate.issuedAt,
    certificateNumber: `TT-${certificate.id.slice(0, 8).toUpperCase()}`
  };
}

export async function getClaimableCourses() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  // Get enrollments that are 100% complete but have no certificate
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      progressPercentage: 100,
      course: {
        certificates: {
          none: { userId }
        }
      }
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
          instructor: { select: { name: true } }
        }
      }
    }
  });

  return enrollments.map(e => ({
    courseId: e.course.id,
    courseTitle: e.course.title,
    courseThumbnail: e.course.thumbnail,
    instructorName: (e.course.instructor as any)?.name || 'Program Lead'
  }));
}

