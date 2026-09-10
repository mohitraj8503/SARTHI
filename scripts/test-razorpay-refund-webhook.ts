import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { POST as handleRazorpayWebhook } from '../app/api/webhooks/razorpay/route';
import { GET as handleVerifyCertificate } from '../app/api/certificates/verify/route';

async function testRazorpayRefundWebhook() {
  console.log('===========================================================');
  console.log('🧪 TESTING RAZORPAY REFUND / REVERSAL WEBHOOK HANDLER');
  console.log('===========================================================');

  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const testCertId = `TT-REFUND-TEST-${randomNum}`;
  const testPaymentId = `pay_refund_${randomNum}`;
  const testOrderId = `order_refund_${randomNum}`;
  const testUser = await prisma.user.findFirst();

  if (!testUser) throw new Error('No test user found in DB');

  // 1. Create a VALID certificate record
  const validCert = await prisma.certificate.create({
    data: {
      certificateNumber: testCertId,
      certificateId: testCertId,
      userId: testUser.id,
      courseId: 'python-developer',
      status: 'VALID',
      issuedAt: new Date()
    }
  });
  console.log(`Created VALID test certificate: ${testCertId}`);

  // 2. Send refund.processed webhook payload
  console.log('\n--- 1. Sending refund.processed Webhook Payload ---');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_secret';
  const refundPayload = JSON.stringify({
    event: 'refund.processed',
    payload: {
      payment: {
        entity: {
          id: testPaymentId,
          order_id: testOrderId,
          amount: 149900,
          status: 'refunded',
          notes: {
            verificationId: testCertId,
            userId: testUser.id,
            certificationId: 'python-developer'
          }
        }
      }
    }
  });

  const validSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(refundPayload)
    .digest('hex');

  const req = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': validSignature },
    body: refundPayload
  });

  const res = await handleRazorpayWebhook(req);
  const data = await res.json();
  console.log('Refund Webhook Response Status:', res.status, 'Body:', data);

  if (res.status !== 200 || !data.reverted) {
    throw new Error(`FAILED: Refund webhook failed to revert status! Response: ${JSON.stringify(data)}`);
  }

  // 3. Check DB Status
  console.log('\n--- 2. Checking DB Status after Refund Webhook ---');
  const updatedCert = await prisma.certificate.findUnique({
    where: { id: validCert.id }
  });
  console.log('Updated Certificate DB Status:', updatedCert?.status);

  if (updatedCert?.status !== 'REFUNDED') {
    throw new Error(`FAILED: DB status was not reverted to REFUNDED! Got: ${updatedCert?.status}`);
  }
  console.log('✓ VERIFIED: Database status updated to REFUNDED!');

  // 4. Check Endpoint Defense-in-Depth Rejection on verify route
  console.log('\n--- 3. Testing /api/certificates/verify Guard on REFUNDED cert ---');
  const verifyReq = new NextRequest(`http://localhost:3000/api/certificates/verify?id=${testCertId}`);
  const verifyRes = await handleVerifyCertificate(verifyReq);
  const verifyData = await verifyRes.json();
  console.log('Verify API Response Status Code:', verifyRes.status);
  console.log('Verify API Response Body:', verifyData);

  if (verifyRes.status !== 403 || verifyData.status !== 'LOCKED') {
    throw new Error(`FAILED: Endpoint guard did not reject REFUNDED cert with HTTP 403 Forbidden! Got ${verifyRes.status}`);
  }
  console.log('✓ VERIFIED: /api/certificates/verify rejects REFUNDED cert with HTTP 403 Forbidden!');

  // Cleanup test record
  await prisma.certificate.delete({ where: { id: validCert.id } });
  console.log('\n===========================================================');
  console.log('🎉 RAZORPAY REFUND WEBHOOK TEST PASSED 100%!');
  console.log('===========================================================');
}

testRazorpayRefundWebhook()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Refund test error:', err);
    process.exit(1);
  });
