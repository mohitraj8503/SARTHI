import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getAdminDashboardCombinedData } from "@/lib/services/admin-dashboard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "month";
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const data = await getAdminDashboardCombinedData(range, limit);

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Combined Admin API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

