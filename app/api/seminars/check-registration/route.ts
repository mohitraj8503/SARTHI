export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const seminarId = searchParams.get('seminarId');
  
  if (!seminarId) {
    return NextResponse.json({ registered: false, paymentStatus: null, canAccess: false });
  }

  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ registered: false, paymentStatus: null, canAccess: false });
  }

  try {
    const registration = await prisma.seminarRegistration.findUnique({
      where: {
        seminarId_userId: {
          seminarId,
          userId: user.id
        }
      }
    });

    const paymentCompleted = registration?.paymentStatus === 'completed';
    const statusOk = registration?.status === 'REGISTERED' || registration?.status === 'REGISTERED';
    
    return NextResponse.json({
      registered: !!registration,
      registrationId: registration?.id || null,
      paymentStatus: registration?.paymentStatus || null,
      canAccess: !!registration && paymentCompleted && statusOk
    });
  } catch (err) {
    return NextResponse.json({ registered: false, paymentStatus: null, canAccess: false });
  }
}

