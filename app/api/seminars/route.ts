export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { withResiliency } from "@/lib/resilient-db";
import { sendSpeakerInviteEmail } from "@/lib/email-templates/speaker-invite";

// Types for the Frontend
export type Seminar = {
    id: string;
    title: string;
    description: string;
    instructorName: string;
    instructorAvatar?: string;
    youtubeVideoId: string;
    youtubeLiveUrl?: string;
    scheduledStart: string;
    durationMins?: number;
    tags: string[];
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    status: 'LIVE' | 'UPCOMING' | 'REPLAY';
    views?: number;
    createdAt: string;
    isDemoData?: boolean;
    isRegistered?: boolean;
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const instructorOnly = searchParams.get('instructor') === 'true';
        
        const user = await getCurrentUser();
        
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const whereClause: any = instructorOnly 
            ? { instructorId: user.id }
            : { status: { in: ['SCHEDULED', 'LIVE', 'ENDED'] } };

        const includeObj: any = instructorOnly
            ? { _count: { select: { registrations: true } } }
            : {
                speaker: { select: { name: true, photo: true } },
                registrations: { where: { userId: user.id }, select: { id: true, userId: true } },
                _count: { select: { registrations: true } },
            };

        const seminarsRes = await withResiliency(() => prisma.seminar.findMany({
            where: whereClause,
            orderBy: instructorOnly 
                ? { createdAt: 'desc' } 
                : { scheduledAt: 'desc' },
            include: includeObj,
        }));

        const safeSeminars = (seminarsRes.data ?? []) as any[];
        const transformed: Seminar[] = safeSeminars.map((s: any) => {
            const videoId = s.youtubeBroadcastId || s.recordingVideoId || "";
            // Resilient Date extraction helper
            let parsedDate: Date;
            try {
                const rawDate = s.scheduledAt || s.scheduledStart || s.date || s.startTime;
                parsedDate = rawDate ? new Date(rawDate) : new Date();
                if (isNaN(parsedDate.getTime())) {
                    parsedDate = new Date();
                }
            } catch (e) {
                parsedDate = new Date();
            }

            return {
                id: s.id,
                title: s.title,
                description: s.description || "",
                instructorName: s.speaker?.name || s.speakerName || "Expert Speaker",
                instructorAvatar: s.speaker?.photo || s.speakerImage || undefined,
                youtubeVideoId: videoId,
                youtubeLiveUrl: videoId ? `https://youtube.com/live/${videoId}` : undefined,
                scheduledStart: parsedDate.toISOString(),
                durationMins: s.durationMinutes || 60,
                tags: typeof s.tags === "string" ? (s.tags.startsWith("[") ? JSON.parse(s.tags) : s.tags.split(",").filter(Boolean)) : [],
                level: 'Intermediate',
                status: s.status === 'LIVE' ? 'LIVE' : ((s.status === 'SCHEDULED' || s.status === 'UPCOMING') ? 'UPCOMING' : 'REPLAY'),
                views: (s._count?.registrations || 0) * 12, // Synthetic views for UI
                registrationsCount: s._count?.registrations || 0,
                createdAt: s.createdAt ? (s.createdAt instanceof Date ? s.createdAt.toISOString() : new Date(s.createdAt).toISOString()) : new Date().toISOString(),
                isRegistered: (s.registrations?.length || 0) > 0
            };
        });

        return NextResponse.json(transformed);
    } catch (error: any) {
        console.error('[Seminar_GET_Error]', error);
        return NextResponse.json({ error: "Failed to load seminars. Please try again later." }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Auto-generate slug from title
        const baseSlug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        let slug = baseSlug;
        let count = 1;
        while (await prisma.seminar.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }

        const seminar = await prisma.seminar.create({
            data: {
                title: body.title,
                slug,
                description: body.description,
                thumbnail: body.thumbnail,
                streamingPlatform: body.streamingPlatform || "YOUTUBE",
                youtubeBroadcastId: body.youtubeVideoId || null,
                meetLink: body.meetLink || null,
                meetViewLink: body.meetViewLink || null,
                streamKey: body.streamKey || null,
                scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
                durationMinutes: body.durationMinutes,
                status: body.status || "DRAFT",
                isPrivate: body.isPrivate ?? true,
                registrationRequired: body.registrationRequired || false,
                maxAttendees: body.maxAttendees || 1000,
                speakerId: body.speakerId || null,
                courseId: body.courseId || null,
                tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : body.tags || "",
                speakerName: body.speakerName || "Expert Speaker",
                speakerBio: body.speakerBio || "", 
                date: body.scheduledAt ? new Date(body.scheduledAt) : new Date(),
                duration: body.durationMinutes || 60,
                price: body.price || 0,
                category: body.category || "General",
                level: body.level || "Intermediate",
            },
        });

        if (seminar.speakerId) {
            const speaker = await prisma.speaker.findUnique({ where: { id: seminar.speakerId } });
            if (speaker?.email) {
                await sendSpeakerInviteEmail({
                    to: speaker.email,
                    speakerName: speaker.name,
                    seminarTitle: seminar.title,
                    seminarDate: seminar.scheduledAt,
                    platform: seminar.streamingPlatform,
                    meetLink: seminar.streamingPlatform === "GOOGLE_MEET" ? seminar.meetLink : null,
                });
            }
        }

        return NextResponse.json(seminar, { status: 201 });
    } catch (error: any) {
        console.error('[Seminar_POST_Error]', error);
        return NextResponse.json({ error: "Failed to create seminar. Please check your data." }, { status: 500 });
    }
}

