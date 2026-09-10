import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRedisHealth } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const status: any = {
    status: 'healthy',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown',
      auth: 'healthy',
      storage: 'healthy',
    },
    latency: 0
  };

  try {
    // 1. Test Database
    await prisma.$queryRaw`SELECT 1`;
    status.services.database = 'healthy';
  } catch (error) {
    status.status = 'degraded';
    status.services.database = 'unhealthy';
  }

  try {
    // 2. Test Redis
    const redis = await checkRedisHealth();
    status.services.redis = redis.healthy ? 'healthy' : 'unhealthy';
    if (!redis.healthy) status.status = 'degraded';
  } catch (err) {
    status.services.redis = 'unhealthy';
    status.status = 'degraded';
  }

  status.latency = Date.now() - startTime;

  return NextResponse.json(status, { 
    status: status.status === 'healthy' ? 200 : (status.status === 'degraded' ? 200 : 500) 
  });
}

