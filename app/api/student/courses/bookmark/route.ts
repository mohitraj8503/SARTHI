import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Check if bookmark exists
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (existing) {
      // Remove it
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, bookmarked: false, message: "Removed from bookmarks" });
    } else {
      // Add it
      await prisma.wishlist.create({
        data: {
          userId: user.id,
          courseId,
        },
      });
      return NextResponse.json({ success: true, bookmarked: true, message: "Added to bookmarks" });
    }
  } catch (error) {
    console.error("Bookmark Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
