export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch legacy certificates
    const res = await withResiliency(() => prisma.certificate.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
            thumbnail: true,
            category: true,
            Category: {
                select: { name: true }
            }
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    }), `api_certificates_${user.id}`);

    const rawCertificates = res.data || [];

    // 2. Fetch IssuedCertificate (v2) certificates
    const v2Certificates = await prisma.issuedCertificate.findMany({
      where: { userId: user.id },
      include: {
        certification: {
          select: {
            title: true,
            slug: true,
            thumbnail: true,
            difficulty: true
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });

    // Normalize and add download URLs
    const legacyList = rawCertificates.map((cert: any) => {
      const certNum = cert.certificateNumber || cert.certificateId || cert.id;
      return {
        id: cert.id,
        certificateNumber: certNum,
        certificateId: certNum,
        verificationId: certNum,
        courseId: cert.courseId,
        courseTitle: cert.course?.title || 'Professional Certification',
        courseThumbnail: cert.course?.thumbnail || null,
        issuedAt: cert.issuedAt,
        status: cert.status,
        tier: cert.tier || 'pro',
        enrollmentId: cert.enrollmentId,
        // Snapshot fields for in-dashboard preview
        htmlSnapshot: cert.htmlSnapshot || null,
        pdfUrl: cert.pdfUrl || null,
        imageUrl: cert.imageUrl || null,
        downloadUrl: certNum ? `/api/pdf/${certNum}` : null,
        // Verify link
        verifyUrl: certNum ? `/verify/${certNum}` : null,
      };
    });

    const v2List = v2Certificates.map((cert: any) => ({
      id: cert.id,
      certificateNumber: cert.verificationId,
      certificateId: cert.verificationId,
      userId: cert.userId,
      courseId: cert.certificationId,
      issuedAt: cert.issuedAt,
      certificateUrl: cert.certificateUrl,
      status: cert.status,
      tier: 'pro',
      courseTitle: cert.certification?.title || 'Professional Certification',
      downloadUrl: cert.certificateUrl && cert.certificateUrl !== '#' ? cert.certificateUrl : `/certification-exams/verify/${cert.verificationId}`,
    }));

    // Merge both lists
    const allCertificates = [...v2List, ...legacyList].sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

    // Deduplicate: Keep only the most recent certificate per course (or by title if courseId is missing)
    const uniqueCertsMap = new Map();
    for (const cert of allCertificates) {
      const key = cert.courseId || cert.courseTitle;
      if (!uniqueCertsMap.has(key)) {
        uniqueCertsMap.set(key, cert);
      }
    }
    const certificates = Array.from(uniqueCertsMap.values());

    return NextResponse.json({ success: true, certificates });
  } catch (error: any) {
    console.error('[CERTIFICATES_API_ERROR]', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return NextResponse.json({ error: 'Server Error', details: error.message }, { status: 500 });
  }
}

