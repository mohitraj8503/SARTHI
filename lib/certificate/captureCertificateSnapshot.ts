import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { CertificateTemplateConfig } from '@/components/certificate/CertificateTemplate';

export interface CaptureSnapshotParams {
  certificateNumber: string;
  studentName?: string;
  courseName?: string;
  specialization?: string;
  issueDate?: string;
  enrollmentNo?: string;
  templateConfig?: CertificateTemplateConfig | null;
  userId?: string;
  courseId?: string;
}

export interface CapturedSnapshotResult {
  htmlSnapshot: string;
  pdfUrl: string;
  imageUrl?: string;
}

/**
 * Builds self-contained, standalone HTML snapshot string representing the exact certificate
 */
export function buildCertificateHtmlSnapshot(params: CaptureSnapshotParams): string {
  const brandName = params.templateConfig?.brandName || 'SARTHI';
  const tagline = params.templateConfig?.tagline || 'INNOVATE TODAY';
  const student = params.studentName || 'John Doe';
  const course = params.templateConfig?.courseName || params.courseName || 'Artificial Intelligence';
  const spec = params.templateConfig?.specialization || params.specialization || course;
  const certId = params.certificateNumber;
  const dateStr = params.templateConfig?.completionDate || params.issueDate || '13.06.2025';
  const sigName = params.templateConfig?.directorName || 'Dr. Mukul Pandey';
  const sigRole = params.templateConfig?.directorTitle || 'CEO & FOUNDER';

  function normalizeCertificateTitle(raw: string) {
    const clean = raw.split('—')[0].split('-')[0].trim().toUpperCase();
    if (/\b(CERTIFICATE|CERTIFICATION|EXAM|AWARD)\b/.test(clean)) return clean;
    return `${clean} CERTIFICATE`;
  }

  const certTitle = normalizeCertificateTitle(params.templateConfig?.mainTitle || course);

  const subTitleText = params.templateConfig?.subTitle !== undefined ? params.templateConfig.subTitle : 'OF COMPLETION';
  const certifiesHeader = params.templateConfig?.certifiesText || 'THIS CERTIFIES THAT';
  const description = params.templateConfig?.descriptionText || `has successfully completed a comprehensive program in ${course}, covering core and advanced modules in machine learning, data analysis, neural networks, and real-world AI applications.`;

  let bgImg = params.templateConfig?.bgImage;
  const combined = `${course} ${params.templateConfig?.mainTitle || ''} ${certId}`.toUpperCase();
  if (!bgImg || bgImg === '/certificate-bg.png') {
    if (combined.includes('EXCEL') || combined.includes('TT-EX-')) bgImg = '/excel-bg.jpg';
    else if (combined.includes('PYTHON') || combined.includes('TT-PY-') || combined.includes('TT-PM-')) bgImg = '/python-bg.jpg';
    else if (combined.includes('BEST INTERN') || combined.includes('TT-BIA') || combined.includes('AWARD')) bgImg = '/best-intern-award-bg.jpg';
    else bgImg = '/certificate-bg.png';
  } else if (bgImg.includes('best-intern') || combined.includes('TT-BIA') || combined.includes('BEST INTERN')) {
    bgImg = '/best-intern-award-bg.jpg';
  }

  const bgStyle = bgImg.startsWith('/') || bgImg.startsWith('http') || bgImg.startsWith('data:')
    ? `background-image: url('${bgImg.startsWith('/') ? 'https://sarthi-woad.vercel.app' + bgImg : bgImg}'); background-size: cover; background-position: center;`
    : `background-color: ${bgImg.startsWith('#') ? bgImg : '#ffffff'};`;

  const logo = params.templateConfig?.logoUrl || '/sarthi-logo.png';
  const rawSigImg = params.templateConfig?.signatureUrl || '/signature-mukul-pandey.png';
  const sigImg = rawSigImg.startsWith('/') ? `https://sarthi-woad.vercel.app${rawSigImg}` : rawSigImg;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate — ${student}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&display=swap" rel="stylesheet" />
  <script>
    function adjustScale() {
      const targetWidth = 1050;
      const targetHeight = 787.5;
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;
      if (winWidth === 0 || winHeight === 0) return;
      if (winWidth < targetWidth || winHeight < targetHeight) {
        const scaleX = winWidth / targetWidth;
        const scaleY = winHeight / targetHeight;
        const scale = Math.min(scaleX, scaleY);
        document.documentElement.style.transform = 'scale(' + scale + ')';
        document.documentElement.style.transformOrigin = 'top left';
        document.documentElement.style.width = targetWidth + 'px';
        document.documentElement.style.height = targetHeight + 'px';
      } else {
        document.documentElement.style.transform = 'none';
        document.documentElement.style.width = '100%';
        document.documentElement.style.height = '100%';
      }
    }
    window.addEventListener('DOMContentLoaded', adjustScale);
    window.addEventListener('load', adjustScale);
    window.addEventListener('resize', adjustScale);
  </script>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @page {
      size: A4 landscape;
      margin: 0;
    }

    .certificate-bg-img {
      display: none;
    }

    html, body {
      width: 1050px;
      height: 787.5px;
      overflow: hidden;
      margin: 0;
      padding: 0;
      background-image: url('${bgImg.startsWith('/') ? 'https://sarthi-woad.vercel.app' + bgImg : bgImg}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      font-family: 'Montserrat', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .certificate-card {
      width: 930px;
      height: 685px;
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 2.5px solid rgba(255, 255, 255, 0.88);
      border-radius: 28px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
      padding: 42px 52px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 5px;
    }

    .brand-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo-img {
      height: 42px;
      width: auto;
      object-fit: contain;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 1.2px;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .tagline {
      font-size: 9px;
      font-weight: 600;
      color: #64748b;
      letter-spacing: 4px;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .msme-logo-img {
      height: 68px;
      width: auto;
      object-fit: contain;
    }

    .title-section {
      text-align: center;
      margin-top: 2px;
    }

    .main-title {
      font-size: 46px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 2px;
      margin-bottom: 2px;
      text-transform: uppercase;
    }

    .subtitle-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      width: 460px;
      margin: 4px auto 0 auto;
    }

    .title-line {
      height: 1.5px;
      flex-grow: 1;
    }

    .title-line.left {
      background: linear-gradient(to right, rgba(15, 23, 42, 0), rgba(15, 23, 42, 0.6));
    }

    .title-line.right {
      background: linear-gradient(to right, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0));
    }

    .subtitle {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      letter-spacing: 4.5px;
      text-transform: uppercase;
    }

    .title-divider-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 280px;
      margin: 14px auto 0 auto;
    }

    .title-divider-line {
      width: 100%;
      height: 1.5px;
      background: linear-gradient(90deg, transparent 0%, #cbd5e1 25%, #f97316 50%, #cbd5e1 75%, transparent 100%);
    }

    .title-divider-dot {
      position: absolute;
      width: 7px;
      height: 7px;
      background-color: #f97316;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(249, 115, 22, 0.6);
    }

    .recipient-section {
      text-align: center;
      margin-top: 10px;
    }

    .certifies-text {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .recipient-name {
      font-family: 'Playfair Display', serif;
      font-size: 46px;
      font-weight: 700;
      color: #000000;
      margin: 4px 0 14px 0;
      letter-spacing: 0.5px;
      line-height: 1.15;
    }

    .description {
      font-size: 13px;
      font-weight: 500;
      color: #475569;
      line-height: 1.75;
      max-width: 640px;
      margin: 0 auto;
    }

    .specialization-section {
      text-align: center;
      margin-top: 12px;
      font-size: 13.5px;
      color: #334155;
    }

    .specialization-section strong {
      font-weight: 700;
      color: #0f172a;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 15px;
      padding: 10px 10px 0 10px;
      border-top: 1px solid rgba(226, 232, 240, 0.8);
    }

    .footer-column {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 190px;
    }

    .footer-column.center {
      align-items: center;
      text-align: center;
    }

    .footer-column.right {
      align-items: flex-end;
      text-align: right;
    }

    .footer-value-above {
      height: 44px;
      display: flex;
      align-items: flex-end;
      margin-bottom: 2px;
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.3px;
    }

    .footer-column.center .footer-value-above {
      justify-content: center;
    }

    .footer-column.right .footer-value-above {
      justify-content: flex-end;
    }

    .signature-img {
      height: 48px;
      width: auto;
      object-fit: contain;
      mix-blend-mode: multiply;
    }

    .footer-column-line {
      width: 100%;
      height: 1.5px;
      background-color: #cbd5e1;
      margin: 2px 0 6px 0;
    }

    .footer-primary-text {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.3px;
    }

    .footer-sub-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }

    @media print {
      @page {
        size: A4 landscape;
        margin: 0 !important;
      }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      html, body {
        width: 297mm !important;
        height: 210mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        overflow: hidden !important;
      }

      .certificate-bg-img {
        display: block !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 297mm !important;
        height: 210mm !important;
        object-fit: cover !important;
        z-index: 0 !important;
        pointer-events: none !important;
      }

      .certificate-card,
      .cert-card {
        width: 263mm !important;
        height: 194mm !important;
        padding: 12mm 15mm !important;
        background: rgba(255, 255, 255, 0.96) !important;
        background-color: rgba(255, 255, 255, 0.96) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border: 2.5px solid rgba(255, 255, 255, 0.95) !important;
        border-radius: 8mm !important;
        box-shadow: none !important;
        position: relative !important;
        z-index: 1 !important;
      }
    }
  </style>
</head>
<body>
  <img src="${bgImg.startsWith('/') ? 'https://sarthi-woad.vercel.app' + bgImg : bgImg}" alt="Certificate Background" class="certificate-bg-img" />
  <div class="certificate-card">
    <div class="header">
      <div class="brand-container">
        <img src="${logo.startsWith('/') ? 'https://sarthi-woad.vercel.app' + logo : logo}" alt="${brandName}" class="brand-logo-img">
        <div class="brand-text">
          <div class="brand-name">${brandName}</div>
          <div class="tagline">${tagline}</div>
        </div>
      </div>
      <img src="https://sarthi-woad.vercel.app/msme-logo.png" alt="MSME Logo" class="msme-logo-img">
    </div>

    <div class="title-section">
      <div class="main-title">${certTitle}</div>
      <div class="subtitle-wrapper">
        <div class="title-line left"></div>
        <div class="subtitle">${subTitleText}</div>
        <div class="title-line right"></div>
      </div>
      <div class="title-divider-container">
        <div class="title-divider-line"></div>
        <div class="title-divider-dot"></div>
      </div>
    </div>

    <div class="recipient-section">
      <div class="certifies-text">${certifiesHeader}</div>
      <div class="recipient-name">${student}</div>
      <div class="description">${description}</div>
    </div>

    <div class="specialization-section">
      <strong>Specialization:</strong> ${spec}
    </div>

    <div class="footer">
      <div class="footer-column">
        <div class="footer-value-above">${dateStr}</div>
        <div class="footer-column-line"></div>
        <div class="footer-sub-label">DATE OF ISSUE</div>
      </div>
      <div class="footer-column center">
        <div class="footer-value-above">${certId}</div>
        <div class="footer-column-line"></div>
        <div class="footer-sub-label">CERTIFICATE ID</div>
      </div>
      <div class="footer-column right">
        <div class="footer-value-above">
          <img src="${sigImg}" alt="${sigName}" class="signature-img">
        </div>
        <div class="footer-column-line"></div>
        <div class="footer-primary-text">${sigName}</div>
        <div class="footer-sub-label">${sigRole}</div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 15px; font-size: 8px; color: #64748b; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; font-family: 'Montserrat', sans-serif;">
      Verify this credential at: https://sarthi-woad.vercel.app/verify/${certId}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Upload helper for PDF output
 */
async function uploadBinaryArtifact(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const bucket = process.env.EGRESS_S3_BUCKET || process.env.S3_BUCKET || process.env.R2_BUCKET;
  const accessKeyId = process.env.EGRESS_S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.EGRESS_S3_SECRET || process.env.AWS_SECRET_ACCESS_KEY;
  const endpoint = process.env.EGRESS_S3_ENDPOINT || process.env.S3_ENDPOINT;

  if (bucket && accessKeyId && secretAccessKey) {
    try {
      const s3Client = new S3Client({
        region: process.env.EGRESS_S3_REGION || 'auto',
        endpoint: endpoint || undefined,
        forcePathStyle: !!endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });

      const s3Key = `certificates/${filename}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: s3Key,
          Body: buffer,
          ContentType: contentType,
        })
      );

      const publicBase = process.env.EGRESS_S3_PUBLIC_URL || process.env.R2_PUBLIC_URL;
      if (publicBase) {
        return `${publicBase.replace(/\/$/, '')}/${s3Key}`;
      }
      return `https://${bucket}.s3.amazonaws.com/${s3Key}`;
    } catch (err) {
      console.warn('[CERT_SNAPSHOT] S3 upload warning:', err);
    }
  }

  if (isCloudinaryConfigured()) {
    try {
      const base64Data = `data:${contentType};base64,${buffer.toString('base64')}`;
      const res = await uploadToCloudinary(base64Data, {
        folder: 'certificates',
        resource_type: contentType === 'application/pdf' ? 'raw' : 'image',
      });
      if (res?.secure_url) return res.secure_url;
    } catch (err) {
      console.warn('[CERT_SNAPSHOT] Cloudinary upload warning:', err);
    }
  }

  const publicCertDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
  if (!fs.existsSync(publicCertDir)) {
    fs.mkdirSync(publicCertDir, { recursive: true });
  }

  const filePath = path.join(publicCertDir, filename);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/certificates/${filename}`;
}

/**
 * Capture HTML snapshot at issuance time & generate printable PDF
 */
export async function captureCertificateSnapshot(
  params: CaptureSnapshotParams
): Promise<CapturedSnapshotResult> {
  const { certificateNumber } = params;
  console.log(`[CERT_SNAPSHOT] Capturing single-source-of-truth HTML snapshot for ${certificateNumber}...`);

  const htmlSnapshot = buildCertificateHtmlSnapshot(params);

  let pdfBuffer: Buffer;
  let pngBuffer: Buffer;

  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ 
      headless: true,
      timeout: 10000 // 10 seconds browser launch timeout
    });
    const page = await browser.newPage({ viewport: { width: 1122, height: 794 } });

    await page.setContent(htmlSnapshot, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(300);

    pngBuffer = await page.screenshot({
      type: 'png',
      fullPage: false,
      omitBackground: false,
    });

    pdfBuffer = await page.pdf({
      width: '297mm',
      height: '210mm',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    });
    await browser.close();
  } catch (err) {
    console.warn(`[CERT_SNAPSHOT] Playwright render fallback: ${err}`);
    pngBuffer = Buffer.from('');
    pdfBuffer = Buffer.from(htmlSnapshot);
  }

  const safeFilename = certificateNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  const pdfUrl = await uploadBinaryArtifact(pdfBuffer, `${safeFilename}.pdf`, 'application/pdf');
  const imageUrl = await uploadBinaryArtifact(pngBuffer, `${safeFilename}.png`, 'image/png');

  // Persist htmlSnapshot and pdfUrl to Certificate and IssuedCertificate tables
  try {
    await prisma.certificate.updateMany({
      where: { OR: [{ certificateNumber }, { id: certificateNumber }, { certificateId: certificateNumber }] },
      data: { htmlSnapshot, pdfUrl, imageUrl }
    });

    await prisma.issuedCertificate.updateMany({
      where: { OR: [{ verificationId: certificateNumber }, { id: certificateNumber }] },
      data: { htmlSnapshot, pdfUrl, imageUrl }
    });
  } catch (dbErr) {
    console.warn(`[CERT_SNAPSHOT] DB update notice:`, dbErr);
  }

  return {
    htmlSnapshot,
    pdfUrl,
    imageUrl
  };
}

/**
 * Resolves and returns a standardized HTML snapshot for any verificationId.
 * It loads the certificate metadata, parses the templateConfig, and builds the snapshot dynamically.
 */
export async function getCertificateHtmlSnapshot(verificationId: string): Promise<string | null> {
  const cleanUpperId = verificationId.toUpperCase().trim();

  // ── Best Intern Award of Excellence: TT-BIA-2026-08 ───────────────────────
  if (cleanUpperId === 'TT-BIA-2026-08' || cleanUpperId.startsWith('TT-BIA-2026-08') || cleanUpperId === 'TT-BIA-AUG26-001') {
    return buildCertificateHtmlSnapshot({
      certificateNumber: 'TT-BIA-2026-08',
      studentName: 'Jaanvi Nair',
      courseName: 'Best Intern Award',
      issueDate: '31.08.2026',
      templateConfig: {
        mainTitle: 'BEST INTERN AWARD',
        subTitle: 'OF EXCELLENCE',
        certifiesText: 'THIS AWARD IS PRESENTED TO',
        descriptionText: 'This award is proudly presented in recognition of exceptional performance, consistent dedication, innovative contribution, and exemplary professionalism demonstrated throughout the internship program.',
        courseName: 'Best Intern Award',
        specialization: 'Best Intern – August 2026',
        brandName: 'SARTHI',
        tagline: 'INNOVATE TODAY',
        directorName: 'Dr. Mukul Pandey',
        directorTitle: 'CEO & FOUNDER',
        bgImage: '/best-intern-award-bg.jpg',
        logoUrl: '/sarthi-logo.png',
        signatureUrl: '/signature-mukul-pandey.png',
        completionDate: '31.08.2026'
      }
    });
  }

  // ── Production Database Hardcoded Bypass ──────────────────────────────────
  if (verificationId === 'TT-EX-2026-0002') {
    const user = await prisma.user.findFirst({
      where: { OR: [{ id: 'cmqmjmxo2000913c8hn9epgmr' }, { email: 'sharmaayush5644@gmail.com' }] }
    });
    return buildCertificateHtmlSnapshot({
      certificateNumber: 'TT-EX-2026-0002',
      studentName: user?.name || 'Ayush Kumar Sharma',
      courseName: 'Advance Excel & Data Analytics',
      issueDate: '08.05.2026',
      templateConfig: {
        mainTitle: 'Advance Excel & Data Analytics',
        subTitle: 'CERTIFICATE OF COMPLETION',
        certifiesText: 'THIS CERTIFIES THAT',
        descriptionText: 'has successfully completed the Advance Excel & Data Analytics program, gaining practical expertise in advanced Excel, data analysis, dashboard creation, PivotTables, Power Query, and business reporting through hands-on learning and real-world applications.',
        courseName: 'Advance Excel & Data Analytics',
        specialization: 'Advance Excel',
        brandName: 'SARTHI',
        tagline: 'INNOVATE TODAY',
        directorName: 'Dr. Mukul Pandey',
        directorTitle: 'CEO & FOUNDER',
        bgImage: '/excel-bg.jpg',
        logoUrl: '/sarthi-logo.png',
        signatureUrl: '/signature-mukul-pandey.png',
        completionDate: '05.08.2026'
      }
    });
  }

  if (verificationId === 'TT-EX-2026-0003') {
    const user = await prisma.user.findFirst({
      where: { OR: [{ id: 'cmsg2w6xw0000mme5esz28sez' }, { id: 'cmsetpdc00001fdwfhptf0e6w' }] }
    });
    return buildCertificateHtmlSnapshot({
      certificateNumber: 'TT-EX-2026-0003',
      studentName: user?.name || 'Dhanlaxmi Naresh Bagoria',
      courseName: 'Advance Excel & Data Analytics',
      issueDate: '05.08.2026',
      templateConfig: {
        mainTitle: 'Advance Excel & Data Analytics',
        subTitle: 'CERTIFICATE OF COMPLETION',
        certifiesText: 'THIS CERTIFIES THAT',
        descriptionText: 'has successfully completed the Advance Excel & Data Analytics program, gaining practical expertise in advanced Excel, data analysis, dashboard creation, PivotTables, Power Query, and business reporting through hands-on learning and real-world applications.',
        courseName: 'Advance Excel & Data Analytics',
        specialization: 'Advance Excel',
        brandName: 'SARTHI',
        tagline: 'INNOVATE TODAY',
        directorName: 'Dr. Mukul Pandey',
        directorTitle: 'CEO & FOUNDER',
        bgImage: '/excel-bg.jpg',
        logoUrl: '/sarthi-logo.png',
        signatureUrl: '/signature-mukul-pandey.png',
        completionDate: '05.08.2026'
      }
    });
  }

  if (verificationId === 'TT-EX-2026-0004') {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: 'dhanlaxmibagoriya21@gmail.com' }] }
    });
    return buildCertificateHtmlSnapshot({
      certificateNumber: 'TT-EX-2026-0004',
      studentName: user?.name || 'Dhanlaxmi Naresh Bagoria',
      courseName: 'Advance Excel & Data Analytics',
      issueDate: '08.08.2026',
      templateConfig: {
        mainTitle: 'Advance Excel & Data Analytics',
        subTitle: 'CERTIFICATE OF COMPLETION',
        certifiesText: 'THIS CERTIFIES THAT',
        descriptionText: 'has successfully completed the Advance Excel & Data Analytics program, gaining practical expertise in advanced Excel, data analysis, dashboard creation, PivotTables, Power Query, and business reporting through hands-on learning and real-world applications.',
        courseName: 'Advance Excel & Data Analytics',
        specialization: 'Advance Excel',
        brandName: 'SARTHI',
        tagline: 'INNOVATE TODAY',
        directorName: 'Dr. Mukul Pandey',
        directorTitle: 'CEO & FOUNDER',
        bgImage: '/excel-bg.jpg',
        logoUrl: '/sarthi-logo.png',
        signatureUrl: '/signature-mukul-pandey.png',
        completionDate: '08.08.2026'
      }
    });
  }

  // Try to find the IssuedCertificate first
  const issued = await prisma.issuedCertificate.findUnique({
    where: { verificationId },
    include: { user: true, certification: true }
  });

  // Try to find the Certificate (fallback)
  const certRecord = await prisma.certificate.findFirst({
    where: {
      OR: [
        { certificateNumber: verificationId },
        { certificateId: verificationId }
      ]
    },
    include: { user: true }
  });

  if (!issued && !certRecord) {
    return null;
  }

  // Use the best available user, certification data
  const user = issued?.user || certRecord?.user;
  const courseId = issued?.certificationId || certRecord?.courseId;
  let courseTitle = issued?.certification?.title || "Professional Pathway Certification";
  let issuedAt = issued?.issuedAt || certRecord?.issuedAt || new Date();

  let templateConfig: any = null;
  if (certRecord) {
    try {
      const meta = typeof certRecord.metadata === 'string' ? JSON.parse(certRecord.metadata) : certRecord.metadata as any;
      if (meta) {
        if (meta.templateConfig) {
          templateConfig = meta.templateConfig;
        } else {
          // Flattened metadata
          templateConfig = {
            mainTitle: meta.mainTitle,
            subTitle: meta.subTitle,
            certifiesText: meta.certifiesText,
            descriptionText: meta.descriptionText,
            courseName: meta.course_name || meta.courseName,
            specialization: meta.specialization,
            brandName: meta.brandName,
            tagline: meta.tagline,
            directorName: meta.directorName,
            directorTitle: meta.directorTitle,
            bgImage: meta.bgImage,
            logoUrl: meta.logoUrl,
            signatureUrl: meta.signatureUrl,
            completionDate: meta.completionDate,
          };
        }
        if (meta.course_name) courseTitle = meta.course_name;
      }
    } catch {}
  }

  const dateStr = new Date(issuedAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).replace(/\//g, '.');

  return buildCertificateHtmlSnapshot({
    certificateNumber: verificationId,
    studentName: user?.name || '',
    courseName: courseTitle,
    issueDate: dateStr,
    templateConfig,
  });
}

