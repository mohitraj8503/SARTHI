export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !["ADMIN", "SUPER_ADMIN", "GOD_ADMIN"].includes(user.role)) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status")?.toUpperCase();
        const query = searchParams.get("q");

        const where: any = {};
        if (status === "PUBLISHED") {
            where.isPublished = true;
            where.isActive = true;
        } else if (status === "DRAFT") {
            where.isPublished = false;
            where.isActive = true;
        } else if (status === "ARCHIVED") {
            where.isActive = false;
        }

        if (query) {
            where.OR = [
                { title: { contains: query } },
                { category: { contains: query } },
                { instructor: { name: { contains: query } } }
            ];
        }

        const courses = await prisma.course.findMany({
            where,
            include: {
                instructor: { select: { name: true } },
                _count: { select: { enrollments: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const headers = ["Title", "Category", "Instructor", "Students Count", "Price", "Status", "Created At", "Updated At"];
        const rows = courses.map(c => [
            `"${c.title.replace(/"/g, '""')}"`,
            c.category || "General",
            c.instructor.name,
            c._count.enrollments,
            c.price.toNumber() === 0 ? "Free" : `₹${Number(c.price)}`,
            c.isActive ? (c.isPublished ? "Published" : "Draft") : "Archived",
            c.createdAt.toISOString(),
            c.updatedAt.toISOString()
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

        return new Response(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="courses-export-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error: any) {
        console.error("Course Export API Error:", error);
        return new Response("Export failed", { status: 500 });
    }
}

