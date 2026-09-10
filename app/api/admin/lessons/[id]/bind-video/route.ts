export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAdmin();
    const { videoId } = await req.json();

    if (!videoId) {
        return ApiResponse.error("Video ID is required", "VALIDATION_ERROR", 400);
    }

    const updatedLesson = await prisma.lesson.update({
        where: { id: params.id },
        data: {
            youtube_video_id: videoId,
            upload_status: 'COMPLETED',
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`
        }
    });

    return ApiResponse.success(updatedLesson);

  } catch (error) {
    return handleApiError(error);
  }
}
