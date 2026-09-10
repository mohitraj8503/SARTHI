import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const teacherId = user.id;
    const { title, description, price, modules, thumbnail, status } = await request.json();
    
    if (!title || !description) {
      return NextResponse.json({ success: false, error: 'Title and description required' }, { status: 400 });
    }

    const [result] = await query<any>(
      `INSERT INTO courses (teacher_id, title, description, price, thumbnail_url, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [teacherId, title, description, price || 0, thumbnail || null, status || 'draft']
    );

    const courseId = result.insertId;

    return NextResponse.json({ 
      success: true, 
      courseId, 
      message: 'Course created' 
    });
  } catch (error: any) {
    console.error('Create course error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const sort = searchParams.get('sort') as any;
    const category = searchParams.get('category');
    const isPublic = searchParams.get('public') === 'true' || limit || sort || category;

    // If it's a public request (featured/listing), use the public service
    if (isPublic) {
      const { getPublicCourses } = await import('@/lib/services/course.service');
      const result = await getPublicCourses({
        limit: limit ? parseInt(limit) : 12,
        sort: sort || 'newest',
        category: category || undefined,
        featured: searchParams.get('featured') === 'true'
      });

      if (result.error) {
        console.warn('[api/courses] Public fetch returned error:', result.error);
        return NextResponse.json({ 
          success: false, 
          data: [],
          total: 0,
          error: result.error
        }, { status: 200 }); // Return 200 with empty data so frontend fallbacks work
      }

      return NextResponse.json({ 
        success: true, 
        data: result.courses,
        courses: result.courses,
        total: result.total
      });
    }

    const user = await getCurrentUser();
    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const teacherId = user.id;
    const [courses] = await query<any[]>(
      `SELECT id, title, description, price, status, created_at FROM courses WHERE teacher_id = ? ORDER BY created_at DESC`,
      [teacherId]
    );
    return NextResponse.json({ 
      success: true, 
      data: courses || [] 
    });
  } catch (error: any) {
    console.error('[COURSES_API_ERROR]', {
      message: error.message,
      stack: error.stack,
      mode: process.env.DATABASE_MODE,
      url_provided: !!process.env.DATABASE_URL
    });
    return NextResponse.json({ 
      success: false, 
      error: error.message, 
      data: [],
      debug: process.env.NODE_ENV === 'development' ? { mode: process.env.DATABASE_MODE } : undefined
    }, { status: 500 });
  }
}

