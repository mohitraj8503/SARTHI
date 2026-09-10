export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await prisma.courseSubscription.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            title: true,
            thumbnail: true,
            slug: true,
          }
        },
        payments: {
          orderBy: { chargedAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, subscriptions });
  } catch (error: any) {
    console.error("[STUDENT_SUBSCRIPTIONS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
