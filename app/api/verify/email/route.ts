export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
 
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");
 
        if (!email) {
            return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
        }
 
        const normalizedEmail = email.trim().toLowerCase();
 
        // 1. Fetch UserCertification
        const userCerts = await prisma.userCertification.findMany({
            where: { user: { email: normalizedEmail } },
            include: {
                user: { select: { name: true, email: true } },
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
 
        // 2. Fetch IssuedCertificate (v2)
        const issuedCerts = await prisma.issuedCertificate.findMany({
            where: { user: { email: normalizedEmail } },
            include: {
                user: { select: { name: true, email: true } },
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
 
        // 3. Fetch Course Certificate
        const courseCerts = await prisma.certificate.findMany({
            where: { user: { email: normalizedEmail } },
            include: {
                user: { select: { name: true, email: true } },
                course: {
                    select: { 
                        title: true
                    }
                }
            },
            orderBy: { issuedAt: "desc" }
        });
 
        // Combine and map
        const allCertificates = [
            ...userCerts.map((c: any) => ({
                id: c.certNumber || c.id,
                title: c.certification?.title || "Professional Certification",
                recipientName: c.user?.name || "Student",
                email: c.user?.email || normalizedEmail,
                issuedAt: c.issuedAt,
                status: c.status || "VALID",
                authority: "SARTHI"
            })),
            ...issuedCerts.map((c: any) => ({
                id: c.certificateHash || c.verificationId || c.id,
                title: c.certification?.title || "Professional Certification",
                recipientName: c.user?.name || "Student",
                email: c.user?.email || normalizedEmail,
                issuedAt: c.issuedAt,
                status: c.status || "VALID",
                authority: "SARTHI"
            })),
            ...courseCerts.map((c: any) => ({
                id: c.certificateHash || c.certificateNumber || c.id,
                title: c.course?.title || "Professional Certification",
                recipientName: c.user?.name || "Student",
                email: c.user?.email || normalizedEmail,
                issuedAt: c.issuedAt,
                status: c.status || "VALID",
                authority: "SARTHI"
            }))
        ];
 
        return NextResponse.json(allCertificates);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
