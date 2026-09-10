export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      workshopId
    } = body;

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Fulfill Registration in Transaction
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId }
    });

    if (!workshop) {
      return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Check for existing registration to prevent double seat decrement
      const existingRegistration = await tx.workshopRegistration.findUnique({
        where: {
          workshopId_userId: {
            workshopId,
            userId: user.id
          }
        }
      });

      const isAlreadyRegistered = existingRegistration?.status === 'REGISTERED';

      // 2. Create or Update Registration
      await tx.workshopRegistration.upsert({
        where: {
          workshopId_userId: {
            workshopId,
            userId: user.id
          }
        },
        update: {
          status: "REGISTERED",
        },
        create: {
          workshopId,
          userId: user.id,
          status: "REGISTERED",
        }
      });

      // 3. Decrement Seats only if NOT already registered
      if (!isAlreadyRegistered) {
        const updatedWorkshop = await tx.workshop.updateMany({
          where: { 
            id: workshopId,
            seatsLeft: { gt: 0 }
          },
          data: {
            seatsLeft: { decrement: 1 }
          }
        });

        // Check if seat was actually decremented (if 0 rows affected, no seats available)
        if (updatedWorkshop.count === 0) {
          throw new Error('No seats available');
        }
      }

      // 4. Create Notification (only if new or upgraded)
      if (!isAlreadyRegistered) {
        await tx.notification.create({
          data: {
            userId: user.id,
            title: "Registration Success",
            body: `You've successfully registered for ${workshop.title}. Welcome aboard!`,
            type: "ENROLLMENT_SUCCESS"
          }
        });
      }
    });

    return NextResponse.json({ success: true, message: "Registration successful" });

  } catch (error: any) {
    console.error("[PAYMENT_VERIFY_ERROR]", error);
    
    // Handle seat availability error specifically
    if (error.message === 'No seats available') {
      return NextResponse.json({ error: "Workshop is fully booked" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Verification failed. If amount was deducted, contact support." }, { status: 500 });
  }
}

