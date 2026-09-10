export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getRazorpayInstance } from "@/lib/razorpay";
import { withResiliency } from "@/lib/resilient-db";

// Fallback seminar data for when DB is unavailable
const FALLBACK_SEMINARS: Record<string, { id: string; title: string }> = {
  'time-management': { id: 'time-management', title: 'Time Management' },
  'time_management': { id: 'time_management', title: 'Time Management' },
};

export async function POST(req: NextRequest) {
  try {
    const authenticatedUser = await getCurrentUser();
    const body = await req.json();
    const { 
      seminarId, 
      name, 
      email, 
      phone, 
      city, 
      profession, 
      referralSource 
    } = body;

    if (!seminarId) {
      return NextResponse.json({ error: "Seminar ID is required" }, { status: 400 });
    }

    // 1. Determine Target User (Authenticated or Guest)
    let targetUserId: string | null | undefined = authenticatedUser?.id;
    const targetEmail = authenticatedUser?.email || email;

    if (!targetUserId) {
      if (!email) {
        return NextResponse.json({ error: "Email is required for guest registration" }, { status: 400 });
      }

      // Guest Flow: Find or Create User
      try {
        console.log(`[SEMINAR_ORDER] Processing guest user: ${email}`);
        targetUserId = await withResiliency(async () => {
          let user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { id: true }
          });

          if (!user) {
            console.log(`[SEMINAR_ORDER] Creating new guest user: ${email}`);
            user = await prisma.user.create({
              data: {
                email: email.toLowerCase(),
                name: name || 'Guest User',
                phone: phone ?? undefined,
                status: "PENDING",
                role: "STUDENT",
                onboarded: false,
              },
              select: { id: true }
            });
          }
          return user.id;
        }, `user_${email.toLowerCase()}`);

        if (!targetUserId) {
           console.warn(`[SEMINAR_ORDER] DB unreachable during user processing for ${email}. Proceeding with temporary ID.`);
           targetUserId = `GUEST_${Buffer.from(email.toLowerCase()).toString('hex').substring(0, 10)}`;
        }
      } catch (err: any) {
        console.error("User processing non-fatal error:", err);
        targetUserId = `GUEST_ERR_${Date.now()}`;
      }
    }

    // 2. Validate Seminar (DB first, then fallback)
    let seminar: { id: string; title: string } | null = null;
    try {
      seminar = await prisma.seminar.findFirst({
        where: { OR: [{ id: seminarId }, { slug: seminarId }] },
        select: { id: true, title: true }
      });
    } catch (err) { /* DB not reachable */ }

    if (!seminar) {
      seminar = FALLBACK_SEMINARS[seminarId] || null;
    }

    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    // 3. Check if already registered
    try {
      const existing = await prisma.seminarRegistration.findUnique({
        where: { 
          seminarId_userId: { 
            seminarId: seminar.id, 
            userId: targetUserId 
          } 
        },
      });
      if (existing && existing.status === 'REGISTERED') {
        return NextResponse.json({ error: "This email is already registered for this seminar" }, { status: 400 });
      }
    } catch (err) { /* DB not reachable, skip check */ }

    // 4. Create Razorpay Order with fallback
    const amount = 499 * 100; // Amount in paise
    const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const razorpay = getRazorpayInstance();

    if (razorpay) {
      try {
        const receiptId = `rcpt_sem_${seminar.id.substring(0, 8)}_${Date.now()}`.substring(0, 40);
        const options = {
          amount,
          currency: "INR",
          receipt: receiptId,
          notes: {
            seminarId: String(seminar.id || ''),
            userId: String(targetUserId || ''),
            email: String(targetEmail || ''),
            name: String(name || authenticatedUser?.name || 'Attendee'),
            title: String(seminar.title || ''),
            type: 'seminar_registration'
          }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          seminar: {
            title: seminar.title,
            id: seminar.id
          }
        });
      } catch (rzpErr: any) {
        console.error("[SEMINAR_RAZORPAY_ORDER_CREATE_WARN] Razorpay order creation failed, generating resilient order ID:", rzpErr);
      }
    }

    // Direct payment fallback if Razorpay gateway API order creation is unavailable
    return NextResponse.json({
      orderId: null,
      amount: amount,
      currency: "INR",
      key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      seminar: {
        title: seminar.title,
        id: seminar.id
      }
    });

  } catch (error: any) {
    console.error("[SEMINAR_PAYMENT_ORDER_ERROR]", error);
    return NextResponse.json({ error: "Could not initiate payment. Please try again." }, { status: 500 });
  }
}

