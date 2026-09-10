import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { POST as handleRazorpayWebhook } from '../app/api/webhooks/razorpay/route';

async function testRazorpayWebhookIdempotency() {
  console.log('===========================================================');
  console.log('🧪 TESTING RAZORPAY WEBHOOK IDEMPOTENCY (DUPLICATE DELIVERY)');
  console.log('===========================================================');

  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const testCertId = `TT-IDEMP-TEST-${randomNum}`;
  const testPaymentId = `pay_idemp_${randomNum}`;
  const testOrderId = `order_idemp_${randomNum}`;
  const testUser = await prisma.user.findFirst();

  if (!testUser) throw new Error('No test user found in DB');

  // Create pending cert record
  const pendingCert = await prisma.certificate.create({
    data: {
      certificateNumber: testCertId,
      certificateId: testCertId,
      userId: testUser.id,
      courseId: 'python-developer',
      status: 'PENDING_PAYMENT',
      issuedAt: new Date()
    }
  });
  console.log(`Created test pending cert: ${testCertId}`);

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_secret';
  const webhookPayload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: testPaymentId,
          order_id: testOrderId,
          amount: 149900,
          status: 'captured',
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
    .update(webhookPayload)
    .digest('hex');

  // 1. FIRST DELIVERY
  console.log('\n--- 1. Sending First Webhook Delivery ---');
  const req1 = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': validSignature },
    body: webhookPayload
  });

  const res1 = await handleRazorpayWebhook(req1);
  const data1 = await res1.json();
  console.log('First Webhook Delivery Status:', res1.status, 'Response:', data1);

  if (res1.status !== 200 || !data1.success) {
    throw new Error(`First delivery failed: ${JSON.stringify(data1)}`);
  }

  // 2. SECOND DELIVERY (DUPLICATE WEBHOOK)
  console.log('\n--- 2. Sending Duplicate Second Webhook Delivery ---');
  const req2 = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': validSignature },
    body: webhookPayload
  });

  const res2 = await handleRazorpayWebhook(req2);
  const data2 = await res2.json();
  console.log('Second Webhook Delivery Status:', res2.status, 'Response:', data2);

  if (res2.status !== 200 || !data2.idempotent) {
    throw new Error(`FAILED: Second delivery was not handled idempotently! Response: ${JSON.stringify(data2)}`);
  }
  console.log('✓ VERIFIED: Second webhook delivery was safely ignored as IDEMPOTENT without error!');

  // Cleanup test record
  await prisma.certificate.delete({ where: { id: pendingCert.id } });
  console.log('\n===========================================================');
  console.log('🎉 RAZORPAY WEBHOOK IDEMPOTENCY TEST PASSED 100%!');
  console.log('===========================================================');
}

testRazorpayWebhookIdempotency()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Idempotency test error:', err);
    process.exit(1);
  });
