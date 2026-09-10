export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";
import { getAdminDashboardCombinedData } from "@/lib/services/admin-dashboard";
import { DashboardParamsSchema } from "@/lib/admin/validators/schemas";
import { rateLimit } from "@/lib/security/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(req);
    if (!rl.success) {
      return ApiResponse.error("Too many telemetry requests. Please stand by.", "RATE_LIMIT_EXCEEDED", 429);
    }

    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const { range } = DashboardParamsSchema.parse({
      range: searchParams.get('range')
    });
    
    const data = await getAdminDashboardCombinedData(range);
    
    return ApiResponse.success(data);
  } catch (error) {
    return handleApiError(error);
  }
}

