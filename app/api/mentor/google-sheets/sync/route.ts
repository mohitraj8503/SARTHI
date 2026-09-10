import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncApplicationToSheet, GOOGLE_SHEET_ID, TEAM_TABS } from '@/lib/services/google-sheets.service';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'MENTOR' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized mentor access' }, { status: 401 });
    }

    const apps = await prisma.internshipApplication.findMany({
      where: { college: { contains: 'iilm' } },
      orderBy: { submittedAt: 'desc' },
      take: 200
    });

    const results = [];
    for (const app of apps) {
      const res = await syncApplicationToSheet(app.id);
      results.push({ id: app.id, email: app.email, name: app.name, res });
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      sheetId: GOOGLE_SHEET_ID,
      sheetTab: TEAM_TABS[0],
      sheetUrl: `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit#gid=1062307809`,
      results
    });
  } catch (err: any) {
    console.error('[MentorGoogleSheetsSync] Error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to sync with Google Sheet' }, { status: 500 });
  }
}
