import { prisma } from './prisma';
import { INITIAL_COURSES, INITIAL_CATEGORIES, INITIAL_INSTRUCTORS } from './initial-data';

export async function seedCourses() {
    try {
        console.log('🌱 Starting Professional Course Seeding...');

        // 1. Seed Categories first
        console.log('--- Seeding Categories ---');
        for (const cat of INITIAL_CATEGORIES) {
            await prisma.category.upsert({
                where: { id: cat.id },
                update: {
                    name: cat.name,
                    slug: cat.slug,
                    color_bg: cat.color_bg,
                    color_text: cat.color_text,
                    icon: cat.icon
                },
                create: {
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    color_bg: cat.color_bg,
                    color_text: cat.color_text,
                    icon: cat.icon
                }
            });
            console.log(`✅ Category: ${cat.name}`);
        }

        // 2. Seed Instructors as Users
        console.log('--- Seeding Instructors ---');
        for (const inst of INITIAL_INSTRUCTORS) {
            await prisma.user.upsert({
                where: { id: inst.id },
                update: {
                    name: inst.name,
                    role: 'TEACHER', // Ensure they are teachers
                    bio: inst.bio,
                    company: inst.company,
                    image: inst.image
                },
                create: {
                    id: inst.id,
                    email: `${inst.id}@sarthi-woad.vercel.app`,
                    name: inst.name,
                    role: 'TEACHER',
                    bio: inst.bio,
                    company: inst.company,
                    image: inst.image,
                    status: 'ACTIVE'
                }
            });
            console.log(`✅ Instructor: ${inst.name}`);
        }

        // 3. Seed Courses
        console.log('--- Seeding Courses ---');
        const seededCourses: any[] = [];
        for (const course of INITIAL_COURSES) {
            const data = await prisma.course.upsert({
                where: { id: course.id },
                update: {
                    title: course.title,
                    slug: course.slug,
                    description: course.description,
                    shortDescription: course.shortDescription ? course.shortDescription.slice(0, 190) : null,
                    category: course.category,
                    categoryId: course.categoryId,
                    price: course.price,
                    originalPrice: course.originalPrice,
                    pricing_type: course.pricing_type || (course.price > 0 ? 'PAID' : 'FREE'),
                    level: course.level,
                    thumbnail: course.thumbnail,
                    thumbnailIcon: course.thumbnailIcon,
                    thumbnailColor: course.thumbnailColor,
                    badge: course.badge,
                    isFeatured: course.isFeatured,
                    homepageOrder: course.homepageOrder,
                    isActive: true,
                    isPublished: true,
                    publish_state: "published", // Force published state
                    instructorId: course.instructorId,
                    rating: course.rating,
                    ratingCount: course.ratingCount,
                    duration: course.totalDuration,
                    enrolledStudentsCount: course.studentsEnrolled
                },
                create: {
                    id: course.id,
                    title: course.title,
                    slug: course.slug,
                    description: course.description,
                    shortDescription: course.shortDescription ? course.shortDescription.slice(0, 190) : null,
                    category: course.category,
                    categoryId: course.categoryId,
                    price: course.price,
                    originalPrice: course.originalPrice,
                    pricing_type: course.pricing_type || (course.price > 0 ? 'PAID' : 'FREE'),
                    level: course.level,
                    thumbnail: course.thumbnail,
                    thumbnailIcon: course.thumbnailIcon,
                    thumbnailColor: course.thumbnailColor,
                    badge: course.badge,
                    isFeatured: course.isFeatured,
                    homepageOrder: course.homepageOrder,
                    isActive: true,
                    isPublished: true,
                    publish_state: "published", // Force published state
                    instructorId: course.instructorId,
                    rating: course.rating,
                    ratingCount: course.ratingCount,
                    duration: course.totalDuration,
                    enrolledStudentsCount: course.studentsEnrolled
                }
            });

            // Seed curriculum modules and lessons if they exist in the initial data
            if (course.curriculum && course.curriculum.length > 0) {
                console.log(`   Seeding curriculum for course: ${course.title}`);
                let modOrder = 1;
                for (const mod of course.curriculum) {
                    const dbModule = await prisma.module.upsert({
                        where: { id: mod.id },
                        update: {
                            title: mod.title,
                            courseId: course.id,
                            order: modOrder,
                            isLocked: mod.isLocked || false,
                        },
                        create: {
                            id: mod.id,
                            title: mod.title,
                            courseId: course.id,
                            order: modOrder,
                            isLocked: mod.isLocked || false,
                        }
                    });

                    if (mod.lessons && mod.lessons.length > 0) {
                        for (const les of mod.lessons) {
                            await prisma.lesson.upsert({
                                where: {
                                    courseId_orderNumber: {
                                        courseId: course.id,
                                        orderNumber: les.orderNumber
                                    }
                                },
                                update: {
                                    title: les.title,
                                    videoUrl: les.videoUrl,
                                    youtube_video_id: les.videoUrl ? (les.videoUrl.includes('v=') ? les.videoUrl.split('v=')[1] : null) : null,
                                    duration: les.duration || 15,
                                    isFreePreview: les.isFreePreview || false,
                                    moduleId: dbModule.id
                                },
                                create: {
                                    id: les.id,
                                    title: les.title,
                                    videoUrl: les.videoUrl,
                                    youtube_video_id: les.videoUrl ? (les.videoUrl.includes('v=') ? les.videoUrl.split('v=')[1] : null) : null,
                                    duration: les.duration || 15,
                                    isFreePreview: les.isFreePreview || false,
                                    orderNumber: les.orderNumber,
                                    courseId: course.id,
                                    moduleId: dbModule.id
                                }
                            });
                        }
                    }
                    modOrder++;
                }
            }

            seededCourses.push(data);
            console.log(`✅ Course: ${course.title}`);
        }

        console.log('🎉 Course seeding complete!');
        return seededCourses;
    } catch (error) {
        console.error('❌ Error during course seeding:', error);
        throw error;
    }
}
