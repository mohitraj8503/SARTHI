import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";
import { youtubeService } from "@/lib/youtube-api";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    const { title, description, privacy = 'private', lessonId } = await req.json();

    if (!title) {
        return ApiResponse.error("Title is required for YouTube upload.", "VALIDATION_ERROR", 400);
    }

    // 1. Initiate Resumable Upload Session
    const uploadUrl = await youtubeService.initiateResumableUpload(user.id, {
        title,
        description: description || `Teaching Session for Lesson: ${lessonId}`,
        privacy
    });

    if (!uploadUrl) {
        return ApiResponse.error("Failed to initiate YouTube upload session.", "YOUTUBE_API_ERROR", 500);
    }

    return ApiResponse.success({
        uploadUrl,
        lessonId,
        suggestedTitle: title
    });

  } catch (error) {
    return handleApiError(error);
  }
}

