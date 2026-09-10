import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

export interface SearchFilters {
  category?: string;
  level?: string;
  priceRange?: { min: number; max: number };
}

const COURSE_PREVIEW_SELECT = {
  id: true,
  title: true,
  description: true,
  thumbnail: true,
  price: true,
  pricing_type: true,
  rating: true,
  enrolledStudentsCount: true,
  instructor: { select: { name: true, avatar_url: true } },
  level: true,
  duration: true,
  category: true
};

/**
 * Enterprise Course Search Engine
 * Implements high-relevance full-text search with filtering and cursor-based pagination.
 */
export async function searchCourses(query: string = '', filters: SearchFilters = {}, cursor?: string) {
  const searchQuery = query.trim().toLowerCase();
  
  const where: Prisma.CourseWhereInput = {
    isPublished: true,
    status: 'PUBLISHED',
    AND: [
      searchQuery ? {
        OR: [
          { title: { contains: searchQuery } },
          { description: { contains: searchQuery } },
          { instructor: { name: { contains: searchQuery } } },
          { category: { contains: searchQuery } }
        ]
      } : {},
      filters.category ? { category: filters.category } : {},
      filters.level ? { level: filters.level } : {},
      filters.priceRange ? {
        price: {
          gte: filters.priceRange.min,
          lte: filters.priceRange.max
        }
      } : {}
    ]
  };

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      select: COURSE_PREVIEW_SELECT,
      orderBy: [
        { rating: 'desc' },
        { enrolledStudentsCount: 'desc' }
      ],
      cursor: cursor ? { id: cursor } : undefined,
      take: 24
    }),
    prisma.course.count({ where })
  ]);

  return {
    courses: courses.map(c => ({
      ...c,
      price: Number(c.price), // Convert Decimal to Number
      instructor: {
        name: c.instructor.name,
        avatar: c.instructor.avatar_url
      }
    })),
    total,
    hasMore: courses.length === 24,
    nextCursor: courses[courses.length - 1]?.id
  };
}
