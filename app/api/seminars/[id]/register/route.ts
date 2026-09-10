export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const seminar = await prisma.seminar.findUnique({
        where: { id: params.id },
        include: { _count: { select: { registrations: true } } },
    });

    if (!seminar) {
        return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    // Check max attendees
    if (seminar.maxAttendees && seminar._count.registrations >= seminar.maxAttendees) {
        return NextResponse.json({ error: "Seminar is full" }, { status: 400 });
    }

    // Upsert registration (idempotent)
    const registration = await prisma.seminarRegistration.upsert({
        where: { seminarId_userId: { seminarId: params.id, userId: user.id } },
        create: { 
            seminarId: params.id, 
            userId: user.id,
            userName: user.name || "",
            userEmail: user.email,
            userPhone: null,
            paymentStatus: "PENDING",
            amountPaid: 0,
            status: "REGISTERED"
        },
        update: {},
    });

    return NextResponse.json({ success: true, registration });
}
