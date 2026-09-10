export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';
import { uploadCertificate } from '@/lib/cloudinary';
import { verifyPayment } from '@/lib/razorpay';
import { sendEmail, templates } from '@/lib/email';
import qrcode from 'qrcode';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { CertificatePdfDocument } from '@/lib/certificate-pdf';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const body = await req.json();
        const {
            attemptId,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        } = body;

        // Fetch Certification to get ID from slug
        const certification = await prisma.certification.findUnique({
            where: { slug: slug },
            select: { id: true, title: true, price: true }
        });

        if (!certification) {
            return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
        }

        const certificationId = certification.id;

        // 1. Verify Payment Signature
        let isValid = false;
        const isFree = razorpay_payment_id === "FREE_CERT" && (Number(certification.price) === 0);
        if (isFree) {
            isValid = true;
        } else {
            isValid = await verifyPayment({
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature
            });
        }

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // 2. Fetch Attempt + Certification Details
        const attempt = await prisma.certificationAttempt.findUnique({
            where: { id: attemptId },
            include: {
                certification: true,
                user: true
            }
        });

        if (!attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        if (attempt.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 3. Idempotency – return existing cert if already issued
        const existingCert = await prisma.issuedCertificate.findFirst({
            where: {
                userId: user.id,
                certificationId: certificationId
            }
        });

        if (existingCert) {
            return NextResponse.json({ success: true, certificate: existingCert });
        }

        // 4. Mark payment complete
        if (!isFree) {
            await prisma.certificationPayment.update({
                where: { attemptId: attemptId },
                data: {
                    status: 'COMPLETED',
                    paymentGatewayPaymentId: razorpay_payment_id
                }
            });
        }

        // 5. Generate Verification ID
        const certPrefix = slug === 'fullstack-mastery' 
          ? 'FSWDM' 
          : slug === 'ias-preparation' 
            ? 'UPSC-FS' 
            : slug === 'python-professional' || slug === 'python-professional-developer' || slug === 'python-pro-cert'
              ? 'PY-PRO' 
              : slug === 'advanced-excel-certification-exam'
                ? 'AEX-C'
                : slug.substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '');
        const year = new Date().getFullYear();
        const count = await prisma.issuedCertificate.count({
          where: {
            verificationId: {
              startsWith: `TT-${certPrefix}-${year}-`
            }
          }
        });
        const sequenceStr = String(count + 1).padStart(6, '0');
        const verificationId = `TT-${certPrefix}-${year}-${sequenceStr}`;
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app'}/verify/${verificationId}`;

        // 6. QR Code (dark TT navy on white)
        const qrDataUrl = await qrcode.toDataURL(verifyUrl, {
            width: 200,
            margin: 1,
            color: { dark: '#06122e', light: '#ffffff' },
            errorCorrectionLevel: 'H',
        });

        // 7. Issue date (e.g. "April 19, 2026")
        const issueDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // 8. Render premium PDF via @react-pdf/renderer
        const pdfBuffer = await renderToBuffer(
            React.createElement(CertificatePdfDocument, {
                studentName:   attempt.user.name    || 'Student',
                courseName:    certification.title,
                issueDate,
                certificateId: verificationId,
                qrDataUrl,
            })
        );

        // 9. Upload to Cloudinary
        const upload = await uploadCertificate(pdfBuffer, verificationId);

        if (!upload.success || !upload.url) {
            throw new Error('Failed to upload certificate to storage.');
        }

        // 10. Persist issued certificate record
        const issued = await prisma.issuedCertificate.upsert({
            where: { userId_certificationId: { userId: user.id, certificationId } },
            update: { razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, status: 'VALID' },
            create: {
                userId:              user.id,
                certificationId:     certificationId,
                certificateUrl:      upload.url,
                verificationId:      verificationId,
                score:               attempt.score || 0,
                razorpayOrderId:     razorpay_order_id,
                razorpayPaymentId:   razorpay_payment_id,
                status:              'VALID'
            }
        });

        // 11. Email delivery
        try {
            const { subject, html } = templates.certificateDelivery(
                attempt.user.name    || 'Student',
                certification.title,
                verificationId
            );

            await sendEmail({
                to:      attempt.user.email,
                subject,
                html,
                attachments: [{
                    filename:    `${certification.title.replace(/\s+/g, '_')}_Certificate.pdf`,
                    content:     pdfBuffer.toString('base64'),
                    type:        'application/pdf',
                    disposition: 'attachment',
                }]
            });
        } catch (emailErr) {
            console.error('[CERT_EMAIL_ERROR]', emailErr);
        }

        return NextResponse.json({ success: true, certificate: issued });

    } catch (error: any) {
        console.error('[GENERATE_CERT_ERROR]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
