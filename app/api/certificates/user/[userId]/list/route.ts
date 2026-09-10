export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

/**
 * API Route: Get User's Certificate List
 * GET /api/certificates/user/[userId]/list
 * 
 * Returns list of all certificates for a user (for bulk download)
 */
export async function GET(req: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const { userId } = params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (user.id !== userId && !isAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Get all certificates for the user
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            instructor: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });

    // Format response
    const formatted = certificates.map(cert => {
      const metadata = cert.metadata ? JSON.parse(cert.metadata) : {};
      
      return {
        id: cert.id,
        certificateNumber: cert.certificateNumber,
        certificateId: cert.certificateId,
        courseId: cert.courseId,
        courseTitle: cert.course.title,
        courseThumbnail: cert.course.thumbnail,
        instructorName: cert.course.instructor?.name || 'Lead Instructor',
        issuedAt: cert.issuedAt,
        tier: (cert as any).tier || 'free',
        status: cert.status,
        metadata
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    return NextResponse.json(
      { message: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}
