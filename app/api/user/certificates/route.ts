export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const userCerts = await prisma.userCertification.findMany({
            where: { userId: user.id },
            include: {
                certification: {
                    select: { 
                        title: true, 
                        thumbnail: true, 
                        description: true 
                    }
                }
            },
            orderBy: { issuedAt: "desc" }
        });

        const v2Certs = await prisma.issuedCertificate.findMany({
            where: { userId: user.id },
            include: {
                certification: {
                    select: {
                        title: true,
                        thumbnail: true,
                        description: true
                    }
                }
            },
            orderBy: { issuedAt: "desc" }
        });

        const studioCerts = await prisma.certificate.findMany({
            where: { userId: user.id },
            include: {
                course: {
                    select: {
                        title: true,
                        thumbnail: true,
                        description: true
                    }
                }
            },
            orderBy: { issuedAt: "desc" }
        });

        // Normalize v2 into the same format
        const normalizedV2 = v2Certs.map(c => ({
            id: c.id,
            userId: c.userId,
            certificationId: c.certificationId,
            certNumber: c.verificationId,
            verificationId: c.verificationId,
            issuedAt: c.issuedAt,
            status: c.status,
            certificateHash: c.certificateHash,
            htmlSnapshot: (c as any).htmlSnapshot || null,
            imageUrl: (c as any).imageUrl || null,
            pdfUrl: (c as any).pdfUrl || null,
            certification: c.certification,
            userName: user.name || 'Student'
        }));

        // Normalize studio certificates into the same format
        const normalizedStudio = studioCerts.map(c => {
            let meta: any = {};
            try {
                if (c.metadata) meta = JSON.parse(c.metadata);
            } catch (e) {}

            const certTitle = c.title || meta.course_name || c.course?.title || 'Professional Certification';
            const verificationId = c.certificateId || c.certificateNumber || c.id;

            return {
                id: c.id,
                userId: c.userId,
                certificationId: c.courseId || c.id,
                certNumber: verificationId,
                verificationId: verificationId,
                title: certTitle,
                issuedAt: c.issuedAt,
                status: c.status || 'VERIFIED',
                certificateHash: c.certificateHash,
                htmlSnapshot: (c as any).htmlSnapshot || null,
                imageUrl: (c as any).imageUrl || null,
                pdfUrl: (c as any).pdfUrl || null,
                type: meta.type || 'Professional Certification',
                isExam: meta.isExam || false,
                templateConfig: meta.templateConfig || null,
                userName: meta.user_name || user.name || 'Student',
                metadata: c.metadata,
                certification: {
                    title: certTitle,
                    thumbnail: c.course?.thumbnail || null,
                    description: c.course?.description || null
                }
            };
        });

        // The legacy tables can mirror the very same issuance.  Do not expose
        // multiple cards for one verification ID; prefer the Studio row because
        // it owns the immutable HTML/image/PDF snapshot.
        const merged = [...normalizedStudio, ...normalizedV2, ...userCerts];
        const byVerificationId = new Map<string, any>();
        for (const certificate of merged) {
            const verificationId = certificate.verificationId || certificate.certNumber || certificate.id;
            const current = byVerificationId.get(verificationId);
            const hasStudioSnapshot = !!certificate.htmlSnapshot || !!certificate.imageUrl;
            const currentHasSnapshot = !!current?.htmlSnapshot || !!current?.imageUrl;
            if (!current || (hasStudioSnapshot && !currentHasSnapshot)) {
                byVerificationId.set(verificationId, certificate);
            }
        }

        const certificates = Array.from(byVerificationId.values()).sort(
            (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
        );

        return NextResponse.json(certificates);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
