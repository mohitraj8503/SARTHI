export const dynamic = "force-dynamic";
import { NextResponse, NextRequest } from 'next/server';
import { seedCourses } from '@/lib/seedCourses';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const setupSecret = process.env.SETUP_SECRET;

    // Allow access via admin session, or via explicitly configured setup secret.
    const user = await getCurrentUser().catch(() => null);
    let isSecretAuthorized = false;
    if (secret && setupSecret) {
      const secretBuf = Buffer.from(secret);
      const configuredBuf = Buffer.from(setupSecret);
      isSecretAuthorized =
        secretBuf.length === configuredBuf.length &&
        crypto.timingSafeEqual(secretBuf, configuredBuf);
    }
    const isAuthorized = isSecretAuthorized || isAdmin(user);

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('[Setup] Seeding courses...');
        const courses = await seedCourses();

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${courses.length} courses`,
            courses: courses.map(c => ({ title: c.title, slug: c.slug }))
        });

    } catch (error: any) {
        console.error('[Setup] Error seeding courses:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

