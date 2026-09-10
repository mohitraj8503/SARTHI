import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { POST as handleRazorpayWebhook } from '../app/api/webhooks/razorpay/route';
import { GET as handleVerifyCertificate } from '../app/api/certificates/verify/route';

async function testPaymentStatusBypassFix() {
  console.log('===========================================================');
  console.log('🧪 TESTING PAYMENT STATUS BYPASS & RAZORPAY FIXES');
  console.log('===========================================================');

  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const testCertId = `TT-FSWDM-2026-TEST-${randomNum}`;
  const testUser = await prisma.user.findFirst();

  if (!testUser) {
    throw new Error('No user found in DB to run verification');
  }

  console.log('\n--- 1. Creating Test Record with status = PENDING_PAYMENT ---');
  const pendingCert = await prisma.certificate.create({
    data: {
      certificateNumber: testCertId,
      certificateId: testCertId,
      userId: testUser.id,
      courseId: 'fullstack-mastery',
      status: 'PENDING_PAYMENT',
      issuedAt: new Date()
    }
  });
  console.log('Created Pending Certificate:', pendingCert.certificateNumber, 'Status:', pendingCert.status);

  // Test 1: Verify API route handler GET /api/certificates/verify?id=<testCertId> blocks pending cert
  console.log('\n--- 2. Testing /api/certificates/verify Endpoint Guard ---');
  const verifyReq = new NextRequest(`http://localhost:3000/api/certificates/verify?id=${testCertId}`);
  const verifyRes = await handleVerifyCertificate(verifyReq);
  const verifyData = await verifyRes.json();
  console.log('Verify API Status Code:', verifyRes.status);
  console.log('Verify API Response Body:', verifyData);

  if (verifyRes.status !== 403 || verifyData.status !== 'LOCKED') {
    throw new Error(`FAILED: Endpoint guard did not reject PENDING_PAYMENT record with 403! Got status ${verifyRes.status}`);
  }
  console.log('✓ VERIFIED: /api/certificates/verify blocks PENDING_PAYMENT record with HTTP 403 Forbidden!');

  // Test 2: Test Razorpay Webhook Invalid Signature Rejection
  console.log('\n--- 3. Testing Razorpay Webhook Invalid Signature Rejection ---');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_secret';
  const invalidSigReq = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': 'invalid_signature_hash_12345'
    },
    body: JSON.stringify({ event: 'payment.captured' })
  });
  const invalidSigRes = await handleRazorpayWebhook(invalidSigReq);
  console.log('Invalid Webhook Response Code:', invalidSigRes.status);
  if (invalidSigRes.status !== 400 && invalidSigRes.status !== 401) {
    throw new Error(`FAILED: Webhook accepted invalid signature! Got status ${invalidSigRes.status}`);
  }
  console.log('✓ VERIFIED: Webhook rejects invalid signature with HTTP 400/401!');

  // Test 3: Test Razorpay Webhook Authoritative Processing for payment.captured
  console.log('\n--- 4. Testing Webhook Authoritative Status Update (payment.captured) ---');
  const webhookPayload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: `pay_test_${Math.floor(100000 + Math.random() * 900000)}`,
          order_id: `order_test_${Math.floor(100000 + Math.random() * 900000)}`,
          amount: 149900,
          status: 'captured',
          notes: {
            verificationId: testCertId,
            userId: testUser.id,
            certificationId: 'fullstack-mastery'
          }
        }
      }
    }
  });

  const validSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(webhookPayload)
    .digest('hex');

  const validWebhookReq = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': validSignature
    },
    body: webhookPayload
  });

  const validWebhookRes = await handleRazorpayWebhook(validWebhookReq);
  const validWebhookData = await validWebhookRes.json();
  console.log('Valid Webhook Response Code:', validWebhookRes.status);
  console.log('Valid Webhook Response Data:', validWebhookData);

  if (!validWebhookRes.ok || !validWebhookData.success) {
    throw new Error(`FAILED: Webhook execution failed! Response: ${JSON.stringify(validWebhookData)}`);
  }

  // Test 4: Single Source of Truth DB Check
  console.log('\n--- 5. Verifying DB Status updated to VALID by Webhook ---');
  const updatedCert = await prisma.certificate.findUnique({
    where: { id: pendingCert.id }
  });

  console.log('DB Certificate Status after Webhook:', updatedCert?.status);
  if (updatedCert?.status !== 'VALID') {
    throw new Error(`FAILED: DB status was not updated to VALID by webhook! Current status: ${updatedCert?.status}`);
  }
  console.log('✓ VERIFIED: Database status updated to VALID authoritatively by webhook!');

  // Cleanup test record
  await prisma.certificate.delete({ where: { id: pendingCert.id } });
  console.log('\n===========================================================');
  console.log('🎉 ALL PAYMENT STATUS BYPASS & RAZORPAY VERIFICATION TESTS PASSED!');
  console.log('===========================================================');
}

testPaymentStatusBypassFix()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Verification failed:', err);
    process.exit(1);
  });
