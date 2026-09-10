export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const issuedCertificates = await prisma.issuedCertificate.findMany({
      where: {
        userId: session.userId,
      },
      include: {
        certification: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        issuedAt: "desc",
      },
    });

    const results = issuedCertificates.map((ic) => ({
      id: ic.id,
      title: ic.certification.title,
      courseTitle: ic.certification.title,
      issueDate: ic.issuedAt.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase().replace(" ", "_"),
      issuedAt: ic.issuedAt,
      certificateUrl: ic.certificateUrl,
      downloadUrl: ic.certificateUrl && ic.certificateUrl !== '#' ? ic.certificateUrl : `/certification-exams/verify/${ic.verificationId}`,
      score: ic.score,
      verificationId: ic.verificationId,
      certificateNumber: ic.verificationId,
    }));

    return NextResponse.json({ success: true, certificates: results });
  } catch (error: any) {
    console.error("Fetch student certifications error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

