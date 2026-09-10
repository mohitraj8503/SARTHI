export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';

// Temporarily disabled - requires schema update
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return NextResponse.json(
        { error: 'This endpoint is temporarily disabled' },
        { status: 503 }
    );
}
