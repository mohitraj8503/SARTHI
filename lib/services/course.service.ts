import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { withResiliency } from "@/lib/resilient-db";
import { MOCK_COURSES } from "@/lib/mock-data";

export interface CourseFilter {
  category?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: "newest" | "popular" | "price-low" | "price-high";
  isActive?: boolean;
  isPublished?: boolean;
}

export async function getPublicCourses(options: CourseFilter = {}) {
  const {
    category,
    search,
    featured,
    page = 1,
    limit = 12,
    sort = "newest",
    isActive = true,
    isPublished = true,
  } = options;

  const skip = (page - 1) * limit;

  const isOriginals = category && typeof category === 'string' && category.startsWith('originals_');
  const actualCategory = isOriginals && typeof category === 'string' ? category.substring('originals_'.length) : category;

  const where: Prisma.CourseWhereInput = {
    publish_state: "published",
    isActive,
    isPublished,
  };

  if (isOriginals) {
    where.badge = "ORIGINALS";
  }

  if (actualCategory) {
    if (actualCategory === 'Technology') {
      where.category = { in: ['Development', 'Databases'] };
      const nonAiFilter = {
        NOT: [
          { title: { contains: "AI" } },
          { title: { contains: "ChatGPT" } },
          { title: { contains: "Prompt" } },
          { title: { contains: "Generative" } }
        ]
      };
      if (Array.isArray(where.AND)) {
        where.AND.push(nonAiFilter);
      } else {
        where.AND = [nonAiFilter];
      }
    } else if (actualCategory === 'Microsoft') {
      where.OR = [
        { title: { contains: 'Microsoft' } },
        { slug: { contains: 'microsoft' } }
      ];
    } else if (actualCategory === 'Artificial Intelligence') {
      where.OR = [
        { category: 'Artificial Intelligence' },
        { categoryId: 'cat_artificial_intelligence' }
      ];
    } else if (actualCategory === 'Commerce & Management') {
      where.category = { in: ['Business', 'Finance'] };
    } else if (actualCategory === 'Personal Development') {
      where.OR = [
        { category: 'Personal Development' },
        { categoryId: 'cat_personal_development' }
      ];
    } else {
      let categoryFilter = null;
      if (Array.isArray(actualCategory)) {
        categoryFilter = {
          OR: [
            { category: { in: actualCategory } },
            {
              Category: {
                name: { in: actualCategory },
              },
            },
          ]
        };
      } else if (typeof actualCategory === "string" && actualCategory.trim() !== "" && actualCategory.toLowerCase() !== "all") {
        categoryFilter = {
          OR: [
            { category: actualCategory },
            {
              Category: {
                name: actualCategory,
              },
            },
          ]
        };
      }

      if (categoryFilter) {
        if (Array.isArray(where.AND)) {
          where.AND.push(categoryFilter);
        } else {
          where.AND = [categoryFilter];
        }
      }
    }
  }

  if (search) {
    where.OR = [
      ...(where.OR || []),
      { title: { contains: search } },
      { description: { contains: search } },
      { shortDescription: { contains: search } },
    ];
  }

  if (featured) {
    where.isFeatured = true;
  }

  const orderBy: Prisma.CourseOrderByWithRelationInput[] = [];
  if (sort === "newest") {
    orderBy.push({ homepageOrder: "asc" }, { createdAt: "desc" });
  } else if (sort === "popular") {
    orderBy.push({ homepageOrder: "asc" }, { enrolledStudentsCount: "desc" });
  } else if (sort === "price-low") {
    orderBy.push({ price: "asc" });
  } else if (sort === "price-high") {
    orderBy.push({ price: "desc" });
  } else {
    orderBy.push({ homepageOrder: "asc" }, { createdAt: "desc" });
  }

  const cacheKey = `public_courses_${JSON.stringify(options)}`;

  const start = Date.now();
  const result = await withResiliency(async () => {
    const pStart = Date.now();
    const data = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true, image: true, bio: true } },
          Category: true,
          _count: {
            select: {
              lessons: true,
              enrollments: { where: { status: "active" } },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);
    console.log(`[course.service] Prisma queries took ${Date.now() - pStart}ms`);
    return data;
  }, cacheKey);
  console.log(`[course.service] getPublicCourses (with resiliency) took ${Date.now() - start}ms`);

  if (!result.success || !result.data) {
    console.warn(`[course.service] Database offline/unreachable (${result.error}). Falling back to mock courses.`);
    const fallbackCourses = MOCK_COURSES.slice(skip, skip + limit);
    return {
      courses: fallbackCourses.map((c) => transformCourse(c)),
      total: MOCK_COURSES.length,
      totalPages: Math.ceil(MOCK_COURSES.length / limit),
      page,
      limit,
      isCached: false,
    };
  }

  const [courses, total] = result.data;

  return {
    courses: courses.map((c) => transformCourse(c)),
    total: total,
    totalPages: Math.ceil(total / limit),
    page,
    limit,
    isCached: result.isCached,
  };
}

