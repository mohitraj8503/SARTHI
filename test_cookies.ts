import { NextResponse } from 'next/server';
const response = NextResponse.json({ success: true });
response.cookies.set("test_cookie", "", { path: "/", maxAge: 0, expires: new Date(0), domain: ".sarthi-woad.vercel.app", secure: true, httpOnly: true, sameSite: "lax" });
console.log(response.headers.get("set-cookie"));
