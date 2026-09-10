export const dynamic = "force-dynamic";

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('[TESTIMONIALS_GET]', error);
    // Return empty array as safe fallback during SSG
    return NextResponse.json([]);
  }
}