/**
 * Transforms a Prisma Course model into a standardized frontend object.
 */
function transformCourse(c: any) {
  const price = Number(c.price);
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    shortDescription: c.shortDescription || c.description?.split('.')[0] + '.' || null,
    thumbnail: normalizeThumbnail(c.thumbnail),
    price: price,
    originalPrice: c.originalPrice || null,
    level: c.level || 'Beginner',
    category: c.Category?.name || c.category || 'Uncategorized',
    categoryId: c.categoryId,
    instructor: {
      id: c.instructorId,
      name: c.instructor?.name || 'SARTHI Expert',
      image: c.instructor?.image || null,
      bio: c.instructor?.bio || null
    },
    _count: {
      lessons: c._count?.lessons || 0,
      enrollments: c._count?.enrollments || 0
    },
    rating: Number(c.rating || 0),
    reviewCount: Number(c.ratingCount || 0),
    badge: c.badge,
    isFeatured: c.isFeatured,
    isCombo: c.bundleIds ? c.bundleIds.length > 0 : false,
    duration: c.duration,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : String(c.updatedAt),
    // UI Helpers
    priceDisplay: price === 0 ? "FREE" : `₹${price.toLocaleString('en-IN')}`,
    isFree: price === 0,
    pricing_type: price > 0 ? "PAID" : "FREE"
  };
}

function normalizeThumbnail(thumbnail: string | null) {
  if (!thumbnail) return null;
  const legacyMap: Record<string, string> = {
    '/course-thumbnails/incometax.png': '/course-thumbnails/income-tax-filing.png',
    '/course-thumbnails/Advanceexcel.png': '/course-thumbnails/advance-excel.png',
    '/course-thumbnails/Advance-Excel.png': '/course-thumbnails/advance-excel.png',
    '/course-thumbnails/Python-Masterclass.png': '/course-thumbnails/python-masterclass.png',
    '/course-thumbnails/gst&it.png': '/course-thumbnails/gst-income-tax-combo.png',
  };
  return legacyMap[thumbnail] || thumbnail;
}

export async function getCourseCategories() {
  const result = await withResiliency(
    async () => {
      const categories = await prisma.course.findMany({
        where: { publish_state: "published", category: { not: null } },
        select: { category: true },
        distinct: ['category'],
      });

      const dbCategories = await prisma.category.findMany({
        select: { name: true }
      });

      const merged = new Set([
        ...categories.map(c => c.category),
        ...dbCategories.map(c => c.name)
      ].filter(Boolean));

      return Array.from(merged).sort();
    },
    'course_categories_all'
  );

  if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
    return result.data;
  }

  // Instant safe fallback array when DB is offline or timing out
  return ['Artificial Intelligence', 'Business', 'Development', 'Finance', 'Personal Development', 'Technology'];
}
