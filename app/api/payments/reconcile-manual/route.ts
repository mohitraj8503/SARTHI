export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fetchPayment } from "@/lib/razorpay";
import { fulfillCourseEnrollment } from "@/lib/enrollment/fulfillment";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { paymentId, courseId, isGroup, members, referralCoupon } = body;

    if (!paymentId || !courseId) {
      return NextResponse.json({ error: "Payment Reference ID and Course ID are required" }, { status: 400 });
    }

    const cleanPaymentId = String(paymentId).trim();
    if (!cleanPaymentId.startsWith("pay_")) {
      return NextResponse.json({ 
        error: "Invalid Razorpay Payment ID format. It usually looks like pay_xxxxxxxxxxxx." 
      }, { status: 400 });
    }

    // 1. Fetch live payment from Razorpay gateway
    let paymentDetails: any;
    try {
      paymentDetails = await fetchPayment(cleanPaymentId);
    } catch (fetchErr: any) {
      console.error("[MANUAL_RECONCILE_FETCH_ERROR]", fetchErr);
      return NextResponse.json({
        error: "Unable to verify this Payment ID with Razorpay. Please check the ID or contact support."
      }, { status: 400 });
    }

    if (!paymentDetails || paymentDetails.status !== "captured") {
      return NextResponse.json({
        error: `Payment is currently ${paymentDetails?.status || "unconfirmed"} and not captured. Please allow a few moments or try again.`
      }, { status: 400 });
    }

    // 2. Validate Course Price
    let course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] }
    });

    if (!course && courseId === "summer-camp-2026") {
      course = {
        id: "summer-camp-2026",
        title: isGroup ? "SARTHI Summer Camp 2026 (Group)" : "SARTHI Summer Camp 2026",
        price: isGroup ? 2500 : 11,
      } as any;
    }

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const expectedMinAmount = isGroup ? 2500 : Number(course.price);
    const paidAmountINR = (paymentDetails.amount || 0) / 100;

    if (paidAmountINR < expectedMinAmount * 0.9) {
      // Amount mismatch
      return NextResponse.json({
        error: `The paid amount (₹${paidAmountINR}) is less than the required course fee (₹${expectedMinAmount}). Please contact support.`,
        code: "REVIEW_REQUIRED"
      }, { status: 400 });
    }

    // 3. Trigger Authoritative Fulfillment Engine
    const result = await fulfillCourseEnrollment({
      userId: user?.id,
      courseId: course.id,
      paymentId: cleanPaymentId,
      orderId: paymentDetails.order_id || `manual_${cleanPaymentId}`,
      amountPaid: paidAmountINR,
      currency: paymentDetails.currency || "INR",
      isGroup: !!isGroup,
      members: members || [],
      referralCoupon,
      guestUser: user ? undefined : {
        email: paymentDetails.email || "student@sarthi-woad.vercel.app",
        name: paymentDetails.notes?.name || paymentDetails.email?.split("@")[0] || "Student",
        phone: paymentDetails.contact
      },
      origin: req.nextUrl.origin || "https://sarthi-woad.vercel.app"
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and enrollment confirmed!",
      enrollmentId: result.enrollmentId,
      courseId: course.id
    });

  } catch (error: any) {
    console.error("[PAYMENTS_RECONCILE_MANUAL_ERROR]", error);
    return NextResponse.json({
      error: error.message || "Manual payment reconciliation failed."
    }, { status: 500 });
  }
}
