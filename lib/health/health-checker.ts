export interface HealthResult {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
  timestamp: Date;
}

export interface HealthReport {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  responseTime: number;
  checks: HealthResult[];
}

export interface HealthCheck {
  name: string;
  checkFn: () => Promise<HealthResult>;
  lastResult: HealthResult | null;
  lastCheck: Date | null;
}

export class HealthChecker {
  private checks: Map<string, HealthCheck> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.registerDefaultChecks();
  }

  private registerDefaultChecks() {
    // Database health check
    this.registerCheck('database', async () => {
      const { prisma } = require('../prisma');
      await prisma.$queryRaw`SELECT 1`;
      return { name: 'database', status: 'healthy', responseTime: 0, timestamp: new Date() };
    });

    // Redis health check
    this.registerCheck('redis', async () => {
      try {
        const { checkRedisHealth } = require('../redis');
        const health = await checkRedisHealth();
        return {
          name: 'redis',
          status: health.healthy ? 'healthy' : 'unhealthy',
          error: health.error,
          responseTime: 0,
          timestamp: new Date()
        };
      } catch (error: any) {
        return {
          name: 'redis',
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date()
        };
      }
    });

    // Application health check
    this.registerCheck('application', async () => {
      return { name: 'application', status: 'healthy', responseTime: 0, timestamp: new Date() };
    });

    // Razorpay health check
    this.registerCheck('razorpay', async () => {
      const { getRazorpayInstance } = require('../razorpay');
      const rzp = getRazorpayInstance();
      if (!rzp) {
        return { name: 'razorpay', status: 'unhealthy', error: 'Razorpay keys missing', timestamp: new Date() };
      }
      
      const start = Date.now();
      try {
        await rzp.orders.all({ count: 1 });
        return {
          name: 'razorpay',
          status: 'healthy',
          responseTime: Date.now() - start,
          timestamp: new Date()
        };
      } catch (error: any) {
        return {
          name: 'razorpay',
          status: 'unhealthy',
          error: error.description || error.message || 'Authentication failed',
          responseTime: Date.now() - start,
          timestamp: new Date()
        };
      }
    });
  }

  registerCheck(name: string, checkFn: () => Promise<HealthResult>) {
    this.checks.set(name, {
      name,
      checkFn,
      lastResult: null,
      lastCheck: null
    });
  }

  async runHealthChecks(): Promise<HealthReport> {
    const results: HealthResult[] = [];
    const startTime = Date.now();

    for (const check of this.checks.values()) {
      try {
        const result = await check.checkFn();
        check.lastResult = result;
        check.lastCheck = new Date();
        results.push(result);
      } catch (error: any) {
        const errorResult: HealthResult = {
          name: check.name,
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date()
        };
        check.lastResult = errorResult;
        check.lastCheck = new Date();
        results.push(errorResult);
      }
    }

    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';
    const responseTime = Date.now() - startTime;

    return {
      status: overallStatus,
      timestamp: new Date(),
      responseTime,
      checks: results
    };
  }

  startPeriodicChecks(intervalMs: number = 30000) {
    this.checkInterval = setInterval(async () => {
      const report = await this.runHealthChecks();

      if (report.status === 'unhealthy') {
        console.error('Health check failed:', report);
      }
    }, intervalMs);
  }

  stopPeriodicChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}