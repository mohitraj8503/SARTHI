export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest, props: { params: Promise<{ param: string }> }) {
  const params = await props.params;
  try {
    const courseId = params.param;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // Get all reviews for the course
    const reviews = await prisma.courseReview.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Fetch course reviews error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ param: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const reviewId = params.param;
    const { rating, review_text } = await request.json();

    // Validation
    if (!rating) {
      return NextResponse.json({ message: 'Rating is required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Find the review
    const review = await prisma.courseReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    // Check if user is the author
    if (review.userId !== session.userId) {
      return NextResponse.json(
        { message: 'You can only update your own reviews' },
        { status: 403 }
      );
    }

    // Update the review
    const updatedReview = await prisma.courseReview.update({
      where: { id: reviewId },
      data: {
        rating,
        review: review_text || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Update course review error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ param: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userRole = (session.role || '').toUpperCase();

    const reviewId = params.param;

    // Find the review
    const review = await prisma.courseReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    // Check if user is the author or admin
    if (review.userId !== session.userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { message: 'You can only delete your own reviews or must be an admin' },
        { status: 403 }
      );
    }

    // Delete the review
    await prisma.courseReview.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete course review error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
