export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('tt_session')?.value || request.cookies.get('user_session')?.value;
  
  if (!token) {
    return NextResponse.json({ error: 'No session cookie found' });
  }

  try {
    const { verifyJWT } = await import('@/lib/auth/jwt');
    const payload = await verifyJWT(token);
    
    return NextResponse.json({
      cookie_found: true,
      token_preview: token.substring(0, 10) + '...',
      decoded_payload: payload,
      raw_cookies: request.cookies.getAll().map(c => ({ name: c.name, value_preview: c.value.substring(0, 5) + '...' }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to verify JWT', details: error.message });
  }
}
