export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";
import { getCertifications } from "@/lib/services/certification.service";
import { clearResiliencyCache } from "@/lib/resilient-db";
import { z } from "zod";

const certCreateSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10),
  duration: z.coerce.number().min(1),
  passingScore: z.coerce.number().min(0).max(100),
  difficulty: z.enum(["Beginner", "Intermediate", "Professional", "Expert"]),
  price: z.coerce.number().min(0),
  proPrice: z.coerce.number().min(0).optional(),
  premiumPrice: z.coerce.number().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  thumbnail: z.string().url().optional().or(z.literal("")).nullable(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin('staff');

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') as any || undefined;

    const result = await getCertifications({
      isAdmin: true,
      page,
      pageSize,
      search,
      status
    });

    if (!result.success) throw new Error(result.error);

    return ApiResponse.success(result.data.items, undefined, {
      total: result.data.total,
      page: result.data.page,
      pageSize: result.data.pageSize,
      totalPages: result.data.totalPages,
      stats: result.data.stats
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin('management');
    const body = await request.json();

    // Phase 1 Security: Strict Validation
    const parsed = certCreateSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error("Invalid certification data", "VALIDATION_ERROR", 400, parsed.error.format());
    }

    const data = parsed.data;
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const certification = await prisma.certification.create({
      data: {
        ...data,
        slug,
        questions: "[]", // Compatibility field
        assessmentDurationMinutes: data.duration, // Map unified duration to DB field
      }
    });

    // ✅ Invalidate public cache immediately
    clearResiliencyCache();

    return ApiResponse.success(certification, "Certification created successfully");
  } catch (error: any) {
    return handleApiError(error);
  }
}

