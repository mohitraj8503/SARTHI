import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";
import { MetricConfig } from "./ai-types";

export const METRIC_REGISTRY: Record<string, MetricConfig> = {
  REVENUE: {
    id: "REVENUE",
    keywords: ["revenue", "earnings", "paise", "income", "sales", "paisa"],
    synonyms: ["profit", "total money", "collection"],
    label: "Total Revenue",
    unit: "₹",
    fetcher: async (filters) => {
      const result = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: "succeeded" }
      });
      return result._sum.amount || 0;
    },
    suggestionRules: (data) => {
      if (data < 1000) return ["Run a limited-time discount", "Increase social media ads"];
      return ["Upsell advanced certifications", "Launch referral program"];
    }
  },
  USERS: {
    id: "USERS",
    keywords: ["users", "students", "members", "logins", "people"],
    synonyms: ["active students", "total kids", "enrollment count"],
    label: "Active Users",
    fetcher: async (filters) => {
      return await prisma.user.count({ where: { role: "STUDENT" } });
    },
    suggestionRules: (data) => {
      if (data < 50) return ["Offer a free trial course", "Run email re-engagement"];
      return ["Host a live Q&A session", "Launch a community forum"];
    }
  },
  COURSES: {
    id: "COURSES",
    keywords: ["courses", "content", "lessons", "modules", "classes"],
    synonyms: ["published courses", "available material"],
    label: "Published Courses",
    fetcher: async (filters) => {
      return await prisma.course.count({ where: { isPublished: true } });
    },
    suggestionRules: (data) => {
      if (data < 10) return ["Onboard 2 new instructors", "Convert top blogs to micro-courses"];
      return ["Review high-performing topics", "Update older course modules"];
    }
  },
  GROWTH: {
    id: "GROWTH",
    keywords: ["growth", "trend", "performance", "scaling", "percentage"],
    synonyms: ["increasing", "decreasing", "improvement"],
    label: "Platform Growth",
    fetcher: async (filters) => {
      const today = await prisma.enrollment.count({ where: { createdAt: { gte: startOfDay(new Date()) } } });
      const yesterday = await prisma.enrollment.count({ 
        where: { createdAt: { gte: startOfDay(subDays(new Date(), 1)), lt: startOfDay(new Date()) } } 
      });
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return ((today - yesterday) / yesterday) * 100;
    },
    suggestionRules: (data) => {
      if (data < 0) return ["Analyze churn reasons", "Audit landing page performance"];
      return ["Scale current marketing ads", "Document successful growth hacks"];
    }
  }
};
