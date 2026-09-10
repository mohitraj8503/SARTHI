import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to request access' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = requestSchema.parse(body);

    // Check for existing request for this user and email
    const existingRequest = await prisma.blogAccessRequest.findUnique({
      where: {
        userId_email: {
          userId: user.id,
          email: validatedData.email,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return NextResponse.json({ 
          error: 'Your request is already under review',
          status: 'pending' 
        }, { status: 400 });
      }
      if (existingRequest.status === 'approved') {
        return NextResponse.json({ 
          message: 'Your request has already been approved. You have access to premium blogs.',
          status: 'approved' 
        }, { status: 200 });
      }
      // If rejected, we allow them to re-apply (maybe?) or just show rejected.
      // For now, let's just allow re-applying if rejected by deleting or updating.
      // But the requirement says "approval may take up to 2 hours", so let's stick to status check.
      if (existingRequest.status === 'rejected') {
        return NextResponse.json({ 
          error: 'Your previous request was rejected. Please contact support.',
          status: 'rejected' 
        }, { status: 403 });
      }
    }

    // Create new request
    const newRequest = await prisma.blogAccessRequest.create({
      data: {
        userId: user.id,
        name: user.name || 'User',
        email: validatedData.email,
        status: 'pending',
      },
    });

    return NextResponse.json({ 
      message: 'Your request has been submitted. Approval may take up to 2 hours.',
      request: newRequest 
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error in /api/blog-access-request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
