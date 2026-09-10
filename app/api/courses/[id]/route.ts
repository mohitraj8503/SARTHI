export const dynamic = "force-dynamic";
import { getCourseDetail } from '@/lib/course-utils';
import { NextResponse } from 'next/server';
import { INITIAL_COURSES } from '@/lib/initial-data';

function buildFallbackCourse(id: string) {
  const fallback = INITIAL_COURSES.find((course) => course.id === id || course.slug === id) || INITIAL_COURSES[0];
  if (!fallback) return null;

  return {
    ...fallback,
    id: fallback.id || id,
    slug: fallback.slug || id,
    price: fallback.price || 0,
    is_free: fallback.price === 0,
    pricing_type: fallback.price === 0 ? 'FREE' : 'PAID',
    originalPrice: fallback.originalPrice || fallback.price || 0,
    reviewCount: fallback.reviewCount || 0,
    studentsEnrolled: fallback.studentsEnrolled || 0,
    totalVideos: fallback.totalVideos || 0,
    totalDuration: fallback.totalDuration || 0,
    lessons_count: fallback.totalVideos || 0,
    students_enrolled: fallback.studentsEnrolled || 0,
    instructor: {
      id: fallback.instructor.id,
      name: fallback.instructor.name,
      image: (fallback.instructor as any).avatar_url || (fallback.instructor as any).image || '',
      bio: (fallback.instructor as any).bio || '',
    },
    createdBy: {
      id: fallback.instructor.id,
      name: fallback.instructor.name,
      profilePicture: (fallback.instructor as any).avatar_url || (fallback.instructor as any).image || '',
    },
    curriculum: fallback.curriculum || [],
    lessons: [],
    reviews: [],
    createdDate: Date.now(),
    lastUpdated: Date.now(),
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  console.log(`[COURSE_API] Fetching course: ${id}`);

  // CRITICAL HARD-CODED FALLBACK FOR SUMMER CAMP
  if (id === 'summer-camp-2026') {
    const fallback = buildFallbackCourse(id);
    if (fallback) return NextResponse.json(fallback);
  }

  try {
    const course = await getCourseDetail(id).catch(() => null);

    if (!course) {
       const fallback = buildFallbackCourse(id);
       if (fallback) return NextResponse.json(fallback);
       return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error: any) {
    console.error(`[COURSE_API_ERROR] ${id}`, error);
    const fallback = buildFallbackCourse(id);
    if (fallback) return NextResponse.json(fallback);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
