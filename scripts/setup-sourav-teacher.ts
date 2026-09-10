import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'souravroy00458@gmail.com';
  const name = 'Sourav Roy';
  const tempPassword = 'TT-FAC-Sourav#2026';
  const hashedPassword = await bcrypt.hash(tempPassword, 12);
  const facultyId = 'TT-FAC-0002'; // Specific ID requested in the letter

  console.log('=== Step 1: Handling potential Faculty ID conflict ===');
  // Check if there is another teacher using TT-FAC-0002
  const conflictingTeacher = await prisma.teacher.findUnique({
    where: { teacherId: facultyId },
  });

  if (conflictingTeacher) {
    console.log(`Found conflicting teacher profile with ID ${facultyId} (User ID: ${conflictingTeacher.userId}).`);
    // Find the next available faculty ID or assign a new unique one like TT-FAC-0006
    const nextFacultyId = 'TT-FAC-0006';
    await prisma.teacher.update({
      where: { id: conflictingTeacher.id },
      data: { teacherId: nextFacultyId },
    });
    console.log(`✓ Updated conflicting teacher's Faculty ID to ${nextFacultyId}`);
  }

  console.log('\n=== Step 2: Creating or Updating Sourav Roy User Account ===');
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  let user;
  if (existingUser) {
    user = await prisma.user.update({
      where: { email },
      data: {
        name,
        role: 'TEACHER',
        status: 'ACTIVE',
        emailVerified: existingUser.emailVerified || new Date(),
        password: hashedPassword,
        tempPassword: tempPassword,
        requiresPasswordChange: true,
        onboardingStatus: 'PENDING',
      },
    });
    console.log('✓ Updated existing User account to TEACHER.');
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name,
        role: 'TEACHER',
        status: 'ACTIVE',
        emailVerified: new Date(),
        password: hashedPassword,
        tempPassword: tempPassword,
        requiresPasswordChange: true,
        onboardingStatus: 'PENDING',
      },
    });
    console.log('✓ Created new User account as TEACHER.');
  }

  console.log('\n=== Step 3: Upserting Teacher Profile for Sourav Roy ===');
  const teacherProfile = await prisma.teacher.upsert({
    where: { userId: user.id },
    update: {
      status: 'verified',
      teacherId: facultyId,
      teacherEmail: email,
      canCreateCourses: true,
      title: 'Instructor',
    },
    create: {
      userId: user.id,
      status: 'verified',
      teacherId: facultyId,
      teacherEmail: email,
      canCreateCourses: true,
      title: 'Instructor',
    },
  });

  console.log('✓ Teacher profile upserted successfully:');
  console.log(JSON.stringify(teacherProfile, null, 2));

  console.log('\n=== Verification ===');
  const isMatch = await bcrypt.compare(tempPassword, user.password!);
  console.log({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    teacherId: teacherProfile.teacherId,
    passwordMatch: isMatch,
  });
}

main()
  .catch((e) => {
    console.error('Error during setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
