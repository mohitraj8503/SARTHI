export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await getCurrentUser();
        if (!user || !["ADMIN", "SUPER_ADMIN", "GOD_ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const exportData = searchParams.get("export") === "true";

        const enrollments = await prisma.enrollment.findMany({
            where: { courseId: params.id },
            include: {
                user: { select: { name: true, email: true, phone: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        if (exportData) {
            const headers = ["Student Name", "Email", "Phone", "Progress (%)", "Status", "Enrolled At"];
            const rows = enrollments.map(e => [
                `"${(e.user.name ?? 'Anonymous').replace(/"/g, '""')}"`,
                e.user.email,
                e.user.phone || "N/A",
                e.progressPercentage,
                e.status,
                e.createdAt.toISOString()
            ]);

            const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

            return new Response(csvContent, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="students-export-${params.id}.csv"`,
                },
            });
        }

        return NextResponse.json(enrollments);
    } catch (error: any) {
        console.error("Enrollment Analytics API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
