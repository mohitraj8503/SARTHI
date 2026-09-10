export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/core';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        await requireAdmin();
        const { paymentId, reason } = await request.json();

        if (!paymentId || !reason) {
            return NextResponse.json({ error: 'Payment ID and reason are required' }, { status: 400 });
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
            data: { status: 'failed' }
        });

        // Log activity
        await prisma.platformActivity.create({
            data: {
                type: 'payment_rejected',
                userId: payment.userId,
                data: JSON.stringify({
                    description: `Payment rejected for "${payment.course.title}" - Reason: ${reason}`,
                    userName: payment.user.name || payment.user.email,
                    amount: payment.amount,
                    reason
                })
            }
        });

        const trimmedReason = reason.slice(0, 500);
        await prisma.notification.create({
            data: {
                userId: payment.userId,
                title: 'Payment Rejected',
                body: `Your payment for "${payment.course.title}" was rejected. Reason: ${trimmedReason}`,
                type: 'payment',
                href: '/pricing',
            }
        }).catch((err: unknown) => {
            console.error('Failed to create payment rejection notification:', err);
        });

        if (payment.user.email) {
            const html = `
                <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto;">
                    <h1 style="color:#991b1b;">Payment Rejected</h1>
                    <p>Hi ${payment.user.name || 'Student'},</p>
                    <p>Your payment for <strong>${payment.course.title}</strong> could not be approved.</p>
                    <div style="background:#fef2f2;border:1px solid #fecaca;padding:12px;border-radius:8px;margin:16px 0;">
                        <p style="margin:0;"><strong>Reason:</strong> ${trimmedReason}</p>
                    </div>
                    <p>Please submit payment proof again or contact support if you need help.</p>
                </div>
            `;

            await sendEmail({
                to: payment.user.email,
                subject: `Payment Rejected - ${payment.course.title}`,
                html
            }).catch((err: unknown) => {
                console.error('Failed to send payment rejection email:', err);
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Payment rejected and student notified'
        });

    } catch (error) {
        if ((error as Error).message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Failed to reject payment:', error);
        return NextResponse.json({ error: 'Failed to reject payment' }, { status: 500 });
    }
}

