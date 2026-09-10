import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    // Fetch all module progress records for this user and path
    const records = await prisma.certificationModuleProgress.findMany({
      where: {
        userId: user.id,
        certificationId: slug,
      },
    });

    const passedMilestones: Record<number, boolean> = {};
    const milestoneScores: Record<string, number> = {};

    records.forEach(r => {
      let idx = 0;
      if (r.moduleId === 'basic') idx = 0;
      else if (r.moduleId === 'intermediate') idx = 1;
      else if (r.moduleId === 'advanced') idx = 2;
      else if (r.moduleId === 'realworld') idx = 3;
      else if (r.moduleId === 'final') idx = 4;

      passedMilestones[idx] = r.passed;
      
      const msId = `ms-${idx + 1}`;
      milestoneScores[msId] = r.percentage;
    });

    // Fetch actual certificate number if already completed
    let certRecord = await prisma.certificate.findFirst({
      where: {
        userId: user.id,
        courseId: slug
      },
      select: {
        certificateNumber: true,
        status: true
      }
    });

    const issuedCertRecord = await prisma.issuedCertificate.findFirst({
      where: {
        userId: user.id,
        certificationId: slug
      },
      select: {
        verificationId: true,
        status: true
      }
    });

    const requiredCount = (slug === 'fullstack-mastery' || slug === 'ias-preparation') ? 5 : 4;
    const passedCount = Object.values(passedMilestones).filter(v => v === true).length;
    const allPassed = passedCount >= requiredCount;

    if (allPassed && !certRecord && !issuedCertRecord) {
      const certPrefix = slug === 'fullstack-mastery' 
        ? 'FSWDM' 
        : slug === 'ias-preparation' 
          ? 'UPSC-FS' 
          : slug === 'advanced-excel-certification-exam'
            ? 'AEX-C'
            : 'PY-PRO';
      const year = new Date().getFullYear();
      const count = await prisma.certificate.count({
        where: {
          certificateNumber: {
            startsWith: `TT-${certPrefix}-${year}-`
          }
        }
      });
      const sequenceStr = String(count + 1).padStart(6, '0');
      const certificateId = `TT-${certPrefix}-${year}-${sequenceStr}`;
      const issueDate = new Date();
      const certificateHash = `TT-HASH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const newCert = await prisma.certificate.upsert({
        where: { userId_courseId: { userId: user.id, courseId: slug } },
        update: {},
        create: {
          certificateNumber: certificateId,
          certificateId: certificateId,
          certificateHash,
          userId: user.id,
          courseId: slug,
          status: 'PENDING_PAYMENT',
          tier: 'pro',
          issuedAt: issueDate,
          metadata: JSON.stringify({
            type: 'professional_path',
            path_slug: slug,
            course_name: slug === 'fullstack-mastery' 
              ? 'Full Stack Web Development Mastery' 
              : slug === 'ias-preparation' 
                ? 'UPSC Civil Services Preparation' 
                : slug === 'advanced-excel-certification-exam'
                  ? 'Advanced Excel Certification'
                  : 'Python Professional Developer',
            user_name: user.name || 'Student',
            credential_id: certificateId
          })
        }
      });
      certRecord = { certificateNumber: newCert.certificateNumber, status: newCert.status };
    }

    const payment = await prisma.certificationPayment.findFirst({
      where: {
        userId: user.id,
        certificationId: slug,
        status: 'COMPLETED'
      }
    });

    const isPaid = certRecord?.status === 'VALID' || issuedCertRecord?.status === 'VALID' || !!payment;
    const activeCertNumber = certRecord?.certificateNumber || issuedCertRecord?.verificationId || null;

    return NextResponse.json({
      success: true,
      passedMilestones,
      milestoneScores,
      credentialId: activeCertNumber,
      isPaid: isPaid,
      status: isPaid ? 'VALID' : (certRecord?.status || issuedCertRecord?.status || 'PENDING_PAYMENT')
    });

  } catch (error: any) {
    console.error("Fetch progress error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

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
    const body = await request.json();
    const { moduleId, score, percentage, passed } = body;

    if (!moduleId) {
      return NextResponse.json({ success: false, error: "Module ID is required" }, { status: 400 });
    }

    // Upsert progression record
    await prisma.certificationModuleProgress.upsert({
      where: {
        userId_certificationId_moduleId: {
          userId: user.id,
          certificationId: slug,
          moduleId: moduleId,
        }
      },
      update: {
        score: parseInt(score || 0),
        percentage: parseFloat(percentage || 0),
        passed: !!passed,
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        certificationId: slug,
        moduleId: moduleId,
        score: parseInt(score || 0),
        percentage: parseFloat(percentage || 0),
        passed: !!passed,
        completedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: "Progress saved successfully."
    });

  } catch (error: any) {
    console.error("Save progress error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
