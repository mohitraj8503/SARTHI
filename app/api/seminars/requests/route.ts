export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !['TEACHER', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Teachers see their own requests, Admins see all
        const where = user.role.includes('ADMIN') ? {} : { teacherId: user.id };

        const requests = await prisma.seminarRequest.findMany({
            where,
            include: {
                teacher: {
                    select: {
                        name: true,
                        image: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(requests);
    } catch (error: any) {
        console.error("Seminar GET Requests Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !['TEACHER', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const request = await prisma.seminarRequest.create({
            data: {
                teacherId: user.id,
                title: body.title,
                topic: body.topic,
                description: body.description,
                whyUseful: body.whyUseful,
                proposedAt: new Date(body.proposedAt),
                proposedDuration: body.proposedDuration,
                targetAudience: body.targetAudience,
                speakerName: body.speakerName,
                tags: body.tags || [],
                resources: body.resources,
                status: "PENDING",
            },
        });

        return NextResponse.json(request, { status: 201 });
    } catch (error: any) {
        console.error("Seminar POST Request Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

