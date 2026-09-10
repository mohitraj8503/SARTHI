import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { seminarId, action } = body;

    if (action === "HAND_RAISE" && seminarId) {
      const registration = await prisma.seminarRegistration.findUnique({
        where: { seminarId_userId: { seminarId, userId: user.id } },
      });

      if (!registration) {
        return NextResponse.json({ error: "Not registered" }, { status: 403 });
      }

      const updated = await prisma.seminarRegistration.update({
        where: { id: registration.id },
        data: { handRaised: !registration.handRaised },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Hand raise error:", error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}

