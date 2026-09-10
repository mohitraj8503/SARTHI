import { passwordSchema } from '@/lib/auth/password-policy';
import { hasPwnedPassword } from 'hibp';

// Mock hibp
jest.mock('hibp');

describe('Password Policy Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject passwords shorter than 12 characters', async () => {
    const result = await passwordSchema.safeParseAsync('Short1!abc');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 12 characters');
    }
  });

  it('should reject passwords without uppercase letters', async () => {
    const result = await passwordSchema.safeParseAsync('lowercaseno1!');
    expect(result.success).toBe(false);
  });

  it('should reject passwords without numbers', async () => {
    const result = await passwordSchema.safeParseAsync('NoNumberAtAll!');
    expect(result.success).toBe(false);
  });

  it('should reject passwords without special characters', async () => {
    const result = await passwordSchema.safeParseAsync('NoSpecialChar123');
    expect(result.success).toBe(false);
  });

  it('should reject breached passwords', async () => {
    (hasPwnedPassword as jest.Mock).mockResolvedValue(true);
    const result = await passwordSchema.safeParseAsync('StrongPassword123!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password appears in known data breaches');
    }
  });

  it('should accept a valid strong, non-breached password', async () => {
    (hasPwnedPassword as jest.Mock).mockResolvedValue(false);
    const result = await passwordSchema.safeParseAsync('V3ryStr0ngP@ssw0rd2026!');
    expect(result.success).toBe(true);
  });
});
