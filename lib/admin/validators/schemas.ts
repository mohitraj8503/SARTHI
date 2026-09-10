import { z } from "zod";

/**
 * Common pagination and filter schemas
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(5000).default(1000),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: z.string().optional(),
  filter: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Dashboard Telemetry
 */
export const DashboardParamsSchema = z.object({
  range: z.enum(["week", "month"]).default("month"),
});

/**
 * Payments / Transactions
 */
export const TransactionUpdateSchema = z.object({
  status: z.enum(["succeeded", "failed", "pending_verification", "refunded"]),
  remark: z.string().optional(),
});

/**
 * Workshops
 */
export const WorkshopSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  instructorId: z.string().optional(),
  instructorName: z.string().optional(),
  date: z.coerce.date(),
  duration: z.string().default("1.5 hours"),
  price: z.coerce.number().min(0).default(0),
  originalPrice: z.coerce.number().min(0).optional(),
  seats: z.coerce.number().min(1).default(50),
  category: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "REGISTRATION_OPEN", "FULL", "LIVE", "COMPLETED", "CANCELLED"]).default("DRAFT"),
  tags: z.any().optional(),
});

/**
 * Teachers
 */
export const TeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  bio: z.string().optional(),
  specialization: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

/**
 * Bulk Actions
 */
export const BulkActionSchema = z.object({
  ids: z.array(z.string()).nullable().optional(),
  excludedIds: z.array(z.string()).nullable().optional(),
  selectAll: z.boolean().default(false),
  action: z.string(), // Allowing more actions like 'email', 'suspend', etc.
  payload: z.any().optional(),
});

/**
 * Support
 */
export const SupportTicketUpdateSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  assignedTo: z.string().optional(),
});
