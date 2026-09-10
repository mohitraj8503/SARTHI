export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await getCurrentUser();
        if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const seminar = await prisma.seminar.findUnique({
            where: { id: params.id },
        });

        if (!seminar) return NextResponse.json({ error: "Seminar not found" }, { status: 404 });

        const newTitle = `Duplicate - ${seminar.title}`;
        const baseSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        let slug = baseSlug;
        let count = 1;
        while (await prisma.seminar.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }

        const duplicated = await prisma.seminar.create({
            data: {
                title: newTitle,
                slug,
                description: seminar.description,
                thumbnail: seminar.thumbnail,
                speakerName: seminar.speakerName,
                speakerBio: seminar.speakerBio,
                speakerImage: seminar.speakerImage,
                date: seminar.date, // Preserve date
                duration: seminar.duration,
                price: seminar.price,
                maxAttendees: seminar.maxAttendees,
                category: seminar.category,
                level: seminar.level,
                tags: seminar.tags,
                youtubeStreamUrl: seminar.youtubeStreamUrl,
                instructorId: seminar.instructorId,
                status: "DRAFT",
            } as any,
        });

        return NextResponse.json(duplicated);
    } catch (error: any) {
        console.error("Duplicate Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
