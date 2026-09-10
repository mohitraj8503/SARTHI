export const revalidate = 3600; // Cache for 1 hour
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [studentCount, courseCount, certCount, partnerCount] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.certificate.count(),
      prisma.user.count({ where: { role: { in: ['TEACHER', 'ADMIN'] }, status: 'ACTIVE' } }),
    ]);

    return NextResponse.json({
      students: {
        raw: studentCount + 221,
        display: `${(studentCount + 221).toLocaleString()}+`,
      },
      courses: {
        raw: courseCount + 23,
        display: `${courseCount + 23}+`,
      },
      certifications: {
        raw: certCount + 1194,
        display: `${(certCount + 1194).toLocaleString()}+`,
      },
      partners: {
        raw: partnerCount + 21,
        display: `${(partnerCount + 21).toLocaleString()}+`,
      }
    });
  } catch (error) {
    console.error('[STATS_GLOBAL_GET]', error);
    // Return safe fallback values instead of erroring out during SSG
    return NextResponse.json({
      students: { raw: 250, display: '250+' },
      courses: { raw: 30, display: '30+' },
      certifications: { raw: 1200, display: '1,200+' },
      partners: { raw: 26, display: '26+' },
    });
  }
}

