import { NextRequest } from 'next/server';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { auditAdminAction } from '@/lib/admin/audit-logs';
import { SettingsService, SettingCategory } from '@/lib/services/settings.service';

export const dynamic = 'force-dynamic';

/**
 * GET: Fetch all validated settings
 */
export async function GET() {
  try {
    await requireAdmin();
    const settings = await SettingsService.getAllSettings();
    return ApiResponse.success(settings);
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * POST: Batch update settings
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin('management');
    const body = await request.json();
    const { settings } = body; 

    if (!settings || typeof settings !== 'object') {
      return ApiResponse.error('Invalid settings data', 'BAD_REQUEST', 400);
    }

    // Process each category update
    for (const [category, categorySettings] of Object.entries(settings)) {
      await SettingsService.updateSettings(
        category as SettingCategory, 
        categorySettings as Record<string, any>, 
        admin.id
      );
    }
    
    await auditAdminAction(admin, 'settings_update', 'SETTINGS', 'SYSTEM', 'Platform Sync', settings);

    return ApiResponse.success(null, 'Portal state synchronized');
  } catch (error: any) {
    return handleApiError(error);
  }
}

