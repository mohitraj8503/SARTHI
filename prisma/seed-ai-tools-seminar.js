const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Ensure Mohit Raj TEACHER account exists
  let instructor = await prisma.user.findUnique({
    where: { id: 'instructor_mohit_raj' }
  });

  if (!instructor) {
    instructor = await prisma.user.upsert({
      where: { email: 'mohit.raj@sarthi-woad.vercel.app' },
      update: {
        name: 'Mohit Raj',
        role: 'TEACHER',
      },
      create: {
        id: 'instructor_mohit_raj',
        name: 'Mohit Raj',
        email: 'mohit.raj@sarthi-woad.vercel.app',
        role: 'TEACHER',
      }
    });
  }

  const slug = 'ai-tools-every-student-must-master-2026';
  // Yesterday 8:00 PM IST (2026-08-09 20:00 IST)
  const yesterday8PM = new Date('2026-08-09T20:00:00+05:30');

  const seminar = await prisma.seminar.upsert({
    where: { slug },
    update: {
      title: 'AI Tools Every Student Must Master in 2026',
      description: `Don't Graduate Without These AI Skills.\n\nArtificial Intelligence is changing how students learn, build projects, prepare for interviews, and secure internships. In this live seminar, you'll discover the most powerful AI tools that every student should master in 2026.\n\n📚 What You'll Learn\n\n✅ ChatGPT for studying & productivity\n✅ Claude for research & writing\n✅ Gemini for learning & coding\n✅ GitHub Copilot for programming\n✅ Cursor AI for AI-powered development\n✅ Canva AI for presentations & design\n✅ Notion AI for notes & organization\n✅ Perplexity AI for accurate research\n\n🎯 Perfect For\nCollege Students, Engineering Students, Beginners, Developers, AI Enthusiasts, Job & Internship Aspirants\n\n💼 Why Attend?\n✔ Learn industry-standard AI tools\n✔ Save hours every week\n✔ Improve productivity and learning\n✔ Build future-ready skills\n✔ Get a roadmap to become AI-ready in 2026\n\n🎓 Don't let your competitors learn these tools before you. Reserve your seat today!`,
      speakerName: 'Mohit Raj',
      speakerBio: 'Expert DevOps Engineer & AI Educator. Specialized in software configuration management, CI/CD pipelines, and microservices architecture. Guiding next-gen engineers at SARTHI.',
      date: yesterday8PM,
      price: 499,
      maxAttendees: 500,
      category: 'Artificial Intelligence',
      level: 'BEGINNER',
      tags: JSON.stringify([
        'AI Tools for Students', 'AI Seminar 2026', 'ChatGPT Workshop',
        'Best AI Tools', 'AI for College Students', 'AI Productivity',
        'GitHub Copilot', 'Cursor AI', 'Claude AI', 'Gemini AI',
        'Canva AI', 'Notion AI', 'AI Workshop', 'SARTHI AI Seminar',
        'AI Career Skills', 'AI Learning', 'Artificial Intelligence for Beginners',
        'AI Training 2026', 'Student Productivity AI', 'AI Education'
      ]),
      isPrivate: false,
      isLive: false,
      status: 'ENDED',
      registrationRequired: false,
      thumbnailUrl: '/seminar-thumbnails/ai-tools-every-student-must-master-2026.jpg',
      thumbnail: '/seminar-thumbnails/ai-tools-every-student-must-master-2026.jpg',
      instructorId: instructor.id,
      endedAt: new Date('2026-08-09T21:30:00+05:30'),
    },
    create: {
      slug,
      title: 'AI Tools Every Student Must Master in 2026',
      description: `Don't Graduate Without These AI Skills.\n\nArtificial Intelligence is changing how students learn, build projects, prepare for interviews, and secure internships. In this live seminar, you'll discover the most powerful AI tools that every student should master in 2026.\n\n📚 What You'll Learn\n\n✅ ChatGPT for studying & productivity\n✅ Claude for research & writing\n✅ Gemini for learning & coding\n✅ GitHub Copilot for programming\n✅ Cursor AI for AI-powered development\n✅ Canva AI for presentations & design\n✅ Notion AI for notes & organization\n✅ Perplexity AI for accurate research\n\n🎯 Perfect For\nCollege Students, Engineering Students, Beginners, Developers, AI Enthusiasts, Job & Internship Aspirants\n\n💼 Why Attend?\n✔ Learn industry-standard AI tools\n✔ Save hours every week\n✔ Improve productivity and learning\n✔ Build future-ready skills\n✔ Get a roadmap to become AI-ready in 2026\n\n🎓 Don't let your competitors learn these tools before you. Reserve your seat today!`,
      speakerName: 'Mohit Raj',
      speakerBio: 'Expert DevOps Engineer & AI Educator. Specialized in software configuration management, CI/CD pipelines, and microservices architecture. Guiding next-gen engineers at SARTHI.',
      date: yesterday8PM,
      duration: 90,
      durationMinutes: 90,
      price: 499,
      maxAttendees: 500,
      category: 'Artificial Intelligence',
      level: 'BEGINNER',
      tags: JSON.stringify([
        'AI Tools for Students', 'AI Seminar 2026', 'ChatGPT Workshop',
        'Best AI Tools', 'AI for College Students', 'AI Productivity',
        'GitHub Copilot', 'Cursor AI', 'Claude AI', 'Gemini AI',
        'Canva AI', 'Notion AI', 'AI Workshop', 'SARTHI AI Seminar',
        'AI Career Skills', 'AI Learning', 'Artificial Intelligence for Beginners',
        'AI Training 2026', 'Student Productivity AI', 'AI Education'
      ]),
      isPrivate: false,
      isLive: false,
      status: 'ENDED',
      registrationRequired: false,
      thumbnailUrl: '/seminar-thumbnails/ai-tools-every-student-must-master-2026.jpg',
      thumbnail: '/seminar-thumbnails/ai-tools-every-student-must-master-2026.jpg',
      instructorId: instructor.id,
      endedAt: new Date('2026-08-09T21:30:00+05:30'),
    }
  });

  console.log('✅ AI Tools Seminar marked COMPLETED/ENDED successfully!');
  console.log('   ID:', seminar.id);
  console.log('   Slug:', seminar.slug);
  console.log('   Title:', seminar.title);
  console.log('   Status:', seminar.status);
  console.log('   Date:', seminar.date);
  console.log('   Registration Closed.');
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

