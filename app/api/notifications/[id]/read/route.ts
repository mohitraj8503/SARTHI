export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { markAsRead } from '@/app/actions/notifications';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const result = await markAsRead(id);

    if ('error' in result && result.error === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if ('error' in result && result.error === 'DB_CONNECTION_FAILED') {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
    }

    return NextResponse.json({ success: true });
}
