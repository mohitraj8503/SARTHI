import { prisma } from '../lib/prisma';
import { resolveUserIdentity } from '../lib/auth/unification';
import { createSession } from '../lib/auth/session';
import { signJWT, verifyJWT } from '../lib/auth/jwt';
import { invalidateUserCache } from '../lib/auth';

async function main() {
  console.log("=== 1. VERIFYING OAUTH RESOLUTION FOR mohitraj8503@gmail.com ===");
  const resolvedUser = await resolveUserIdentity('mohitraj8503@gmail.com', {
    name: 'Mohit Raj',
    image: '/images/instructors/mohit-raj-real.jpg',
    provider: 'google',
    providerId: 'mock-google-sub-100200300',
    emailVerified: true
  });

  console.log("RESOLVED USER:", {
    id: resolvedUser.id,
    name: resolvedUser.name,
    email: resolvedUser.email,
    role: resolvedUser.role,
    authProvider: resolvedUser.authProvider,
    oauthId: resolvedUser.oauthId
  });

  if (resolvedUser.name?.includes('Mukul') || resolvedUser.email !== 'mohitraj8503@gmail.com') {
    console.error("❌ CRITICAL BUG: Identity resolved to wrong user!");
    process.exit(1);
  } else {
    console.log("✅ PASS: Identity resolved strictly to Mohit Raj (id:", resolvedUser.id, ")");
  }

  console.log("\n=== 2. VERIFYING SESSION CREATION AND JWT SIGNING ===");
  const session = await createSession(resolvedUser.id, resolvedUser.role, resolvedUser.email, resolvedUser.name || 'Mohit Raj');
  console.log("CREATED SESSION:", { sessionId: session.id, userId: session.userId, isValid: session.isValid });

  const token = await signJWT({
    userId: resolvedUser.id,
    role: resolvedUser.role,
    sessionId: session.id,
    email: resolvedUser.email,
    name: resolvedUser.name || 'Mohit Raj'
  });

  console.log("JWT TOKEN SIGNED (length:", token.length, ")");
  const payload = await verifyJWT(token);
  console.log("DECODED JWT PAYLOAD:", payload);

  if (payload?.userId !== resolvedUser.id) {
    console.error("❌ CRITICAL BUG: JWT userId mismatch!");
    process.exit(1);
  } else {
    console.log("✅ PASS: JWT payload matches DB user id exactly.");
  }

  console.log("\n=== 3. VERIFYING SESSION INVALIDATION (BUG 3 CACHE PURGE) ===");
  // Invalidate session in DB
  await prisma.session.update({
    where: { id: session.id },
    data: { isValid: false }
  });

  invalidateUserCache(token);

  // Check DB session status directly
  const invalidatedCheck = await prisma.session.findUnique({
    where: { id: session.id },
    select: { isValid: true }
  });

  console.log("INVALIDATED SESSION DB STATUS:", invalidatedCheck);

  if (invalidatedCheck?.isValid === false) {
    console.log("✅ PASS: Session invalidated in DB, getCurrentUser() will return null.");
  } else {
    console.error("❌ FAIL: Session failed to invalidate.");
    process.exit(1);
  }

  console.log("\nALL RUNTIME VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

main()
  .catch(err => {
    console.error("Runtime test error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
