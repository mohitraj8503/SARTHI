export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";
import { getAIAssistantAnswer } from "@/lib/services/dashboard-intelligence";
import { z } from "zod";

const QuerySchema = z.object({
  query: z.string().min(2).max(200),
});

// Basic in-memory rate limiter for Admin API (10 req/min/admin)
const rateLimitMap = new Map<string, { count: number, timestamp: number }>();

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin('management');
    const adminId = admin.user.id;

    // 1. Rate Limiting Check
    const now = Date.now();
    const rateData = rateLimitMap.get(adminId) || { count: 0, timestamp: now };
    if (now - rateData.timestamp > 60000) {
      rateData.count = 1;
      rateData.timestamp = now;
    } else {
      rateData.count++;
      if (rateData.count > 20) { // 20 requests per minute max
        return ApiResponse.error("Rate limit exceeded. Please wait a minute.", 429);
      }
    }
    rateLimitMap.set(adminId, rateData);

    // 2. Validate Payload
    const body = await req.json();
    const { query } = QuerySchema.parse(body);

    // 3. Execute with Timeout Protection
    const answerPromise = getAIAssistantAnswer(query);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Query Timeout')), 5000));
    
    const answer = await Promise.race([answerPromise, timeoutPromise]);

    return ApiResponse.success({ answer });
  } catch (error) {
    if (error instanceof Error && error.message === 'Query Timeout') {
      return ApiResponse.error("Query took too long. Please try a simpler question.", 408);
    }
    console.error('AI Assistant API error:', error);
    return handleApiError(error);
  }
}

