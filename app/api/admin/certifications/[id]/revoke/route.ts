export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const admin = user!;

    const { id } = await params;

    // We don't know the type of certificate, so try updating in all three models
    let revoked = false;

    // 1. Professional Certification V2
    try {
      const issuedCert = await prisma.issuedCertificate.findUnique({ where: { verificationId: id } });
      if (issuedCert) {
        await prisma.issuedCertificate.update({
          where: { verificationId: id },
          data: { status: 'REVOKED' } as any // Handle TS strictness if status is enum
        });
        revoked = true;
      }
    } catch (e) {}

    // 2. Legacy Professional Certification
    try {
      if (!revoked) {
        const profCert = await prisma.userCertification.findUnique({ where: { certNumber: id } });
        if (profCert) {
          await prisma.userCertification.update({
            where: { certNumber: id },
            data: { status: 'REVOKED' } as any
          });
          revoked = true;
        }
      }
    } catch (e) {}

    // 3. Standard Course Certificate
    try {
      if (!revoked) {
        const cert = await prisma.certificate.findUnique({ where: { certificateNumber: id } });
        if (cert) {
          await prisma.certificate.update({
            where: { certificateNumber: id },
            data: { status: 'REVOKED' }
          });
          revoked = true;
        }
      }
    } catch (e) {}

    if (!revoked) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Log the revocation event
    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'revoke_certificate',
      entityType: 'CERTIFICATE',
      entityId: id,
      entityName: id,
      changes: { status: 'REVOKED' }
    });

    return NextResponse.json({ success: true, message: 'Certificate revoked successfully' });
  } catch (error) {
    console.error('Revocation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
