export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function buildSearchTerms(title: string, slug: string) {
  const baseTerms = `${title} ${slug}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2)
    .filter((term) => !["certification", "professional", "master"].includes(term));

  return Array.from(new Set(baseTerms)).slice(0, 4);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const certification = await prisma.certification.findUnique({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
      },
    });

    if (!certification) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 });
    }

    const searchTerms = buildSearchTerms(certification.title, certification.slug);
    const relatedCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
        isActive: true,
        OR: searchTerms.flatMap((term) => [
          { title: { contains: term } },
          { description: { contains: term } },
          { category: { contains: term } },
        ]),
      },
      take: 3,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        thumbnail: true,
        level: true,
        price: true,
      },
    });

    return NextResponse.json({
      certificationId: certification.id,
      courses: relatedCourses.map((course) => ({
        ...course,
        price: Number(course.price || 0),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch related courses" }, { status: 500 });
  }
}
