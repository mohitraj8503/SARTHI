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
    console.error('Error reading ambassador applications DB:', err);
    return [];
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing ambassador applications DB:', err);
  }
}

// GET: Retrieve all applications
export async function GET() {
  try {
    const applications = readDb();
    // Sort applications by newest first
    const sorted = [...applications].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json({ success: true, data: sorted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Update application status (APPROVED / REJECTED)
export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    if (status !== 'APPROVED' && status !== 'REJECTED' && status !== 'PENDING') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const applications = readDb();
    const index = applications.findIndex((app: any) => app.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Generate referral code if approved
    if (status === 'APPROVED') {
      if (!applications[index].referralCode) {
        const cleanName = (applications[index].firstName || 'STUDENT').replace(/[^a-zA-Z]/g, '').toUpperCase();
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let isUnique = false;
        let generatedCode = '';
        const existingCodes = applications.map((a: any) => a.referralCode).filter(Boolean);
        
        while (!isUnique) {
          let randomPart = '';
          for (let i = 0; i < 4; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          generatedCode = `TT-${cleanName}-${randomPart}`;
          if (!existingCodes.includes(generatedCode)) {
            isUnique = true;
          }
        }
        
        applications[index].referralCode = generatedCode;
        applications[index].registrationsCount = 0;
        applications[index].taskStatus = 'IN_PROGRESS';
        applications[index].dateApproved = new Date().toISOString();
      }
    }

    applications[index].status = status;
    writeDb(applications);

    return NextResponse.json({ success: true, data: applications[index] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
