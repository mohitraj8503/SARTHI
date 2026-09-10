import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRazorpayInstance } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { verificationId } = await req.json();

    if (!verificationId) {
      return NextResponse.json({ error: 'Verification ID is required' }, { status: 400 });
    }

    const isMock = verificationId === 'TT-PY-PRO-2026-000004' || verificationId === 'TT-PY-PRO-2026-000007' || verificationId === 'TT-PY-PRO-2026-000008';
    
    let issuedCert = null;
    if (!isMock) {
      issuedCert = await prisma.issuedCertificate.findUnique({
        where: { verificationId },
        include: { user: true, certification: true }
      });
      if (!issuedCert) {
        return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
      }
      if (issuedCert.status === 'VALID') {
        return NextResponse.json({ error: 'Certificate is already active' }, { status: 400 });
      }
    }

    const amount = 2000 * 100; // ₹2000 in paise
    const mockTitle = 'Python Professional Developer Certification';
    const mockUser = verificationId === 'TT-PY-PRO-2026-000004' ? 'Ashish Raj' : verificationId === 'TT-PY-PRO-2026-000007' ? 'Keshav Kumar' : 'Pranshu Singh';

    const razorpay = getRazorpayInstance();
    
    if (!razorpay) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `activate_${verificationId.substring(0, 15)}_${Date.now()}`,
      notes: {
        title: isMock ? 'Python Professional Developer Certification' : issuedCert!.certification.title,
        certificationId: isMock ? 'cert_python_mock' : issuedCert!.certificationId,
        verificationId: verificationId,
        userId: isMock ? 'mock_user' : issuedCert!.userId,
        score: isMock ? '100' : String(issuedCert!.score)
      }
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      user: {
        name: isMock ? mockUser : issuedCert!.user.name,
        email: isMock ? `${mockUser.toLowerCase().replace(' ', '')}@example.com` : issuedCert!.user.email,
        phone: isMock ? '' : (issuedCert!.user.phone || '')
      },
      title: isMock ? 'Python Professional Developer Certification' : issuedCert!.certification.title
    });
  } catch (error: any) {
    console.error('Create activation order error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
