export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/logger';

function isAuditPlaceholder(value: string) {
  return value === 'sample-id' || value === 'sample-slug' || value.startsWith('sample-');
}

export async function GET(request: Request) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    // Rate limit: 60 lookups per minute per IP
    const rateLimitResult = await checkRateLimit(`verify:${clientIp}`, 60, 60);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawId = searchParams.get('id');
    const id = rawId ? decodeURIComponent(rawId) : null;
    const rawEmail = searchParams.get('email');
    const email = rawEmail ? decodeURIComponent(rawEmail) : null;

    // 1. Email Lookup Mode
    if (email) {
      const emailLower = email.toLowerCase().trim();

      const AUTHORITATIVE_EMAIL_ROSTER: Record<string, { title: string; refId: string }> = {
        "ranjansingh.w@gmail.com":    { title: "Web Development Internship", refId: "TT-INT-2026-0001" },
        "nairjaanvi199@gmail.com":    { title: "Full Stack Web Development Internship", refId: "TT-INT-2026-0026" },
        "nandinikatiyar5@gmail.com":  { title: "Web Development Internship", refId: "TT-INT-2026-0038" },
        "ps859521@gmail.com":         { title: "Full Stack Web Development Internship", refId: "TT-INT-2026-0051" },
        "surjobanerjee207@gmail.com": { title: "Web Development Internship", refId: "TT-INT-2026-0060" },
        "kumarkeshav10320@gmail.com": { title: "Web Development Internship", refId: "TT-INT-2026-0062" },
        "keshavruhela25@gmail.com":   { title: "Web Development Internship", refId: "TT-INT-2026-0066" },
        "kumaritejal535@gmail.com":   { title: "Full Stack Web Development Internship", refId: "TT-INT-2026-0083" },
        "aniketdutta615@gmail.com":   { title: "Web Development Internship", refId: "TT-INT-2026-0086" },
        "nitinsinha062@gmail.com":   { title: "Full Stack Web Development Internship", refId: "TT-INT-2026-0128" },
        "harshnayan018@gmail.com":    { title: "Web Development Internship", refId: "TT-INT-2026-0150" },
      };

      const hasDb = !!process.env.DATABASE_URL;
      let user: any = null;
      if (hasDb) {
        try {
          user = await prisma.user.findFirst({ where: { email: emailLower } });
        } catch {}
      }

      if (!user && AUTHORITATIVE_EMAIL_ROSTER[emailLower]) {
        const match = AUTHORITATIVE_EMAIL_ROSTER[emailLower];
        return NextResponse.json({
          certificates: [{
            id: match.refId,
            title: match.title,
            date: '2026-08-20T00:00:00.000Z',
            type: 'internship',
            certificateNumber: match.refId
          }]
        });
      }

      if (!user) {
        return NextResponse.json({ certificates: [] });
      }

      const v2Certs = await prisma.issuedCertificate.findMany({
        where: { userId: user.id },
        include: { certification: { select: { title: true } } }
      });

      const legacyCerts = await prisma.userCertification.findMany({
        where: { userId: user.id },
        include: { certification: { select: { title: true } } }
      });

      const rawCourseCerts = await prisma.certificate.findMany({
        where: { userId: user.id }
      });

      const courseCerts = [];
      for (const c of rawCourseCerts) {
        let title = c.title || 'Course Certificate';
        if (c.courseId) {
          const course = await prisma.course.findUnique({
            where: { id: c.courseId },
            select: { title: true }
          }).catch(() => null);
          if (course) {
            title = course.title;
          } else {
            const certification = await prisma.certification.findUnique({
              where: { id: c.courseId },
              select: { title: true }
            }).catch(() => null);
            if (certification) {
              title = certification.title;
            }
          }
        }
        courseCerts.push({
          ...c,
          course: { title }
        });
      }

      const certificatesListRaw = [
        ...v2Certs.map(c => ({
          id: c.certificateHash || c.verificationId,
          title: c.certification?.title || 'Professional Certificate',
          date: c.issuedAt,
          type: 'v2',
          certificateNumber: c.verificationId
        })),
        ...legacyCerts.map(c => ({
          id: c.certNumber,
          title: c.certification?.title || 'Legacy Certificate',
          date: c.issuedAt,
          type: 'legacy',
          certificateNumber: c.certNumber
        })),
        ...courseCerts.map(c => ({
          id: c.certificateNumber,
          title: c.course?.title || 'Course Certificate',
          date: c.issuedAt,
          type: 'course',
          certificateNumber: c.certificateNumber
        }))
      ];

      // Deduplicate certificates by certificateNumber or id (preferring v2/legacy over course if duplicates exist)
      const uniqueCertsMap = new Map();
      certificatesListRaw.forEach(c => {
        const key = c.certificateNumber || c.id;
        if (key) {
          const trimmedKey = key.trim();
          if (!uniqueCertsMap.has(trimmedKey)) {
            uniqueCertsMap.set(trimmedKey, c);
          }
        }
      });
      let certificates = Array.from(uniqueCertsMap.values());

      if (certificates.length === 0 && AUTHORITATIVE_EMAIL_ROSTER[emailLower]) {
        const match = AUTHORITATIVE_EMAIL_ROSTER[emailLower];
        certificates = [{
          id: match.refId,
          title: match.title,
          date: new Date('2026-08-20'),
          type: 'internship',
          certificateNumber: match.refId
        }];
      }

      await logSecurityEvent({
        type: 'CERTIFICATE_EMAIL_SEARCH',
        ipAddress: clientIp,
        metadata: { email: emailLower, count: certificates.length }
      });

      return NextResponse.json({ certificates });
    }

    // 2. Single ID Verification Mode
    if (!id) {
      return NextResponse.json({ error: 'Certificate ID or Email required' }, { status: 400 });
    }

    // Direct mock response bypass for local testing
    if (isAuditPlaceholder(id)) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    const hasDb = !!process.env.DATABASE_URL;
    let certificate = null;

    if (hasDb) {
      try {
        // Query by ID (CUID) or Certificate Number or Certificate ID or Enrollment ID
        const baseCert = await prisma.certificate.findFirst({
          where: {
            OR: [
              { id: id },
              { certificateNumber: id },
              { certificateId: id },
              { enrollmentId: id }
            ],
          },
          include: {
            user: { select: { name: true, email: true } },
          },
        });

        if (baseCert) {
          if (baseCert.status !== 'VALID') {
            await logSecurityEvent({
              type: 'CERTIFICATE_VERIFY_LOCKED',
              ipAddress: clientIp,
              metadata: { id: baseCert.certificateNumber || baseCert.id, email: baseCert.user?.email }
            });
            return NextResponse.json({
              error: 'Payment verification required to view credential',
              paymentStatus: 'PENDING',
              status: 'LOCKED',
              id: baseCert.certificateNumber || baseCert.id,
              certificateNumber: baseCert.certificateNumber || baseCert.id
            }, { status: 403 });
          }

          // Safely resolve course or certification title if courseId exists
          let title = baseCert.title || "Professional Certification";
          if (baseCert.courseId && baseCert.courseId !== 'course_gen') {
            try {
              const courseObj = await prisma.course.findUnique({
                where: { id: baseCert.courseId },
                select: { title: true }
              });
              if (courseObj) {
                title = courseObj.title;
              } else {
                const certObj = await prisma.certification.findUnique({
                  where: { id: baseCert.courseId },
                  select: { title: true }
                });
                if (certObj) title = certObj.title;
              }
            } catch (e) {
              console.warn('Course/Certification lookup error during verification:', e);
            }
          }

          certificate = {
            ...baseCert,
            course: { title }
          };
        }

        if (!certificate) {
          const issuedCert = await prisma.issuedCertificate.findFirst({
            where: {
              OR: [{ id: id }, { verificationId: id }],
            },
            include: {
              user: { select: { name: true, email: true } },
              certification: { select: { title: true } },
            },
          });

          if (issuedCert) {
            const isPaid = issuedCert.paymentStatus === 'PAID' || 
              await prisma.certificationPayment.findFirst({
                where: {
                  userId: issuedCert.userId,
                  certificationId: issuedCert.certificationId,
                  status: "COMPLETED"
                }
              });

            if (!isPaid) {
              await logSecurityEvent({
                type: 'CERTIFICATE_VERIFY_LOCKED',
                ipAddress: clientIp,
                metadata: { id: issuedCert.verificationId, email: issuedCert.user.email }
              });
              return NextResponse.json({
                error: 'Payment verification required to view credential',
                paymentStatus: 'PENDING',
                status: 'LOCKED',
                id: issuedCert.verificationId,
                certificateNumber: issuedCert.verificationId
              }, { status: 403 });
            }

            await logSecurityEvent({
              type: 'CERTIFICATE_VERIFY_SUCCESS',
              ipAddress: clientIp,
              metadata: { id: issuedCert.verificationId, email: issuedCert.user.email }
            });
            return NextResponse.json({
              id: issuedCert.verificationId,
              certificateNumber: issuedCert.verificationId,
              status: issuedCert.status,
              paymentStatus: issuedCert.paymentStatus,
              paymentId: issuedCert.paymentId,
              amountPaid: issuedCert.amountPaid,
              paymentDate: issuedCert.paymentDate ? issuedCert.paymentDate.toISOString() : null,
              user: { name: issuedCert.user.name, email: issuedCert.user.email },
              course: { title: issuedCert.certification.title },
              createdAt: issuedCert.issuedAt.toISOString(),
              metadata: JSON.stringify({
                studentName: issuedCert.user.name,
                courseName: issuedCert.certification.title,
                studentId: issuedCert.userId,
              }),
            });
          }

          // Fallback to legacy userCertification table
          const legacyCert = await prisma.userCertification.findFirst({
            where: {
              OR: [{ id: id }, { certNumber: id }],
            },
            include: {
              user: { select: { name: true, email: true } },
              certification: { select: { title: true } },
            },
          });

          if (legacyCert) {
            const isPaid = await prisma.certificationPayment.findFirst({
              where: {
                userId: legacyCert.userId,
                certificationId: legacyCert.certificationId,
                status: "COMPLETED"
              }
            });

            if (!isPaid) {
              await logSecurityEvent({
                type: 'CERTIFICATE_VERIFY_LOCKED',
                ipAddress: clientIp,
                metadata: { id: legacyCert.certNumber, email: legacyCert.user.email }
              });
              return NextResponse.json({
                error: 'Payment verification required to view credential',
                paymentStatus: 'PENDING',
                status: 'LOCKED',
                id: legacyCert.certNumber,
                certificateNumber: legacyCert.certNumber
              }, { status: 403 });
            }

            await logSecurityEvent({
              type: 'CERTIFICATE_VERIFY_SUCCESS',
              ipAddress: clientIp,
              metadata: { id: legacyCert.certNumber, email: legacyCert.user.email }
            });
            return NextResponse.json({
              id: legacyCert.certNumber,
              certificateNumber: legacyCert.certNumber,
              status: legacyCert.status,
              paymentStatus: 'PAID',
              paymentId: null,
              amountPaid: 49.0,
              paymentDate: legacyCert.issuedAt.toISOString(),
              user: { name: legacyCert.user.name, email: legacyCert.user.email },
              course: { title: legacyCert.certification.title },
              createdAt: legacyCert.issuedAt.toISOString(),
              metadata: JSON.stringify({
                studentName: legacyCert.user.name,
                courseName: legacyCert.certification.title,
                studentId: legacyCert.userId,
              }),
            });
          }

          // Lookup in dedicated internship_certificates table (internship letters & awards)
          if (!certificate) {
            const internCert = await prisma.internshipCertificate.findFirst({
              where: {
                OR: [{ id: id }, { certificateNumber: id }],
              },
            });

            if (internCert) {
              let meta: any = {};
              try {
                meta = typeof internCert.metadata === 'string' ? JSON.parse(internCert.metadata) : (internCert.metadata || {});
              } catch {}

              const holderName = meta.recipientName || 'Verified Intern';
              const holderEmail = meta.recipientEmail || '';
              const progTitle = internCert.title || meta.internshipTrack || 'Internship Program';

              await logSecurityEvent({
                type: 'CERTIFICATE_VERIFY_SUCCESS',
                ipAddress: clientIp,
                metadata: { id: internCert.certificateNumber, email: holderEmail }
              });

              return NextResponse.json({
                id: internCert.certificateNumber,
                certificateNumber: internCert.certificateNumber,
                status: internCert.status,
                paymentStatus: 'PAID',
                paymentId: null,
                amountPaid: 0,
                paymentDate: internCert.issuedAt ? internCert.issuedAt.toISOString() : null,
                user: { name: holderName, email: holderEmail },
                course: { title: progTitle },
                createdAt: internCert.issuedAt ? internCert.issuedAt.toISOString() : internCert.createdAt.toISOString(),
                metadata: typeof internCert.metadata === 'string' ? internCert.metadata : JSON.stringify(meta),
              });
            }
          }
        }
      } catch (err) {
        console.error('Database connection failed during verification:', err);
        return NextResponse.json({ error: 'Database is offline or not configured' }, { status: 503 });
      }
    }

    if (!certificate) {
      await logSecurityEvent({
        type: 'CERTIFICATE_VERIFY_NOT_FOUND',
        ipAddress: clientIp,
        metadata: { id }
      });
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    if (certificate.status !== 'VALID') {
      await logSecurityEvent({
        type: 'CERTIFICATE_VERIFY_LOCKED',
        ipAddress: clientIp,
        metadata: { id: certificate.certificateNumber || certificate.id, status: certificate.status }
      });
      return NextResponse.json({
        error: 'Payment verification required to view credential',
        paymentStatus: 'PENDING',
        status: 'LOCKED',
        id: certificate.certificateNumber || certificate.id,
        certificateNumber: certificate.certificateNumber || certificate.id
      }, { status: 403 });
    }

    // Parse metadata if it exists
    const processedCertificate = { ...certificate };
    processedCertificate.paymentStatus = 'PAID';
    if (certificate.metadata && typeof certificate.metadata === 'string') {
      try {
        processedCertificate.metadata = JSON.parse(certificate.metadata);
      } catch (e) {
        console.error('Failed to parse metadata:', e);
      }
    }

    await logSecurityEvent({
      type: 'CERTIFICATE_VERIFY_SUCCESS',
      ipAddress: clientIp,
      metadata: { id: processedCertificate.certificateNumber || processedCertificate.id, email: processedCertificate.user?.email }
    });

    return NextResponse.json(processedCertificate);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

