export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const attemptId = params.id;
        const body = await req.json();
        const { answers } = body;

        // 1. Validate attempt and ownership
        const attempt = await prisma.certificationAttempt.findUnique({
            where: { id: attemptId }
        });

        if (!attempt) {
            return NextResponse.json({ error: "Attempt session not found" }, { status: 404 });
        }

        if (attempt.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized access to attempt" }, { status: 403 });
        }

        if (attempt.completedAt) {
            return NextResponse.json({ error: "Cannot save progress for a completed attempt" }, { status: 400 });
        }

        // 2. Update progress
        await prisma.certificationAttempt.update({
            where: { id: attemptId },
            data: {
                answers: answers
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
