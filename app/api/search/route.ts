import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: Request) {
  try {
    const teacherId = 1; // TEMP
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    
    if (q.length < 2) return NextResponse.json({ success: true, data: { results: [] } });

    const term = `%${q}%`;
    
    // Search courses
    const [courses] = await query<any[]>(
      `SELECT id, title, description, CONCAT('/teacher/courses/', id) as url, 'course' as type
       FROM courses WHERE teacher_id = ? AND (title LIKE ? OR description LIKE ?) LIMIT 5`,
      [teacherId, term, term]
    );
    
    // Search students (using student_enrollments or similar table structure implied by user prompt)
    const [students] = await query<any[]>(
      `SELECT s.id, s.name as title, s.email as description, CONCAT('/teacher/students/', s.id) as url, 'student' as type
       FROM users s JOIN enrollments e ON s.id = e.student_id
       WHERE e.teacher_id = ? AND (s.name LIKE ? OR s.email LIKE ?) LIMIT 5`,
      [teacherId, term, term]
    );

    const results = [...(courses || []), ...(students || [])].slice(0, 10);
    return NextResponse.json({ 
      success: true, 
      data: { results } 
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ 
      success: false, 
      data: { results: [] } 
    });
  }
}

