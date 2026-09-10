import { NextRequest, NextResponse } from 'next/server';
import { getCertifications } from '@/lib/services/certification.service';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const search = searchParams.get('search') || undefined;

    const result = await getCertifications({
      page,
      pageSize,
      search,
      isAdmin: false // Strict public filter
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json({ 
      data: result.data.items, 
      meta: {
        total: result.data.total,
        page: result.data.page,
        pageSize: result.data.pageSize,
        totalPages: result.data.totalPages
      },
      success: true 
    });
  } catch (error: any) {
    console.error('Public Certifications API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications', success: false },
      { status: 500 }
    );
  }
}

