import { z } from 'zod';

// India Phone number schema: optional +91, followed by 10 digits starting with 6-9
export const phoneSchema = z.string()
  .trim()
  .regex(/^(?:\+91|91)?[6-9]\d{9}$/, 'Invalid Indian phone number format. Must be a valid 10-digit mobile number.');

// URL schema restricted to HTTPS protocol only (protects against javascript: schemes)
export const httpsUrlSchema = z.string()
  .trim()
  .url('Invalid URL format')
  .regex(/^https:\/\//i, 'Only HTTPS URLs are allowed for security reasons.')
  .refine(val => !val.toLowerCase().includes('javascript:'), {
    message: 'JavaScript scheme is not allowed.',
  });

// Filename safety check
export const safeFileNameSchema = z.string()
  .min(1, 'Filename cannot be empty')
  .max(100, 'Filename too long')
  .regex(/^[a-zA-Z0-9_\-\. ]+$/, 'Filename contains disallowed characters. Only letters, numbers, spaces, dots, hyphens, and underscores are allowed.')
  .refine(val => !val.includes('..') && !val.includes('/') && !val.includes('\\'), {
    message: 'Path traversal attempts are forbidden.',
  });

// Date Range Schema (ensure DOB is in the past, deadlines in the future)
export const pastDateSchema = z.date()
  .max(new Date(), 'Date of birth cannot be in the future.');

export const futureDateSchema = z.date()
  .min(new Date(), 'Deadline must be in the future.');

// Referral code Zod schema (TT-FIRSTNAME-4CHARS)
export const referralCodeSchema = z.string()
  .trim()
  .regex(/^TT-[A-Z]+-[A-Z0-9]{4}$/i, 'Invalid referral code format. Standard format is TT-FIRSTNAME-4CHARS.');

// Helper to normalize input URLs (handles empty strings, usernames/handles, and missing https:// protocols)
const normalizeUrl = (val: unknown, platform?: 'github' | 'linkedin' | 'generic'): string | null => {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'string') return null;
  let str = val.trim();
  if (!str) return null;

  if (str.toLowerCase().startsWith('javascript:') || str.toLowerCase().startsWith('data:')) {
    return str;
  }

  if (str.startsWith('http://')) {
    str = 'https://' + str.slice(7);
  }

  if (platform === 'github') {
    if (!str.startsWith('https://')) {
      if (str.startsWith('github.com/')) {
        str = 'https://' + str;
      } else if (!str.includes('/')) {
        str = `https://github.com/${str}`;
      } else {
        str = `https://${str}`;
      }
    }
  } else if (platform === 'linkedin') {
    if (!str.startsWith('https://')) {
      if (str.startsWith('linkedin.com/') || str.startsWith('www.linkedin.com/')) {
        str = 'https://' + str;
      } else if (str.startsWith('in/')) {
        str = `https://linkedin.com/${str}`;
      } else if (!str.includes('/')) {
        str = `https://linkedin.com/in/${str}`;
      } else {
        str = `https://${str}`;
      }
    }
  } else if (platform === 'generic') {
    if (!str.startsWith('https://')) {
      str = `https://${str}`;
    }
  }

  return str;
};

export const optionalGithubSchema = z.preprocess(
  (val) => normalizeUrl(val, 'github'),
  httpsUrlSchema.nullable().optional()
);

export const optionalLinkedinSchema = z.preprocess(
  (val) => normalizeUrl(val, 'linkedin'),
  httpsUrlSchema.nullable().optional()
);

export const optionalPortfolioSchema = z.preprocess(
  (val) => normalizeUrl(val, 'generic'),
  httpsUrlSchema.nullable().optional()
);

export const optionalResumeSchema = z.preprocess(
  (val) => normalizeUrl(val, 'generic'),
  httpsUrlSchema.or(z.string().trim().regex(/^https:\/\/res\.cloudinary\.com\//, 'Invalid resume storage URL')).nullable().optional()
);

// Internship application schema
export const internshipApplicationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Invalid email address format').max(255),
  college: z.string().trim().min(3, 'College name must be at least 3 characters').max(200),
  course: z.string().trim().min(2, 'Course name must be at least 2 characters').max(100),
  semester: z.string().trim().min(1, 'Semester is required').max(20),
  location: z.string().trim().min(2, 'Location / City is required').max(100, 'Location is too long'),
  resume: optionalResumeSchema,
  github: optionalGithubSchema,
  linkedin: optionalLinkedinSchema,
  portfolio: optionalPortfolioSchema,
  domain: z.string().trim().min(1, 'Preferred track is required'),
  preferredField: z.string().trim().min(1, 'Please select your preferred field'),
  internshipTrack: z.enum(['experienced', 'learning'], {
    message: 'Please select an internship track'
  }),
  statement: z.string().trim().max(1000, 'Statement of purpose must not exceed 1000 characters').optional().nullable(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Invalid email address format').max(255),
  phone: phoneSchema.optional().or(z.literal('')),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(150),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
});
