export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

// POST /api/industry-automation/projects/[projectId]/interests - Submit interest
export async function POST(request: NextRequest, props: { params: Promise<{ projectId: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = session.userId;
    
    const projectId = params.projectId;
    const body = await request.json();
    const {
      coverLetter,
      proposedTimeline,
      proposedBudget,
      approach,
      attachments,
      portfolioLinks
    } = body;

    // Validate required fields
    if (!coverLetter) {
      return NextResponse.json({ error: 'Cover letter is required' }, { status: 400 });
    }
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Check if user is the project owner
    if (project.clientId === userId) {
      return NextResponse.json({ error: 'You cannot show interest in your own project' }, { status: 400 });
    }
    
    // Check if user already showed interest
    const existingInterest = await prisma.projectInterest.findUnique({
      where: {
        projectId_developerId: {
          projectId,
          developerId: userId
        }
      }
    });
    
    if (existingInterest) {
      return NextResponse.json({ error: 'You have already shown interest in this project' }, { status: 400 });
    }
    
    // Create interest
    const interest = await prisma.projectInterest.create({
      data: {
        projectId,
        developerId: userId,
        coverLetter,
        proposedTimeline,
        proposedBudget: proposedBudget ? parseFloat(proposedBudget) : null,
        approach,
        attachments: attachments ? JSON.stringify(attachments) : null,
        portfolioLinks: portfolioLinks ? JSON.stringify(portfolioLinks) : null,
        status: 'PENDING'
      },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    
    return NextResponse.json({ interest }, { status: 201 });
    
  } catch (error) {
    console.error('Error submitting interest:', error);
    return NextResponse.json({ error: 'Failed to submit interest' }, { status: 500 });
  }
}

// GET /api/industry-automation/projects/[projectId]/interests - Get interests for a project
export async function GET(request: NextRequest, props: { params: Promise<{ projectId: string }> }) {
  const params = await props.params;
  try {
    const projectId = params.projectId;
    
    const session = await getSession();
    const userId = session?.userId || null;
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, clientId: true }
    });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Only project owner can see all interests
    const isOwner = userId === project.clientId;
    
    if (!isOwner) {
      return NextResponse.json({ error: 'Not authorized to view interests' }, { status: 403 });
    }
    
    const interests = await prisma.projectInterest.findMany({
      where: { projectId },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ interests });
    
  } catch (error) {
    console.error('Error fetching interests:', error);
    return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 });
  }
}
