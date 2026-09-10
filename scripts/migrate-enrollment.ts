import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateEnrollmentNumber(role: string, seq: number) {
  const year = new Date().getFullYear().toString();
  let roleCode = role.toUpperCase() === 'TEACHER' || role.toUpperCase() === 'ADMIN' ? 'TCH' : 'STU';
  const paddedSeq = seq.toString().padStart(4, '0');
  return `TT-${roleCode}-${year}-${paddedSeq}`;
}

async function migrate() {
  console.log('🚀 Starting enrollment number migration (Enterprise V2)...');

  // 1. Find all users (we check everyone to ensure consistency)
  const users = await prisma.user.findMany({
    where: {
      status: { not: 'DELETED' }
    }
  });

  console.log(`Analyzing ${users.length} users...`);

  const roles = ['STUDENT', 'TEACHER', 'ADMIN'];
  
  for (const role of roles) {
    // Filter users who need a new ID:
    // - ID is null/empty
    // - ID doesn't start with TT-
    // - ID uses old 2-digit year (e.g. TT-STU-26-)
    const roleUsers = users.filter(u => {
        const r = u.role === 'ADMIN' ? 'TEACHER' : u.role; // Group ADMIN with TCH
        if (r !== role && !(role === 'TEACHER' && u.role === 'ADMIN')) return false;
        
        if (!u.enrollmentNumber) return true;
        if (!u.enrollmentNumber.startsWith('TT-')) return true;
        if (u.enrollmentNumber.split('-')[2]?.length === 2) return true; // Old YY format
        return false;
    });

    if (roleUsers.length === 0) {
        console.log(`ℹ️ All ${role}s already have valid structured IDs.`);
        continue;
    }

    console.log(`Migrating ${roleUsers.length} ${role}s to the new format...`);

    const year = new Date().getFullYear().toString();
    const roleCode = (role === 'TEACHER' || role === 'ADMIN') ? 'TCH' : 'STU';
    const counterId = `enrollment_${year}_${roleCode}`;
    
    let currentCounter = await prisma.systemCounter.findUnique({
      where: { id: counterId }
    });

    let seq = currentCounter?.seq || 0;

    for (const user of roleUsers) {
      seq++;
      const enrollmentNumber = await generateEnrollmentNumber(role, seq);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { enrollmentNumber }
      });
      
      console.log(`✅ Refined ID: ${user.enrollmentNumber || 'NONE'} -> ${enrollmentNumber} (${user.email})`);
    }

    // Update the counter in DB
    await prisma.systemCounter.upsert({
      where: { id: counterId },
      update: { seq: seq },
      create: { id: counterId, seq: seq }
    });
  }

  console.log('✨ Enterprise ID Migration complete!');
}

migrate()
  .catch(e => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
