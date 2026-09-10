import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateLessonProgress, recordLearningSession } from "@/lib/services/progress";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, courseId, progress, durationSec } = await req.json();

    if (!lessonId || !courseId || typeof progress !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Update Progress & Completion
    const updateResult = await updateLessonProgress(user.id, courseId, lessonId, progress);

    // 2. Track Study Time (if provided)
    if (durationSec && durationSec > 0) {
      await recordLearningSession(user.id, courseId, lessonId, durationSec);
    }

    return NextResponse.json({
        success: true,
        ...updateResult
    });
  } catch (error: any) {
    console.error("Progress Update API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

