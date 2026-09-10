import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTransactionalEmail } from '@/lib/email/send';
import { getOTPTemplate } from '@/lib/email-templates/otp';
import { crypto } from '@/lib/utils/crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Expiry set to 10 minutes from now
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        // Store in VerificationToken table (identifier is email)
        await prisma.verificationToken.upsert({
            where: { identifier_token: { identifier: email, token: otp } },
            update: { expires },
            create: { identifier: email, token: otp, expires }
        });

        // Send email
        const emailResult = await sendTransactionalEmail({
            to: email,
            subject: `${otp} is your SARTHI verification code`,
            html: getOTPTemplate(otp),
            type: 'verification'
        });

        if (!emailResult.success) {
            return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });

    } catch (error: any) {
        console.error('[OTP_SEND_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        // Check if token exists and is valid
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: otp,
                expires: { gt: new Date() }
            }
        });

        if (!verificationToken) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // Delete the token after successful verification
        await prisma.verificationToken.delete({
            where: { token: otp }
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Email verified successfully',
            // Return a temporary proof of verification if needed
            // For now success is enough
        });

    } catch (error: any) {
        console.error('[OTP_VERIFY_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
