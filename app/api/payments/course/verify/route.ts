export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { fulfillCourseEnrollment } from "@/lib/enrollment/fulfillment";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      isGroup,
      members,
      referralCoupon
    } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    console.log(`[VERIFY_PAYMENT] verifying order: ${razorpay_order_id}, payment: ${razorpay_payment_id}, isGroup: ${isGroup}`);

    // 1. Verify Signature (Security Check)
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Gateway secret unconfigured" }, { status: 500 });
    }

    const isValid = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      secret
    );

    if (!isValid) {
      console.error("[VERIFY_PAYMENT_INVALID_SIGNATURE]");
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Delegate to centralized atomic fulfillment engine
    const result = await fulfillCourseEnrollment({
      userId: user?.id,
      courseId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      isGroup: !!isGroup,
      members: members || [],
      referralCoupon,
      guestUser: user ? undefined : {
        email: members && members[0]?.email,
        name: members && members[0]?.name
      },
      origin: req.nextUrl.origin || "https://sarthi-woad.vercel.app"
    });

    return NextResponse.json({ 
      success: true, 
      message: "Enrollment successful",
      enrollmentId: result.enrollmentId,
      courseId: courseId
    });

  } catch (error: any) {
    console.error("[COURSE_PAYMENT_VERIFY_ERROR_CRITICAL]", error);
    return NextResponse.json({ 
      error: error.message || "Verification failed. Please contact support." 
    }, { status: 500 });
  }
}

