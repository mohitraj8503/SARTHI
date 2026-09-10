import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';

export async function getPublishedWorkshops(filters: {
    category?: string[];
    level?: string[];
    search?: string;
} = {}) {
    try {
        const { category, level, search } = filters;

        const where: any = {
            status: { in: ['PUBLISHED', 'REGISTRATION_OPEN', 'FULL', 'LIVE'] }
        };

        if (category && category.length > 0) where.category = { in: category };
        if (level && level.length > 0) where.level = { in: level };
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { tags: { has: search } }
            ];
        }

        const workshops = await withResiliency(() => prisma.workshop.findMany({
            where,
            orderBy: { date: "asc" },
            include: {
                _count: {
                    select: { registrations: true }
                }
            }
        }), 'public-workshops-list');

        if (!workshops.success || !workshops.data) return [];

        return workshops.data.map(w => ({
            ...w,
            instructorName: w.instructorName || (w as any).instructor?.name || 'Lead Instructor'
        }));
    } catch (error) {
        console.error('Error fetching workshops:', error);
        throw error;
    }
}
