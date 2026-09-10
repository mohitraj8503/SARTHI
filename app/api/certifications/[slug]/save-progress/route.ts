export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function getCertIdBySlug(slug: string) {
  const cert = await prisma.certification.findUnique({
    where: { slug },
    select: { id: true }
  });
  return cert?.id;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const certificationId = await getCertIdBySlug(slug);
    if (!certificationId) {
      return NextResponse.json({ success: false, error: "Certification not found" }, { status: 404 });
    }

    const body = await request.json();
    const { answers, timeTaken, tabSwitchCount } = body;

    // Look for an existing in-progress attempt (completedAt is null)
    const existingAttempt = await prisma.certificationAttempt.findFirst({
      where: {
        userId: user.id,
        certificationId,
        completedAt: null
      },
      orderBy: { startedAt: 'desc' }
    });

    let attempt;
    if (existingAttempt) {
      attempt = await prisma.certificationAttempt.update({
        where: { id: existingAttempt.id },
        data: {
          answers: JSON.stringify(answers || {}),
          timeTaken: timeTaken || existingAttempt.timeTaken,
          tabSwitchCount: tabSwitchCount || existingAttempt.tabSwitchCount
        }
      });
    } else {
      attempt = await prisma.certificationAttempt.create({
        data: {
          user: { connect: { id: user.id } },
          certification: { connect: { id: certificationId } },
          answers: JSON.stringify(answers || {}),
          score: null,
          passed: null,
          timeTaken: timeTaken || 0,
          tabSwitchCount: tabSwitchCount || 0,
          startedAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true, attemptId: attempt.id });
  } catch (error: any) {
    console.error("Save progress error:", error);
    return NextResponse.json({ success: false, error: "Failed to save progress" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const certificationId = await getCertIdBySlug(slug);
    if (!certificationId) {
      return NextResponse.json({ success: false, error: "Certification not found" }, { status: 404 });
    }

    const attempt = await prisma.certificationAttempt.findFirst({
      where: {
        userId: user.id,
        certificationId,
        completedAt: null
      },
      orderBy: { startedAt: 'desc' }
    });

    if (!attempt) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ 
      exists: true, 
      answers: attempt.answers ? JSON.parse(attempt.answers) : {},
      timeTaken: attempt.timeTaken,
      tabSwitchCount: attempt.tabSwitchCount
    });
  } catch (error: any) {
    console.error("Fetch progress error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch progress" }, { status: 500 });
  }
}
