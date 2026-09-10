export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "SUPER_ADMIN", "TEACHER"].includes(user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const attendees = await prisma.seminarRegistration.findMany({
            where: { seminarId: params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        image: true,
                    }
                }
            },
            orderBy: { registeredAt: 'desc' }
        });

        return NextResponse.json(attendees);
    } catch (error) {
        console.error("Error fetching attendees:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { userId, email } = await req.json() as { userId?: string; email?: string };
        let targetUserId: string | undefined = userId;

        if (!targetUserId && email) {
            const foundUser = await prisma.user.findUnique({ where: { email } });
            if (!foundUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
            targetUserId = foundUser.id;
        }

        const foundUser = targetUserId ? await prisma.user.findUnique({ where: { id: targetUserId } }) : null;

        if (!targetUserId) return NextResponse.json({ error: "User ID or Email required" }, { status: 400 });

        const registration = await prisma.seminarRegistration.upsert({
            where: {
                seminarId_userId: {
                    seminarId: params.id,
                    userId: targetUserId
                }
            },
            create: {
                seminarId: params.id,
                userId: targetUserId,
                userName: foundUser?.name || "",
                userEmail: foundUser?.email || email || "",
                userPhone: foundUser?.phone,
                paymentStatus: "PENDING",
                amountPaid: 0,
                status: "REGISTERED"
            },
            update: {
                status: "REGISTERED"
            }
        });

        return NextResponse.json(registration);
    } catch (error) {
        console.error("Error adding attendee:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    try {
        await prisma.seminarRegistration.delete({
            where: {
                seminarId_userId: {
                    seminarId: params.id,
                    userId: userId
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing attendee:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
