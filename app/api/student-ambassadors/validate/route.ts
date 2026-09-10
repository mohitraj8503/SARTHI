import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'lib/data/ambassador-applications.json');

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return [];
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Code is required' });
    }

    const applications = readDb();
    const ambassador = applications.find(
      (app: any) => app.referralCode && app.referralCode.toUpperCase() === code.toUpperCase()
    );

    if (ambassador && ambassador.status === 'APPROVED') {
      return NextResponse.json({ valid: true, ambassadorId: ambassador.id, name: `${ambassador.firstName} ${ambassador.lastName}` });
    }

    return NextResponse.json({ valid: false, error: 'Invalid referral code' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
