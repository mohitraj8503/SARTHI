import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { trackStudentActivity } from '@/lib/services/growth';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { type, metadata } = body;

        if (!type) {
            return NextResponse.json({ error: 'Type is required' }, { status: 400 });
        }

        // Validate type (whitelist)
        const allowedTypes = ['COURSE_VIEW', 'CATEGORY_CLICK', 'SEARCH', 'CART_ADD', 'CHECKOUT_START'];
        if (!allowedTypes.includes(type)) {
            return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
        }

        await trackStudentActivity(session.userId, type, metadata || {});

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Activity Tracking Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

