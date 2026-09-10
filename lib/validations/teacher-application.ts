import { z } from 'zod';

// Helper to normalize a URL string — adds https:// if missing
const normalizeUrl = (val: string) => {
  if (!val) return val;
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  return `https://${val}`;
};

// LinkedIn URL: accept usernames, paths, or full URLs — normalize internally
const linkedinUrlSchema = z
  .string()
  .min(1, 'LinkedIn profile URL is required')
  .transform((val) => {
    const trimmed = val.trim();
    if (!trimmed) return trimmed;
    // Already a full URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    // Looks like a path
    if (trimmed.startsWith('in/') || trimmed.startsWith('/in/')) {
      return `https://www.linkedin.com/${trimmed.replace(/^\//, '')}`;
    }
    // Looks like linkedin.com/... without protocol
    if (trimmed.includes('linkedin.com')) return `https://${trimmed}`;
    // Just a username
    return `https://www.linkedin.com/in/${trimmed}`;
  })
  .pipe(
    z.string().refine(
      (val) => {
        try { new URL(val); return true; } catch { return false; }
      },
      'Must be a valid LinkedIn profile URL'
    )
  );

export const personalDetailsSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  profilePhotoUrl: z.string().min(1, 'Profile photo is required'),
  linkedinUrl: linkedinUrlSchema,
  githubUrl: z.string().optional().or(z.literal('')).transform((val) => val ? normalizeUrl(val) : val),
  personalWebsite: z.string().optional().or(z.literal('')).transform((val) => val ? normalizeUrl(val) : val),
});

export const professionalDetailsSchema = z.object({
  headline: z.string().min(10, 'Headline must be at least 10 characters'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  primaryDomain: z.string().min(2, 'Primary domain is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  yearsOfExperience: z.string().or(z.number()).transform(v => parseInt(String(v)) || 0).pipe(z.number().min(0, 'Experience cannot be negative')),
  currentRole: z.string().min(2, 'Current role is required'),
  currentCompany: z.string().min(2, 'Current company is required'),
  toolsMastery: z.string().min(2, 'Tools mastery description is required'),
  languagesKnown: z.string().min(2, 'Languages known is required'),
  teachingExperience: z.string().or(z.number()).transform(v => parseInt(String(v)) || 0).pipe(z.number().min(0, 'Teaching experience cannot be negative')),
  preferredSessionType: z.array(z.string()).optional(),
  teachingCategories: z.array(z.string()).optional(),
});

export const educationEntrySchema = z.object({
  institution: z.string().min(2, 'Institution is required'),
  degree: z.string().min(2, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  graduationYear: z.string().or(z.number()).transform(v => {
    const parsed = parseInt(String(v));
    return isNaN(parsed) ? null : parsed;
  }).optional().nullable(),
});

export const credentialsDetailsSchema = z.object({
  highestQualification: z.string().min(2, 'Highest qualification is required'),
  certifications: z.array(z.string()).optional(),
  awards: z.string().optional(),
  achievements: z.string().optional(),
  hackathonsParticipated: z.string().optional(),
  publishedResearch: z.string().optional(),
  openSourceContributions: z.string().optional(),
});

export const teachingDetailsSchema = z.object({
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  teachingStyle: z.string().min(2, 'Teaching style is required'),
  comfortableClassSize: z.string().min(2, 'Comfortable class size is required'),
  communicationStyle: z.string().min(2, 'Communication style is required'),
  sessionLanguage: z.array(z.string()).min(1, 'Select at least one language'),
  publicSpeakingConfidence: z.number().min(1).max(5),
  cameraComfort: z.number().min(1).max(5),
  hasWebcam: z.boolean().default(false),
  hasMic: z.boolean().default(false),
  internetSpeed: z.string().min(1, 'Internet speed is required'),
  demoVideoUrl: z.string().url('Invalid Demo Video URL').optional().or(z.literal('')),
  simplifyConcepts: z.string().min(15, 'Simplify concepts explanation must be at least 15 characters'),
  teachingProcess: z.string().min(15, 'Teaching process explanation must be at least 15 characters'),
  keepStudentsEngaged: z.string().min(15, 'Keep students engaged explanation must be at least 15 characters'),
  demoSessionLink: z.string().optional().or(z.literal('')),
});

export const availabilityDetailsSchema = z.object({
  availableDays: z.array(z.string()).min(1, 'Select at least one available day'),
  preferredTimeSlots: z.array(z.string()).min(1, 'Select at least one preferred time slot'),
  timezone: z.string().min(2, 'Timezone is required'),
  remoteOfflineAvailability: z.string().min(2, 'Remote/offline preference is required'),
  travelAvailability: z.boolean().default(false),
  weekendAvailability: z.boolean().default(false),
  monthlyAvailability: z.string().optional(),
  preferredPaymentMethod: z.string().min(2, 'Preferred payment method is required'),
  hourlyRate: z.number().min(0, 'Hourly rate cannot be negative'),
  workshopPricing: z.number().min(0, 'Workshop pricing cannot be negative'),
});

export const reviewDetailsSchema = z.object({
  bankDetails: z.string().min(5, 'Direct bank transfer details or UPI ID is required'),
  agreedToNDA: z.boolean().refine(v => v === true, 'You must agree to the NDA & IP terms'),
});

export const teacherApplicationSchema = z.object({
  step: z.number().int().min(1).max(6),
  // Client can only send DRAFT or PENDING; server enforces no other values
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'SUSPENDED', 'UNDER_REVIEW', 'DISABLED']).default('DRAFT'),
  personalDetails: z.any().optional(),
  professionalDetails: z.any().optional(),
  educationDetails: z.any().optional(),
  credentialsDetails: z.any().optional(),
  teachingDetails: z.any().optional(),
  availabilityDetails: z.any().optional(),
  reviewDetails: z.any().optional(),
  documents: z.any().optional(),
});

export type TeacherApplicationInput = z.infer<typeof teacherApplicationSchema>;

