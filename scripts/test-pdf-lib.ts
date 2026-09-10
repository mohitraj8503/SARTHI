import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import AdmZip from 'jszip';
import { execSync } from 'child_process';

async function main() {
  const templatePath = '/home/mohitraj8503/.gemini/antigravity/brain/b7c3f59b-0293-41da-b048-3375e33c32b2/Tech_Tomorrow_Offer_Template.docx';
  const outDocxPath = '/home/mohitraj8503/Mohit_Raj_Offer_Letter.docx';
  const pdfPath = '/home/mohitraj8503/Mohit_Raj_Offer_Letter.pdf';
  const sigMukulPath = '/home/mohitraj8503/Documents/SARTHI /public/signature-mukul-pandey.png';
  const sigMohitPath = '/home/mohitraj8503/Documents/SARTHI /public/signature-mohit-raj.png';

  console.log('Loading template docx...');
  const data = fs.readFileSync(templatePath);
  const zip = await AdmZip.loadAsync(data);
  let docXml = await zip.file('word/document.xml').async('text');

  console.log('Locating Mukul Pandey table...');
  const mukulIndex = docXml.indexOf('Mukul Pandey');
  if (mukulIndex !== -1) {
    const tblStart = docXml.lastIndexOf('<w:tbl>', mukulIndex);
    const tblEnd = docXml.indexOf('</w:tbl>', mukulIndex) + 8;
    if (tblStart !== -1 && tblEnd > 8) {
      // Remove the entire table to take full control in PDF-lib
      docXml = docXml.slice(0, tblStart) + docXml.slice(tblEnd);
      console.log('Removed the signature table completely!');
    }
  }

  // Apply other replacements
  docXml = docXml.replace(/\[Student Name\]/g, 'Mohit Raj');
  docXml = docXml.replace(/\[Reference No\.\]/g, 'TT-INT-2026-0006');
  docXml = docXml.replace(/\[Degree \/ Program\]/g, 'B.Tech, Artificial Intelligence &amp; Data Science');
  docXml = docXml.replace(/\[University Name\]/g, 'Arka Jain University');
  docXml = docXml.replace(/\[City, State\]/g, 'Jamshedpur, Jharkhand');
  docXml = docXml.replace(/\[Internship Role\]/g, 'Research and Development Intern');
  docXml = docXml.replace(/\[Duration, e\.g\., 2 Months\]/g, '2 Months');
  docXml = docXml.replace(/\[Start Date\]/g, '06-Jul-2026');
  docXml = docXml.replace(/\[End Date\]/g, '06-Sep-2026');
  docXml = docXml.replace(/\[Date\]/g, '05-Jul-2026');
  docXml = docXml.replace(/\[Acceptance Deadline\]/g, '07-Jul-2026');

  zip.file('word/document.xml', docXml);
  const outBuf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(outDocxPath, outBuf);

  console.log('Converting to PDF...');
  execSync(`libreoffice --headless --convert-to pdf --outdir "/home/mohitraj8503" "${outDocxPath}"`);

  console.log('Loading PDF...');
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const page = pages[pages.length - 1];

  console.log('Embedding signatures...');
  const imgMukul = await pdfDoc.embedPng(fs.readFileSync(sigMukulPath));
  const imgMohit = await pdfDoc.embedPng(fs.readFileSync(sigMohitPath));
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Constants for layout
  const yLine = 150; // The Y coordinate of the horizontal line
  const leftCenterX = 150; // Center of the left signature block
  const rightCenterX = 450; // Center of the right signature block
  const lineHalfWidth = 60; // Total width of line is 120
  
  const textColor = rgb(0, 0, 0); // Black or use the green color from before: rgb(0, 0.45, 0.45) if it was colored.
  const nameColor = rgb(0, 114/255, 126/255); // A teal color #00727e

  const drawCenteredText = (text, font, size, color, centerX, y) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: centerX - textWidth / 2,
      y,
      size,
      font,
      color,
    });
  };

  // Mukul Signature Block
  // Signature image
  const imgW = 110;
  const imgH = 40;
  page.drawImage(imgMukul, {
    x: leftCenterX - imgW / 2,
    y: yLine + 6, // 6px gap above line
    width: imgW,
    height: imgH,
  });
  // Line
  page.drawLine({
    start: { x: leftCenterX - lineHalfWidth, y: yLine },
    end: { x: leftCenterX + lineHalfWidth, y: yLine },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  // Name
  drawCenteredText('Mukul Pandey', fontBold, 11, nameColor, leftCenterX, yLine - 16);
  // Title
  drawCenteredText('CEO & Founder', fontRegular, 9, textColor, leftCenterX, yLine - 28);
  // Company
  drawCenteredText('SARTHI Pvt. Ltd.', fontRegular, 9, textColor, leftCenterX, yLine - 40);

  // Mohit Signature Block
  // Signature image
  page.drawImage(imgMohit, {
    x: rightCenterX - imgW / 2,
    y: yLine + 6,
    width: imgW,
    height: imgH,
  });
  // Line
  page.drawLine({
    start: { x: rightCenterX - lineHalfWidth, y: yLine },
    end: { x: rightCenterX + lineHalfWidth, y: yLine },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  // Name
  drawCenteredText('Mohit Raj', fontBold, 11, nameColor, rightCenterX, yLine - 16);
  // Title
  drawCenteredText('Mentor', fontRegular, 9, textColor, rightCenterX, yLine - 28);
  // Company
  drawCenteredText('SARTHI Pvt. Ltd.', fontRegular, 9, textColor, rightCenterX, yLine - 40);


  console.log('Saving PDF...');
  fs.writeFileSync(pdfPath, await pdfDoc.save());
  console.log('Done!');
}

main().catch(console.error);
