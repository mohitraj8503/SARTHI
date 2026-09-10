import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';
import WorkshopsClient from './WorkshopsClient';

export const revalidate = 60;

export default async function WorkshopsPage() {
  let initialWorkshops: any[] = [];
  let categories: string[] = [];

  try {
    const data = await prisma.workshop.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { date: 'desc' }
    });

    initialWorkshops = data.map(w => ({
      id: w.id,
      title: w.title,
      slug: w.slug,
      description: w.description || '',
      instructorName: w.instructorName || 'Anonymous',
      date: w.date ? new Date(w.date).toISOString() : null,
      duration: w.duration,
      price: w.price,
      originalPrice: w.originalPrice || undefined,
      seats: w.seats,
      seatsLeft: w.seatsLeft,
      category: w.category || 'General',
      tags: w.tags ? w.tags.split(',').map(t => t.trim()) : [],
      thumbnail: w.thumbnail || undefined,
      status: w.status,
      level: (w as any).level || 'Beginner'
    }));

    categories = Array.from(new Set(initialWorkshops.map(w => w.category)));
  } catch (error) {
    console.error("Failed to fetch workshops:", error);
  }

  return (
    <WorkshopsClient
      initialWorkshops={initialWorkshops}
      categories={categories}
    />
  );
}

