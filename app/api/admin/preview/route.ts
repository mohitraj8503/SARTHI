export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { type, data } = body;

    // This is a generic preview endpoint. 
    // It should render or return data for a preview component.
    // For now, let's just return what's sent with a success flag.
    
    return ApiResponse.success({
      previewType: type,
      previewData: data,
      renderedAt: new Date().toISOString(),
    });

  } catch (error) {
    return handleApiError(error);
  }
}

