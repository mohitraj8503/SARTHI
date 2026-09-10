import { NextResponse } from 'next/server';
import { InsightAnalyzer } from '@/lib/insights/analysis-engine';
import { prisma } from '@/lib/prisma';

async function getPlatformData() {
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. Revenue Data
  const [courseTx, certificateUpgradeTx, certificationPaymentTx] = await Promise.all([
    prisma.transaction.findMany({
      where: { status: 'SUCCESS' }
    }),
    prisma.paymentIntent.findMany({
      where: { status: 'completed' }
    }),
    prisma.certificationPayment.findMany({
      where: { status: 'COMPLETED' }
    })
  ]);

  const totalRevenue = 
    courseTx.reduce((sum, p) => sum + (p.amount || 0), 0) +
    certificateUpgradeTx.reduce((sum, p) => sum + (p.amount || 0), 0) +
    certificationPaymentTx.reduce((sum, p) => sum + (p.amount || 0), 0);

  const transactionCount = courseTx.length + certificateUpgradeTx.length + certificationPaymentTx.length;
  const avgTicket = transactionCount > 0 ? totalRevenue / transactionCount : 0;

  // 2. User Data
  const totalUsers = await prisma.user.count({ where: { role: 'STUDENT' } });
  const activeUsers = await prisma.user.count({ 
    where: { 
      role: 'STUDENT',
      status: 'ACTIVE'
    } 
  });
  const newThisWeek = await prisma.user.count({
    where: {
      role: 'STUDENT',
      createdAt: { gte: lastWeek }
    }
  });

  // 3. Course Data
  const totalCourses = await prisma.course.count();
  const publishedCourses = await prisma.course.count({ where: { isPublished: true } });
  const totalEnrollments = await prisma.enrollment.count();

  return {
    revenue: {
      total: totalRevenue,
      growth: 0, // Simplified for now
      transactions: transactionCount,
      avgTicket: avgTicket
    },
    users: {
      total: totalUsers,
      active: activeUsers,
      newThisWeek: newThisWeek,
      churnRate: 5, // Mocked
      engagement: 65 // Mocked
    },
    courses: {
      total: totalCourses,
      published: publishedCourses,
      enrollments: totalEnrollments,
      completionRate: 42 // Mocked
    },
    system: {
      uptime: 99.9,
      errors: 0,
      responseTime: 120
    }
  };
}

export async function GET() {
  try {
    const data = await getPlatformData();
    const analyzer = new InsightAnalyzer(data);
    
    const insights = analyzer.generateInsights();
    const suggestions = analyzer.generateGrowthSuggestions();

    return NextResponse.json({
      success: true,
      insights,
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Insights API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate insights',
      insights: [],
      suggestions: []
    }, { status: 500 });
  }
}

