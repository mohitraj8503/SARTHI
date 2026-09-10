export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, handleApiError } from '@/lib/admin/core';
import { authenticateTeacher } from '@/lib/auth/middleware';

/**
 * Enterprise Teacher Course API - V6 High-Performance Layer
 * Resolves Points 1, 4, and 10 of the Platform Architecture.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const userId = await authenticateTeacher(request);
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: { id: true }
    });

    const where: any = {
      AND: [
        {
          OR: [
            { instructorId: userId },
            ...(teacher ? [{ teacherId: teacher.id }] : [])
          ]
        }
      ]
    };

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } }
        ]
      });
    }
    if (category && category !== 'All') {
      where.AND.push({ category });
    }

    // 2. Discover Courses (Lean Identification) with Pagination
    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          price: true,
          thumbnail: true,
          isPublished: true,
          slug: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    if (courses.length === 0) return ApiResponse.success({ courses: [], pagination: { total, page, limit } });

    const courseIds = courses.map(c => c.id);

    // 3. Batch Aggregations (Enterprise Optimization - No N+1 Queries)
    const [enrollmentCounts, revenueCounts, lessonCounts] = await Promise.all([
        // Active Enrollments (Grouped)
        prisma.enrollment.groupBy({
            by: ['courseId'],
            where: { courseId: { in: courseIds }, status: 'active' },
            _count: true
        }),
        // Revenue (Grouped Transactions)
        prisma.transaction.groupBy({
            by: ['courseId'],
            where: { courseId: { in: courseIds }, status: { in: ['succeeded', 'SUCCESS'] } },
            _sum: { amount: true }
        }),
        // Lesson Density
        prisma.lesson.groupBy({
            by: ['courseId'],
            where: { courseId: { in: courseIds } },
            _count: true
        })
    ]);

    // 4. Vectorized Hydration (O(n) Assembly)
    const enrollmentMap = new Map(enrollmentCounts.map(e => [e.courseId, e._count]));
    const revenueMap = new Map(revenueCounts.map(r => [r.courseId, r._sum.amount || 0]));
    const lessonMap = new Map(lessonCounts.map(l => [l.courseId, l._count]));

    const enrichedCourses = courses.map(course => ({
        ...course,
        status: course.isPublished ? 'published' : 'draft',
        studentsEnrolled: enrollmentMap.get(course.id) || 0,
        totalRevenue: Number(revenueMap.get(course.id)) || 0,
        totalVideos: lessonMap.get(course.id) || 0,
    }));

    const executionTime = Date.now() - startTime;
    console.log(`[TEACHER_COURSES_V6] Synchronized ${courses.length} courses in ${executionTime}ms`);

    return ApiResponse.success({ 
      courses: enrichedCourses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, undefined, { executionTimeMs: executionTime });
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * Enterprise Course Creator (Drafting Protocol)
 */
