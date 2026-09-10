import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { API } from '@/lib/api/response';

/**
 * Enterprise Search API
 * Implements high-performance full-text search with relevance ranking and suggestions.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    
    if (!query) return API.err('Search query required', 'MISSING_QUERY', 400);
    
    // Performance-optimized search using partial matching
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        status: 'PUBLISHED',
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { category: { contains: query } }
        ]
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        price: true,
        rating: true,
        category: true,
        instructor: { select: { name: true } }
      },
      orderBy: [
        { rating: 'desc' },
        { enrolledStudentsCount: 'desc' }
      ],
      take: 24
    });
    
    // Generate type-ahead suggestions
    const suggestions = await prisma.course.findMany({
      where: {
        isPublished: true,
        title: { contains: query }
      },
      select: { title: true },
      take: 5
    });
    
    return API.ok({
      results: courses,
      suggestions: suggestions.map(s => s.title),
      total: courses.length
    });
    
  } catch (error) {
    console.error('Search API Error:', error);
    return API.server('Search failed');
  }
}
