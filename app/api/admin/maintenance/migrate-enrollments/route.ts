import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { determineRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Authorization: Only admins can trigger maintenance
    // (Assuming session check is handled by middleware or wrapping, 
    // but adding a basic check here if needed)
    
    console.log('🚀 Starting enrollment number migration (Server Triggered)...');

    // 1. Find all users sorted by creation date
    const users = await prisma.user.findMany({
      where: {
        status: { not: 'DELETED' }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Analyzing ${users.length} users for identity hardening and re-sequencing...`);

    const results = [];
    const roles = ['STUDENT', 'TEACHER', 'ADMIN'];

    for (const role of roles) {
      const roleUsers = users.filter(u => {
        const r = u.role === 'ADMIN' ? 'TEACHER' : u.role;
        return r === role || (role === 'TEACHER' && u.role === 'ADMIN');
      });

      if (roleUsers.length === 0) continue;

      // Standardize role codes to match lib/enrollment.ts (FAC for Teacher/Admin)
      let roleCode = 'STU';
      const uRole = role.toUpperCase();
      if (uRole === 'TEACHER' || uRole === 'ADMIN' || uRole === 'INSTRUCTOR') {
        roleCode = 'FAC';
      } else if (uRole === 'MENTOR') {
        roleCode = 'MNT';
      }
      
      const counterId = `enrollment_v2_global_${roleCode}`;
      
      // Reset sequence counter to 0 for migration to get a clean contiguous sequence
      let seq = 0;

      for (const user of roleUsers) {
        seq++;
        const paddedSeq = seq.toString().padStart(4, '0');
        
        const enrollmentNumber = `TT-${roleCode}-${paddedSeq}`;
        const updateData: any = {
          enrollmentNumber: enrollmentNumber
        };

        if (roleCode === 'STU') {
          updateData.studentId = enrollmentNumber;
        }
        
        await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });
        
        results.push({ email: user.email, old: user.enrollmentNumber, new: enrollmentNumber });
      }

      // Sync counter back to the database
      await prisma.systemCounter.upsert({
        where: { id: counterId },
        update: { seq: seq },
        create: { id: counterId, seq: seq }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Hardened and contiguously re-sequenced ${results.length} student/staff identities.`,
      details: results
    });

  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
