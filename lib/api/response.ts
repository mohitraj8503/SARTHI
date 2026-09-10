import { NextResponse } from 'next/server';
import { z } from 'zod';

export type ApiResult<T> = 
  | { success: true; data: T; meta?: Record<string, any> }
  | { success: false; error: { message: string; code: string; details?: any }; requestId: string };

/**
 * Standardized API Response Engine
 * Enforces consistency across all micro-services and client-side consumption.
 */
export const API = {
  ok: <T>(data: T, meta?: Record<string, any>): Response => 
    NextResponse.json<ApiResult<T>>({ 
      success: true, 
      data, 
      meta: { ...meta, timestamp: new Date().toISOString() } 
    }),
    
  err: (message: string, code: string, status = 400, details?: any): Response =>
    NextResponse.json<ApiResult<never>>(
      { 
        success: false, 
        error: { message, code, details }, 
        requestId: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7) 
      },
      { status }
    ),
    
  validation: (errors: z.ZodIssue[] | any) => 
    API.err('Validation failed', 'VALIDATION_ERROR', 400, { fields: errors }),
    
  notFound: (resource = 'Resource') => API.err(`${resource} not found`, 'NOT_FOUND', 404),
  forbidden: (msg = 'Access denied') => API.err(msg, 'FORBIDDEN', 403),
  unauthorized: () => API.err('Authentication required', 'UNAUTHORIZED', 401),
  server: (msg = 'Internal server error') => API.err(msg, 'INTERNAL_ERROR', 500)
};
