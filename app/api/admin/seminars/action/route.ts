import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, seminarId, registrationId, data } = body;

    if (action === 'RECORD_ATTENDANCE') {
      if (!seminarId || !registrationId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      
      const updated = await prisma.seminarRegistration.update({
        where: { id: registrationId },
        data: { attended: true },
      });
      
      return NextResponse.json({ success: true, registration: updated });
    }

    if (action === 'END SEMINAR') {
      if (!seminarId) {
        return NextResponse.json({ error: 'Missing seminarId' }, { status: 400 });
      }
      
      const updated = await prisma.seminar.update({
        where: { id: seminarId },
        data: { 
          isLive: false, 
          status: 'ENDED',
          endedAt: new Date(),
        },
      });
      
      return NextResponse.json({ success: true, seminar: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}

