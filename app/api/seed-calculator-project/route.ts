export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/seed-calculator-project
 *
 * Seeds the Ranjan Singh user and SARTHI AI Calculator App project
 * into the database. Protected by a secret key.
 *
 * Usage: GET /api/seed-calculator-project?secret=SEED_SECRET_2026
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== 'SEED_SECRET_2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const steps: string[] = [];

    // 1. Upsert Ranjan Singh user
    const ranjan = await prisma.user.upsert({
      where: { email: 'ranjansinghgy@gmail.com' },
      update: {
        name: 'Ranjan Singh',
        image: 'https://lh3.googleusercontent.com/a/ACg8ocKk1OXOFIKnhpDx3gnyqN5gbKt7s7TE8bd-lM5XfDxksLKtloX-=s96-c',
        oauthImage: 'https://lh3.googleusercontent.com/a/ACg8ocKk1OXOFIKnhpDx3gnyqN5gbKt7s7TE8bd-lM5XfDxksLKtloX-=s96-c',
      },
      create: {
        email: 'ranjansinghgy@gmail.com',
        name: 'Ranjan Singh',
        role: 'STUDENT',
        image: 'https://lh3.googleusercontent.com/a/ACg8ocKk1OXOFIKnhpDx3gnyqN5gbKt7s7TE8bd-lM5XfDxksLKtloX-=s96-c',
        oauthImage: 'https://lh3.googleusercontent.com/a/ACg8ocKk1OXOFIKnhpDx3gnyqN5gbKt7s7TE8bd-lM5XfDxksLKtloX-=s96-c',
      },
    });
    steps.push(`✅ Ranjan Singh user ready: ${ranjan.id}`);

    // 2. Upsert the Calculator Project
    const projectTitle = 'SARTHI AI Calculator';
    const existingProject = await prisma.project.findFirst({
      where: { title: { contains: 'SARTHI AI Calculator' } },
    });

    let project;
    if (existingProject) {
      project = await prisma.project.update({
        where: { id: existingProject.id },
        data: {
          title: projectTitle,
          description:
            'Futuristic liquid glass calculator. At SARTHI, we believe in automating the existing industries that nobody wants to. Made by Ranjan Singh.',
          category: 'Artificial Intelligence',
          budget: 50000,
          timeline: 'Completed',
          status: 'OPEN',
          clientId: ranjan.id,
          requirements: '/industry-automation/calculator',
          skills:
            'React, Next.js, TypeScript, Razorpay, Glassmorphism, Artificial Intelligence',
        },
      });
      steps.push(`✅ Project updated: ${project.id}`);
    } else {
      project = await prisma.project.create({
        data: {
          title: projectTitle,
          description:
            'Futuristic liquid glass calculator. At SARTHI, we believe in automating the existing industries that nobody wants to. Made by Ranjan Singh.',
          category: 'Artificial Intelligence',
          budget: 50000,
          timeline: 'Completed',
          status: 'OPEN',
          clientId: ranjan.id,
          requirements: '/industry-automation/calculator',
          skills:
            'React, Next.js, TypeScript, Razorpay, Glassmorphism, Artificial Intelligence',
        },
      });
      steps.push(`✅ Project created: ${project.id}`);
    }

    return NextResponse.json({
      success: true,
      message: 'SARTHI AI Calculator seeded successfully!',
      steps,
      project: {
        id: project.id,
        title: project.title,
        clientName: ranjan.name,
      },
    });
  } catch (err: any) {
    console.error('[SEED_CALCULATOR] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
