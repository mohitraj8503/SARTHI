import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const id = 'TT-BIA-JUL26-001';
  
  const cert = await prisma.certificate.findFirst({
    where: {
      OR: [
        { id: id },
        { certificateNumber: id },
        { certificateId: id },
        { enrollmentId: id }
      ]
    },
    include: {
      user: { select: { name: true, email: true } }
    }
  });
  console.log('Verification lookup result:', JSON.stringify(cert, null, 2));

  const allCerts = await prisma.certificate.findMany();
  console.log('All Certificate IDs in DB:', allCerts.map(c => ({ id: c.id, num: c.certificateNumber, cid: c.certificateId })));
}

main().finally(() => prisma.$disconnect());
