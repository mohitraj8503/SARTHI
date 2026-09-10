import { NextResponse } from 'next/server';
const response = NextResponse.json({ success: true });
response.headers.append("Set-Cookie", "tt_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Lax");
response.headers.append("Set-Cookie", "tt_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Domain=.sarthi-woad.vercel.app; Secure; HttpOnly; SameSite=Lax");
response.headers.append("Set-Cookie", "tt_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Domain=sarthi-woad.vercel.app; Secure; HttpOnly; SameSite=Lax");
console.log(response.headers.get("set-cookie"));
