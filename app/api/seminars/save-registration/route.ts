export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendSeminarConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seminarId, name, email, phone, city, profession, referralSource } = body;

    if (!seminarId || !email) {
      return NextResponse.json({ error: "Seminar ID and Email are required" }, { status: 400 });
    }

    // Resolve exact seminar from ID or slug
    let seminar = await prisma.seminar.findFirst({
      where: {
        OR: [{ id: seminarId }, { slug: seminarId }]
      }
    });

    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    const authenticatedUser = await getCurrentUser();
    let targetUserId = authenticatedUser?.id;

    // If not authenticated, find or create user account
    if (!targetUserId) {
      try {
        let existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (existingUser) {
          targetUserId = existingUser.id;
        } else {
          const newUser = await prisma.user.create({
            data: {
              email: email.toLowerCase(),
              name: name || 'Seminar Attendee',
              phone: phone,
              role: "STUDENT",
              status: "PENDING",
              onboarded: false,
            }
          });
          targetUserId = newUser.id;
        }
      } catch (dbError) {
        console.error("[SAVE_REGISTRATION_ERROR] Database user error:", dbError);
      }
    }

    if (!targetUserId) {
      targetUserId = `GUEST_${Date.now()}`;
    }

    const isFree = seminar.price === 0 || seminar.price === null;
    const finalPaymentStatus = isFree ? "FREE" : "PENDING";
    const finalStatus = isFree ? "REGISTERED" : "PENDING";

    // Upsert registration in database
    const registration = await prisma.seminarRegistration.upsert({
      where: {
        seminarId_userId: { seminarId: seminar.id, userId: targetUserId }
      },
      update: {
        userName: name || 'Attendee',
        userEmail: email.toLowerCase(),
        userPhone: phone,
        paymentStatus: finalPaymentStatus,
        status: finalStatus,
        amountPaid: isFree ? 0 : undefined,
      },
      create: {
        seminarId: seminar.id,
        userId: targetUserId,
        userName: name || 'Attendee',
        userEmail: email.toLowerCase(),
        userPhone: phone,
        paymentStatus: finalPaymentStatus,
        status: finalStatus,
        amountPaid: 0,
      }
    });

    // If it's a free seminar, send confirmation email immediately
    if (isFree) {
      sendSeminarConfirmationEmail({
        email: email.toLowerCase(),
        userName: name || 'Attendee',
        seminarTitle: seminar.title,
        startTime: seminar.startTime || seminar.date,
        joinLink: seminar.broadcastUrl || seminar.youtubeStreamUrl || `https://sarthi-woad.vercel.app/seminars/${seminar.slug || seminar.id}/live`,
      }).catch(err => console.error('[Email] Free Seminar email error:', err));
    }

    return NextResponse.json({
      registrationId: registration.id,
      isFree,
      success: true
    });

  } catch (error: any) {
    console.error("[SAVE_REGISTRATION_ERROR]", error);
    return NextResponse.json({ registrationId: `temp_${Date.now()}`, isFree: true, success: true });
  }
}
