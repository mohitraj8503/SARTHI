const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== CLEANUP SCRIPT ===');

    // 1. Remove the bogus "student_test@sarthi-woad.vercel.app" teacher account
    //    (SUSPENDED, no teacher ID - just a polluted record)
    const suspendedTeacher = await prisma.user.findUnique({
      where: { id: 'cmp9r818t000xtzswknjwsflh' },
      include: { teacher: true }
    });
    if (suspendedTeacher) {
      console.log('Removing suspended/empty teacher:', suspendedTeacher.email);
      // Remove teacher record first if exists
      if (suspendedTeacher.teacher) {
        await prisma.teacher.delete({ where: { userId: 'cmp9r818t000xtzswknjwsflh' } });
      }
      await prisma.user.update({
        where: { id: 'cmp9r818t000xtzswknjwsflh' },
        data: { role: 'STUDENT', status: 'ACTIVE' }
      });
      console.log('✅ Demoted student_test to STUDENT role');
    }

    // 2. Remove the instructor_mohit_raj fake seeded account
    const mohitFake = await prisma.user.findUnique({
      where: { id: 'instructor_mohit_raj' }
    });
    if (mohitFake) {
      console.log('Removing fake instructor_mohit_raj:', mohitFake.email);
      await prisma.user.delete({ where: { id: 'instructor_mohit_raj' } });
      console.log('✅ Deleted instructor_mohit_raj');
    }

    // 3. Delete the PENDING application (mohitraj8503@gmail.com) 
    //    that has no user linked and causes 404 when clicked
    const pendingApp = await prisma.teacherApplication.findUnique({
      where: { id: 'cmpjqfuah0004atrsexa8n7ob' }
    });
    if (pendingApp) {
      console.log('Deleting pending application:', pendingApp.email);
      // Delete education entries and documents first
      await prisma.educationEntry.deleteMany({ where: { applicationId: 'cmpjqfuah0004atrsexa8n7ob' } });
      await prisma.teacherDocument.deleteMany({ where: { applicationId: 'cmpjqfuah0004atrsexa8n7ob' } });
      await prisma.teacherApplication.delete({ where: { id: 'cmpjqfuah0004atrsexa8n7ob' } });
      console.log('✅ Deleted pending application cmpjqfuah0004atrsexa8n7ob');
    }

    // 4. Fix the APPROVED application (mohitraj8503.edu@gmail.com) 
    //    that has no userId - link it to the actual user
    const approvedApp = await prisma.teacherApplication.findUnique({
      where: { id: 'cmoxu90yu0004iq7doy5g7rdt' }
    });
    const mohitEduUser = await prisma.user.findUnique({
      where: { email: 'mohitraj8503.edu@gmail.com' }
    });
    if (approvedApp && mohitEduUser && !approvedApp.userId) {
      console.log('Linking approved application to user:', mohitEduUser.id);
      await prisma.teacherApplication.update({
        where: { id: 'cmoxu90yu0004iq7doy5g7rdt' },
        data: { userId: mohitEduUser.id }
      });
      console.log('✅ Linked approved application to mohitraj8503.edu@gmail.com user');
    }

    // 5. Verify final state
    console.log('\n=== FINAL STATE ===');
    const finalTeachers = await prisma.user.findMany({
      where: { role: { in: ['TEACHER', 'INSTRUCTOR', 'MENTOR'] } },
      include: { teacher: true }
    });
    finalTeachers.forEach(t => {
      console.log(`✅ ID: ${t.id} | Email: ${t.email} | Role: ${t.role} | TeacherId: ${t.teacher?.teacherId}`);
    });

    const finalApps = await prisma.teacherApplication.findMany({
      select: { id: true, email: true, status: true, userId: true }
    });
    console.log('\n=== FINAL APPLICATIONS ===');
    finalApps.forEach(a => console.log(`AppID: ${a.id} | Email: ${a.email} | Status: ${a.status} | UserId: ${a.userId}`));

  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
