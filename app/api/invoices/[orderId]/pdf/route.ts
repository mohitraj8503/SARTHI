import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateStudent } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Enterprise Invoice Generator
 * Generates professional PDF invoices using high-performance server-side rendering.
 */
export async function GET(request: NextRequest, props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params;
  try {
    const userId = await authenticateStudent(request);
    
    // 1. Fetch Order Data
    const order = await prisma.order.findUnique({
      where: { id: params.orderId, userId },
      include: {
        course: { select: { title: true, price: true } },
        user: { select: { name: true, email: true } }
      }
    });
    
    if (!order) return API.notFound('Order');
    
    // 2. Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 Size
    const { width, height } = page.getSize();
    
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Header
    page.drawText('SARTHI Engineering', { x: 50, y: height - 50, size: 20, font: fontBold, color: rgb(0.02, 0.3, 0.2) });
    page.drawText('TAX INVOICE', { x: width - 150, y: height - 50, size: 14, font: fontBold });
    
    // Order Info
    page.drawText(`Invoice No: ${order.id.substring(0, 8).toUpperCase()}`, { x: 50, y: height - 100, size: 10, font: fontRegular });
    page.drawText(`Date: ${order.createdAt.toLocaleDateString()}`, { x: 50, y: height - 115, size: 10, font: fontRegular });
    
    // Customer Info
    page.drawText('BILL TO:', { x: 50, y: height - 160, size: 10, font: fontBold });
    page.drawText(order.user.name || 'Student', { x: 50, y: height - 175, size: 12, font: fontRegular });
    page.drawText(order.user.email, { x: 50, y: height - 190, size: 10, font: fontRegular });
    
    // Table Header
    page.drawRectangle({ x: 50, y: height - 240, width: width - 100, height: 25, color: rgb(0.95, 0.95, 0.95) });
    page.drawText('DESCRIPTION', { x: 60, y: height - 232, size: 10, font: fontBold });
    page.drawText('AMOUNT (INR)', { x: width - 130, y: height - 232, size: 10, font: fontBold });
    
    // Table Row
    page.drawText(order.course.title, { x: 60, y: height - 260, size: 10, font: fontRegular });
    page.drawText(`₹${Number(order.course.price).toFixed(2)}`, { x: width - 130, y: height - 260, size: 10, font: fontRegular });
    
    // Total
    page.drawLine({ start: { x: 350, y: height - 300 }, end: { x: width - 50, y: height - 300 }, thickness: 1 });
    page.drawText('GRAND TOTAL:', { x: 350, y: height - 320, size: 12, font: fontBold });
    page.drawText(`₹${Number(order.course.price).toFixed(2)}`, { x: width - 130, y: height - 320, size: 12, font: fontBold });
    
    // Footer
    page.drawText('GSTIN: 27AABCT1234F1Z5', { x: 50, y: 50, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
    page.drawText('This is a computer generated invoice and requires no signature.', { x: 50, y: 40, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });

    const pdfBytes = await pdfDoc.save();
    
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.id}.pdf"`,
        'Cache-Control': 'private, max-age=3600'
      }
    });
    
  } catch (err) {
    console.error('Invoice API Error:', err);
    return API.server();
  }
}
