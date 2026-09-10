export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, adminErrorResponse } from '@/lib/admin/requireAdmin';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAdmin();

    const application = await prisma.blogWriterApplication.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json({
      application: application
        ? {
            ...application,
            categories: application.categories
              ? application.categories.split(',').map((category) => category.trim()).filter(Boolean)
              : [],
          }
        : null,
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
