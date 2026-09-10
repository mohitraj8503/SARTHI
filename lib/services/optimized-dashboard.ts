/**
 * INTELLIGENT QUERY CACHING LAYER
 * Reduces database load with smart cache invalidation
 */

const Redis = require('ioredis');

export class QueryCache {
  private redis: any;
  private defaultTtl: number = 300; // 5 minutes
  private compressionThreshold: number = 1024; // Compress responses > 1KB

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');

    this.redis.on('error', (err: any) => {
      console.error('Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('📊 Query cache connected to Redis');
    });
  }

  async getOrSet<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = this.defaultTtl,
    options: CacheOptions = {}
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.redis.get(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log(`✅ Cache hit for: ${key}`);
        return parsed;
      }

      // Cache miss - execute query
      console.log(`❌ Cache miss for: ${key}`);
      const result = await queryFn();

      // Store in cache with TTL
      const serialized = JSON.stringify(result);
      await this.redis.setex(key, ttl, serialized);

      // Store metadata if requested
      if (options.metadata) {
        await this.storeMetadata(key, options.metadata);
      }

      return result;
    } catch (error) {
      console.error(`Cache error for key ${key}:`, error);
      // Fallback to direct query on cache failure
      return queryFn();
    }
  }

  // Cache dashboard data with user-specific TTL
  async getDashboardData(userId: string, role: string, forceRefresh: boolean = false) {
    const key = `dashboard:${role}:${userId}`;
    const ttl = role === 'teacher' ? 180 : 300; // 3min for teachers, 5min for students

    if (forceRefresh) {
      await this.invalidate(key);
    }

    return this.getOrSet(key, async () => {
      const dashboardService = require('../services/dashboard');
      return dashboardService.getDashboardData(userId, role);
    }, ttl, {
      metadata: { userId, role, type: 'dashboard' }
    });
  }

  // Cache course analytics with invalidation on updates
  async getCourseAnalytics(courseId: string, forceRefresh: boolean = false) {
    const key = `analytics:course:${courseId}`;

    if (forceRefresh) {
      await this.invalidate(key);
    }

    return this.getOrSet(key, async () => {
      const analyticsService = require('../services/course-analytics');
      return analyticsService.computeAnalytics(courseId);
    }, 600, { // 10 minutes
      metadata: { courseId, type: 'analytics' }
    });
  }

  // Cache enrollment data
  async getEnrollmentData(userId: string, courseId?: string) {
    const key = courseId
      ? `enrollment:${userId}:${courseId}`
      : `enrollments:${userId}`;

    return this.getOrSet(key, async () => {
      if (courseId) {
        return require('../services/enrollment').getEnrollment(userId, courseId);
      } else {
        return require('../services/enrollment').getUserEnrollments(userId);
      }
    }, 180, {
      metadata: { userId, courseId, type: 'enrollment' }
    });
  }

  // Smart cache invalidation
  async invalidate(pattern: string) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
        console.log(`🗑️ Invalidated ${keys.length} cache keys matching: ${pattern}`);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  // Invalidate user-related data
  async invalidateUserData(userId: string) {
    const patterns = [
      `*${userId}*`,
      `dashboard:*:${userId}`,
      `enrollments:${userId}`,
      `enrollment:${userId}:*`
    ];

    for (const pattern of patterns) {
      await this.invalidate(pattern);
    }
  }

  // Invalidate course-related data
  async invalidateCourseData(courseId: string) {
    const patterns = [
      `*course:${courseId}*`,
      `analytics:course:${courseId}`,
      `enrollment:*:${courseId}`
    ];

    for (const pattern of patterns) {
      await this.invalidate(pattern);
    }
  }

  // Store cache metadata for debugging
  private async storeMetadata(key: string, metadata: any) {
    try {
      const metaKey = `meta:${key}`;
      await this.redis.setex(metaKey, this.defaultTtl, JSON.stringify({
        ...metadata,
        cachedAt: new Date().toISOString(),
        ttl: this.defaultTtl
      }));
    } catch (error) {
      // Metadata storage failure shouldn't break caching
      console.warn('Failed to store cache metadata:', error);
    }
  }

  // Get cache statistics
  async getStats() {
    try {
      const info = await this.redis.info('stats');
      const keys = await this.redis.dbsize();

      return {
        connected: this.redis.status === 'ready',
        totalKeys: keys,
        info: this.parseRedisInfo(info),
        memory: await this.getMemoryStats()
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  private parseRedisInfo(info: string) {
    const lines = info.split('\r\n');
    const stats: any = {};

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = value;
      }
    }

    return stats;
  }

  private async getMemoryStats() {
    try {
      const info = await this.redis.info('memory');
      return this.parseRedisInfo(info);
    } catch (error) {
      return { error: error.message };
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  // Graceful shutdown
  async disconnect() {
    await this.redis.quit();
  }
}

interface CacheOptions {
  metadata?: any;
  compress?: boolean;
}