export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "SUPER_ADMIN", "GOD_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Parallel searches across categories
    const [students, teachers, courses, seminars] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'STUDENT', OR: [{ name: { contains: query } }, { email: { contains: query } }] },
        take: 3,
        select: { id: true, name: true, email: true }
      }),
      prisma.user.findMany({
        where: { role: 'TEACHER', OR: [{ name: { contains: query } }, { email: { contains: query } }] },
        take: 3,
        select: { id: true, name: true, email: true }
      }),
      prisma.course.findMany({
        where: { title: { contains: query } },
        take: 3,
        select: { id: true, title: true, slug: true }
      }),
      prisma.seminar.findMany({
        where: { title: { contains: query } },
        take: 3,
        select: { id: true, title: true, slug: true }
      }),
    ]);

    const results: Array<{
      category: string;
      items: Array<{ id: string; title: string | null; subtitle: string; url: string }>;
    }> = [];

    if (students.length > 0) {
      results.push({
        category: 'Students',
        items: students.map(s => ({ id: s.id, title: s.name, subtitle: s.email, url: `/admin/students/${s.id}` }))
      });
    }

    if (teachers.length > 0) {
      results.push({
        category: 'Teachers',
        items: teachers.map(t => ({ id: t.id, title: t.name, subtitle: t.email, url: `/admin/teachers/${t.id}` }))
      });
    }

    if (courses.length > 0) {
      results.push({
        category: 'Courses',
        items: courses.map(c => ({ id: c.id, title: c.title, subtitle: 'View course details', url: `/admin/courses/${c.id}/manage` }))
      });
    }

    if (seminars.length > 0) {
      results.push({
        category: 'Seminars',
        items: seminars.map(s => ({ id: s.id, title: s.title, subtitle: 'Manage seminar event', url: `/admin/seminars/${s.id}/manage` }))
      });
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

