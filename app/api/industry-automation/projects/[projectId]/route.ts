export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

// GET /api/industry-automation/projects/[projectId] - Get single project
export async function GET(request: NextRequest, props: { params: Promise<{ projectId: string }> }) {
  const params = await props.params;
  try {
    const projectId = params.projectId;
    
    const session = await getSession();
    const userId = session?.userId || null;
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
          }
        },
        interests: {
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
        }
      }
    });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Check if current user has shown interest
    let userInterest: { developerId: string; developer: { id: string; name: string | null; image: string | null; email: string } } | null = null;
    if (userId) {
      userInterest = project.interests.find(i => i.developerId === userId) || null;
    }
    
    // Hide other developers' interests unless user is the client
    const isClient = userId === project.clientId;
    const interests = isClient 
      ? project.interests 
      : project.interests.map(i => ({
          ...i,
          developer: {
            id: i.developer.id,
            name: i.developer.name,
            image: i.developer.image
          }
        }));
    
    return NextResponse.json({
      project: {
        ...project,
        interests,
        userInterest,
        isClient
      }
    });
    
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

// PATCH /api/industry-automation/projects/[projectId] - Update project
export async function PATCH(request: NextRequest, props: { params: Promise<{ projectId: string }> }) {
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
      title,
      description,
      category,
      budget,
      timeline,
      requirements,
      skills,
      status
    } = body;
    
    // Check if project exists and user is the owner
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    if (existingProject.clientId !== userId) {
      return NextResponse.json({ error: 'Not authorized to update this project' }, { status: 403 });
    }
    
    // Update project
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(budget !== undefined && { budget: budget ? parseFloat(budget) : null }),
        ...(timeline !== undefined && { timeline }),
        ...(requirements && { requirements }),
        ...(skills && { skills }),
        ...(status && { status })
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    
    return NextResponse.json({ project });
    
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE /api/industry-automation/projects/[projectId] - Delete project
export async function DELETE(request: NextRequest, props: { params: Promise<{ projectId: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = session.userId;
    
    const projectId = params.projectId;
    
    // Check if project exists and user is the owner
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    if (existingProject.clientId !== userId) {
      return NextResponse.json({ error: 'Not authorized to delete this project' }, { status: 403 });
    }
    
    // Delete project (cascades to interests)
    await prisma.project.delete({
      where: { id: projectId }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
