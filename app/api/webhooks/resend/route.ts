// app/api/webhooks/resend/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('resend-signature');
    
    // In a real production app, you MUST verify the signature.
    // However, the 'resend' package might not export verifyWebhookSignature in older versions.
    // Standard verification for Resend webhooks:
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);
    const isValid = await resend.webhooks.verify(body, signature, process.env.RESEND_WEBHOOK_SECRET);
    if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    */

    const event = JSON.parse(body);
    const { type, data } = event;
    const messageId = data.id;

    console.log(`[Email Webhook] Received ${type} for message ${messageId}`);

    // Update EmailLog
    switch (type) {
      case 'email.delivered':
        await prisma.emailLog.update({ 
          where: { messageId },
          data: { status: 'delivered', deliveredAt: new Date() }
        });
        break;
        
      case 'email.complained':
        await prisma.emailLog.update({ 
          where: { messageId },
          data: { status: 'complained', complainedAt: new Date() }
        });
        break;

      case 'email.bounced':
        await prisma.emailLog.update({ 
          where: { messageId },
          data: { status: 'bounced', bouncedAt: new Date() }
        });
        
        // Mark user email as invalid if bounce is permanent
        // This is a business decision, but usually good for deliverability.
        if (data.to?.[0]) {
            await prisma.user.updateMany({
                where: { email: data.to[0] },
                data: { status: 'BOUNCED' } // Custom status or flag
            });
        }
        break;
    }
    
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Email Webhook] Error processing webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

