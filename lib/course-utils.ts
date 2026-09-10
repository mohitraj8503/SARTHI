import { prisma } from './prisma';
import { getGoogleDriveDirectUrl } from './video-utils';

/**
 * Get effective pricing for a course
 * Returns pricing_type and effective_price_amount
 */
export async function getEffectivePricing(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      pricing_type: true,
      price: true,
      effective_price_amount: true,
    },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  const pricing_type = course.pricing_type || (Number(course.price) === 0 ? 'FREE' : 'PAID');
  const effective_price_amount = course.effective_price_amount ?? Number(course.price);

  return {
    pricing_type,
    effective_price_amount,
  };
}

/**
 * Get count of published lessons for a course
 */
export async function getPublishedLessonsCount(courseId: string): Promise<number> {
  const count = await prisma.lesson.count({
    where: {
      courseId,
      isPublished: true,
    },
  });

  return count;
}

/**
 * Get course summary with canonical fields
 */
export async function getCourseSummary(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          avatar_url: true,
          image: true,
          bio: true,
          headline: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          lessons: true
        },
      },
    },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  const pricing_type = course.pricing_type || (Number(course.price) === 0 ? 'FREE' : 'PAID');
  const effective_price_amount = course.effective_price_amount ?? Number(course.price);

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    category: course.category || 'General',
    level: course.level || 'Beginner',
    pricing_type,
    effective_price_amount,
    instructor: {
      id: course.instructor.id,
      name: course.instructor.name || 'Unknown Instructor',
      avatar_url: course.instructor.avatar_url || course.instructor.image || '',
      bio: course.instructor.bio || '',
      role: (course.instructor as any).headline || 'Industry Expert',
    },
    lessons_count: course._count.lessons,
    students_enrolled: course._count.enrollments,
    is_published: course.isPublished,
    is_featured: course.isFeatured,
    slug: course.slug,
    updated_at: course.updatedAt,
  };
}

/**
 * Get course detail with canonical fields
 */
export async function getCourseDetail(courseId: string) {
  const course = await prisma.course.findFirst({
    where: {
      OR: [
        { id: courseId },
        { slug: courseId }
      ]
    },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          avatar_url: true,
          image: true,
          bio: true,
          headline: true,
        },
      },
      lessons: {
        where: { isPublished: true },
        orderBy: { orderNumber: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          videoUrl: true,
          youtube_video_id: true,
          isPublished: true,
          isFreePreview: true,
        },
      },
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { orderNumber: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              duration: true,
              videoUrl: true,
              youtube_video_id: true,
              isPublished: true,
              isFreePreview: true,
            },
          },
        },
      },
      _count: {
        select: { enrollments: true },
      },
    },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  const pricing = await getEffectivePricing(course.id);
  const lessons_count = course.lessons.length; // Already filtered to published

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    category: course.category || 'General',
    level: course.level || 'Beginner',
    pricing_type: pricing.pricing_type,
    effective_price_amount: pricing.effective_price_amount,
    instructor: {
      id: course.instructor.id,
      name: course.instructor.name || 'Unknown Instructor',
      avatar_url: course.instructor.avatar_url || course.instructor.image || '',
      bio: course.instructor.bio || '',
      role: (course.instructor as any).headline || 'Industry Expert',
    },
    lessons_count,
    lessons: course.lessons.map(l => ({ ...l, videoUrl: getGoogleDriveDirectUrl(l.videoUrl) })),
    milestones: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      order: module.order,
      lectures: module.lessons.map(l => ({ ...l, videoUrl: getGoogleDriveDirectUrl(l.videoUrl) })),
    })),
    students_enrolled: course._count.enrollments,
    is_published: course.isPublished,
    is_featured: course.isFeatured,
    duration: course.duration,
    syllabusUrl: course.syllabusUrl,
    introVideoUrl: getGoogleDriveDirectUrl(course.introVideoUrl),
    startDate: course.startDate,
    endDate: course.endDate,
    prerequisites: course.prerequisites,
    deviceLimit: course.deviceLimit,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    // New SSOT fields
    slug: course.slug,
    originalPrice: course.originalPrice,
    badge: course.badge,
    isActive: course.isActive,
    rating: course.rating,
    ratingCount: course.ratingCount,
    metaTitle: course.metaTitle,
    metaDescription: course.metaDescription,
    thumbnailIcon: course.thumbnailIcon,
    thumbnailColor: course.thumbnailColor,
    categoryId: course.categoryId,
    bundleIds: course.bundleIds,
  };
}
