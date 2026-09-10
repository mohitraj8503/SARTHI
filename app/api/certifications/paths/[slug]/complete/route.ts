import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateCredentialId, generateCertificateHash } from "@/lib/certificates";
import { captureCertificateSnapshot } from "@/lib/certificate/captureCertificateSnapshot";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    
    // We expect the client to send a payload confirming completion stats 
    // In a fully strictly-typed backend, this would evaluate DB records.
    const body = await request.json();
    const { 
      allModulesCompleted, 
      allAssignmentsCompleted, 
      finalAssessmentPassed, 
      courseTitle 
    } = body;

    if (!allModulesCompleted || !finalAssessmentPassed) {
      return NextResponse.json({ 
        success: false, 
        error: "All modules and final assessment must be completed to issue certificate." 
      }, { status: 400 });
    }

    // Since this is a path, we may not have a dedicated Certification record for "Path"
    // Let's see if we can find a matched certification or create an IssuedCertificate
    // For now, we will create an IssuedCertificate (V2) or fallback to Course Certificate
    
    // Attempt to find a matching Certification first by slug (if it matches a certification)
    let cert = await prisma.certification.findUnique({
      where: { slug }
    });

    // If no direct certification exists for this path slug, 
    // we could try finding one by title, or just generate a generic IssuedCertificate
    // Let's assume we can generate a generic Certificate 

    const certPrefix = slug === 'fullstack-mastery' 
      ? 'FSWDM' 
      : slug === 'ias-preparation' 
        ? 'UPSC-FS' 
        : slug === 'advanced-excel-certification-exam'
          ? 'AEX-C'
          : 'PY-PRO';
    const year = new Date().getFullYear();
    
    // The pending activation record is created by /progress and /unlock with
    // the path slug as courseId.  Reuse that exact record here; using cert.id
    // created a second, independently visible credential for one completion.
    const existingPathCertificate = await prisma.certificate.findFirst({
      where: { userId: user.id, courseId: slug },
      orderBy: { issuedAt: 'asc' }
    });

    // Only allocate an ID when the completion does not already have a pending
    // certificate.  This also makes retrying the completion endpoint safe.
    const count = await prisma.certificate.count({
      where: {
        certificateNumber: {
          startsWith: `TT-${certPrefix}-${year}-`
        }
      }
    });
    const sequenceStr = String(count + 1).padStart(6, '0');
    const certificateId = existingPathCertificate?.certificateNumber || `TT-${certPrefix}-${year}-${sequenceStr}`;
    const issueDate = new Date();
    const certificateHash = generateCertificateHash(
      user.name || 'Student',
      courseTitle || (slug === 'advanced-excel-certification-exam' ? 'Advanced Excel Certification' : 'Professional Developer Path'),
      issueDate,
      certificateId
    );

    if (cert) {
       // It's a mapped certification
       const existingLegacyCertificate = await prisma.userCertification.findFirst({
         where: { userId: user.id, certificationId: cert.id }
       });
       if (!existingLegacyCertificate) {
         await prisma.userCertification.create({
           data: {
             userId: user.id,
             certificationId: cert.id,
             certNumber: certificateId,
             certificateHash,
             status: 'VALID',
             issuedAt: issueDate
           }
         });
       }
     }

    const certificateMetadata = JSON.stringify({
      type: 'professional_path',
      path_slug: slug,
      course_name: courseTitle || (slug === 'advanced-excel-certification-exam' ? 'Advanced Excel Certification' : 'Professional Developer Path'),
      user_name: user.name || 'Student',
      credential_id: certificateId
    });

    const snapshotParams = {
      certificateNumber: certificateId,
      studentName: user.name || 'Student',
      courseName: courseTitle || (slug === 'advanced-excel-certification-exam' ? 'Advanced Excel Certification' : 'Professional Developer Path'),
      issueDate: issueDate.toLocaleDateString('en-GB'),
      templateConfig: null,
      userId: user.id,
      courseId: slug
    };

    let htmlSnapshot = '';
    let imageUrl: string | null = null;
    let pdfUrl: string | null = null;

    try {
      const artifacts = await captureCertificateSnapshot(snapshotParams);
      htmlSnapshot = artifacts.htmlSnapshot;
      imageUrl = artifacts.imageUrl;
      pdfUrl = artifacts.pdfUrl;
    } catch (artifactErr) {
      console.error('[PATH_CERT_COMPLETE] Failed to generate certificate artifacts:', artifactErr);
      htmlSnapshot = buildCertificateHtmlSnapshot(snapshotParams);
    }

    // One canonical Certificate row per (user, path).  Keep its original
    // verification ID when a pending activation becomes valid.
    const updateData: any = {
      status: 'VALID',
      tier: 'pro',
      certificateHash,
      metadata: certificateMetadata,
      htmlSnapshot,
    };

    if (imageUrl) updateData.imageUrl = imageUrl;
    if (pdfUrl) updateData.pdfUrl = pdfUrl;

    if (existingPathCertificate) {
      await prisma.certificate.update({
        where: { id: existingPathCertificate.id },
        data: updateData
      });
    } else {
      await prisma.certificate.upsert({
        where: { userId_courseId: { userId: user.id, courseId: slug } },
        update: updateData,
        create: {
          certificateNumber: certificateId,
          certificateId: certificateId,
          certificateHash,
          userId: user.id,
          courseId: slug,
          status: 'VALID',
          tier: 'pro',
          issuedAt: issueDate,
          metadata: certificateMetadata,
          htmlSnapshot,
          imageUrl,
          pdfUrl
        }
      });
    }

    return NextResponse.json({
      success: true,
      credentialId: certificateId,
      message: "Certificate generated successfully."
    });

  } catch (error: any) {
    console.error("Path completion error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
