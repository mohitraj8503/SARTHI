export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { createAdminNotification } from '@/lib/admin/notifications';

import { contactSchema } from '@/lib/validators/schemas';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json(
        { message: firstError, details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = validationResult.data;

    // Create admin notification
    await createAdminNotification({
      title: `New Contact Inquiry: ${subject}`,
      body: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nSubject: ${subject}\n\nMessage:\n${message}`,
      type: 'contact_inquiry',
      meta: { name, email, phone, subject, message }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}

