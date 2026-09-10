import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { CertificateTemplateConfig, CertificateRecipientData } from '@/components/certificate/CertificateTemplate';

export interface GenerateCertificateParams {
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

export interface GeneratedArtifactsResult {
  imageUrl: string;
  pdfUrl: string;
  isStoredInObjectStorage: boolean;
}

/**
 * Builds HTML string for server-side headless browser rendering
 */
function buildCertificateHtml(params: GenerateCertificateParams): string {
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

  let bgImg = params.templateConfig?.bgImage || '/certificate-bg.png';
  const combined = `${course} ${params.templateConfig?.mainTitle || ''} ${certId}`.toUpperCase();
  if (combined.includes('BEST INTERN') || combined.includes('TT-BIA') || combined.includes('AWARD')) {
    bgImg = '/best-intern-award-bg.jpg';
  } else if (bgImg === '/certificate-bg.png') {
    if (combined.includes('EXCEL') || combined.includes('TT-EX-')) bgImg = '/excel-bg.jpg';
    else if (combined.includes('PYTHON') || combined.includes('TT-PY-') || combined.includes('TT-PM-')) bgImg = '/python-bg.jpg';
  }
  const bgStyle = bgImg.startsWith('/') || bgImg.startsWith('http')
    ? `background-image: url('${bgImg}'); background-size: cover; background-position: center;`
    : `background-color: ${bgImg.startsWith('#') ? bgImg : '#ffffff'};`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Outfit:wght@600;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: 1122px; height: 794px; font-family: 'Montserrat', sans-serif; background: #0f172a; display: flex; align-items: center; justify-content: center; }
    .cert-page { width: 1122px; height: 794px; padding: 32px; ${bgStyle} display: flex; align-items: center; justify-content: center; position: relative; }
    .cert-card { width: 100%; height: 100%; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 2px solid rgba(255, 255, 255, 0.7); border-radius: 28px; padding: 40px 50px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
    .header { display: flex; align-items: center; justify-content: space-between; }
    .brand-box { display: flex; items-center; gap: 12px; }
    .logo-img { height: 45px; width: auto; }
    .brand-title { font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 800; letter-spacing: 1.2px; color: #0f172a; text-transform: uppercase; }
    .brand-tag { font-size: 10px; font-weight: 600; letter-spacing: 4px; color: #64748b; text-transform: uppercase; }
    .msme-img { height: 45px; width: auto; }
    .main-content { text-align: center; margin: 20px 0; display: flex; flex-direction: column; align-items: center; }
    .cert-title { font-size: 42px; font-weight: 900; letter-spacing: 1.5px; color: #0f172a; text-transform: uppercase; }
    .sub-title { font-size: 15px; font-weight: 700; letter-spacing: 8px; color: #475569; text-transform: uppercase; margin-top: 10px; }
    .divider { width: 120px; height: 3px; background: linear-gradient(to right, #f59e0b, #f43f5e); border-radius: 999px; margin: 18px 0; }
    .certifies-header { font-size: 12px; font-weight: 700; letter-spacing: 4px; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; }
    .student-name { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; color: #0f172a; margin: 6px 0; }
    .description { font-size: 13.5px; font-weight: 500; color: #475569; max-width: 82%; line-height: 1.6; margin-top: 12px; text-align: center; }
    .spec-line { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 16px; }
    .spec-val { font-weight: 600; color: #475569; }
    .footer { display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: end; border-top: 1px solid rgba(226, 232, 240, 0.7); padding-top: 16px; }
    .footer-left { text-align: left; }
    .footer-center { text-align: center; }
    .footer-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
    .val-text { font-family: monospace; font-size: 14px; font-weight: 800; color: #0f172a; letter-spacing: 1px; }
    .lbl-text { font-size: 9.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 3px; }
    .sig-img { height: 40px; width: auto; mix-blend-mode: multiply; margin-bottom: 2px; }
    .sig-name { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 800; color: #0f172a; }
  </style>
</head>
<body>
  <div class="cert-page">
    <div class="cert-card">
      <div class="header">
        <div class="brand-box">
          <img src="https://sarthi-woad.vercel.app/sarthi-logo.png" alt="${brandName}" class="logo-img" />
          <div style="display:flex; flex-direction:column;">
            <span class="brand-title">${brandName}</span>
            <span class="brand-tag">${tagline}</span>
          </div>
        </div>
        <img src="https://sarthi-woad.vercel.app/msme-logo.png" alt="MSME" class="msme-img" />
      </div>

      <div class="main-content">
        <div class="cert-title">${certTitle}</div>
        <div class="sub-title">${subTitleText}</div>
        <div class="divider"></div>
        <div class="certifies-header">${certifiesHeader}</div>
        <div class Student-name="${student}">${student}</div>
        <div class="description">${description}</div>
        <div class="spec-line">Specialization: <span class="spec-val">${spec}</span></div>
      </div>

      <div class="footer">
        <div class="footer-left">
          <div class="val-text">${dateStr}</div>
          <div class="lbl-text">DATE OF ISSUE</div>
        </div>
        <div class="footer-center">
          <div class="val-text">${certId}</div>
          <div class="lbl-text">CERTIFICATE ID</div>
        </div>
        <div class="footer-right">
          <img src="https://sarthi-woad.vercel.app/signature-mukul-pandey.png" alt="${sigName}" class="sig-img" />
          <div class="sig-name">${sigName}</div>
          <div class="lbl-text">${sigRole}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Uploads buffers to S3/R2 / Cloudinary / Local filesystem
 */
async function uploadArtifact(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  // Option A: Cloudflare R2 / AWS S3
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
      if (endpoint) {
        return `${endpoint.replace(/\/$/, '')}/${bucket}/${s3Key}`;
      }
      return `https://${bucket}.s3.amazonaws.com/${s3Key}`;
    } catch (err) {
      console.warn('[CERT_STORAGE] S3 upload error, falling back to Cloudinary/Local:', err);
    }
  }

  // Option B: Cloudinary
  if (isCloudinaryConfigured()) {
    try {
      const base64Data = `data:${contentType};base64,${buffer.toString('base64')}`;
      const isPdf = contentType.includes('pdf');
      const res = await uploadToCloudinary(base64Data, {
        folder: 'certificates',
        resource_type: isPdf ? 'raw' : 'image',
      });
      if (res?.secure_url) return res.secure_url;
    } catch (err) {
      console.warn('[CERT_STORAGE] Cloudinary upload error, falling back to local file storage:', err);
    }
  }

  // Option C: Local Filesystem Storage (Public directory fallback)
  const publicCertDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
  if (!fs.existsSync(publicCertDir)) {
    fs.mkdirSync(publicCertDir, { recursive: true });
  }

  const filePath = path.join(publicCertDir, filename);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/certificates/${filename}`;
}

/**
 * Main Function: Generate PNG & PDF artifacts once at issuance/payment time, store them, and update DB.
 */
export async function generateCertificateArtifacts(
  params: GenerateCertificateParams
): Promise<GeneratedArtifactsResult> {
  const { certificateNumber } = params;
  console.log(`[CERT_GENERATOR] Generating single-source-of-truth image & PDF for ${certificateNumber}...`);

  const html = buildCertificateHtml(params);

  let pngBuffer: Buffer;
  let pdfBuffer: Buffer;

  try {
    // Dynamically import playwright to render headless HTML screenshot & PDF
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1122, height: 794 } });
    
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    pngBuffer = await page.screenshot({ type: 'png', fullPage: false });
    pdfBuffer = await page.pdf({
      width: '297mm',
      height: '210mm',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    });

    await browser.close();
  } catch (err) {
    console.warn(`[CERT_GENERATOR] Playwright render notice: ${err instanceof Error ? err.message : err}. Falling back to default generation...`);
    // Fallback: Use minimal SVG -> Sharp rasterization or standard buffer
    const sharp = (await import('sharp')).default;
    const svgStr = `<svg width="1122" height="794" xmlns="http://www.w3.org/2000/svg">
      <rect width="1122" height="794" fill="#0f172a"/>
      <rect x="32" y="32" width="1058" height="730" rx="28" fill="#ffffff" opacity="0.9"/>
      <text x="561" y="250" font-family="sans-serif" font-size="40" font-weight="bold" fill="#0f172a" text-anchor="middle">${params.courseName || 'CERTIFICATE OF COMPLETION'}</text>
      <text x="561" y="340" font-family="sans-serif" font-size="20" fill="#64748b" text-anchor="middle">PROUDLY PRESENTED TO</text>
      <text x="561" y="430" font-family="serif" font-size="48" font-weight="bold" fill="#0f172a" text-anchor="middle">${params.studentName || 'Student'}</text>
      <text x="561" y="650" font-family="monospace" font-size="16" fill="#0f172a" text-anchor="middle">ID: ${certificateNumber}</text>
    </svg>`;
    pngBuffer = await sharp(Buffer.from(svgStr)).png().toBuffer();
    pdfBuffer = Buffer.from(html);
  }

  const safeFilename = certificateNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  const imageUrl = await uploadArtifact(pngBuffer, `${safeFilename}.png`, 'image/png');
  const pdfUrl = await uploadArtifact(pdfBuffer, `${safeFilename}.pdf`, 'application/pdf');

  console.log(`[CERT_GENERATOR] Successfully generated & uploaded artifacts for ${certificateNumber}:`);
  console.log(`  imageUrl: ${imageUrl}`);
  console.log(`  pdfUrl:   ${pdfUrl}`);

  // Persist imageUrl and pdfUrl to Certificate and IssuedCertificate tables
  try {
    await prisma.certificate.updateMany({
      where: { OR: [{ certificateNumber }, { id: certificateNumber }, { certificateId: certificateNumber }] },
      data: { imageUrl, pdfUrl }
    });

    await prisma.issuedCertificate.updateMany({
      where: { OR: [{ verificationId: certificateNumber }, { id: certificateNumber }] },
      data: { imageUrl, pdfUrl }
    });
  } catch (dbErr) {
    console.warn(`[CERT_GENERATOR] DB update notice:`, dbErr);
  }

  return {
    imageUrl,
    pdfUrl,
    isStoredInObjectStorage: !imageUrl.startsWith('/uploads/')
  };
}
