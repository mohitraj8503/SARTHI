import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seminarId = searchParams.get('seminarId');
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!seminarId) {
      return NextResponse.json({ error: "Missing seminarId" }, { status: 400 });
    }

    const registration = await prisma.seminarRegistration.findUnique({
      where: { seminarId_userId: { seminarId, userId: user.id } },
    });

    if (!registration || registration.paymentStatus !== 'completed') {
      return NextResponse.json({ error: "Not registered or payment not completed" }, { status: 403 });
    }

    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
    });

    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    const certificate = {
      id: `CERT-${registration.id}`,
      recipientName: registration.userName || user.name,
      recipientEmail: registration.userEmail || user.email,
      seminarTitle: seminar.title,
      seminarDate: seminar.endedAt || seminar.startTime || seminar.date,
      issueDate: new Date().toISOString(),
      instructorName: seminar.speakerName,
    };

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Certificate error:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}

