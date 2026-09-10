import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Simple encryption/decryption for secrets
const ENCRYPTION_KEY = process.env.MFA_ENCRYPTION_KEY || 'at_least_32_chars_long_key_for_mfa_encryption';
const IV_LENGTH = 16;

async function encrypt(text: string): Promise<string> {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

async function decrypt(text: string): Promise<string> {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * Multi-Factor Authentication (MFA) Service
 * Provides secure TOTP generation, verification, and persistent storage with encryption.
 */
export class MFAService {
  /**
   * Generates a new TOTP secret and QR code for a user.
   * Secrets are stored in an encrypted state in the database.
   * 
   * @param userId - The ID of the user setting up MFA.
   * @returns Promise<{qrCode: string, secret: string}> - Base64 QR code and plaintext secret.
   */
  static async setupMFA(userId: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userId, 'SARTHI', secret);
    
    // Store secret encrypted
    // Note: This requires MfaConfig table in DB
    try {
      await prisma.mfaConfig.upsert({
        where: { userId },
        create: {
          userId,
          secret: await encrypt(secret),
          backupCodes: await encrypt(JSON.stringify(await this.generateBackupCodes())),
          enabled: false
        },
        update: {
          secret: await encrypt(secret),
          enabled: false
        }
      });
    } catch (e) {
      console.error('MFA setup failed in DB:', e);
      throw new Error('Database error during MFA setup');
    }
    
    return {
      qrCode: await toDataURL(otpauth),
      secret // Show once only
    };
  }
  
  /**
   * Verifies a TOTP token against the user's stored encrypted secret.
   * 
   * @param userId - ID of the user.
   * @param token - The 6-digit code provided by the user.
   * @returns Promise<boolean> - True if the token is valid or MFA is not enabled.
   */
  static async verifyTOTP(userId: string, token: string) {
    try {
      const config = await prisma.mfaConfig.findUnique({ where: { userId } });
      if (!config?.enabled) return true; // Skip if not enabled
      
      const secret = await decrypt(config.secret);
      return authenticator.check(token, secret);
    } catch (e) {
      console.error('MFA verification failed:', e);
      return false;
    }
  }
  
  private static async generateBackupCodes() {
    return Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  }

  static async enableMFA(userId: string, token: string) {
    const config = await prisma.mfaConfig.findUnique({ where: { userId } });
    if (!config) throw new Error('MFA not set up');
    
    const secret = await decrypt(config.secret);
    const isValid = authenticator.check(token, secret);
    
    if (isValid) {
      await prisma.mfaConfig.update({
        where: { userId },
        data: { enabled: true }
      });
      return true;
    }
    return false;
  }
}
