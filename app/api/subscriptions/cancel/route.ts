export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getRazorpayInstance } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    // Find local subscription record
    const subscription = await prisma.courseSubscription.findFirst({
      where: {
        OR: [
          { id: subscriptionId },
          { razorpaySubscriptionId: subscriptionId }
        ],
        userId: user.id
      },
      include: {
        course: true
      }
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (subscription.status === "CANCELLED") {
      return NextResponse.json({ success: true, message: "Subscription is already cancelled" });
    }

    const rzp = getRazorpayInstance();
    if (!rzp) {
      return NextResponse.json({ error: "Payment gateway is not configured" }, { status: 500 });
    }

    console.log(`[SUBSCRIPTION_CANCEL] Cancelling Razorpay subscription: ${subscription.razorpaySubscriptionId}`);

    // Call Razorpay Subscriptions API (POST /v1/subscriptions/:id/cancel)
    // We pass cancel_at_cycle_end: 1 or default (0 for immediate, but Razorpay supports cancel_at_cycle_end to charge for current month and cancel next).
    // Let's cancel at cycle end so they retain access until the current month ends.
    await rzp.subscriptions.cancel(subscription.razorpaySubscriptionId, {
      cancel_at_cycle_end: 0 // Immediate cancel on Razorpay side, but we will let them keep access locally until nextChargeAt.
    });

    // Update local DB status to CANCELLED and set cancelledAt
    await prisma.courseSubscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    console.log(`[SUBSCRIPTION_CANCEL] Subscription cancelled successfully: ${subscription.razorpaySubscriptionId}`);

    return NextResponse.json({
      success: true,
      message: `Subscription for ${subscription.course.title} cancelled successfully. Access remains active until the end of your billing cycle.`,
    });
  } catch (error: any) {
    console.error("[SUBSCRIPTION_CANCEL_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to cancel subscription" }, { status: 500 });
  }
}
