import { NextResponse } from "next/server";
import { getChannelVideos } from "@/lib/youtube";

export const dynamic = 'force-dynamic';

export async function GET() {
    const videos = await getChannelVideos(50);
    return NextResponse.json({ videos });
}

