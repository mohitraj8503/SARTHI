import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { sendTransactionalEmail } from '../lib/email/send';
import { templates } from '../lib/email';

async function main() {
  console.log('=== Step 1: Deleting SARTHI Originals ===');
  
  const originalsUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: 'instructor_mohit_raj' },
        { email: 'instructor_mohit_raj@sarthi-woad.vercel.app' },
        { name: 'SARTHI Originals' },
      ],
    },
  });

  if (originalsUser) {
    console.log(`Found SARTHI Originals user (${originalsUser.id}). Reassiging courses...`);
    
    // Find Mohit Raj's main instructor user account to reassign courses to
    const primaryTeacher = await prisma.user.findFirst({
      where: {
        email: { in: ['mohitraj8503.edu@gmail.com', 'mohitraj8503@gmail.com'] },
      },
    });

    if (primaryTeacher) {
      console.log(`Reassigning courses from ${originalsUser.id} to ${primaryTeacher.id}...`);
      await prisma.course.updateMany({
        where: { instructorId: originalsUser.id },
        data: { instructorId: primaryTeacher.id },
      });
    }

    // Delete Teacher profile if exists
    await prisma.teacher.deleteMany({
      where: { userId: originalsUser.id },
    });

    // Delete User record
    await prisma.user.delete({
      where: { id: originalsUser.id },
    });

    console.log('✓ Successfully deleted SARTHI Originals account!');
  } else {
    console.log('SARTHI Originals account not found or already deleted.');
  }

  console.log('\n=== Step 2: Approving Rajat Choudhury & Sending HTML Email ===');

  const rajat = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'rajatchoudhury5@gmail.com' },
        { name: { contains: 'Rajat' } },
      ],
    },
  });

  if (!rajat) {
    console.error('Rajat Choudhury user account not found!');
    process.exit(1);
  }

  const tempPassword = 'Rajat@TT2026!';
  const hashedPassword = await bcrypt.hash(tempPassword, 12);
  const facultyId = 'TT-FAC-0003';

  // Update Rajat's user record
  const updatedRajat = await prisma.user.update({
    where: { id: rajat.id },
    data: {
      role: 'TEACHER',
      status: 'VERIFIED',
      emailVerified: new Date(),
      password: hashedPassword,
      tempPassword: tempPassword,
      requiresPasswordChange: true,
      onboardingStatus: 'PENDING',
    },
  });

  // Upsert Teacher profile
  const teacherProfile = await prisma.teacher.upsert({
    where: { userId: rajat.id },
    update: {
      status: 'verified',
      teacherId: facultyId,
      teacherEmail: rajat.email,
      canCreateCourses: true,
      title: 'Instructor',
    },
    create: {
      userId: rajat.id,
      status: 'verified',
      teacherId: facultyId,
      teacherEmail: rajat.email,
      canCreateCourses: true,
      title: 'Instructor',
    },
  });

  console.log(`✓ Approved Rajat Choudhury (${updatedRajat.email}) as TEACHER with Faculty ID ${facultyId}`);

  // Send HTML Email to Rajat
  const emailTemplate = templates.teacherAccountReady(
    updatedRajat.name || 'Rajat Choudhury',
    updatedRajat.email,
    tempPassword,
    facultyId,
    'setup_token_rajat_2026'
  );

  console.log(`Sending HTML email with credentials to ${updatedRajat.email}...`);

  const emailRes = await sendTransactionalEmail({
    to: updatedRajat.email,
    cc: 'mohitraj8503@gmail.com',
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    type: 'application',
  });

  console.log('✓ Email delivery result:', emailRes);
}

main()
  .catch((err) => {
    console.error('Script error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
