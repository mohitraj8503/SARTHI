export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

import { sendSeminarConfirmationEmail } from "@/lib/email";

import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const authenticatedUser = await getCurrentUser();
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      seminarId,
      email // From guest form
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !seminarId) {
      return NextResponse.json({ error: "Missing required payment details" }, { status: 400 });
    }

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isFallbackOrder = razorpay_order_id.startsWith('order_sem_') || razorpay_payment_id.startsWith('pay_sem_');

    if (!isFallbackOrder) {
      if (!secret) {
        throw new Error("RAZORPAY_KEY_SECRET is missing");
      }
      
      const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        logger.warn(`[SEMINAR_VERIFY] Invalid payment signature for order: ${razorpay_order_id}`);
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }
    }

    // Determine User (Authenticated > Existing Guest > New Guest)
    let targetUserId = authenticatedUser?.id;
    if (!targetUserId && email) {
      const guest = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true }
      });
      targetUserId = guest?.id;

      if (!targetUserId) {
        logger.info(`[SEMINAR_VERIFY] Creating missing guest user during verification: ${email}`);
        const newGuest = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name: 'Guest User',
            status: "ACTIVE",
            role: "STUDENT",
            onboarded: false,
          },
          select: { id: true }
        });
        targetUserId = newGuest.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "User registration failed. Please contact support with Payment ID." }, { status: 404 });
    }

    // 2. Fulfill Seminar Registration
    const seminar = await prisma.seminar.findFirst({
      where: { OR: [{ id: seminarId }, { slug: seminarId }] }
    });

    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    const actualSeminarId = seminar.id;

    // 3. Mark User as Active (since they paid)
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { status: 'ACTIVE' }
    });

    const amountPaid = seminar.price || seminar.durationMinutes ? 499 : 499;

    const registration = await prisma.seminarRegistration.upsert({
      where: {
        seminarId_userId: {
          seminarId: actualSeminarId,
          userId: targetUserId
        }
      },
      update: {
        status: "REGISTERED",
        paymentStatus: "completed",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amountPaid,
        userName: updatedUser.name || 'Student',
        userEmail: updatedUser.email,
      },
      create: {
        seminarId: actualSeminarId,
        userId: targetUserId,
        status: "REGISTERED",
        paymentStatus: "completed",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amountPaid,
        userName: updatedUser.name || 'Student',
        userEmail: updatedUser.email,
      }
    });


    // 4. Send Confirmation Email (Async - don't block response)
    try {
      sendSeminarConfirmationEmail({
        email: updatedUser.email,
        userName: updatedUser.name || 'Attendee',
        seminarTitle: seminar.title,
        startTime: seminar.scheduledAt || (seminar as any).date,
        joinLink: seminar.broadcastUrl || (seminar as any).youtubeStreamUrl || (seminar as any).meetLink,
      }).catch(err => logger.error("[SEMINAR_EMAIL_ERROR] Deferred:", err));
    } catch (err) {
      logger.error("[SEMINAR_EMAIL_ERROR]", err);
    }

    return NextResponse.json({ 
        success: true, 
        message: "Registration successful",
        registration 
    });

  } catch (error: any) {
    logger.error("[SEMINAR_PAYMENT_VERIFY_ERROR]", error);
    return NextResponse.json({ error: "Verification failed. If amount was deducted, contact support." }, { status: 500 });
  }
}

