/**
 * Feature Flags Configuration
 *
 * Use feature flags for safe rollouts and instant rollback
 * Can be replaced with LaunchDarkly, Flagsmith, or other providers
 */

// Environment-based feature flags
export const featureFlags = {
  // Dashboard features
  newDashboardEnabled: process.env.FEATURE_NEW_DASHBOARD === 'true',
  newLeaderboard: process.env.FEATURE_NEW_LEADERBOARD === 'true',
  streakCalculation: process.env.FEATURE_STREAK_CALC === 'true',

  // Real-time features
  realtimeSync: process.env.FEATURE_REALTIME_SYNC !== 'false', // Default enabled
  socketAuth: process.env.FEATURE_SOCKET_AUTH !== 'false', // Default enabled

  // Performance features
  redisCache: process.env.FEATURE_REDIS_CACHE !== 'false', // Default enabled
  rateLimiting: process.env.FEATURE_RATE_LIMITING !== 'false', // Default enabled

  // Experimental features
  aiRecommendations: process.env.FEATURE_AI_RECOMMENDATIONS === 'true',
  darkMode: process.env.FEATURE_DARK_MODE === 'true',

  // Monitoring
  observability: process.env.FEATURE_OBSERVABILITY === 'true',
  performanceMonitoring: process.env.FEATURE_PERF_MONITORING === 'true',
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: keyof typeof featureFlags): boolean {
  return featureFlags[flag] ?? false;
}

/**
 * Get all feature flags (for debugging/admin)
 */
export function getAllFeatureFlags() {
  return { ...featureFlags };
}

/**
 * Feature flag check for dashboard widgets
 */
export const dashboardFeatures = {
  showLeaderboard: () => isFeatureEnabled('newLeaderboard'),
  showStreak: () => isFeatureEnabled('streakCalculation'),
  showAiRecommendations: () => isFeatureEnabled('aiRecommendations'),
  useRealtimeSync: () => isFeatureEnabled('realtimeSync'),
  useRedisCache: () => isFeatureEnabled('redisCache'),
  useRateLimiting: () => isFeatureEnabled('rateLimiting'),
};

/**
 * Safe feature check with default fallback
 */
export function checkFeature<T>(
  flag: keyof typeof featureFlags,
  enabledValue: T,
  disabledValue: T
): T {
  return isFeatureEnabled(flag) ? enabledValue : disabledValue;
}

export default featureFlags;
