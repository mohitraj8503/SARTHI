import { jwtVerify, SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';

const EMERGENCY_SECRET = new TextEncoder().encode(process.env.EMERGENCY_SECRET || 'fallback_emergency_secret_at_least_32_chars');

export async function validateEmergencyToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, EMERGENCY_SECRET);
    
    // Check if token was already used
    // Note: This requires the EmergencyToken table to exist in the DB.
    // If it doesn't exist, this will fail.
    try {
      const usedToken = await prisma.emergencyToken.findUnique({
        where: { id: payload.jti as string }
      });
      
      if (!usedToken || usedToken.used || new Date() > usedToken.expiresAt) {
        return false;
      }
      
      // Mark as used
      await prisma.emergencyToken.update({
        where: { id: payload.jti as string },
        data: { used: true, usedAt: new Date() }
      });
    } catch (e) {
      console.warn('EmergencyToken table not found or query failed. Falling back to JWT-only validation.');
      // Fallback: Just trust the JWT if the table is missing
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function createEmergencyToken(adminId: string, reason: string): Promise<string> {
  const jti = Math.random().toString(36).substring(7);
  
  try {
    await prisma.emergencyToken.create({
      data: {
        id: jti,
        createdBy: adminId,
        reason: reason,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
      }
    });
  } catch (e) {
    console.warn('Could not persist emergency token to DB.');
  }

  return new SignJWT({ reason, jti })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(EMERGENCY_SECRET);
}
