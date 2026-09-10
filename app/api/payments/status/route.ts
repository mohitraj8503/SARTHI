export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { razorpayOrderId: orderId },
      select: { 
        status: true,
        invoiceNumber: true,
        courseId: true,
        userId: true
      }
    });

    if (!transaction) {
      return NextResponse.json({ status: 'NOT_FOUND' });
    }

    return NextResponse.json({ 
      status: transaction.status,
      invoiceId: transaction.invoiceNumber || 'success'
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

