export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { sendEmail } from '@/lib/email';
import { createAdminNotification } from '@/lib/admin/notifications';

async function sendAdminPaymentAlert(payload: {
  studentName: string;
  courseTitle: string;
  amount: string;
  transactionId: string;
  orderId: string;
  orderHref: string;
}) {
  const { studentName, courseTitle, amount, transactionId, orderId, orderHref } = payload;

  await createAdminNotification({
    title: 'Payment Proof Submitted',
    body: `${studentName} submitted payment proof for ${courseTitle} (₹${amount}).`,
    type: 'payment',
    source: 'payments',
    severity: 'info',
    href: orderHref,
    meta: { orderId, transactionId, amount, courseTitle }
  });

  const webhook = process.env.PAYMENT_ALERT_WEBHOOK_URL;
  if (!webhook) return;

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'payment_proof_submitted',
        orderId,
        transactionId,
        amount,
        studentName,
        courseTitle,
      }),
    });
  } catch (error) {
    console.error('[Payments] Failed to send payment alert webhook:', error);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const orderId = formData.get('orderId') as string;
    const transactionId = formData.get('transactionId') as string;
    const studentId = formData.get('studentId') as string;
    const courseId = formData.get('courseId') as string;
    const amount = formData.get('amount') as string;
    const screenshot = formData.get('screenshot') as File;

    if (!orderId || !transactionId || !studentId || !courseId || !amount || !screenshot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate UTR format (12 digits)
    if (!/^\d{12}$/.test(transactionId)) {
      return NextResponse.json(
        { error: 'Invalid UTR format. Must be 12 digits.' },
        { status: 400 }
      );
    }

    // Check for duplicate UTR
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        razorpayPaymentId: transactionId,
        status: { in: ['completed', 'pending_verification'] },
      },
    });

    if (existingTransaction) {
      return NextResponse.json(
        { error: 'This transaction ID has already been used' },
        { status: 400 }
      );
    }

    // Save screenshot to public/uploads directory
    const bytes = await screenshot.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const filename = `payment_${orderId}_${timestamp}.${screenshot.name.split('.').pop()}`;
    const filepath = join(process.cwd(), 'public', 'uploads', 'payments', filename);

    await mkdir(join(process.cwd(), 'public', 'uploads', 'payments'), { recursive: true });
    await writeFile(filepath, buffer);

    const screenshotUrl = `/uploads/payments/${filename}`;

    // Create or update transaction
    let transaction = await prisma.transaction.findFirst({
      where: { razorpayOrderId: orderId },
    });

    if (transaction) {
      transaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'pending_verification',
          razorpayPaymentId: transactionId,
        },
      });
    } else {
      transaction = await prisma.transaction.create({
        data: {
          userId: studentId,
          courseId: courseId,
          amount: parseFloat(amount),
          status: 'pending_verification',
          razorpayOrderId: orderId,
          razorpayPaymentId: transactionId,
          currency: 'INR',
        },
      });
    }

    // Fetch student and course details for admin alert
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true, email: true },
    });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });

    // Log activity
    await prisma.platformActivity.create({
      data: {
        type: 'payment_proof_submitted',
        userId: studentId,
        data: JSON.stringify({
          description: `Payment proof submitted for Order ${orderId}`,
          userName: student?.name || student?.email || 'Unknown Student',
          amount,
          courseId,
          screenshot: screenshotUrl,
          transactionId,
        }),
      },
    });

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app';
    const verifyHref = `/admin/payments/verify/${orderId}`;

    // Format human-readable alert message
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = now
      .toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .toLowerCase();

    const adminAlertMessage = `
🔔 *New Course Payment Notification*

👤 *Student Name:* ${student?.name || 'Unknown'}
📚 *Course:* ${course?.title || 'Unknown'}
💰 *Amount Paid:* ₹${amount}
🔢 *Transaction ID:* ${transactionId}
📦 *Order ID:* ${orderId}
📅 *Date & Time:* ${formattedDate}, ${formattedTime}

⚠️ *Payment proof submitted. Please verify and confirm enrollment.*

🔗 *Verify Now:* ${appBaseUrl}${verifyHref}
        `.trim();

    await sendAdminPaymentAlert({
      studentName: student?.name || student?.email || 'Unknown Student',
      courseTitle: course?.title || 'Unknown Course',
      amount,
      transactionId,
      orderId,
      orderHref: verifyHref,
    });

    // Log admin alert event
    await prisma.platformActivity.create({
      data: {
        type: 'payment_admin_alert_sent',
        userId: 'system',
        data: JSON.stringify({
          description: 'Admin payment alert notification sent',
          orderId,
          message: adminAlertMessage,
        }),
      },
    });

    // Send email confirmation to student
    if (student?.email) {
      const emailContent = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Payment Proof Received</h1>
                    <p>Hi ${student.name || 'Student'},</p>
                    <p>We have received your payment proof for <strong>${
                      course?.title || 'the course'
                    }</strong>.</p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
                        <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${amount}</p>
                        <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
                    </div>
                    <p>Our team will verify the details and activate your enrollment shortly (usually within 24 hours).</p>
                    <p>You will receive another email once your course is active.</p>
                    <br>
                    <p style="color: #666; font-size: 14px;">Best regards,<br>SARTHI Support Team</p>
                </div>
            `;

      await sendEmail({
        to: student.email,
        subject: `Payment Proof Received - ${course?.title}`,
        html: emailContent,
      }).catch((err: unknown) => console.error('Failed to send student email:', err));
    }

    return NextResponse.json({
      success: true,
      transaction,
      orderId,
      message: 'Payment proof submitted successfully!',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit payment proof';
    console.error('Submit proof error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

