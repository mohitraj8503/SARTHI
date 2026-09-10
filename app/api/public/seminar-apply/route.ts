import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            fullName, 
            email, 
            phone, 
            linkedinUrl, 
            title, 
            topic, 
            description, 
            whyUseful, 
            proposedAt, 
            proposedDuration, 
            targetAudience 
        } = body;

        if (!fullName || !email || !title || !proposedAt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Create or Find User
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: fullName,
                    phone: phone || null,
                    role: "TEACHER",
                    status: "PENDING",
                    onboarded: false,
                    headline: linkedinUrl ? `LinkedIn: ${linkedinUrl}` : "Guest Speaker",
                }
            });
        } else {
            // Update role if they are not already a teacher/admin
            if (!['TEACHER', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { role: "TEACHER" }
                });
            }
        }

        // 2. Create SeminarRequest
        const request = await prisma.seminarRequest.create({
            data: {
                teacherId: user.id,
                title,
                topic: topic || "General Technology",
                description: description || "No description provided.",
                whyUseful: whyUseful || "Knowledge share session.",
                proposedAt: new Date(proposedAt),
                proposedDuration: proposedDuration || "60 minutes",
                targetAudience: targetAudience || "All Students",
                speakerName: fullName,
                tags: topic ? [topic] : [],
                resources: linkedinUrl ? `Speaker Profile: ${linkedinUrl}` : undefined,
                status: "PENDING",
            },
        });

        return NextResponse.json({ success: true, request }, { status: 201 });
    } catch (error: any) {
        console.error("Public Seminar Application Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
