export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getRazorpayInstance } from "@/lib/razorpay";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
        return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const attemptId = params.id;

        // 1. Verify attempt status and ownership
        const attempt = await prisma.certificationAttempt.findUnique({
            where: { id: attemptId },
            include: {
                certification: true
            }
        });

        if (!attempt) {
            return NextResponse.json({ error: "Attempt session not found" }, { status: 404 });
        }

        if (attempt.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (!attempt.passed) {
            return NextResponse.json({ error: "You must pass the assessment before claiming a certificate" }, { status: 400 });
        }

        // 2. Check if payment already completed
        const existingPayment = await prisma.certificationPayment.findUnique({
            where: { attemptId: attemptId }
        });

        if (existingPayment && existingPayment.status === 'COMPLETED') {
            return NextResponse.json({ error: "Certificate already paid for" }, { status: 400 });
        }

        // 3. Create or update payment record
        const amount = attempt.certification.price;
        const currency = "INR";
        
        // Generate a simple invoice number if not existing
        const invoiceNumber = existingPayment?.invoiceNumber || `INV-CERT-${attemptId.substring(0, 8)}-${Date.now()}`;

        // 4. Create Razorpay Order
        const options = {
            amount: amount * 100, // in paise
            currency: currency,
            receipt: invoiceNumber,
            notes: {
                attemptId: attemptId,
                userId: user.id,
                certificationId: attempt.certificationId,
                type: "CERTIFICATION_FEE"
            }
        };

        const order = await razorpay.orders.create(options);

        // 5. Save payment entry (Upsert if retry)
        await prisma.certificationPayment.upsert({
            where: { attemptId: attemptId },
            create: {
                userId: user.id,
                certificationId: attempt.certificationId,
                attemptId: attemptId,
                amount: amount,
                currency: currency,
                status: 'PENDING',
                paymentGateway: 'razorpay',
                paymentGatewayOrderId: order.id,
                invoiceNumber: invoiceNumber
            },
            update: {
                paymentGatewayOrderId: order.id,
                status: 'PENDING'
            }
        });

        return NextResponse.json({
            paymentId: attemptId, // Using attemptId as internal ref
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            certificationTitle: attempt.certification.title,
            razorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error("[CERT_PAYMENT_ERROR]", error);
        return NextResponse.json({ error: "Could not initiate payment. Please try again." }, { status: 500 });
    }
}
