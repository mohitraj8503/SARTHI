import { NextResponse } from 'next/server';
import { seedCourses } from '@/lib/seedCourses';

export async function POST() {
    try {
        const courses = await seedCourses();
        return NextResponse.json({ 
            success: true, 
            count: courses.length,
            courses 
        });
    } catch (error) {
        console.error('Seed API Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
