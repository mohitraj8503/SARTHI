import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const certId = 'TT-BIA-JUL26-001';
  const newTitle = 'Best Intern of the Month - July 2026 Award';

  const cert = await prisma.certificate.findFirst({
    where: { certificateNumber: certId }
  });

  if (cert) {
    let metadataObj: any = {};
    try {
      metadataObj = JSON.parse(cert.metadata || '{}');
    } catch (e) {}

    metadataObj.course_name = newTitle;
    metadataObj.user_name = 'Kumari Tejal';
    metadataObj.badge_title = 'BEST INTERN OF THE MONTH';

    metadataObj.templateConfig = {
      mainTitle: 'BEST INTERN OF THE MONTH',
      subTitle: '',
      certifiesText: 'THIS AWARD IS PRESENTED TO',
      courseName: 'Outstanding Performance',
      specialization: 'Outstanding Performance',
      descriptionText: 'This award proudly recognizes your exceptional performance, leadership, innovation, and unwavering dedication throughout July 2026. Your remarkable contributions and commitment to excellence have earned you the title of Best Intern of the Month at SARTHI.',
      brandName: 'SARTHI',
      tagline: 'INNOVATE TODAY',
      directorName: 'Dr. Mukul Pandey',
      directorTitle: 'CEO & FOUNDER',
      bgImage: '/certificate-bg.png'
    };

    await prisma.certificate.update({
      where: { id: cert.id },
      data: {
        title: newTitle,
        metadata: JSON.stringify(metadataObj)
      }
    });

    console.log(`✅ Successfully updated full templateConfig for ${certId}!`);
  }
}

main().finally(() => prisma.$disconnect());
