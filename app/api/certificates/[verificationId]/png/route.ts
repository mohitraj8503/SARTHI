import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCertificateHtmlSnapshot } from '@/lib/certificate/captureCertificateSnapshot';


export const dynamic = 'force-dynamic';

/**
 * GET /api/certificates/[verificationId]/png
 *
 * Renders the stored htmlSnapshot for a certificate using Playwright (server-side,
 * no CORS constraints) and streams back a PNG file download.
 *
 * The htmlSnapshot is patched before rendering to force the certificate card
 * to be fully-opaque white (matching the PDF print output) by replacing the
 * screen-mode rgba background and removing backdrop-filter.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ verificationId: string }> },
) {
  const { verificationId } = await params;

  // ── 1. Dynamically construct/fetch the htmlSnapshot ────────────────────────
  const htmlSnapshot = await getCertificateHtmlSnapshot(verificationId);
  if (!htmlSnapshot) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }

  // Resolve user name for filename
  let studentName = 'certificate';
  const cert = await prisma.issuedCertificate.findUnique({
    where: { verificationId },
    select: { user: { select: { name: true } } },
  });
  if (cert?.user?.name) {
    studentName = cert.user.name;
  } else {
    const fallbackCert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateNumber: verificationId },
          { certificateId: verificationId }
        ]
      },
      select: { user: { select: { name: true } } }
    });
    if (fallbackCert?.user?.name) {
      studentName = fallbackCert.user.name;
    }
  }

  // ── 2. Patch the snapshot HTML to match PDF opacity ────────────────────────
  // Inject a <style> block just before </head> that overrides the card to be
  // fully opaque. This matches both .certificate-card and .cert-card classes.
  const opacityOverride = `
    <style id="png-override">
      .certificate-card,
      .cert-card,
      [class*="certificate-card"],
      [class*="cert-card"] {
        background: #ffffff !important;
        background-color: #ffffff !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        opacity: 1 !important;
      }
    </style>
  `;
  const patchedSnapshot = htmlSnapshot.replace(
    '</head>',
    opacityOverride + '</head>',
  );

  // ── 3. Render with Playwright ──────────────────────────────────────────────
  try {
    const { chromium } = await import('playwright');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1050, height: 788 },
    });

    await page.setContent(patchedSnapshot, {
      waitUntil: 'networkidle',
      timeout: 15_000,
    });

    // Extra wait for fonts / background images to fully paint
    await page.waitForTimeout(800);

    const pngBuffer = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1050, height: 788 },
      omitBackground: false,
    });

    await browser.close();

    const safeName = studentName
      .replace(/[^a-zA-Z0-9 _-]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="certificate-${safeName}.png"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[cert-png] Playwright render failed:', err);
    return NextResponse.json(
      { error: 'PNG generation failed', detail: String(err) },
      { status: 500 },
    );
  }
}
