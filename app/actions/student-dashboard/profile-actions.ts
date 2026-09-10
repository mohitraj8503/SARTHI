"use server";
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser, IS_CONN_ERROR } from './index';
import { withResiliency } from '@/lib/resilient-db';

export async function getStudentSettings() {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized', settings: null };

    const result = await withResiliency(async () => {
        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                name: true,
                email: true,
                image: true
            }
        });

        return { settings: userData };
    }, `student-settings-${user.id}`);

    if (!result.success || !result.data) {
        return { error: result.error || 'DB_CONNECTION_FAILED', settings: null };
    }

    return result.data;
}

export async function updateStudentSettings(data: { name: string }) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized' };

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: { name: data.name }
        });
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch {
        return { error: 'Failed' };
    }
}

