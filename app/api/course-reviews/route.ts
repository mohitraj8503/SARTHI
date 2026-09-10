export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/course-reviews?courseId=xxxx
 * Fetch all reviews for a specific course
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ message: 'Course ID required' }, { status: 400 });
    }

    const reviews = await prisma.courseReview.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            avatar_url: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/course-reviews
 * Submit a new review for a course
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, rating, review } = await req.json();

    if (!courseId || !rating) {
      return NextResponse.json({ message: 'Course ID and rating required' }, { status: 400 });
    }

    // Verify rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // 1. Verify enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json({ message: 'Course enrollment required to leave a review' }, { status: 403 });
    }

    // 2. Check if already reviewed (avoid duplicates)
    const existingReview = await prisma.courseReview.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    if (existingReview) {
      return NextResponse.json({ message: 'You have already reviewed this course' }, { status: 409 });
    }

    // 3. Transactional update: Create review + Update aggregated rating on course
    const result = await prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.courseReview.create({
        data: {
          userId: user.id,
          courseId,
          rating,
          review
        }
      });

      // Get current course stats
      const course = await tx.course.findUnique({
        where: { id: courseId },
        select: { rating: true, ratingCount: true }
      });

      if (course) {
        const oldCount = course.ratingCount || 0;
        const oldRating = course.rating || 0;
        
        const newCount = oldCount + 1;
        const newRating = ((oldRating * oldCount) + rating) / newCount;

        // Round to 1 decimal place
        const fixedRating = Math.round(newRating * 10) / 10;

        await tx.course.update({
          where: { id: courseId },
          data: {
            rating: fixedRating,
            ratingCount: newCount
          }
        });
      }

      return newReview;
    });

    // 4. REALTIME: Emit event for Teacher Notification
    try {
        const { eventBus } = await import('@/lib/realtime/event-bus');
        eventBus.emitEvent({
            eventId: `rev_${result.id}`,
            version: '1.0',
            source: 'api.course-reviews',
            timestamp: new Date().toISOString(),
            type: 'REVIEW_CREATED',
            metadata: { actorId: user.id },
            payload: {
                entity: 'CourseReview',
                action: 'CREATE',
                id: result.id,
                after: { rating: result.rating, courseId: result.courseId }
            }
        });
    } catch (evError) {
        console.warn('[Realtime] Review event emission failed:', evError);
    }

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
     console.error('Error submitting review:', error);
     return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

