export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nextEnrollmentNo, nextEnrollmentCode } from '@/lib/enrollment';
import { requireAdmin } from '@/lib/admin/core';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        await requireAdmin();
        const { paymentId } = await request.json();

        if (!paymentId) {
            return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
        }

        // Get payment details
        const payment = await prisma.transaction.findUnique({
            where: { id: paymentId },
            include: {
                user: true,
                course: true
            }
        });

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // Update payment status
        await prisma.transaction.update({
            where: { id: paymentId },
            data: { status: 'succeeded' }
        });

        // Create enrollment
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: payment.userId,
                    courseId: payment.courseId
                }
            }
        });

        if (!existingEnrollment) {
            const eNo = await nextEnrollmentNo();
            const eCode = await nextEnrollmentCode(eNo);

            await prisma.enrollment.create({
                data: {
                    userId: payment.userId,
                    courseId: payment.courseId,
                    enrollmentNo: eNo,
                    enrollmentCode: eCode,
                    status: 'active',
                    enrolledBy: 'payment_approval'
                }
            });
        }

        // Log activity
        await prisma.platformActivity.create({
            data: {
                type: 'payment_approved',
                userId: payment.userId,
                data: JSON.stringify({
                    description: `Payment approved for "${payment.course.title}"`,
                    userName: payment.user.name || payment.user.email,
                    amount: payment.amount
                })
            }
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app';
        const courseHref = payment.course?.slug ? `/courses/${payment.course.slug}` : '/dashboard';

        await prisma.notification.create({
            data: {
                userId: payment.userId,
                title: 'Payment Approved',
                body: `Your payment for "${payment.course.title}" has been approved. You can now access the course.`,
                type: 'payment',
                href: courseHref,
            }
        }).catch((err: unknown) => {
            console.error('Failed to create payment approval notification:', err);
        });

        if (payment.user.email) {
            const html = `
                <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto;">
                    <h1 style="color:#1f2937;">Payment Approved</h1>
                    <p>Hi ${payment.user.name || 'Student'},</p>
                    <p>Your payment for <strong>${payment.course.title}</strong> has been approved.</p>
                    <p>You now have access to the course in your dashboard.</p>
                    <p style="margin-top:24px;">
                        <a href="${appUrl}${courseHref}" style="background:#111827;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;">
                            Open Course
                        </a>
                    </p>
                    <p style="color:#6b7280;font-size:13px;">If you did not make this purchase, contact support immediately.</p>
                </div>
            `;

            await sendEmail({
                to: payment.user.email,
                subject: `Payment Approved - ${payment.course.title}`,
                html
            }).catch((err: unknown) => {
                console.error('Failed to send payment approval email:', err);
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Payment approved and student enrolled successfully'
        });

    } catch (error) {
        if ((error as Error).message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Failed to approve payment:', error);
        return NextResponse.json({ error: 'Failed to approve payment' }, { status: 500 });
    }
}

