import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await getCurrentUser();
        if (!user || !["ADMIN", "SUPER_ADMIN", "GOD_ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { action } = await req.json();

        let data: any = {};
        if (action === "publish") {
            data = { isPublished: true, publish_state: "published", isActive: true };
        } else if (action === "unpublish") {
            data = { isPublished: false, publish_state: "draft" };
        } else if (action === "archive") {
            data = { isActive: false, isPublished: false, publish_state: "archived" };
        } else if (action === "restore") {
            data = { isActive: true, isPublished: false, publish_state: "draft" };
        } else if (action === "toggle-featured") {
            const currentCourse = await prisma.course.findUnique({
                where: { id: params.id },
                select: { isFeatured: true }
            });
            const course = await prisma.course.update({
                where: { id: params.id },
                data: { isFeatured: !currentCourse?.isFeatured }
            });
            return NextResponse.json(course);
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const course = await prisma.course.update({
            where: { id: params.id },
            data
        });

        return NextResponse.json(course);
    } catch (error: any) {
        console.error("Course Status Action Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
