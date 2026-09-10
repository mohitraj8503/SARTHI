const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      name: { contains: 'Aakash' }
    }
  });
  console.log("Aakash User:", user);

  if (user) {
    const certs = await prisma.certificate.findMany({
      where: { userId: user.id }
    });
    console.log("Aakash Certificates:", certs);
    const issuedCerts = await prisma.issuedCertificate.findMany({
      where: { userId: user.id }
    });
    console.log("Aakash IssuedCertificates:", issuedCerts);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