export async function POST(req: NextRequest) {
    try {
        const userId = await authenticateTeacher(req);

        let body: any = {};
        let thumbnailFile: File | null = null;
        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            
            // Extract modules or curriculum alias
            const rawModules = formData.get('modules') || formData.get('curriculum') || '[]';
            let parsedModules: any[] = [];
            try {
                parsedModules = typeof rawModules === 'string' ? JSON.parse(rawModules) : [];
            } catch {
                parsedModules = [];
            }

            body = {
                title: (formData.get('title') as string) || '',
                category: (formData.get('category') as string) || '',
                description: (formData.get('description') as string) || (formData.get('subtitle') as string) || '',
                price: (formData.get('price') as string) || '0',
                pricingType: (formData.get('pricingType') as string) || (formData.get('is_free') === 'true' ? 'FREE' : 'PAID'),
                level: (formData.get('level') as string) || 'Beginner',
                language: (formData.get('language') as string) || 'English',
                modules: parsedModules
            };

            // Support thumbnail or thumbnail_file or thumbnail_url
            const fileItem = formData.get('thumbnail') || formData.get('thumbnail_file');
            if (fileItem && typeof fileItem === 'object' && 'arrayBuffer' in fileItem) {
                thumbnailFile = fileItem as File;
            } else if (typeof fileItem === 'string') {
                body.thumbnailUrl = fileItem;
            } else if (formData.get('thumbnail_url')) {
                body.thumbnailUrl = formData.get('thumbnail_url') as string;
            }
        } else {
            body = await req.json();
            if (body.curriculum && !body.modules) {
                body.modules = body.curriculum;
            }
        }

        const { title, category, description, price, pricingType, level, modules } = body;

        if (!title || !title.trim()) {
            return ApiResponse.error("Course title is required.", "VALIDATION_ERROR", 400);
        }
        if (!category || !category.trim()) {
            return ApiResponse.error("Course category is required.", "VALIDATION_ERROR", 400);
        }

        const slug = `${title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(1000 + Math.random() * 9000)}`;

        // Handle Thumbnail Upload
        let thumbnailUrl: string | null = body.thumbnailUrl || null;
        if (thumbnailFile && !thumbnailUrl) {
            try {
                const { uploadCourseThumbnail, isCloudinaryConfigured } = await import('@/lib/cloudinary');
                const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
                
                if (isCloudinaryConfigured()) {
                    const uploadResult = await uploadCourseThumbnail(buffer, slug, thumbnailFile.type);
                    if (uploadResult.success) {
                        thumbnailUrl = uploadResult.url;
                    }
                } else {
                    // Safe fallback placeholder URL or Base64 if small
                    if (buffer.length < 500000) {
                        thumbnailUrl = `data:${thumbnailFile.type};base64,${buffer.toString('base64')}`;
                    } else {
                        thumbnailUrl = '/placeholder-course.jpg';
                    }
                }
            } catch (uploadError) {
                console.warn('Thumbnail upload failed, proceeding without thumbnail:', uploadError);
            }
        }

        const course = await prisma.$transaction(async (tx) => {
            const createdCourse = await tx.course.create({
                data: {
                    title: title.trim(),
                    slug,
                    category: category.trim(),
                    description: description ? description.trim() : "No course description provided.",
                    level: level || "Beginner",
                    instructorId: userId,
                    price: parseFloat(price) || 0,
                    pricing_type: pricingType || (parseFloat(price) > 0 ? 'PAID' : 'FREE'),
                    thumbnail: thumbnailUrl,
                    isPublished: body.publish === 'true' || body.visibility === 'Publish Immediately',
                    publish_state: (body.publish === 'true' || body.visibility === 'Publish Immediately') ? "published" : "draft",
                    isActive: true,
                }
            });

            if (Array.isArray(modules) && modules.length > 0) {
                for (let mIdx = 0; mIdx < modules.length; mIdx++) {
                    const moduleData = modules[mIdx];
                    const createdModule = await tx.module.create({
                        data: {
                            title: moduleData.title || `Module ${mIdx + 1}`,
                            orderIndex: mIdx,
                            courseId: createdCourse.id,
                        }
                    });

                    if (Array.isArray(moduleData.lessons) && moduleData.lessons.length > 0) {
                        for (let lIdx = 0; lIdx < moduleData.lessons.length; lIdx++) {
                            const lessonData = moduleData.lessons[lIdx];
                            await tx.lesson.create({
                                data: {
                                    title: lessonData.title || `Lesson ${lIdx + 1}`,
                                    orderNumber: lIdx,
                                    position: lIdx,
                                    contentType: (lessonData.type || lessonData.contentType || 'video').toLowerCase(),
                                    duration: parseInt(lessonData.duration || lessonData.duration_minutes || '10') || 10,
                                    videoUrl: lessonData.url || lessonData.videoUrl || null,
                                    courseId: createdCourse.id,
                                    moduleId: createdModule.id,
                                }
                            });
                        }
                    }
                }
            }

            return createdCourse;
        });

        // 3. Auto-create Google Drive Folder Structure (Centralized)
        try {
            const { GoogleDriveService } = await import('@/lib/services/google-drive');
            await GoogleDriveService.getCourseFolder(course.id);
        } catch (gdError) {
            console.warn('Google Drive structure initialization failed:', gdError);
        }

        // 4. Invalidate Redis Caches (Phase 3)
        try {
            const { getRedisClient } = await import('@/lib/redis');
            const redis = getRedisClient();
            if (redis) {
                await redis.del(`teacher:courses:list:${userId}`);
                await redis.del(`teacher:dashboard:stats:${userId}`);
            }
        } catch (cacheError) {
            console.warn('Cache invalidation failed:', cacheError);
        }

        // 5. Audit Logging (Phase 11)
        const { logTeacherAction } = await import('@/lib/teacher/logger');
        await logTeacherAction({
            userId,
            action: 'CREATE_COURSE_DRAFT',
            entity: 'Course',
            entityId: course.id,
            details: { title: course.title, slug: course.slug }
        });

        return ApiResponse.success(course, "New course draft synthesized successfully.");
    } catch (error: any) {
        return handleApiError(error);
    }
}

