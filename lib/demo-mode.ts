/**
 * DEMO_MODE Infrastructure
 * 
 * This module provides utilities for handling demo mode in the application.
 * When DEMO_MODE=true, demo data can be displayed with proper labeling.
 * In production (DEMO_MODE=false), fake/demo data should NEVER be shown to users.
 */

// Check if demo mode is enabled
export const DEMO_MODE = false;

// Check if we're in production (not demo mode)
export const IS_PRODUCTION = true;

/**
 * Guard function that throws an error if demo data is being used in production
 * Use this to enforce that demo data is never shown in production
 */
export function enforceProductionMode(caller: string): void {
  if (DEMO_MODE) {
    console.warn(`[DEMO_MODE] ${caller} is using demo data. This should only happen in demo mode.`);
  }

  if (IS_PRODUCTION) {
    throw new Error(`[SECURITY] ${caller} attempted to use demo data in production! This is not allowed.`);
  }
}

/**
 * Helper to get demo mode status for UI rendering
 * Returns true only if DEMO_MODE is explicitly enabled
 */
export function isDemoMode(): boolean {
  return DEMO_MODE;
}

/**
 * Type guard to check if data is marked as demo data
 */
export function isDemoData<T extends { isDemoData?: boolean }>(data: T): boolean {
  return data.isDemoData === true;
}
