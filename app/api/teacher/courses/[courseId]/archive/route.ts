export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse, handleApiError } from "@/lib/admin/core";
import { authenticateTeacher } from "@/lib/auth/middleware";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await authenticateTeacher(req);
    const { courseId } = await params;

    const body = await req.json();
    const { archive } = body;

    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId: userId }
    });

    if (!course) {
      return ApiResponse.error("Course not found or unauthorized.", "NOT_FOUND", 404);
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        isActive: !archive,
        isPublished: archive ? false : course.isPublished,
        publish_state: archive ? 'archived' : (course.isPublished ? 'published' : 'draft')
      }
    });

    return ApiResponse.success(
      updatedCourse, 
      archive ? "Course archived successfully." : "Course restored from archive."
    );
  } catch (error: any) {
    return handleApiError(error);
  }
}
