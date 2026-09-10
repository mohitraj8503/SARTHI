import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .max(255, 'Email too long'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character/symbol')
    .refine(val => !['password123', '123456789012', 'admin12345678'].some(common => val.toLowerCase().includes(common)), {
      message: 'Password is too common or easy to guess.',
    }),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .trim()
    .optional(),
  referralCode: z.string()
    .max(50, 'Referral code too long')
    .refine(val => !val || /^TT-[A-Za-z]+-[A-Za-z0-9]{4}$/.test(val), {
      message: 'Invalid referral code format. Must be like TT-FIRSTNAME-4CHARS.',
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .max(255, 'Email too long'),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password too long'),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .max(255, 'Email too long'),
});

export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Token is required')
    .max(512, 'Invalid token'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character/symbol')
    .refine(val => !['password123', '123456789012', 'admin12345678'].some(common => val.toLowerCase().includes(common)), {
      message: 'Password is too common or easy to guess.',
    }),
});
