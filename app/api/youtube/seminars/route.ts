import { NextResponse } from 'next/server';
import { getLiveStatus } from '@/lib/youtube';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // 30 seconds cache

export async function GET() {
  try {
    const data = await getLiveStatus();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { live: null, upcoming: [], replays: [] }, 
      { status: 500 }
    );
  }
}

