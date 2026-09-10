import { NextResponse } from 'next/server';
import { getCurriculumPath } from '@/lib/curriculum';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    const curriculum = getCurriculumPath(slug);
    return NextResponse.json(curriculum);
  } catch (error: any) {
    console.error('Error fetching path curriculum:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve curriculum path data', details: error.message },
      { status: 500 }
    );
  }
}
