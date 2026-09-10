import { prisma } from "@/lib/prisma";
import { withResiliency } from "@/lib/resilient-db";
import { CertificationStatus } from "@prisma/client";

/**
 * UNIFIED DATA CONTRACT (SaaS Level)
 * This is the ONLY format the frontend should receive.
 */
export interface UnifiedCertification {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  level: string; // Unified from 'difficulty'
  durationMinutes: number; // Unified from 'duration' or 'assessmentDurationMinutes'
  passingScore: number;
  price: number;
  proPrice?: number;
  premiumPrice?: number;
  status: CertificationStatus;
  stats?: {
    enrollments: number;
    attempts: number;
  };
  createdAt: string;
}

/**
 * Mapper: DB Model -> Unified Contract
 */
export function mapToUnifiedCertification(cert: any): UnifiedCertification {
  return {
    id: cert.id,
    title: cert.title,
    slug: cert.slug,
    description: cert.description || '',
    imageUrl: cert.thumbnail || getCertificationFallbackImage(cert.title),
    level: cert.difficulty || 'Intermediate',
    durationMinutes: cert.assessmentDurationMinutes || cert.duration || 60,
    passingScore: cert.passingScore || 85,
    price: cert.price || 2000,
    proPrice: cert.proPrice || 2000,
    premiumPrice: cert.premiumPrice || 2000,
    status: cert.status,
    stats: cert._count ? {
      enrollments: cert._count.userCertifications || 0,
      attempts: cert._count.attempts || 0
    } : undefined,
    createdAt: cert.createdAt.toISOString()
  };
}

function getCertificationFallbackImage(title?: string) {
  if (!title) return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80";
  const normalizedTitle = title.toLowerCase();
  if (normalizedTitle.includes("gst")) return "/images/gst-practitioner.png";
  if (normalizedTitle.includes("python")) return "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80";
  if (normalizedTitle.includes("c++") || normalizedTitle.includes("cpp")) return "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&q=80";
  return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80";
}

/**
 * Stats Calculator: High-fidelity business metrics
 */
export async function getCertificationStats() {
  return await withResiliency(async () => {
    const [totalAttempts, totalCerts, revenueData, completions] = await Promise.all([
      prisma.certificationAttempt.count(),
      prisma.issuedCertificate.count(),
      prisma.certificationPayment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.certificationAttempt.count({
        where: { passed: true }
      })
    ]);

    const totalRevenue = revenueData._sum.amount || 0;
    const avgPassRate = totalAttempts > 0 ? Math.round((completions / totalAttempts) * 100) : 0;

    return {
      totalAttempts,
      totalCertificates: totalCerts,
      avgPassRate,
      totalRevenue
    };
  }, 'certification-global-stats');
}

/**
 * SHARED SERVICE LAYER: Single Source of Truth
 */
export async function getCertifications(options: {
  isAdmin?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CertificationStatus;
} = {}) {
  const { isAdmin = false, page = 1, pageSize = 12, search, status } = options;
  const skip = (page - 1) * pageSize;

  return await withResiliency(async () => {
    // 1. Build Query
    const where: any = {};
    
    if (!isAdmin) {
      where.status = 'PUBLISHED';
    } else if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // 2. Fetch Data
    const [items, total, globalStats] = await Promise.all([
      prisma.certification.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { attempts: true, userCertifications: true }
          }
        }
      }),
      prisma.certification.count({ where }),
      isAdmin ? getCertificationStats() : Promise.resolve(null)
    ]);

    // 3. Map to Unified Contract
    return {
      items: items.map(mapToUnifiedCertification),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      stats: globalStats
    };
  }, `certifications-list-${isAdmin ? 'admin' : 'public'}-${page}-${search || 'none'}`);
}

export async function getCertificationBySlug(slug: string, isAdmin = false) {
  return await withResiliency(async () => {
    const cert = await prisma.certification.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { attempts: true, userCertifications: true }
        }
      }
    });

    if (!cert || (!isAdmin && cert.status !== 'PUBLISHED')) {
      return null;
    }

    return mapToUnifiedCertification(cert);
  }, `certification-detail-${slug}`);
}
