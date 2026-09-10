import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTransactionalEmail } from '@/lib/email/send';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      organization,
      type,
      state,
      district,
      areaType,
      students,
      infra,
      intent
    } = body;

    // 1. Create Database Entry
    const request = await prisma.partnerRequest.create({
      data: {
        name,
        email,
        phone,
        organization,
        type,
        state,
        district,
        areaType,
        students,
        infra: JSON.stringify(infra),
        intent,
        status: 'pending'
      }
    });

    // 2. Send Email to Admin
    await sendTransactionalEmail({
      to: 'sarthilive@gmail.com',
      subject: `🚀 New Partnership Request – ${organization}`,
      type: 'application',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1a3c2e;">
          <h2 style="color: #10b981;">New Partner Application Received</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>👤 Name:</strong> ${name}</p>
          <p><strong>📧 Email:</strong> ${email}</p>
          <p><strong>📱 Phone:</strong> ${phone}</p>
          <br/>
          <p><strong>🏫 Organization:</strong> ${organization}</p>
          <p><strong>🏷 Type:</strong> ${type}</p>
          <br/>
          <p><strong>📍 Location:</strong></p>
          <ul style="list-style: none; padding-left: 0;">
            <li>- State: ${state}</li>
            <li>- District: ${district}</li>
            <li>- Area: ${areaType}</li>
          </ul>
          <br/>
          <p><strong>📊 Capacity:</strong></p>
          <ul style="list-style: none; padding-left: 0;">
            <li>- Students: ${students}</li>
            <li>- Infrastructure: ${Array.isArray(infra) ? infra.join(', ') : infra}</li>
          </ul>
          <br/>
          <p><strong>🎯 Intent:</strong></p>
          <p style="background: #f8f8f6; padding: 15px; border-radius: 8px;">${intent}</p>
          <br/>
          <p style="font-size: 12px; color: #666;">Submitted At: ${new Date().toLocaleString()}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/partners" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">View in Admin Dashboard</a>
        </div>
      `
    });

    // 3. Send Auto-Reply to User
    await sendTransactionalEmail({
      to: email,
      subject: 'We’ve received your partnership request 🤝',
      type: 'application',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1a3c2e;">
          <h2 style="color: #10b981;">Hi ${name},</h2>
          <p>Thank you for showing interest in partnering with <strong>SARTHI</strong>.</p>
          <p>Our team has received your request and will review it shortly. You can expect a response within 24–48 hours.</p>
          <p>We’re excited about the possibility of working together to bring digital skills and opportunities to your community.</p>
          <br/>
          <p>Best Regards,</p>
          <p><strong>Team SARTHI</strong></p>
        </div>
      `
    });

    return NextResponse.json({ success: true, id: request.id });
  } catch (error: any) {
    console.error('[PARTNER_REQUEST_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
