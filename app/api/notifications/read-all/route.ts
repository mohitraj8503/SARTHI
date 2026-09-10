export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { markAllAsRead } from '@/app/actions/notifications';

export async function POST() {
    const result = await markAllAsRead();

    if ('error' in result && result.error === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if ('error' in result && result.error === 'DB_CONNECTION_FAILED') {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
    }

    return NextResponse.json({ success: true });
}

