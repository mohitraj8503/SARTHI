import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { sendPushToUser } from './push';
import { emailEnv } from '../env/email';

export async function onBlogAccessRequested(requestId: string) {
  const request = await prisma.blogAccessRequest.findUnique({
    where: { id: requestId },
    include: { user: true }
  });

  if (!request) return;

  // 1. Notify Admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });

  for (const admin of admins) {
    if (admin.email) {
      await sendEmail({
        to: admin.email,
        subject: `New Blog Access Request: ${request.name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>New Blog Access Request</h2>
            <p><strong>Name:</strong> ${request.name}</p>
            <p><strong>Email:</strong> ${request.email}</p>
            <p>A new student has requested access to the blog writer ecosystem.</p>
            <div style="margin-top: 20px;">
              <a href="${emailEnv.APP_URL}/admin/blogs/access-requests" 
                 style="background: #174F3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
                Review Request
              </a>
            </div>
          </div>
        `
      }).catch(console.error);
    }
  }

  // 2. In-app notification for the user (skipped due to schema constraints)
  // TODO: Add BLOG_ACCESS_REQUESTED to notifications_type enum in schema.prisma and migrate
}

export async function onBlogAccessUpdated(requestId: string) {
  const request = await prisma.blogAccessRequest.findUnique({
    where: { id: requestId },
    include: { user: true }
  });

  if (!request) return;

  const isApproved = request.status === 'approved';
  const title = isApproved ? 'Blog Access Approved! 🎉' : 'Blog Access Update';
  const body = isApproved 
    ? 'Congratulations! You now have access to the blog writer dashboard.' 
    : 'Your request for blog access was not approved at this time.';

  // 1. Email notification
  if (request.user.email) {
    await sendEmail({
      to: request.user.email,
      subject: title,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>${title}</h2>
          <p>Hi ${request.user.name || 'Creator'},</p>
          <p>${body}</p>
          ${isApproved ? `
            <div style="margin-top: 30px;">
              <a href="${emailEnv.APP_URL}/dashboard/blogs" 
                 style="background: #174F3A; color: white; padding: 16px 32px; text-decoration: none; border-radius: 14px; font-weight: 800; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                Start Writing
              </a>
            </div>
          ` : ''}
        </div>
      `
    }).catch(console.error);
  }

  // 2. Push notification
  await sendPushToUser(request.userId, {
    title,
    body,
    url: '/dashboard/blogs',
  }).catch(console.error);
}
