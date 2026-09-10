import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUniqueLorReferenceId } from '@/lib/certificate/generateLorReferenceId';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipientName,
      recipientEmail,
      college,
      internshipTrack,
      certificateNumber,
      issueDate,
      format = 'A4_PORTRAIT_LETTER'
    } = body;

    if (!recipientName) {
      return NextResponse.json(
        { error: 'Recipient name is required' },
        { status: 400 }
      );
    }

    const isLor = body.documentType === 'LETTER_OF_RECOMMENDATION' || (certificateNumber && certificateNumber.includes('-LOR-'));
    const certNumClean = certificateNumber.trim().toUpperCase();

    const emailClean = (recipientEmail || `${recipientName.toLowerCase().replace(/\s+/g, '')}@sarthi-woad.vercel.app`).toLowerCase().trim();

    // Check if matching user exists or create fallback user reference
    let user = await prisma.user.findFirst({
      where: { email: emailClean }
    });

    if (!user) {
      // Find admin or mentor fallback user
      user = await prisma.user.findFirst({
        where: {
          role: { in: ['ADMIN', 'SUPER_ADMIN', 'MENTOR'] }
        }
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'System user allocation failed. Please log in first.' },
        { status: 500 }
      );
    }

    // Upsert into Certificate table - check if a doc of this specific type already exists for this certificateNumber
    const existingCerts = await prisma.certificate.findMany({
      where: {
        OR: [
          { certificateNumber: certNumClean },
          { certificateId: certNumClean }
        ]
      }
    });

    let existingCert = null;
    for (const c of existingCerts) {
      let m: any = {};
      try { m = typeof c.metadata === 'string' ? JSON.parse(c.metadata) : (c.metadata || {}); } catch {}
      const docTypeMatch = isLor ? (m.documentType === 'LETTER_OF_RECOMMENDATION') : (m.documentType !== 'LETTER_OF_RECOMMENDATION');
      if (docTypeMatch) {
        existingCert = c;
        break;
      }
    }

    const docTitle = isLor
      ? `Letter of Recommendation — ${internshipTrack || 'Engineering'}`
      : `Internship Completion Letter — ${internshipTrack || 'Engineering'}`;

    const certMetaData = {
      documentType: isLor ? 'LETTER_OF_RECOMMENDATION' : 'COMPLETION_LETTER',
      referenceId: certNumClean,
      recipientName,
      recipientCollege: college,
      internshipTrack,
      format,
      issueDate,
      startDate: body.startDate || '15 May 2026',
      endDate: body.endDate || '30 June 2026',
      customExposureBody: body.customExposureBody,
      performanceBody: body.performanceBody,
      closingStatement: body.closingStatement,
      // LOR fields
      introParagraph: body.introParagraph,
      performanceParagraph: body.performanceParagraph,
      contributionParagraph: body.contributionParagraph,
      recommendationStatement: body.recommendationStatement,
      lorClosingStatement: body.lorClosingStatement,
    };

    const isInternshipDoc = certNumClean.startsWith('TT-INT-') ||
      certNumClean.startsWith('TTI') ||
      certNumClean.startsWith('TT-BIA') ||
      certNumClean.startsWith('TT-APP-') ||
      certNumClean.startsWith('TT-LOR-') ||
      !!internshipTrack;

    if (isInternshipDoc) {
      const existingInternCert = await prisma.internshipCertificate.findFirst({
        where: { certificateNumber: certNumClean }
      });

      let memberId = null;
      if (user?.id) {
        const bm = await prisma.batchMember.findFirst({ where: { userId: user.id } });
        if (bm) memberId = bm.id;
      }

      let certificateRecord;
      if (existingInternCert) {
        certificateRecord = await prisma.internshipCertificate.update({
          where: { id: existingInternCert.id },
          data: {
            title: docTitle,
            status: 'VALID',
            metadata: JSON.stringify(certMetaData),
            certUrl: `/verify/interns/${encodeURIComponent(certNumClean)}/certificate`,
            memberId: memberId || existingInternCert.memberId,
          }
        });
      } else {
        certificateRecord = await prisma.internshipCertificate.create({
          data: {
            certificateNumber: certNumClean,
            title: docTitle,
            status: 'VALID',
            userId: user.id,
            issuedAt: new Date(),
            metadata: JSON.stringify(certMetaData),
            certUrl: `/verify/interns/${encodeURIComponent(certNumClean)}/certificate`,
            memberId,
          }
        });
      }

      return NextResponse.json({
        success: true,
        certificate: certificateRecord,
        verificationUrl: `/verify/interns/${encodeURIComponent(certNumClean)}`
      });
    }

    let certificateRecord;

    if (existingCert) {
      certificateRecord = await prisma.certificate.update({
        where: { id: existingCert.id },
        data: {
          title: docTitle,
          status: 'VALID',
          metadata: JSON.stringify(certMetaData)
        }
      });
    } else {
      certificateRecord = await prisma.certificate.create({
        data: {
          certificateNumber: certNumClean,
          certificateId: certNumClean,
          title: docTitle,
          status: 'VALID',
          userId: user.id,
          issuedAt: new Date(),
          metadata: JSON.stringify(certMetaData)
        }
      });
    }

    return NextResponse.json({
      success: true,
      certificate: certificateRecord,
      verificationUrl: `/verify/${encodeURIComponent(certNumClean)}`
    });
  } catch (err: any) {
    console.error('Error issuing/publishing certificate:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to publish certificate to verification registry' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const [internCerts, normalCerts] = await Promise.all([
      prisma.internshipCertificate.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.certificate.findMany({
        take: 100,
        orderBy: { issuedAt: 'desc' }
      })
    ]);
    return NextResponse.json({
      success: true,
      certificates: [...internCerts, ...normalCerts]
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
