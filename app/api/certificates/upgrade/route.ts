export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { CertificateGenerator } from '@/lib/certificate-generator';

/**
 * API Route: Upgrade Certificate Tier
 * POST /api/certificates/upgrade
 * 
 * Body: { certificateId, tier }
 * 
 * Tier options: "premium" (₹49), "pro" (₹99)
 */
export async function POST(req: Request) {
  try {
    const { certificateId, tier } = await req.json();

    // Validate tier
    const validTiers = ['premium', 'pro'];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { message: 'Invalid tier. Use "premium" or "pro"' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Find the certificate
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: certificateId,
        userId: user.id
      },
      include: {
        course: true,
        user: true
      }
    });

    if (!certificate) {
      return NextResponse.json(
        { message: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Get pricing
    const pricing = CertificateGenerator.getTierPrice(tier);
    const features = CertificateGenerator.getTierFeatures(tier);

    // If already at this tier, return current
    if (certificate.tier === tier) {
      return NextResponse.json({
        message: 'Certificate already at this tier',
        certificate,
        pricing,
        features
      });
    }

    // Update certificate tier
    const updated = await prisma.certificate.update({
      where: { id: certificateId },
      data: { tier }
    });

    // Update metadata
    const existingMetadata = certificate.metadata ? JSON.parse(certificate.metadata) : {};
    const newMetadata = {
      ...existingMetadata,
      tier,
      tierPrice: pricing.amount,
      upgradedAt: new Date().toISOString(),
      features
    };

    await prisma.certificate.update({
      where: { id: certificateId },
      data: { metadata: JSON.stringify(newMetadata) }
    });

    return NextResponse.json({
      message: `Certificate upgraded to ${tier} tier`,
      certificate: updated,
      pricing,
      features
    });
  } catch (error) {
    console.error('Certificate upgrade error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get available tiers and pricing
 * GET /api/certificates/upgrade?tiers=true
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const showTiers = searchParams.get('tiers');

  if (showTiers) {
    return NextResponse.json({
      tiers: [
        {
          id: 'premium',
          name: 'Premium',
          price: 49,
          currency: 'INR',
          features: CertificateGenerator.getTierFeatures('premium')
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 99,
          currency: 'INR',
          features: CertificateGenerator.getTierFeatures('pro')
        }
      ]
    });
  }

  return NextResponse.json({ message: 'Use POST to upgrade' }, { status: 400 });
}

