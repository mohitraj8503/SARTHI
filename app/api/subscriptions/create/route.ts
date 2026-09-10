export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getRazorpayInstance } from "@/lib/razorpay";
import { createOrGetPlan } from "@/lib/razorpay/createPlan";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // 1. Fetch course, validate pricingType === 'SUBSCRIPTION'
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.pricingType !== "SUBSCRIPTION") {
      return NextResponse.json({ error: "This course does not support recurring subscriptions" }, { status: 400 });
    }

    if (!course.subscriptionMonthlyAmount || !course.subscriptionTotalMonths) {
      return NextResponse.json({ error: "Course subscription pricing terms are not configured" }, { status: 400 });
    }

    // 2. Call createOrGetPlan(course) to get/create razorpayPlanId
    const planId = await createOrGetPlan(course.id);

    const rzp = getRazorpayInstance();
    if (!rzp) {
      return NextResponse.json({ error: "Payment gateway is not configured" }, { status: 500 });
    }

    // 3. Call Razorpay Subscriptions API (POST /v1/subscriptions)
    console.log(`[SUBSCRIPTION_CREATE] Creating Razorpay subscription for user: ${user.id}, plan: ${planId}`);
    const rzpSubscription = await rzp.subscriptions.create({
      plan_id: planId,
      total_count: course.subscriptionTotalMonths,
      customer_notify: 1,
      notes: {
        courseId: course.id,
        userId: user.id,
      },
    });

    if (!rzpSubscription || !rzpSubscription.id) {
      throw new Error("Failed to create subscription on Razorpay");
    }

    // 4. Create local CourseSubscription row with status 'CREATED'
    const localSubscription = await prisma.courseSubscription.create({
      data: {
        userId: user.id,
        courseId: course.id,
        razorpaySubscriptionId: rzpSubscription.id,
        razorpayPlanId: planId,
        status: "CREATED",
        totalMonths: course.subscriptionTotalMonths,
        amountPerMonth: course.subscriptionMonthlyAmount,
      },
    });

    console.log(`[SUBSCRIPTION_CREATE] Subscription created locally and on Razorpay: ${rzpSubscription.id}`);

    // 5. Return to frontend (never expose key_secret)
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    return NextResponse.json({
      subscriptionId: rzpSubscription.id,
      keyId,
    });
  } catch (error: any) {
    console.error("[SUBSCRIPTION_CREATE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to initiate subscription" }, { status: 500 });
  }
}
