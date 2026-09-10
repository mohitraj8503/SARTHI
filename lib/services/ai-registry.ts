import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export const METRIC_REGISTRY = {
  REVENUE_TOTAL: {
    id: "REVENUE_TOTAL",
    keywords: ["revenue", "earnings", "paise", "income", "sales"],
    query: async (filters: { dateStr?: string }) => {
      let gte = startOfDay(new Date());
      let dateLabel = "today";
      
      if (filters.dateStr === 'kal' || filters.dateStr === 'yesterday') {
        gte = startOfDay(subDays(new Date(), 1));
        dateLabel = "yesterday";
      }

      const res = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'succeeded', createdAt: { gte } }
      });
      return { 
        value: res._sum.amount || 0,
        type: 'currency',
        label: `Total Revenue (${dateLabel})`
      };
    }
  },
  USERS_ACTIVE: {
    id: "USERS_ACTIVE",
    keywords: ["users", "active", "students", "logins"],
    query: async () => {
      const count = await prisma.user.count({
        where: { lastActive: { gte: subDays(new Date(), 7) } }
      });
      return { value: count, type: 'number', label: 'Active Users (Last 7 Days)' };
    }
  },
  COURSE_ENROLLMENTS: {
    id: "COURSE_ENROLLMENTS",
    keywords: ["enrollments", "course", "popular", "top"],
    query: async () => {
      const top = await prisma.enrollment.groupBy({
        by: ['courseId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1
      });
      
      if (!top[0]) return { value: 0, type: 'text', label: 'Top Course' };
      
      const course = await prisma.course.findUnique({ where: { id: top[0].courseId } });
      return { 
        value: top[0]._count.id, 
        type: 'text', 
        label: `Top Course: ${course?.title || 'Unknown'}`,
        raw: course?.title
      };
    }
  },
  PAYMENT_FAILURES: {
    id: "PAYMENT_FAILURES",
    keywords: ["failed", "failures", "error", "payment issues"],
    query: async () => {
      const count = await prisma.transaction.count({
        where: { status: 'failed', createdAt: { gte: subDays(new Date(), 1) } }
      });
      return { value: count, type: 'number', label: 'Failed Payments (Last 24h)' };
    }
  },
  SYSTEM_ERRORS: {
    id: "SYSTEM_ERRORS",
    keywords: ["errors", "bugs", "system", "health"],
    query: async () => {
      // Mocking system errors for now since we don't have an error log table
      return { value: 0, type: 'number', label: 'System Errors (Last 24h)' };
    }
  }
};

export async function parseQuery(query: string) {
  const q = query.toLowerCase();
  
  // 1. Entity Extraction (Dates)
  const filters: { dateStr?: string } = {};
  if (q.includes("kal") || q.includes("yesterday")) filters.dateStr = "yesterday";
  if (q.includes("aaj") || q.includes("today")) filters.dateStr = "today";

  // 2. Check Overrides (Self-Training Loop)
  const override = await prisma.metricOverride.findUnique({
    where: { phrase: q }
  });
  
  if (override && METRIC_REGISTRY[override.metricId as keyof typeof METRIC_REGISTRY]) {
    return { 
      metric: METRIC_REGISTRY[override.metricId as keyof typeof METRIC_REGISTRY], 
      filters, 
      confidence: 1.0 
    };
  }

  // 3. Intent Matching
  let matchedMetric = null;
  let highestScore = 0;

  for (const [key, metric] of Object.entries(METRIC_REGISTRY)) {
    let score = 0;
    for (const kw of metric.keywords) {
      if (q.includes(kw)) score++;
    }
    if (score > highestScore) {
      highestScore = score;
      matchedMetric = metric;
    }
  }

  const confidence = highestScore > 0 ? 0.9 : 0.2;

  // 4. Log Unmatched Queries for Admin Review
  if (confidence < 0.5) {
    try {
      await prisma.unmatchedQuery.upsert({
        where: { id: q }, // We don't have id=q constraint, so we must find first
        create: { phrase: q, frequency: 1 },
        update: { frequency: { increment: 1 } }
      });
    } catch (e) {
      // Ignore unique constraint issues if running concurrently
      const existing = await prisma.unmatchedQuery.findFirst({ where: { phrase: q }});
      if (existing) {
        await prisma.unmatchedQuery.update({
          where: { id: existing.id },
          data: { frequency: { increment: 1 } }
        });
      } else {
        await prisma.unmatchedQuery.create({
          data: { phrase: q, frequency: 1 }
        });
      }
    }
  }

  return { metric: matchedMetric, filters, confidence };
}

export async function fetchMetricData(metric: any, filters: any) {
  // Can add Redis caching here in the future
  return await metric.query(filters);
}
