export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await getCurrentUser();
        if (!user || !["ADMIN", "SUPER_ADMIN", "GOD_ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const course = await prisma.course.findUnique({
            where: { id: params.id }
        });

        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

        const newSlug = course.slug ? `${course.slug}-copy-${Date.now()}` : `copy-${Date.now()}`;

        // Duplicate course
        const duplicated = await prisma.course.create({
            data: {
                title: `${course.title} (Copy)`,
                description: course.description,
                thumbnail: course.thumbnail,
                price: course.price,
                category: course.category,
                instructorId: course.instructorId,
                teacherId: course.teacherId,
                slug: newSlug,
                shortDescription: course.shortDescription,
                isPublished: false,
                isActive: true,
                publish_state: "draft",
            }
        });

        return NextResponse.json(duplicated);
    } catch (error: any) {
        console.error("Course Duplicate API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
