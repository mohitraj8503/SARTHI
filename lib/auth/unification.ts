import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';
import { determineRole } from '@/lib/auth';

export async function resolveUserIdentity(email: string, metadata: {
  name?: string;
  image?: string;
  provider: string;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  emailVerified?: boolean;
}) {
  const normalizedEmail = email.toLowerCase();
  const now = new Date();

  // 1. Audit Log: Start resolution
  console.log(`[AUTH_AUDIT] Starting identity resolution for ${normalizedEmail} via ${metadata.provider}`);

  // 2. Find user by OAuth ID first (most stable connection)
  const oauthResult = await withResiliency(
    () => prisma.user.findUnique({
      where: { 
        authProvider_oauthId: {
          authProvider: metadata.provider,
          oauthId: metadata.providerId
        }
      }
    }),
    `oauth_lookup_${metadata.provider}_${metadata.providerId}`
  );
  // ⚠️ FIX: If DB is down/timed out, oauthResult.data is null but success=false.
  // Previously this was silently treated as "user not found" — triggering
  // more DB ops that all fail, ultimately returning null → service_outage.
  // Now we throw immediately so the OAuth callback catch block handles it.
  if (!oauthResult.success && !oauthResult.isCached) {
    console.error(`[AUTH_UNIFICATION] DB unavailable during oauth lookup: ${oauthResult.error}`);
    throw new Error(`DB_UNAVAILABLE:${oauthResult.error}`);
  }
  let user = oauthResult.data;

  // 3. Handle email-based lookup for linking or collision detection
  if (!user) {
    const emailResult = await withResiliency(
      () => prisma.user.findUnique({
        where: { email: normalizedEmail }
      }),
      `email_lookup_${normalizedEmail}`
    );
    if (!emailResult.success && !emailResult.isCached) {
      console.error(`[AUTH_UNIFICATION] DB unavailable during email lookup: ${emailResult.error}`);
      throw new Error(`DB_UNAVAILABLE:${emailResult.error}`);
    }
    const existingUser = emailResult.data;

    if (existingUser) {
      // SECURITY: Prevent silent account takeover
      // If email exists but was registered with a different provider (including 'credentials' / email-password)
      // We only auto-link if the incoming OAuth email is already verified by the provider.
      if (metadata.emailVerified !== true) {
        console.warn(`[AUTH_SECURITY_WARNING] Blocked unverified email linking: ${normalizedEmail} from ${metadata.provider}`);
        throw new Error('UNVERIFIED_EMAIL_COLLISION');
      }

      // If existing user has a different auth provider, log it
      if (existingUser.authProvider && existingUser.authProvider !== metadata.provider) {
        console.log(`[AUTH_AUDIT] Linking existing account (${existingUser.authProvider}) to new provider (${metadata.provider}) for ${normalizedEmail}`);
      }

      // Link the account
      const linkResult = await withResiliency(
        () => prisma.user.update({
          where: { id: existingUser.id },
          data: {
            authProvider: metadata.provider,
            oauthId: metadata.providerId,
            oauthImage: metadata.image, // Always sync provider image to secondary field
            lastActive: now,
            loginCount: { increment: 1 },
            // If the primary image is null, we can seed it from OAuth once
            image: existingUser.image || metadata.image,
            status: existingUser.status === 'PENDING' ? 'ACTIVE' : existingUser.status,
          }
        }),
        `oauth_link_${existingUser.id}`
      );
      if (!linkResult.success && !linkResult.isCached) {
        console.error(`[AUTH_UNIFICATION] DB unavailable during account link: ${linkResult.error}`);
        throw new Error(`DB_UNAVAILABLE:${linkResult.error}`);
      }
      user = linkResult.data;

      // Ensure enrollment is set for linked users
      if (user) {
        const { ensureUserEnrollment } = await import('@/lib/enrollment');
        await ensureUserEnrollment(user.id);
      }
    }
  } else {
    // 4. Update existing returning user (found via OAuth ID lookup in Step 2)
    const { ensureUserEnrollment } = await import('@/lib/enrollment');
    await ensureUserEnrollment(user.id); // Silent fix if missing

    const updateResult = await withResiliency(
      () => prisma.user.update({
        where: { id: user!.id },
        data: {
          lastActive: now,
          loginCount: { increment: 1 }
        }
      }),
      `oauth_update_${user.id}`
    );
    // Non-critical update — if it fails, use the already-fetched user object
    // rather than returning null. The user is still authenticated.
    if (updateResult.success || updateResult.isCached) {
      user = updateResult.data ?? user;
    } else {
      console.warn(`[AUTH_UNIFICATION] Non-critical: failed to update lastActive for ${user.id}, proceeding with login.`);
    }
  }
  if (!user) {
    // SECURITY: Only create NEW users if email is verified by provider
    if (metadata.emailVerified !== true) {
      console.warn(`[AUTH_SECURITY_WARNING] Denied creation for unverified email: ${normalizedEmail} from ${metadata.provider}`);
      throw new Error('UNVERIFIED_EMAIL_FORBIDDEN');
    }

    const userRole = determineRole(normalizedEmail);
    const isStaffOrMentor = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'TEACHER', 'INSTRUCTOR', 'MENTOR', 'CTO', 'LEAD_DEVELOPER'].includes(userRole);
    const { generateUniqueUserId } = await import('@/lib/id-generator');
    const enrollmentNumber = await generateUniqueUserId(userRole);

    const createResult = await withResiliency(
      () => prisma.user.create({
        data: {
          email: normalizedEmail,
          name: metadata.name,
          image: metadata.image,
          oauthImage: metadata.image,
          authProvider: metadata.provider,
          oauthId: metadata.providerId,
          role: userRole,
          status: 'ACTIVE',
          onboarded: isStaffOrMentor,
          onboardingStatus: isStaffOrMentor ? 'COMPLETED' : 'NOT_STARTED',
          loginCount: 1,
          avatar_version: 0,
          enrollmentNumber: userRole === 'MENTOR' ? 'Mentor' : enrollmentNumber
        }
      })
    );
    if (!createResult.success) {
      console.error(`[AUTH_UNIFICATION] DB unavailable during user creation: ${createResult.error}`);
      throw new Error(`DB_UNAVAILABLE:${createResult.error}`);
    }
    user = createResult.data;
    console.log(`[AUTH_AUDIT] Created new ${userRole} account for ${normalizedEmail} via ${metadata.provider}`);
  }

  // Self-healing check for mentor/staff accounts: ensure role and onboarded status are updated
  if (user) {
    const isStaffOrMentor = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'TEACHER', 'INSTRUCTOR', 'MENTOR', 'CTO', 'LEAD_DEVELOPER'].includes((user.role || '').toUpperCase());
    const shouldBeMentor = normalizedEmail === 'pm.enthuse@gmail.com';
    
    if (shouldBeMentor && user.role !== 'MENTOR') {
      const healResult = await withResiliency(
        () => prisma.user.update({
          where: { id: user!.id },
          data: { role: 'MENTOR', onboarded: true, onboardingStatus: 'COMPLETED' }
        })
      );
      if (healResult.data) user = healResult.data;
    } else if (isStaffOrMentor && !user.onboarded) {
      const healResult = await withResiliency(
        () => prisma.user.update({
          where: { id: user!.id },
          data: { onboarded: true, onboardingStatus: 'COMPLETED' }
        })
      );
      if (healResult.data) user = healResult.data;
    }
  }

  return user;
}

/**
 * Image resolution logic (Tiered Priority)
 * 1. User Uploaded (avatar_url) + Cache Buster
 * 2. Standard field (image)
 * 3. OAuth Provider fallback (oauthImage)
 */
export function resolveProfileImage(user: any) {
  // 1. avatar_url takes absolute priority (User Controlled)
  if (user.avatar_url) {
    const version = user.avatar_version || 0;
    return `${user.avatar_url}${user.avatar_url.includes('?') ? '&' : '?'}v=${version}`;
  }
  
  // 2. Standard image field (could be manual or initial provider sync)
  if (user.image) return user.image;
  
  // 3. Fallback to latest OAuth image from metadata
  if (user.oauthImage) return user.oauthImage;
  
  // 4. System Default
  return "/avatar.png";
}
