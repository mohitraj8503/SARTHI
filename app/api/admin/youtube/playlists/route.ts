export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { youtubeService } from '@/lib/youtube-api';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const playlists = await youtubeService.getPlaylists(user.id);
    return NextResponse.json(playlists);
  } catch (error: any) {
    console.error('Fetch YT Playlists Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

