export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { withResiliency } from '@/lib/resilient-db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await withResiliency(async () => {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            price: true,
            shortDescription: true,
            instructor: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { wishlist };
  }, `wishlist_fetch_${user.id}`);

  if (!result.success) {
    return NextResponse.json({ error: 'Failed to fetch wishlist', details: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error: 'Course ID required' }, { status: 400 });

    const result = await withResiliency(async () => {
        // Toggle wishlist
        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId
                }
            }
        });

        if (existing) {
            await prisma.wishlist.delete({
                where: { id: existing.id }
            });
            return { status: 'removed' };
        } else {
            await prisma.wishlist.create({
                data: {
                    userId: user.id,
                    courseId
                }
            });
            return { status: 'added' };
        }
    }, `wishlist_toggle_${user.id}_${courseId}`);

    if (!result.success) {
        return NextResponse.json({ error: 'Failed to toggle wishlist', details: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

