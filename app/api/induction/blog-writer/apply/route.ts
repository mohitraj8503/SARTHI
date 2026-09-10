export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const data = await request.json();
    const { fullName, email, portfolioUrl, writingSample, categories } = data;

    // Basic validation
    if (!fullName || !email || !writingSample) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if application already exists for this email
    const existingApplication = await prisma.blogWriterApplication.findUnique({
      where: { email },
    });

    if (existingApplication) {
      return NextResponse.json({ error: 'An application with this email already exists.' }, { status: 409 });
    }

    const application = await prisma.blogWriterApplication.create({
      data: {
        fullName,
        email,
        portfolioUrl,
        writingSample,
        categories: categories?.join(','),
        userId: user?.id || null, // Link to existing user if logged in
      },
    });

    return NextResponse.json({
      message: 'Application submitted successfully.',
      applicationId: application.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

