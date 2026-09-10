export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await getCurrentUser();
        if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
            return new Response("Unauthorized", { status: 401 });
        }

        const seminar = await prisma.seminar.findUnique({
            where: { id: params.id },
            include: {
                registrations: {
                    include: {
                        user: { select: { name: true, email: true, phone: true } }
                    }
                }
            }
        });

        if (!seminar) return new Response("Not found", { status: 404 });

        const headers = ["Name", "Email", "Phone", "Status", "Attended", "Registered At"];
        const rows = seminar.registrations.map(r => [
            `"${(r.user.name ?? 'Anonymous').replace(/"/g, '""')}"`,
            r.user.email,
            r.user.phone || "N/A",
            r.status,
            r.attended ? "YES" : "NO",
            r.registeredAt.toISOString()
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

        return new Response(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="attendees-${seminar.slug}.csv"`,
            },
        });
    } catch (error: any) {
        console.error("Attendee Export Error:", error);
        return new Response("Export failed", { status: 500 });
    }
}
