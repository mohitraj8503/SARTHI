import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional().nullable(),
  headline: z.string().max(100, 'Headline cannot exceed 100 characters').optional().nullable(),
  location: z.string().max(100, 'Location cannot exceed 100 characters').optional().nullable(),
  socialLinks: z.string().optional().nullable(), // Validated as JSON if needed, but keeping simple string for now
});

export const courseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'All Levels']),
});

export const feedbackSchema = z.object({
  type: z.enum(['GENERAL', 'BUG', 'FEATURE']), // Match Prisma enum convention usually uppercase or check usage.
  // Code said `type || 'GENERAL'`, implies string.
  title: z.string().min(3, 'Title too short').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  rating: z.number().min(1).max(5).optional(),
});
