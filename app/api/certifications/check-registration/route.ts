export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    // If no user, they definitely aren't registered yet
    if (!user) {
      return NextResponse.json({ registered: false });
    }

    const { searchParams } = new URL(req.url);
    const certificationId = searchParams.get('certificationId');

    if (!certificationId) {
      return NextResponse.json({ error: "Certification ID is required" }, { status: 400 });
    }

    // Also check if the cert is free
    const cert = await prisma.certification.findUnique({
      where: { id: certificationId },
      select: { price: true }
    });

    if (cert?.price === 0) {
      return NextResponse.json({ registered: true });
    }

    const registration = await prisma.certificationRegistration.findUnique({
      where: {
        certificationId_userId: {
          certificationId,
          userId: user.id
        }
      }
    });

    if (registration && registration.status === 'REGISTERED') {
      return NextResponse.json({ registered: true, registrationId: registration.id });
    }

    return NextResponse.json({ registered: false });
    
  } catch (error) {
    console.error("Check registration error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

