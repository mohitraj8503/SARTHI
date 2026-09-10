export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isManagement } from "@/lib/auth";
import { clearResiliencyCache } from "@/lib/resilient-db";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!isManagement(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const certification = await prisma.certification.findUnique({
      where: { id: params.id },
      include: {
        questionsV2: true,
        _count: { select: { attempts: true } }
      }
    });

    if (!certification) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(certification);
  } catch (error) {
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!isManagement(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();
    const updated = await prisma.certification.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration ? parseInt(data.duration) : undefined,
        passingScore: data.passingScore ? parseInt(data.passingScore) : undefined,
        price: data.price ? parseInt(data.price) : undefined,
        proPrice: data.proPrice ? parseInt(data.proPrice) : undefined,
        premiumPrice: data.premiumPrice ? parseInt(data.premiumPrice) : undefined,
        difficulty: data.difficulty,
        status: data.status,
        thumbnail: data.thumbnail
      }
    });
    
    // ✅ Invalidate public cache immediately
    clearResiliencyCache();

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!isManagement(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Delete with protection (maybe check for attempts first?)
    await prisma.certification.delete({
      where: { id: params.id }
    });
    
    // ✅ Invalidate public cache immediately
    clearResiliencyCache();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
