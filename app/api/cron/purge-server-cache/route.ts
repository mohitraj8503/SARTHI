import { NextRequest, NextResponse } from 'next/server';
import { purgeServerSideCache } from '@/lib/server-cache-manager';

function isAuthorizedCron(req: NextRequest): boolean {
  const secretHeader = req.headers.get('x-cron-secret');
  const authHeader = req.headers.get('authorization');
  const urlSecret = req.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.CRON_SECRET || 'sarthi_cron_secret_key_2026';

  if (secretHeader === expectedSecret || urlSecret === expectedSecret) {
    return true;
  }
  if (authHeader === `Bearer ${expectedSecret}`) {
    return true;
  }
  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
  }

  const result = await purgeServerSideCache();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
  }

  const result = await purgeServerSideCache();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
