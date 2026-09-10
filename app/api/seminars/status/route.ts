import { NextResponse } from "next/server";
import { getCurrentLiveStream } from "@/lib/youtube";

export async function GET() {
    const liveStream = await getCurrentLiveStream();
    return NextResponse.json({
        isLive: liveStream.videoId !== null,
        ...liveStream,
    });
}

export const dynamic = 'force-dynamic'; // Prevent static prerendering issues
export const revalidate = 30; // recheck every 30 seconds

