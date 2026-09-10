export class QueryCache {
  private redis: any;
  private ttl: number = 300; // 5 minutes default

  constructor(redisClient: any) {
    this.redis = redisClient;
  }

  async getOrSet<T>(
    key: string, 
    queryFn: () => Promise<T>, 
    ttl: number = this.ttl
  ): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await queryFn();
    await this.redis.setex(key, ttl, JSON.stringify(result));
    return result;
  }

  // Cache dashboard data
  async getDashboardData(userId: string, role: string) {
    const key = `dashboard:${role}:${userId}`;
    return this.getOrSet(key, async () => {
      // Compute dashboard data (Placeholder for actual implementation)
      return null; 
    }, 180); // 3 minutes for dashboard
  }

  // Cache course analytics
  async getCourseAnalytics(courseId: string) {
    const key = `analytics:course:${courseId}`;
    return this.getOrSet(key, async () => {
      // Compute course analytics (Placeholder for actual implementation)
      return null;
    }, 600); // 10 minutes for analytics
  }

  // Invalidate cache patterns
  async invalidateUserData(userId: string) {
    const keys = await this.redis.keys(`*${userId}*`);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }

  async invalidateCourseData(courseId: string) {
    const keys = await this.redis.keys(`*course:${courseId}*`);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }
}