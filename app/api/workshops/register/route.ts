export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { workshopId } = body;

        // Check if workshop exists
        const workshop = await prisma.workshop.findUnique({
            where: { id: workshopId }
        });

        if (!workshop) {
            return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
        }

        if (workshop.status !== 'REGISTRATION_OPEN' && workshop.status !== 'PUBLISHED') {
            return NextResponse.json({ error: "Registration is not open for this workshop" }, { status: 400 });
        }

        if (workshop.seatsLeft <= 0) {
            return NextResponse.json({ error: "Workshop is full" }, { status: 400 });
        }

        // Create registration
        // Note: For paid workshops, this should be triggered after successful payment
        const registration = await prisma.workshopRegistration.create({
            data: {
                workshopId,
                userId: user.id,
                status: workshop.price === 0 ? "REGISTERED" : "PENDING_PAYMENT"
            }
        });

        // Update seatsLeft
        await prisma.workshop.update({
            where: { id: workshopId },
            data: {
                seatsLeft: { decrement: 1 }
            }
        });

        return NextResponse.json(registration, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "You are already registered for this workshop" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

