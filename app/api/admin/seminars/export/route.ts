export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status")?.toUpperCase();
        const query = searchParams.get("q");

        const where: any = {};
        if (status && status !== "ALL") {
            if (status === "LIVE_NOW") where.status = "LIVE";
            else if (status === "UPCOMING") where.status = "SCHEDULED";
            else if (status === "PAST") where.status = "ENDED";
            else where.status = status;
        }

        if (query) {
            where.OR = [
                { title: { contains: query } },
                { speaker: { name: { contains: query } } },
            ];
        }

        const seminars = await prisma.seminar.findMany({
            where,
            include: {
                speaker: { select: { name: true } },
                _count: { select: { registrations: true } },
            },
            orderBy: { scheduledAt: "desc" },
        });

        // Generate CSV
        const headers = ["Title", "Status", "Type", "Scheduled At", "Instructor", "Registrations", "Capacity"];
        const rows = seminars.map((s: any) => [
            `"${s.title.replace(/"/g, '""')}"`,
            s.status,
            "Workshop", // Default for now
            s.scheduledAt ? s.scheduledAt.toISOString() : "N/A",
            s.speaker?.name || "N/A",
            s._count?.registrations || 0,
            s.maxAttendees || 500
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

        return new Response(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="seminars-export-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error: any) {
        console.error("Export Error:", error);
        return new Response("Export failed", { status: 500 });
    }
}

