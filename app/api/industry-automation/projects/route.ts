export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { withResiliency } from '@/lib/resilient-db';

// GET /api/industry-automation/projects - List all projects with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filter params
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const skills = searchParams.get('skills')?.split(',').filter(Boolean);
    const search = searchParams.get('search')?.trim();
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build where clause
    const where: any = {};
    
    if (category) {
      if (category === 'Technology') {
        where.category = { in: ['Development', 'Databases', 'Technology'] };
        const nonAiFilter = {
          NOT: [
            { title: { contains: "AI" } },
            { title: { contains: "ChatGPT" } },
            { title: { contains: "Prompt" } },
            { title: { contains: "Generative" } }
          ]
        };
        where.AND = where.AND ? [...where.AND, nonAiFilter] : [nonAiFilter];
      } else if (category === 'Artificial Intelligence') {
        const aiFilter = {
          OR: [
            { title: { contains: "AI" } },
            { title: { contains: "ChatGPT" } },
            { title: { contains: "Prompt" } },
            { title: { contains: "Generative" } },
            { category: { contains: "AI" } }
          ]
        };
        where.AND = where.AND ? [...where.AND, aiFilter] : [aiFilter];
      } else if (category === 'Commerce & Management') {
        where.category = { in: ['Business', 'Finance', 'Commerce', 'Management'] };
      } else if (category === 'Personal Development') {
        where.category = 'Design';
      } else {
        where.category = category;
      }
    }
    
    if (status) {
      where.status = status;
    } else {
      // Default to showing OPEN projects only
      where.status = 'OPEN';
    }
    
    if (skills && skills.length > 0) {
      where.skills = {
        hasSome: skills
      };
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'budget_high') {
      orderBy = { budget: 'desc' };
    } else if (sort === 'budget_low') {
      orderBy = { budget: 'asc' };
    } else if (sort === 'most_interested') {
      orderBy = { interests: { _count: 'desc' } };
    }
    
    const skip = (page - 1) * limit;
    
    const projectsResult = await withResiliency(async () => {
      const [projectsList, count] = await Promise.all([
        prisma.project.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            client: {
              select: { id: true, name: true, image: true }
            },
            _count: { select: { interests: true } }
          }
        }),
        prisma.project.count({ where })
      ]);
      return { projectsList, count };
    // No cache key — always fetch fresh from DB so new projects show immediately
    });

    if (!projectsResult.success || !projectsResult.data) {
      // DB is down, return empty to prevent crash
      return NextResponse.json({
        projects: [],
        pagination: { page, limit, total: 0, pages: 0 }
      });
    }

    const { projectsList, count } = projectsResult.data;
    
    return NextResponse.json({
      projects: projectsList.map(p => ({
        ...p,
        interestCount: p._count.interests
      })),
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = session.userId;
    
    const body = await request.json();
    const {
      title,
      description,
      category,
      budget,
      timeline,
      requirements,
      skills
    } = body;
    
    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }
    
    // Create project
    const project = await prisma.project.create({
      data: {
        title,
        description,
        category,
        budget: budget ? parseFloat(budget) : null,
        timeline,
        requirements: requirements || [],
        skills: skills || [],
        clientId: userId,
        status: 'OPEN'
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
    
    return NextResponse.json({ project }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

