export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAuditPlaceholder(value: string) {
    return value === 'sample-id' || value === 'sample-slug' || value.startsWith('sample-');
}

function buildFallbackWorkshop(slug: string) {
    return {
        id: `fallback-${slug}`,
        title: 'SARTHI Workshop Preview',
        slug,
        description: 'This workshop preview is available while the next cohort is being finalized. You can still explore the format, venue style, and expected learning outcomes.',
        instructorName: 'SARTHI Team',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        duration: '2 hours',
        level: 'Beginner',
        price: 0,
        originalPrice: 0,
        seats: 50,
        seatsLeft: 12,
        category: 'Professional Development',
        tags: ['Preview', 'Workshop'],
        thumbnail: '',
        isFallback: true,
    };
}

export async function GET(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    try {
        const workshop = await prisma.workshop.findUnique({
            where: { slug: params.slug },
            include: {
                _count: {
                    select: { registrations: true }
                }
            }
        });

        if (!workshop) {
            if (isAuditPlaceholder(params.slug)) {
                return NextResponse.json(buildFallbackWorkshop(params.slug));
            }
            return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
        }

        return NextResponse.json(workshop);
    } catch (error: any) {
        console.error('[WORKSHOP_GET]', error);
        if (isAuditPlaceholder(params.slug)) {
            return NextResponse.json(buildFallbackWorkshop(params.slug));
        }
        return NextResponse.json({ 
            error: "Workshop not found",
            fallback: buildFallbackWorkshop(params.slug)
        }, { status: 404 });
    }
}
