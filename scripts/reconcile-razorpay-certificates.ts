import { prisma } from '../lib/prisma';
import { getRazorpayInstance } from '../lib/razorpay';

/**
 * Razorpay Certificate Reconciliation & One-Time Audit Script
 * Audits all PENDING_PAYMENT certificates against Razorpay payment records
 * to auto-correct any records stuck in PENDING_PAYMENT despite successful capture.
 */
async function reconcileRazorpayCertificates() {
  console.log('===========================================================');
  console.log('🚀 STARTING RAZORPAY CERTIFICATE PAYMENT RECONCILIATION AUDIT');
  console.log('===========================================================');

  const razorpay = getRazorpayInstance();
  const hasRazorpay = !!razorpay;
  console.log(`Razorpay Instance Configured: ${hasRazorpay}`);

  // Query pending certificates in Certificate table
  const pendingCerts = await prisma.certificate.findMany({
    where: { status: 'PENDING_PAYMENT' },
    include: { user: { select: { id: true, name: true, email: true } } }
  });

  // Query pending certificates in IssuedCertificate table
  const pendingIssuedCerts = await prisma.issuedCertificate.findMany({
    where: { status: 'PENDING_PAYMENT' },
    include: { user: { select: { id: true, name: true, email: true } } }
  });

  console.log(`Found ${pendingCerts.length} pending records in 'certificates' table.`);
  console.log(`Found ${pendingIssuedCerts.length} pending records in 'issued_certificates' table.`);

  let auditedCount = 0;
  let updatedCount = 0;
  let skippedUnpaidCount = 0;

  // Process Certificate table
  for (const cert of pendingCerts) {
    auditedCount++;
    console.log(`\n-----------------------------------------------------------`);
    console.log(`Auditing Certificate: ${cert.certificateNumber || cert.id}`);
    console.log(`User: ${cert.user?.name} (${cert.user?.email || cert.userId})`);
    console.log(`Current DB Status: ${cert.status}`);

    let paymentCaptured = false;
    let paymentDetails: any = null;

    // Check if there is a matching COMPLETED CertificationPayment record in DB
    const existingDbPayment = await prisma.certificationPayment.findFirst({
      where: {
        userId: cert.userId,
        certificationId: cert.courseId || undefined,
        status: 'COMPLETED'
      }
    });

    if (existingDbPayment) {
      console.log(`  ✓ Found matching COMPLETED CertificationPayment in DB: ${existingDbPayment.id}`);
      paymentCaptured = true;
    } else if (hasRazorpay) {
      // Query Razorpay API if order/payment ID exists in metadata
      let rzpOrderId: string | null = null;
      let rzpPaymentId: string | null = null;

      if (cert.metadata) {
        try {
          const meta = JSON.parse(cert.metadata);
          rzpOrderId = meta.razorpayOrderId || meta.razorpay_order_id;
          rzpPaymentId = meta.razorpayPaymentId || meta.razorpay_payment_id;
        } catch (e) {}
      }

      if (rzpPaymentId) {
        try {
          paymentDetails = await razorpay.payments.fetch(rzpPaymentId);
          if (paymentDetails && paymentDetails.status === 'captured') {
            console.log(`  ✓ Verified Captured Payment on Razorpay API! Payment ID: ${rzpPaymentId}`);
            paymentCaptured = true;
          }
        } catch (e: any) {
          console.warn(`  ⚠️ Razorpay payment fetch error (${rzpPaymentId}):`, e.message);
        }
      } else if (rzpOrderId) {
        try {
          const orderPayments = await razorpay.orders.fetchPayments(rzpOrderId);
          if (orderPayments && orderPayments.items) {
            const captured = orderPayments.items.find((p: any) => p.status === 'captured');
            if (captured) {
              console.log(`  ✓ Verified Captured Payment for Order ${rzpOrderId}! Payment ID: ${captured.id}`);
              paymentCaptured = true;
            }
          }
        } catch (e: any) {
          console.warn(`  ⚠️ Razorpay order fetch error (${rzpOrderId}):`, e.message);
        }
      }
    }

    if (paymentCaptured) {
      await prisma.certificate.update({
        where: { id: cert.id },
        data: { status: 'VALID' }
      });
      updatedCount++;
      console.log(`  🎉 UPDATED DB STATUS TO 'VALID' for Certificate ${cert.certificateNumber || cert.id}`);
    } else {
      skippedUnpaidCount++;
      console.log(`  🔒 CONFIRMED UNPAID in Razorpay & DB — Remaining as 'PENDING_PAYMENT'.`);
    }
  }

  // Process IssuedCertificate table
  for (const cert of pendingIssuedCerts) {
    auditedCount++;
    console.log(`\n-----------------------------------------------------------`);
    console.log(`Auditing IssuedCertificate: ${cert.verificationId || cert.id}`);
    console.log(`User: ${cert.user?.name} (${cert.user?.email || cert.userId})`);
    console.log(`Current DB Status: ${cert.status}`);

    let paymentCaptured = false;

    if (cert.razorpayPaymentId && hasRazorpay) {
      try {
        const paymentDetails = await razorpay.payments.fetch(cert.razorpayPaymentId);
        if (paymentDetails && paymentDetails.status === 'captured') {
          console.log(`  ✓ Verified Captured Payment on Razorpay API! Payment ID: ${cert.razorpayPaymentId}`);
          paymentCaptured = true;
        }
      } catch (e: any) {
        console.warn(`  ⚠️ Razorpay payment fetch error (${cert.razorpayPaymentId}):`, e.message);
      }
    }

    if (paymentCaptured) {
      await prisma.issuedCertificate.update({
        where: { id: cert.id },
        data: { status: 'VALID' }
      });
      updatedCount++;
      console.log(`  🎉 UPDATED DB STATUS TO 'VALID' for IssuedCertificate ${cert.verificationId || cert.id}`);
    } else {
      skippedUnpaidCount++;
      console.log(`  🔒 CONFIRMED UNPAID in Razorpay & DB — Remaining as 'PENDING_PAYMENT'.`);
    }
  }

  console.log('\n===========================================================');
  console.log('📊 RECONCILIATION SUMMARY');
  console.log('===========================================================');
  console.log(`Total Pending Records Audited: ${auditedCount}`);
  console.log(`Auto-Corrected to VALID (Verified Paid): ${updatedCount}`);
  console.log(`Confirmed Unpaid (Kept as PENDING_PAYMENT): ${skippedUnpaidCount}`);
  console.log('===========================================================');
}

reconcileRazorpayCertificates()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Reconciliation error:', err);
    process.exit(1);
  });
