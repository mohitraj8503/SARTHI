export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';

/**
 * CENTRAL GRAVITY GENERATOR (SSE API)
 * 
 * This endpoint maintains the real-time conduit for all authenticated masses.
 */

// In-memory store of active connections (for demonstration)
// In production, this would use Redis Pub/Sub
const clients = new Map<string, ReadableStreamDefaultController>();

export async function GET() {
    return new NextResponse('Gravity Field Decomissioned', { status: 404 });
}

export async function POST(req: NextRequest) {
    // This endpoint handles Presence Broadcasts
    const body = await req.json();
    const { userId, status } = body;

    // Simulate broadcasting to all connected clients
    const encoder = new TextEncoder();
    clients.forEach((controller, id) => {
        if (id !== userId) {
            try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'CONSTELLATION_UPDATE',
                    payload: { userId, status }
                })}\n\n`));
            } catch { }
        }
    });

    return NextResponse.json({ success: true });
}

