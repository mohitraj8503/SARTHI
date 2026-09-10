import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleApiError } from '@/lib/admin/core';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await requireAdmin();
        const count = await prisma.transaction.count({
            where: { status: 'pending_verification' }
        });

        return NextResponse.json({ count });
    } catch (error) {
        if ((error as Error).message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Failed to fetch pending payments count:', error);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}

