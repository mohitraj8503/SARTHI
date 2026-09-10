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

        const seminar = await prisma.seminar.update({
            where: { id: params.id },
            data: { status: "CANCELLED" },
            include: {
                registrations: { include: { user: { select: { email: true, name: true } } } },
            }
        });

        // Notify registered students (conceptual)
        // console.log("Notifying", seminar.registrations.length, "attendees about cancellation of", seminar.title);

        return NextResponse.json({ success: true, count: seminar.registrations.length });

    } catch (error: any) {
        console.error("Cancel Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
