import { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import { authenticateTeacher, AuthenticationError, AuthorizationError } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const teacherId = await authenticateTeacher(request);
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Using teacherId from auth (UUID)
    let sql = `SELECT id, type, description, student_id, course_id, created_at FROM activity_log WHERE teacher_id = ?`;
    const params: any[] = [teacherId];
    
    if (type && type !== 'all') { 
      sql += ` AND type = ?`; 
      params.push(type); 
    }
    sql += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);

    try {
      const [activities] = await query<any[]>(sql, params);
      return API.ok({ activities: activities || [] });
    } catch (dbError) {
       console.warn('Activity DB query failed:', dbError);
       return API.ok({ activities: [] }); // Graceful fallback
    }

  } catch (error: any) {
    console.error('Activity API error:', error);
    
    if (error instanceof AuthenticationError) return API.unauthorized();
    if (error instanceof AuthorizationError) return API.forbidden(error.message);

    return API.server('Internal Server Error');
  }
}

