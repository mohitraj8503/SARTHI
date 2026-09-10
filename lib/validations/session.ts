import { z } from 'zod';

export const sessionSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  scheduledStart: z.string().datetime(),
  duration: z.number().min(15).max(480), // 15min to 8 hours
  maxAttendees: z.number().min(1).max(1000).optional(),
  courseId: z.string().cuid(),
  meetingUrl: z.string().url().optional().or(z.literal('')),
  allowRecording: z.boolean().default(true),
  requireApproval: z.boolean().default(false)
});

export type SessionInput = z.infer<typeof sessionSchema>;
