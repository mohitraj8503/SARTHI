import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin, isManagement } from "@/lib/auth";
import { z } from "zod";
import { ADMIN_ROLES, MANAGEMENT_ROLES, STAFF_ROLES } from "@/lib/admin/roles";

/**
 * Standard API Response structure
 */
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
};

/**
 * Response Formatter
 */
export const ApiResponse = {
  success: <T>(data: T, message?: string, meta?: any): NextResponse<ApiResponse<T>> => {
    return NextResponse.json({
      success: true,
      data,
      message,
      meta,
    });
  },
  error: (message: string, code = "INTERNAL_ERROR", status = 500, details?: any): NextResponse<ApiResponse> => {
    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
          details,
        },
      },
      { status }
    );
  },
};

/**
 * Auth Guard - Hardened Hierarchical RBAC
 */
export async function requireAdmin(minRole: 'staff' | 'management' | 'admin' = 'admin') {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const role = (user.role as string)?.toUpperCase();
  let allowed = false;

  switch (minRole) {
    case 'admin':
      allowed = ADMIN_ROLES.includes(role);
      break;
    case 'management':
      allowed = MANAGEMENT_ROLES.includes(role);
      break;
    case 'staff':
      allowed = STAFF_ROLES.includes(role);
      break;
  }

  if (!allowed) {
    throw new Error("FORBIDDEN");
  }

  // Relaxed Domain Check for Teachers/Admins (Allow personal emails for verified teachers)
  /*
  const email = (user.email || '').toLowerCase();
  if (!email.endsWith('@sarthi-woad.vercel.app')) {
    console.warn(`[SECURITY] Access denied for user ${email} with role ${role} - Missing @sarthi-woad.vercel.app domain`);
    throw new Error("FORBIDDEN");
  }
  */

  return user;
}

/**
 * Central Error Handler
 */
export function handleApiError(error: any) {
  console.error("[API_ERROR]", error);
  
  if (error.message === "UNAUTHORIZED") {
    return ApiResponse.error("Authentication required for this system sector", "AUTH_REQUIRED", 401);
  }

  if (error.message === "FORBIDDEN") {
    return ApiResponse.error("Insufficient management clearance for this operation", "ACCESS_DENIED", 403);
  }
  
  if (error instanceof z.ZodError) {
    return ApiResponse.error("Validation sync failure: Malformed request structure", "VALIDATION_ERROR", 400, error.issues);
  }

  return ApiResponse.error(error.message || "Core engine synchronization failure", "INTERNAL_ERROR", 500);
}

/**
 * Pagination & Filter Parser
 */
export function parsePaginationParams(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Math.min(100, parseInt(url.searchParams.get("pageSize") || "10")));
  const search = url.searchParams.get("search") || undefined;
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder = (url.searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
    search,
    sortBy,
    sortOrder,
  };
}
