import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { captureCertificateSnapshot } from '@/lib/certificate/captureCertificateSnapshot';
import { auditAdminAction } from '@/lib/admin/audit-logs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/certificates/regenerate
 * Admin action to force re-capture HTML snapshot & PDF for a specific certificate ID.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin('staff');
    const body = await request.json();
    const { certificateId, templateConfig, studentName, courseName } = body;

    if (!certificateId) {
      return ApiResponse.error('Missing certificateId', 'BAD_REQUEST', 400);
    }

    const cert = await prisma.certificate.findFirst({
      where: { OR: [{ certificateNumber: certificateId }, { id: certificateId }, { certificateId }] },
      include: { user: true, course: true }
    });

    const issuedCert = !cert ? await prisma.issuedCertificate.findFirst({
      where: { OR: [{ verificationId: certificateId }, { id: certificateId }] },
      include: { user: true, certification: true }
    }) : null;

    if (!cert && !issuedCert) {
      return ApiResponse.error('Certificate not found', 'NOT_FOUND', 404);
    }

    let parsedMeta: any = {};
    if (cert?.metadata) {
      try { parsedMeta = JSON.parse(cert.metadata); } catch (e) {}
    }

    const recipientName = studentName || cert?.user?.name || issuedCert?.user?.name || parsedMeta?.user_name || 'Student';
    const titleName = courseName || cert?.course?.title || cert?.title || issuedCert?.certification?.title || parsedMeta?.course_name || 'Professional Certification';
    const issueDateStr = (cert?.issuedAt || issuedCert?.issuedAt || new Date()).toLocaleDateString('en-GB');

    // A legacy record without the Studio fields cannot be faithfully rebuilt:
    // using the course title as a substitute is exactly the regression this
    // endpoint exists to correct.  Require the caller to provide the Studio
    // configuration once, then persist the resulting immutable snapshot.
    const mergedTemplateConfig = templateConfig || parsedMeta?.templateConfig;
    if (!mergedTemplateConfig?.mainTitle || mergedTemplateConfig.subTitle === undefined) {
      return ApiResponse.error(
        'This legacy certificate has no saved Studio title/subtitle. Provide its original Studio template fields before regenerating.',
        'TEMPLATE_CONFIG_REQUIRED',
        400
      );
    }

    const artifacts = await captureCertificateSnapshot({
      certificateNumber: certificateId,
      studentName: recipientName,
      courseName: titleName,
      issueDate: issueDateStr,
      templateConfig: mergedTemplateConfig,
      userId: cert?.userId || issuedCert?.userId,
      courseId: cert?.courseId || issuedCert?.certificationId
    });

    await auditAdminAction(admin, 'certificate_regenerate', 'CERTIFICATE', cert?.id || issuedCert?.id || certificateId, certificateId);

    return ApiResponse.success({
      certificateNumber: certificateId,
      htmlSnapshot: artifacts.htmlSnapshot,
      pdfUrl: artifacts.pdfUrl,
      imageUrl: artifacts.imageUrl,
      regeneratedAt: new Date().toISOString()
    }, 'Certificate HTML snapshot re-captured and updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
