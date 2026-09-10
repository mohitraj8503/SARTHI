import { prisma } from "@/lib/prisma";
import { withResiliency } from "@/lib/resilient-db";
import { z } from "zod";

/**
 * SETTINGS SCHEMAS
 * Strict contracts for platform configuration.
 */
export const PlatformSettingsSchema = z.object({
  name: z.string().min(2).default("SARTHI"),
  supportEmail: z.string().email().default("support@sarthi.in"),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

export const PaymentSettingsSchema = z.object({
  currency: z.string().default("INR"),
  razorpayKeyId: z.string().optional(),
  razorpaySecret: z.string().optional(),
  taxPercentage: z.number().min(0).max(100).default(18),
});

export const SecuritySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  sessionTimeoutMinutes: z.number().min(5).max(1440).default(60),
  allowedDomains: z.array(z.string()).default([]),
});

export type SettingCategory = 'platform' | 'payment' | 'security' | 'notifications' | 'integrations';

/**
 * SETTINGS SERVICE
 * Centralized logic for system-wide configuration.
 */
export const SettingsService = {
  /**
   * Get settings for a category with validation.
   */
  async getCategorySettings<T>(category: SettingCategory, schema: z.ZodSchema<T>): Promise<T> {
    return await withResiliency(async () => {
      const settings = await prisma.settings.findMany({
        where: { category }
      });

      // Convert flat DB records back to structured object
      const data: any = {};
      settings.forEach(s => {
        try {
          data[s.key] = JSON.parse(s.value);
        } catch {
          data[s.key] = s.value;
        }
      });

      const result = schema.safeParse(data);
      if (!result.success) {
        console.warn(`[SettingsService] Schema mismatch for ${category}:`, result.error.format());
        // Return defaults from schema if validation fails
        return schema.parse({});
      }
      return result.data;
    }, `get-settings-${category}`);
  },

  /**
   * Batch update settings for a category.
   */
  async updateSettings(category: SettingCategory, data: Record<string, any>, adminId: string) {
    return await withResiliency(async () => {
      return await prisma.$transaction(async (tx) => {
        const updates = Object.entries(data).map(([key, value]) => {
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          return tx.settings.upsert({
            where: { key: `${category}_${key}` }, // Use namespaced keys to prevent collisions
            update: { value: stringValue, updatedAt: new Date() },
            create: { 
              key: `${category}_${key}`, 
              value: stringValue, 
              category 
            }
          });
        });

        const results = await Promise.all(updates);
        
        // TODO: Log to AuditTrail service
        console.log(`[Audit] Admin ${adminId} updated ${category} settings.`);

        return results;
      });
    }, `update-settings-${category}`);
  },

  /**
   * Unified Get All Settings (Internal Use)
   */
  async getAllSettings() {
    const [platform, payment, security] = await Promise.all([
      this.getCategorySettings('platform', PlatformSettingsSchema),
      this.getCategorySettings('payment', PaymentSettingsSchema),
      this.getCategorySettings('security', SecuritySettingsSchema),
    ]);

    return { platform, payment, security };
  }
};
