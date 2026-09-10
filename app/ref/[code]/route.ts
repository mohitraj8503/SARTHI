import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recordReferralClick } from '@/lib/services/marketing.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, props: { params: Promise<{ code: string }> }) {
  try {
    const params = await props.params;
    const { code } = params;
    
    // Look up the coupon code
    const coupon = await prisma.marketingCoupon.findFirst({
      where: {
        couponCode: code,
        active: true
      },
      include: { partner: true }
    });

    if (coupon && coupon.partner) {
      // Extract user agent details
      const userAgent = req.headers.get('user-agent') || '';
      const referer = req.headers.get('referer') || '';
      
      let device = 'Desktop';
      if (/mobile/i.test(userAgent)) device = 'Mobile';
      else if (/tablet/i.test(userAgent)) device = 'Tablet';

      let browser = 'Unknown';
      if (/chrome/i.test(userAgent)) browser = 'Chrome';
      else if (/firefox/i.test(userAgent)) browser = 'Firefox';
      else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';

      // Parse geolocation details from CF header or standard geo location if present
      const country = req.headers.get('cf-ipcountry') || 'IN';
      const city = req.headers.get('x-vercel-ip-city') || 'Unknown';

      // Save click record
      await recordReferralClick(coupon.partner.id, {
        device,
        browser,
        country,
        city,
        referer
      });
    }

    // Redirect to home/landing page with cookie / query parameters to automatically apply coupon during checkout
    const url = new URL('/', req.url);
    url.searchParams.set('ref', code);
    
    const response = NextResponse.redirect(url);
    // Set a client cookie valid for 30 days to store the referral code
    response.cookies.set('ref_coupon', code, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('[REFERRAL_REDIRECT_ERROR]', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}
