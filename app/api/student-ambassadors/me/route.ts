import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
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
    console.error('Error reading DB:', err);
    return [];
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if ((user as any).platformSegment !== 'MAIN') {
      return NextResponse.json({ error: 'Student Ambassador Portal is restricted to College / Higher Education students.' }, { status: 403 });
    }

    const applications = readDb();
    const app = applications.find(
      (a: any) => (a.email || '').toLowerCase().trim() === (user.email || '').toLowerCase().trim()
    );

    if (!app) {
      return NextResponse.json({ success: true, status: 'NOT_APPLIED', userEmail: user.email, userName: user.name });
    }

    return NextResponse.json({ success: true, status: app.status, application: app });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Simulate approving user as ambassador for dev demonstration
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if ((user as any).platformSegment === 'JUNIOR') {
      return NextResponse.json({ error: 'Student Ambassador Portal is restricted to College / Higher Education students.' }, { status: 403 });
    }

    const applications = readDb();
    const emailKey = (user.email || '').toLowerCase().trim();
    let index = applications.findIndex((a: any) => (a.email || '').toLowerCase().trim() === emailKey);

    const nameParts = (user.name || 'Student').split(' ');
    const firstName = nameParts[0] || 'Student';
    const lastName = nameParts[1] || 'Ambassador';

    const cleanName = firstName.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let generatedCode = '';
    let isUnique = false;
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

    const mockApp = {
      id: `amb_${Date.now()}`,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone || '9999999999',
      dob: '2000-01-01',
      gender: 'Male',
      country: 'India',
      state: 'Jharkhand',
      city: 'Jamshedpur',
      collegeName: user.college || 'ARKA JAIN University',
      degreeProgram: 'B.Tech',
      gradMonth: 'May',
      gradYear: '2026',
      essayWelcome: 'This is a simulation ambassador statement of purpose essay.',
      linkedinUrl: 'https://linkedin.com/in/mohit',
      githubUrl: 'https://github.com/mohit',
      skills: ['React', 'Next.js', 'TailwindCSS'],
      status: 'APPROVED',
      referralCode: generatedCode,
      registrationsCount: 0,
      taskStatus: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      dateApproved: new Date().toISOString(),
    };

    if (index !== -1) {
      applications[index] = mockApp;
    } else {
      applications.push(mockApp);
    }

    writeDb(applications);

    return NextResponse.json({ success: true, application: mockApp });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
