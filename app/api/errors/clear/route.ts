import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/admin/core';

const LOG_FILE = path.join(process.cwd(), 'error-logs.json');

export async function POST() {
    try {
        await requireAdmin();
        fs.writeFileSync(LOG_FILE, '[]');
        return NextResponse.json({ success: true, message: 'Terminal log repository cleared' });
    } catch (e) {
        if (e instanceof Error && e.message === 'UNAUTHORIZED') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        if (e instanceof Error && e.message === 'FORBIDDEN') {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

// Redirect GET to Dashboard
export async function GET() {
    return NextResponse.redirect(new URL('/admin/errors', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}

