import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncApplicationToSheet } from '@/lib/services/google-sheets.service';

export async function POST(req: NextRequest) {
  try {
    const apps = await prisma.internshipApplication.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const results = [];
    for (const app of apps) {
      const res = await syncApplicationToSheet(app.id);
      results.push({ id: app.id, email: app.email, res });
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      sheetId: '1dW9mq6x_-dUkgE6jJEJozGX1YBIJ4XvePArMMFjJwzk',
      tabName: 'Team Sankalp',
      results
    });
  } catch (err: any) {
    console.error('[AdminGoogleSheetsSync] Error:', err);
    return NextResponse.json({ error: err?.message || 'Bulk sync error' }, { status: 500 });
  }
}
