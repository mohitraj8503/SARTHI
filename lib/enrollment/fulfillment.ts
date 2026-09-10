import { prisma } from '@/lib/prisma';
import { sendTransactionalEmail } from '@/lib/email/send';
import bcrypt from 'bcryptjs';

export interface FulfillEnrollmentParams {
  userId?: string;
  courseId: string;
  paymentId: string;
  orderId?: string;
  paymentLinkId?: string;
  amountPaid: number;
  currency?: string;
  isGroup?: boolean;
  members?: Array<{ name?: string; email: string; phone?: string }>;
  referralCoupon?: string;
  guestUser?: {
    email: string;
    name: string;
    phone?: string;
  };
  origin?: string;
}

export interface FulfillEnrollmentResult {
  success: boolean;
  enrollmentId: string;
  isGroup: boolean;
  squadId?: string;
  alreadyProcessed?: boolean;
}

/**
 * Authoritative, atomic enrollment fulfillment engine.
 * Idempotent, safe against duplicate webhooks / multi-tab callbacks, handles solo & squad.
 */
export async function fulfillCourseEnrollment(params: FulfillEnrollmentParams): Promise<FulfillEnrollmentResult> {
  const {
    userId,
    courseId,
    paymentId,
    orderId,
    paymentLinkId,
    amountPaid,
    currency = 'INR',
    isGroup = false,
    members = [],
    referralCoupon,
    guestUser,
    origin = 'https://sarthi-woad.vercel.app'
  } = params;

  console.log(`[FULFILLMENT_ENGINE] Initiating fulfillment: course=${courseId}, payment=${paymentId}, order=${orderId}, isGroup=${isGroup}`);

  // 1. Idempotency Check on Transaction
  if (paymentId) {
    const existingTx = await prisma.transaction.findFirst({
      where: {
        OR: [
          { razorpayPaymentId: paymentId },
          ...(orderId ? [{ razorpayOrderId: orderId }] : []),
        ],
        status: 'SUCCESS'
      }
    });

    if (existingTx) {
      console.log(`[FULFILLMENT_ENGINE] Transaction already marked SUCCESS for paymentId: ${paymentId}`);
      // Find matching enrollment
      const existingEnroll = await prisma.enrollment.findFirst({
        where: {
          courseId,
          ...(userId ? { userId } : {})
        }
      });

      return {
        success: true,
        enrollmentId: existingEnroll?.enrollmentCode || existingEnroll?.id || 'COMPLETED',
        isGroup,
        alreadyProcessed: true
      };
    }
  }

  const emailQueue: Array<{
    email: string;
    name: string;
    tempPassword?: string;
    isLeader: boolean;
    squadName: string;
  }> = [];

  // 2. Perform Atomic Database Transaction
  const result = await prisma.$transaction(async (tx) => {
    // A. Marketing / Affiliate Coupon Resolution
    let partner: any = null;
    let coupon: any = null;
    let commissionPercentage = 5.0;

    if (referralCoupon) {
      coupon = await tx.marketingCoupon.findFirst({
        where: { couponCode: referralCoupon, active: true },
        include: { partner: true }
      });
      if (coupon && coupon.partner && coupon.partner.status === 'ACTIVE') {
        partner = coupon.partner;
        const settings = await tx.marketingSettings.findFirst();
        if (settings) {
          commissionPercentage = settings.commissionPercentage;
        }
        await tx.marketingCoupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }
    }

    // B. Course Resolution
    let course = await tx.course.findFirst({
      where: {
        OR: [
          { id: courseId },
          { slug: courseId }
        ]
      },
      select: { id: true, title: true, price: true, instructorId: true }
    });

    if (!course && courseId === 'summer-camp-2026') {
      const adminUser = await tx.user.findFirst({ where: { role: 'ADMIN' } });
      course = {
        id: 'summer-camp-2026',
        title: isGroup ? 'SARTHI Summer Camp 2026 (Group)' : 'SARTHI Summer Camp 2026',
        price: isGroup ? 2500 : 1000,
        instructorId: adminUser?.id || 'admin_fallback'
      } as any;
    }

    if (!course) {
      throw new Error(`Course not found for ID/Slug: ${courseId}`);
    }

    // C. Buyer User Resolution
    let buyerUser: any = null;
    if (userId) {
      buyerUser = await tx.user.findUnique({ where: { id: userId } });
    }

    if (!buyerUser) {
      const buyerEmail = (members && members[0]?.email) || guestUser?.email;
      if (!buyerEmail) {
        throw new Error('Buyer email or user ID required for enrollment');
      }

      const cleanEmail = buyerEmail.toLowerCase().trim();
      buyerUser = await tx.user.findUnique({ where: { email: cleanEmail } });

      if (!buyerUser) {
        const tempPassword = `TT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const hashedPassword = await bcrypt.hash(tempPassword, 12);
        buyerUser = await tx.user.create({
          data: {
            email: cleanEmail,
            name: (members && members[0]?.name) || guestUser?.name || cleanEmail.split('@')[0],
            password: hashedPassword,
            tempPassword,
            requiresPasswordChange: true,
            role: 'STUDENT',
            status: 'ACTIVE',
            onboarded: true,
          }
        });

        emailQueue.push({
          email: cleanEmail,
          name: buyerUser.name || 'Student',
          tempPassword,
          isLeader: true,
          squadName: `${buyerUser.name || 'Innovator'}'s Squad`
        });
      }
    }

    if (!buyerUser) {
      throw new Error('Unable to resolve or create student user account');
    }

    // D. Upsert Transaction Record
    const txIdentifier = orderId || paymentLinkId || `tx_${paymentId}`;
    await tx.transaction.upsert({
      where: { razorpayOrderId: txIdentifier },
      update: {
        status: 'SUCCESS',
        razorpayPaymentId: paymentId,
        amount: amountPaid,
        updatedAt: new Date()
      },
      create: {
        userId: buyerUser.id,
        courseId: course.id,
        amount: amountPaid,
        status: 'SUCCESS',
        razorpayOrderId: txIdentifier,
        razorpayPaymentId: paymentId,
        currency,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // E. Enrollment Fulfillment (Squad vs Solo)
    if (isGroup && members && members.length > 0) {
      const squadName = `${buyerUser.name || 'Innovator'}'s Squad`;
      const squad = await tx.squad.create({
        data: {
          squadName,
          leaderId: buyerUser.id,
          campId: course.id,
          status: 'active',
          paymentStatus: 'paid'
        }
      });

      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        if (!m.email) continue;
        const memberEmail = m.email.toLowerCase().trim();
        let mUser = await tx.user.findUnique({ where: { email: memberEmail } });
        let tempPasswordPlain: string | undefined = undefined;

        if (!mUser) {
          tempPasswordPlain = `TT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const hashedPassword = await bcrypt.hash(tempPasswordPlain, 12);
          mUser = await tx.user.create({
            data: {
              email: memberEmail,
              name: m.name || memberEmail.split('@')[0],
              password: hashedPassword,
              tempPassword: tempPasswordPlain,
              requiresPasswordChange: true,
              role: 'STUDENT',
              status: 'ACTIVE',
              onboarded: true,
            }
          });

          emailQueue.push({
            email: memberEmail,
            name: mUser.name || 'Team Member',
            tempPassword: tempPasswordPlain,
            isLeader: i === 0 || memberEmail === buyerUser.email.toLowerCase(),
            squadName
          });
        }

        await tx.squadMember.upsert({
          where: {
            squadId_userId: {
              squadId: squad.id,
              userId: mUser.id
            }
          },
          update: {
            role: (i === 0 || memberEmail === buyerUser.email.toLowerCase()) ? 'leader' : 'member'
          },
          create: {
            squadId: squad.id,
            userId: mUser.id,
            role: (i === 0 || memberEmail === buyerUser.email.toLowerCase()) ? 'leader' : 'member'
          }
        });

        const existingEnrollment = await tx.enrollment.findFirst({
          where: { userId: mUser.id, courseId: course.id }
        });

        if (!existingEnrollment) {
          const mEnrollmentCode = `TT-SC26-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
          await tx.enrollment.create({
            data: {
              userId: mUser.id,
              courseId: course.id,
              status: 'active',
              progressPercentage: 0,
              enrollmentCode: mEnrollmentCode,
              enrollmentNo: Math.floor(1000 + Math.random() * 9000),
              paymentId,
              squadId: squad.id,
              referralCoupon
            }
          });
        }
      }

      return { squadId: squad.id, enrollmentId: squad.id, isGroup: true };
    } else {
      // Solo enrollment
      const existingEnrollment = await tx.enrollment.findFirst({
        where: { userId: buyerUser.id, courseId: course.id }
      });

      let enrollment = existingEnrollment;
      if (!enrollment) {
        const enrollmentCode = `TT-ENR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        enrollment = await tx.enrollment.create({
          data: {
            userId: buyerUser.id,
            courseId: course.id,
            status: 'active',
            progressPercentage: 0,
            enrollmentCode,
            enrollmentNo: Math.floor(1000 + Math.random() * 9000),
            paymentId,
            referralCoupon
          }
        });

        // Notifications
        await tx.notification.create({
          data: {
            userId: buyerUser.id,
            title: 'Enrollment Confirmed!',
            body: `You have successfully enrolled in ${course.title}. Happy learning!`,
            type: 'ENROLLMENT_SUCCESS',
            href: `/courses/${course.id}/learn`
          }
        });

        if (!emailQueue.some(e => e.email === buyerUser.email)) {
          emailQueue.push({
            email: buyerUser.email,
            name: buyerUser.name || 'Learner',
            isLeader: false,
            squadName: ''
          });
        }
      }

      return { enrollmentId: enrollment.enrollmentCode || enrollment.id, isGroup: false };
    }
  });

  // 3. Post-Transaction Email Notifications
  try {
    for (const recipient of emailQueue) {
      let emailHtml = '';
      if (recipient.tempPassword) {
        emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0A1628; color: #FFFFFF; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
            <h2 style="color: #FF8A00; text-align: center; margin-top: 0;">Welcome to SARTHI</h2>
            <p>Hello <strong>${recipient.name}</strong>,</p>
            <p>Your enrollment has been successfully confirmed!</p>
            <div style="background-color: rgba(255,255,255,0.06); padding: 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); margin: 20px 0;">
              <h4 style="color: #10B981; margin-top: 0;">Your Account Credentials</h4>
              <p style="margin: 6px 0;"><strong>Email:</strong> ${recipient.email}</p>
              <p style="margin: 6px 0;"><strong>Temporary Password:</strong> <code style="background-color: #050B14; padding: 4px 8px; border-radius: 6px; font-weight: bold; color: #FF8A00;">${recipient.tempPassword}</code></p>
            </div>
            <p style="color: #94A3B8; font-size: 13px;">You can change your password anytime in your dashboard profile settings.</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${origin}/login" style="background: linear-gradient(135deg, #FF8A00, #E65100); color: white; padding: 12px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Start Learning Now</a>
            </div>
          </div>
        `;
      } else {
        emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0A1628; color: #FFFFFF; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
            <h2 style="color: #10B981; text-align: center; margin-top: 0;">Enrollment Confirmed!</h2>
            <p>Hello <strong>${recipient.name}</strong>,</p>
            <p>Your payment has been verified and your course enrollment is active.</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${origin}/dashboard/courses" style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 12px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Open My Courses</a>
            </div>
          </div>
        `;
      }

      await sendTransactionalEmail({
        to: recipient.email,
        subject: `Enrollment Confirmed — SARTHI`,
        html: emailHtml,
        type: 'enrollment'
      });
    }
  } catch (err) {
    console.error('[FULFILLMENT_EMAIL_NOTIFICATION_ERROR]', err);
  }

  return {
    success: true,
    enrollmentId: result.enrollmentId,
    isGroup: result.isGroup,
    squadId: (result as any).squadId
  };
}
