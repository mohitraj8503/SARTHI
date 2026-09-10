export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET: Public list of all active speakers
export async function GET() {
    try {
        const speakers = await prisma.speaker.findMany({
            where: { isActive: true },
            include: {
                seminars: {
                    select: { id: true, title: true, status: true, scheduledAt: true },
                    orderBy: { scheduledAt: "desc" },
                    take: 5,
                },
            },
            orderBy: { name: "asc" },
        });
        return NextResponse.json(speakers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Admin creates a new speaker
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, bio, designation, linkedin, twitter, expertise, photo } = body;

        if (!name || !email) {
            return NextResponse.json({ error: "name and email required" }, { status: 400 });
        }

        // Check if this email already has a user account
        const existingUser = await prisma.user.findUnique({ where: { email } });

        const speaker = await prisma.speaker.create({
            data: {
                name,
                email,
                bio,
                designation,
                linkedin,
                twitter,
                expertise: expertise || [],
                photo,
                userId: existingUser?.id || null,
            },
        });

        return NextResponse.json(speaker, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

