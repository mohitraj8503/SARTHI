import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();
        let userId = '';

        if (token) {
            const user = await prisma.user.findFirst({
                where: {
                    passwordSetupToken: token,
                    passwordSetupExpires: { gt: new Date() }
                }
            });
            if (!user) {
                return NextResponse.json({ error: 'Setup link is invalid or has expired' }, { status: 404 });
            }
            userId = user.id;
        } else {
            const { getSession } = await import('@/lib/auth/session');
            const session = await getSession();
            if (!session?.userId) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
            }
            userId = session.userId;
        }

        const uppercase = /[A-Z]/.test(password);
        const lowercase = /[a-z]/.test(password);
        const number = /[0-9]/.test(password);
        if (password.length < 8 || !uppercase || !lowercase || !number) {
            return NextResponse.json({ 
                error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' 
            }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                passwordSetupToken: null,
                passwordSetupExpires: null,
                requiresPasswordChange: false,
                onboardingStatus: 'COMPLETED',
                onboarded: true,
                status: 'ACTIVE'
            }
        });

        return NextResponse.json({ success: true, message: 'Account finalized successfully' });

    } catch (error) {
        console.error('[SETUP_COMPLETE_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
