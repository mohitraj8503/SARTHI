import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { buildCertificateHtmlSnapshot } from '@/lib/certificate/captureCertificateSnapshot';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const results: any = {
      status: 'starting',
      steps: []
    };

    // Seeding Ranjan Singh and the Calculator project for Industry Automation
    results.steps.push("Checking Ranjan Singh and Calculator Project...");
    let ranjan = await prisma.user.findFirst({
      where: { email: 'ranjansinghgy@gmail.com' }
    });

    if (!ranjan) {
      ranjan = await prisma.user.create({
        data: {
          email: 'ranjansinghgy@gmail.com',
          name: 'Ranjan Singh',
          role: 'STUDENT',
          image: 'https://lh3.googleusercontent.com/a/ACg8ocKk1OXOFIKnhpDx3gnyqN5gbKt7s7TE8bd-lM5XfDxksLKtloX-=s96-c',
          oauthImage: 'https://lh3.googleusercontent.com/a/ACg8ocKk1OXOFIKnhpDx3gnyqN5gbKt7s7TE8bd-lM5XfDxksLKtloX-=s96-c',
        }
      });
      results.steps.push(`Created user Ranjan Singh: ${ranjan.id}`);
    } else {
      ranjan = await prisma.user.update({
        where: { id: ranjan.id },
        data: {
          name: 'Ranjan Singh',
          image: 'https://lh3.googleusercontent.com/a/ACg8ocKk1OXOFIKnhpDx3gnyqN5gbKt7s7TE8bd-lM5XfDxksLKtloX-=s96-c',
          oauthImage: 'https://lh3.googleusercontent.com/a/ACg8ocKk1OXOFIKnhpDx3gnyqN5gbKt7s7TE8bd-lM5XfDxksLKtloX-=s96-c',
        }
      });
      results.steps.push(`Updated user Ranjan Singh: ${ranjan.id}`);
    }

    const projectTitle = 'SARTHI AI Calculator';
    let project = await prisma.project.findFirst({
      where: { title: { contains: 'SARTHI AI Calculator' } }
    });

    const projectData = {
      title: projectTitle,
      description: 'Futuristic liquid glass calculator. At SARTHI, we believe in automating the existing industries that nobody wants to. Made by Ranjan Singh.',
      category: 'Artificial Intelligence',
      budget: 50000,
      timeline: 'Completed',
      status: 'OPEN',
      clientId: ranjan.id,
      requirements: '/industry-automation/calculator',
      skills: 'React, Next.js, TypeScript, Razorpay, Glassmorphism, Artificial Intelligence',
    };

    if (!project) {
      project = await prisma.project.create({
        data: projectData
      });
      results.steps.push(`Created project ${projectTitle}: ${project.id}`);
    } else {
      project = await prisma.project.update({
        where: { id: project.id },
        data: projectData
      });
      results.steps.push(`Updated project ${projectTitle}: ${project.id}`);
    }

    const targetEmail = 'dhanlaxmibagoriya21@gmail.com';
    
    // 1. Find active user
    const activeUser = await prisma.user.findFirst({
      where: { email: targetEmail }
    });

    if (!activeUser) {
      return NextResponse.json({
        success: false,
        error: `Active user ${targetEmail} not found in database. Please log in first via Google to create the active account.`
      }, { status: 404 });
    }

    results.activeUserId = activeUser.id;
    results.steps.push(`Found active user: ${activeUser.name} (${activeUser.id})`);

    // 2. Find legacy users (excluding the active user itself)
    const legacyUsers = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { email: { contains: 'dhanlaxmi' } },
              { email: { contains: 'bagoria' } },
              { email: { contains: 'bagoriya' } }
            ]
          },
          {
            id: { not: activeUser.id }
          }
        ]
      }
    });

    results.legacyUsersCount = legacyUsers.length;
    results.legacyUsers = legacyUsers.map(u => ({ id: u.id, email: u.email }));

    if (legacyUsers.length === 0) {
      results.steps.push('No legacy user accounts found to merge.');
    } else {
      // 3. Merge data from each legacy user
      for (const legUser of legacyUsers) {
        results.steps.push(`Merging records from legacy user ${legUser.email} (${legUser.id})...`);

        // Certificate merges
        const certUpdate = await prisma.certificate.updateMany({
          where: { userId: legUser.id },
          data: { userId: activeUser.id }
        });
        results.steps.push(`  Merged ${certUpdate.count} Certificate rows`);

        const issuedCertUpdate = await prisma.issuedCertificate.updateMany({
          where: { userId: legUser.id },
          data: { userId: activeUser.id }
        });
        results.steps.push(`  Merged ${issuedCertUpdate.count} IssuedCertificate rows`);

        const userCertUpdate = await prisma.userCertification.updateMany({
          where: { userId: legUser.id },
          data: { userId: activeUser.id }
        });
        results.steps.push(`  Merged ${userCertUpdate.count} UserCertification rows`);

        // Other record merges
        const enrollmentUpdate = await prisma.enrollment.updateMany({
          where: { userId: legUser.id },
          data: { userId: activeUser.id }
        });
        results.steps.push(`  Merged ${enrollmentUpdate.count} Enrollment rows`);

        // Rename legacy credentials to prevent email/username collisions
        const originalEmail = legUser.email;
        const newEmail = `${originalEmail.split('@')[0]}_legacy_${Date.now()}@legacy.tech`;
        await prisma.user.update({
          where: { id: legUser.id },
          data: { 
            email: newEmail,
            username: legUser.username ? `${legUser.username}_legacy_${Date.now()}` : null,
            enrollmentNumber: legUser.enrollmentNumber ? `${legUser.enrollmentNumber}_legacy_${Date.now()}` : null
          }
        });
        results.steps.push(`  Renamed legacy user email ${originalEmail} -> ${newEmail}`);
      }
    }

    // 4. Force onboarded status to true for the active user
    await prisma.user.update({
      where: { id: activeUser.id },
      data: { onboarded: true, onboardingStatus: 'COMPLETED' }
    });
    results.steps.push(`Set active user onboarded status to true.`);

    // 5. Rebuild snapshots for the active user's certificates (ensures correct styling & verification footer)
    const userCerts = await prisma.certificate.findMany({
      where: { userId: activeUser.id }
    });

    results.rebuiltSnapshotsCount = 0;
    for (const cert of userCerts) {
      try {
        const userRec = await prisma.user.findUnique({ where: { id: cert.userId } });
        if (userRec) {
          const dateStr = new Date(cert.issuedAt || cert.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '.');

          // Generate new HTML snapshot
          const htmlSnapshot = buildCertificateHtmlSnapshot({
            certificateNumber: cert.certificateNumber || cert.id,
            studentName: userRec.name || 'Student',
            courseName: cert.title,
            issueDate: dateStr,
            templateConfig: cert.metadata ? JSON.parse(JSON.stringify(cert.metadata)) : null
          });

          await prisma.certificate.update({
            where: { id: cert.id },
            data: { htmlSnapshot }
          });
          results.steps.push(`  Rebuilt htmlSnapshot for Certificate ID ${cert.id}`);
          results.rebuiltSnapshotsCount++;
        }
      } catch (snapErr: any) {
        results.steps.push(`  Error rebuilding snapshot for Cert ID ${cert.id}: ${snapErr.message}`);
      }
    }

    results.status = 'completed';
    results.success = true;
    return NextResponse.json(results);
  } catch (err: any) {
    console.error('Migration error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}
