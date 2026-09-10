import { MetadataRoute } from 'next'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

type SitemapCourse = {
    slug: string | null;
    updatedAt: Date;
};

type SitemapCertification = {
    id: string;
    updatedAt: Date;
};

type SitemapSeminar = {
    id: string;
    updatedAt: Date;
};

type SitemapBlog = {
    slug: string;
    updatedAt: Date;
    publishedAt: Date | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://sarthi-woad.vercel.app'

    // Get all courses for dynamic routes
    let courses: SitemapCourse[] = []
    try {
        courses = await prisma.course.findMany({
            where: { isPublished: true, slug: { not: null } },
            select: {
                slug: true,
                updatedAt: true,
            }
        })
    } catch {
        console.log("Sitemap generation: DB might be offline or empty")
    }

    const courseEntries: MetadataRoute.Sitemap = courses.map((course) => ({
        url: `${baseUrl}/courses/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    // Get certifications
    let certifications: SitemapCertification[] = [];
    try {
        certifications = await prisma.certification.findMany({
            select: { id: true, updatedAt: true }
        });
    } catch {
    }

    const certEntries: MetadataRoute.Sitemap = certifications.map((c) => ({
        url: `${baseUrl}/certification-exams/${c.id}`,
        lastModified: c.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    // Get seminars
    let seminars: SitemapSeminar[] = [];
    try {
        seminars = await prisma.seminar.findMany({
            where: { status: 'SCHEDULED' },
            select: { id: true, updatedAt: true }
        });
    } catch {
    }

    const seminarEntries: MetadataRoute.Sitemap = seminars.map((s) => ({
        url: `${baseUrl}/seminars/${s.id}`,
        lastModified: s.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    // Get published blog posts
    let blogs: SitemapBlog[] = [];
    try {
        blogs = await prisma.blogPost.findMany({
            where: { status: 'published' },
            select: { slug: true, updatedAt: true, publishedAt: true }
        });
    } catch {
    }

    const blogEntries: MetadataRoute.Sitemap = blogs.map((blog) => ({
        url: `${baseUrl}/blogs/${blog.slug}`,
        lastModified: blog.publishedAt || blog.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/courses`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/certification-exams`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/seminars`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blogs`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/community`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...courseEntries,
        ...certEntries,
        ...seminarEntries,
        ...blogEntries,
    ]
}

