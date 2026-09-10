import { prisma } from '@/lib/prisma';
import { Metadata } from "next";
import { withResiliency } from "@/lib/resilient-db";
import CoursesClient from "@/app/(public)/courses/CoursesClient";
import { Suspense } from "react";
import Loading from "@/app/(public)/courses/loading";
import { redirect } from 'next/navigation';

export const dynamic = "force-dynamic";

function isAuditPlaceholder(value: string) {
  return value === 'sample-id' || value === 'sample-slug' || value.startsWith('sample-');
}

export async function generateMetadata(props: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const params = await props.params;
  const category = await prisma.category.findUnique({
    where: { slug: params.category },
    select: { name: true }
  });

  const categoryName = category?.name || "Premium Courses";
  return {
    title: `${categoryName} Courses | SARTHI`,
    description: `Master ${categoryName} with production-grade tech courses. Learn by shipping real projects from industry veterans.`,
  };
}

export default async function CategoryCoursesPage(
  props: {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const categoryRes = await withResiliency(
    async () => prisma.category.findUnique({
      where: { slug: params.category },
      include: {
         _count: {
           select: { courses: { where: { publish_state: "published" } } }
         }
      }
    }),
    'category-lookup'
  );

  const category = categoryRes.data;

  if (!categoryRes.success || !category) {
    redirect('/courses');
  }

  return (
    <Suspense fallback={<Loading />}>
      <CategoryCoursesFetcher category={category} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryCoursesFetcher({ 
  category, 
  searchParams 
}: { 
  category: any; 
  searchParams: { q?: string; page?: string; sort?: string } 
}) {
  const q = searchParams.q || "";
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  try {
    const res = await withResiliency(
      async () => {
        const where: any = {
           categoryId: category.id,
           isPublished: true,
           isActive: true,
        };

        if (q) {
          where.OR = [
            { title: { contains: q } },
            { description: { contains: q } }
          ];
        }

        const [dbCourses, total] = await Promise.all([
          prisma.course.findMany({
            where,
            include: {
              instructor: { select: { name: true, image: true, bio: true } },
              _count: {
                select: {
                  lessons: true,
                  enrollments: true
                }
              },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.course.count({ where })
        ]);

        return { dbCourses, total };
      },
      'category-courses-fetch'
    );

    const data = res.data;

    if (!res.success || !data) throw new Error('Failed to fetch category courses');

    const formattedCourses = data.dbCourses.map(c => {
      const price = Number(c.price);
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        thumbnail: c.thumbnail,
        price: price,
        originalPrice: c.originalPrice || null,
        level: c.level || 'Beginner',
        category: category.name,
        instructor: {
          name: c.instructor?.name || 'SARTHI Expert',
          image: c.instructor?.image || null,
        },
        _count: {
          lessons: c._count.lessons,
          enrollments: c.enrolledStudentsCount + c._count.enrollments
        },
        rating: c.rating || 0,
        reviewCount: c.ratingCount || 0,
      };
    });

    return (
      <CoursesClient 
        initialCourses={formattedCourses} 
        categories={['All', category.name]} 
        initialTotal={data.total}
      />
    );
  } catch (error) {
    console.error('[CATEGORY_COURSES_ERROR]', error);
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-[#FDFCF9]">
        <div className="max-w-md">
          <h2 className="text-3xl font-black text-[#1A3C2E] mb-4">Temporarily Unavailable</h2>
          <p className="text-[#5D705C] mb-8">We encountered a system error while loading the {category.name} collection. Please try again later.</p>
        </div>
      </div>
    );
  }
}
