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
    // Ensure parent directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing ambassador applications DB:', err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Quick validation
    const { firstName, lastName, email, phone, collegeName, degreeProgram, essayWelcome } = body;
    if (!firstName || !lastName || !email || !phone || !collegeName || !degreeProgram || !essayWelcome) {
      return NextResponse.json({ error: 'Missing mandatory fields' }, { status: 400 });
    }

    const applications = readDb();
    
    const cleanName = (firstName || 'STUDENT').replace(/[^a-zA-Z]/g, '').toUpperCase();
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

    // Create new application object
    const newApplication = {
      id: `amb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      firstName,
      lastName,
      email,
      phone,
      dob: body.dob || '',
      gender: body.gender || '',
      country: body.country || 'India',
      state: body.state || '',
      city: body.city || '',
      collegeName,
      degreeProgram,
      gradMonth: body.gradMonth || '',
      gradYear: body.gradYear || '',
      essayWelcome,
      linkedinUrl: body.linkedinUrl || '',
      githubUrl: body.githubUrl || '',
      blogUrl: body.blogUrl || '',
      twitterUrl: body.twitterUrl || '',
      portfolioUrl: body.portfolioUrl || '',
      skills: body.skills || [],
      resumeName: body.resumeName || null,
      resumeBase64: body.resumeBase64 || null,
      status: 'APPROVED',
      referralCode: generatedCode,
      registrationsCount: 0,
      taskStatus: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      dateApproved: new Date().toISOString(),
    };

    applications.push(newApplication);
    writeDb(applications);

    return NextResponse.json({ success: true, applicationId: newApplication.id, status: 'APPROVED' });
  } catch (error: any) {
    console.error('Error in ambassador apply API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
