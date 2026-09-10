'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';
import { invalidateSessionCache } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { processProfileImage } from '@/lib/upload-profile-photo';

async function getCurrentUserId() {
    const session = await getSession();
    return session?.userId || null;
}

export async function updateProfile(data: { name?: string; image?: string }) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const updateData: { name?: string; image?: string; avatar_url?: string } = {};

        if (data.name !== undefined) {
            if (!data.name || data.name.trim().length < 2) {
                return { success: false, error: 'Name must be at least 2 characters' };
            }
            updateData.name = data.name.trim();
        }

        if (data.image !== undefined) {
            const processedImage = await processProfileImage(userId, data.image);
            updateData.image = processedImage || undefined;
            updateData.avatar_url = processedImage || undefined;
        }

        if (Object.keys(updateData).length === 0) {
            return { success: false, error: 'No data to update' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        await invalidateSessionCache();
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}

export async function changePassword(data: { current: string; new: string; confirm: string }) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const { current, new: newPass, confirm } = data;

        if (newPass !== confirm) {
            return { success: false, error: 'New passwords do not match' };
        }

        if (newPass.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.password) {
            return { success: false, error: 'User not found or uses OAuth' };
        }

        const isValid = await bcrypt.compare(current, user.password);
        if (!isValid) {
            return { success: false, error: 'Current password is incorrect' };
        }

        const hashedPassword = await bcrypt.hash(newPass, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { success: true };
    } catch (error) {
        console.error('Change password error:', error);
        return { success: false, error: 'Failed to update password' };
    }
}

export async function updateNotificationSettings(settings: any) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { notificationSettings: JSON.stringify(settings) },
        });

        await invalidateSessionCache();
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Update notification settings error:', error);
        return { success: false, error: 'Failed to update preferences' };
    }
}

export async function updateUserDetails(data: { 
    name?: string; 
    email?: string; 
    bio?: string; 
    socialLinks?: { 
        platform: string; 
        url: string; 
    }[]; 
}) {
    const userId = await getCurrentUserId();
    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const updateData: { 
            name?: string; 
            email?: string; 
            bio?: string; 
            socialLinks?: any; 
        } = {};

        if (data.name !== undefined) {
            if (!data.name || data.name.trim().length < 2) {
                return { success: false, error: 'Name must be at least 2 characters' };
            }
            updateData.name = data.name.trim();
        }

        if (data.email !== undefined) {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return { success: false, error: 'Invalid email format' };
            }
            updateData.email = data.email.toLowerCase().trim();
        }

        if (data.bio !== undefined) {
            updateData.bio = data.bio.trim();
        }

        if (data.socialLinks !== undefined) {
            // Validate social links format
            for (const link of data.socialLinks) {
                if (!link.platform || !link.url) {
                    return { success: false, error: 'Each social link must have platform and URL' };
                }
                // Basic URL validation
                try {
                    new URL(link.url);
                } catch {
                    return { success: false, error: `Invalid URL for platform ${link.platform}` };
                }
            }
            updateData.socialLinks = JSON.stringify(data.socialLinks);
        }

        if (Object.keys(updateData).length === 0) {
            return { success: false, error: 'No data to update' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        await invalidateSessionCache();
        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Update user details error:', error);
        return { success: false, error: 'Failed to update user details' };
    }
}

