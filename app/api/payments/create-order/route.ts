export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createOrder } from "@/lib/razorpay";

import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = await checkRateLimit(`payment-order:${clientIp}`, 10, 5 * 60); // 10 order creations per 5 minutes per IP
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many payment requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Razorpay amount is in paise
    const amount = Number(course.price);
    
    const rzpOrder = await createOrder({
      amount,
      currency: "INR",
      receipt: `course_buy_${Date.now()}`,
      notes: {
        userId: user.id,
        courseId: course.id,
        userEmail: user.email,
        courseTitle: course.title
      }
    });

    // We create a PENDING transaction record
    // This allows us to track initiated payments
    await prisma.transaction.create({
      data: {
        userId: user.id,
        courseId: course.id,
        amount: amount,
        currency: "INR",
        status: "pending",
        razorpayOrderId: rzpOrder.id,
      }
    });

    return NextResponse.json({ 
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });

  } catch (error: any) {
    console.error("[CREATE_ORDER_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

