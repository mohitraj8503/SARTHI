import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                passwordSetupToken: token,
                passwordSetupExpires: { gt: new Date() }
            },
            select: {
                id: true,
                email: true,
                name: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Setup link is invalid or has expired' }, { status: 404 });
        }

        return NextResponse.json({ user });

    } catch (error) {
        console.error('[SETUP_VERIFY_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
