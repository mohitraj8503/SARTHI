const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Mohit Raj — TEACHER account
  const instructor = await prisma.user.findUnique({
    where: { id: 'instructor_mohit_raj' }
  });

  if (!instructor) {
    console.error('Mohit Raj TEACHER account not found');
    return;
  }

  const slug = 'resume-linkedin-portfolio-gets-you-hired';

  const seminar = await prisma.seminar.upsert({
    where: { slug },
    update: {
      title: 'Resume, LinkedIn & Portfolio That Gets You Hired 💼',
      description: `Stand Out. Get Hired.\n\nIn this live masterclass, you'll discover how to build an industry-standard resume, optimize your LinkedIn profile for recruiters, and showcase a project portfolio that gets you high-paying jobs and internships.\n\n📚 What You'll Learn\n\n✅ Resume building secrets that beat the ATS\n✅ LinkedIn profile optimization for inbound recruiters\n✅ Designing a portfolio that showcases real impact\n✅ Cold emailing and networking strategies that work\n\n🎯 Perfect For\nCollege Students, Job Seekers, Freshers, Developers, Career Switchers\n\n💼 Why Attend?\n✔ Stand out from the crowd\n✔ Attract top recruiters directly\n✔ Showcase your projects effectively\n✔ Build a personal brand\n\n🎓 Reserve your seat today to start getting interview calls!`,
      speakerName: 'Mohit Raj',
      speakerBio: 'Expert DevOps Engineer & Educator. Specialized in software configuration management, CI/CD pipelines, and microservices architecture. Guiding next-gen engineers at SARTHI.',
      price: 499,
      maxAttendees: 500,
      category: 'Career Guidance',
      level: 'BEGINNER',
      tags: JSON.stringify([
        'Resume Building', 'LinkedIn Optimization', 'Developer Portfolio',
        'Get Hired', 'Interview Prep', 'Career Seminar 2026',
        'SARTHI Career Series'
      ]),
      isPrivate: false,
      status: 'PUBLISHED',
      registrationRequired: true,
      thumbnailUrl: '/seminar-thumbnails/resume-linkedin-portfolio.png'
    },
    create: {
      slug,
      title: 'Resume, LinkedIn & Portfolio That Gets You Hired 💼',
      description: `Stand Out. Get Hired.\n\nIn this live masterclass, you'll discover how to build an industry-standard resume, optimize your LinkedIn profile for recruiters, and showcase a project portfolio that gets you high-paying jobs and internships.\n\n📚 What You'll Learn\n\n✅ Resume building secrets that beat the ATS\n✅ LinkedIn profile optimization for inbound recruiters\n✅ Designing a portfolio that showcases real impact\n✅ Cold emailing and networking strategies that work\n\n🎯 Perfect For\nCollege Students, Job Seekers, Freshers, Developers, Career Switchers\n\n💼 Why Attend?\n✔ Stand out from the crowd\n✔ Attract top recruiters directly\n✔ Showcase your projects effectively\n✔ Build a personal brand\n\n🎓 Reserve your seat today to start getting interview calls!`,
      speakerName: 'Mohit Raj',
      speakerBio: 'Expert DevOps Engineer & Educator. Specialized in software configuration management, CI/CD pipelines, and microservices architecture. Guiding next-gen engineers at SARTHI.',
      date: new Date('1970-01-01'), // Coming Soon
      duration: 90,
      durationMinutes: 90,
      price: 499,
      maxAttendees: 500,
      category: 'Career Guidance',
      level: 'BEGINNER',
      tags: JSON.stringify([
        'Resume Building', 'LinkedIn Optimization', 'Developer Portfolio',
        'Get Hired', 'Interview Prep', 'Career Seminar 2026',
        'SARTHI Career Series'
      ]),
      isPrivate: false,
      isLive: false,
      status: 'PUBLISHED',
      registrationRequired: true,
      instructorId: instructor.id,
      thumbnailUrl: '/seminar-thumbnails/resume-linkedin-portfolio.png'
    }
  });

  console.log('✅ Resume/LinkedIn Seminar created/updated successfully!');
  console.log('   ID:', seminar.id);
  console.log('   Slug:', seminar.slug);
  console.log('   Title:', seminar.title);
  console.log('   URL: /seminars/' + seminar.slug);
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
