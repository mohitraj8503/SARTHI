import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export type ValidationResult<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; error: NextResponse; data?: never };

/**
 * Validates the request body against a Zod schema.
 * Returns the parsed data or a NextResponse with 400 status and errors.
 */
export async function validateRequestBody<T>(
  req: NextRequest, 
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await req.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          { 
            error: 'Validation failed', 
            details: error.issues.map(e => ({
              path: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        )
      };
    }
    
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    };
  }
}

/**
 * Validates URL search parameters against a Zod schema.
 */
export function validateQueryParams<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const validatedData = schema.parse(searchParams);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          { 
            error: 'Query parameter validation failed', 
            details: error.issues.map(e => ({
              path: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        )
      };
    }
    
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      )
    };
  }
}
