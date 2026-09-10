export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const programs = await prisma.inductionProgram.findMany({
            where: { isActive: true },
            include: {
                mentor: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format for the frontend InductionClient
        const formatted = programs.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category || 'Engineering',
            duration: p.duration ? `${p.duration} Days` : 'Cohort 2026',
            mentor: p.mentor?.name || 'Industry Mentor',
            seats: p.seats || 50,
            level: p.level || 'Beginner',
            thumbnail: p.thumbnail || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=600&fit=crop',
            description: p.description || 'Master real-world tech by shipping production-grade projects.'
        }));

        // If no programs found, return a default one to avoid empty state on first load
        if (formatted.length === 0) {
            return NextResponse.json([
                {
                    id: 'default-eng',
                    title: 'Software Engineering Induction',
                    category: 'Engineering',
                    duration: '90 Days',
                    mentor: 'Siddharth Raj',
                    seats: 50,
                    level: 'Beginner',
                    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
                    description: 'A comprehensive journey into modern software architecture and production engineering.'
                }
            ]);
        }

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Induction API error:', error);
        // Fallback to static mockup data if database connection fails
        return NextResponse.json([
            {
                id: 'fallback-eng',
                title: 'Software Engineering induction',
                category: 'Engineering',
                duration: '6 Months',
                mentor: 'Siddharth Raj',
                seats: 50,
                level: 'Beginner',
                thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
                description: 'A comprehensive journey from frontend basics to system design at scale.'
            }
        ]);
    }
}

