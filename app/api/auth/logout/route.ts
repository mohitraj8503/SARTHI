export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCookieOptions } from "@/lib/auth/utils";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));

  const cookieNames = [
    "tt_session",
    "user_session",
    "user_role",
    "oauth_state",
    "auth_redirect",
    "next-auth.session-token",
    "__Host-next-auth.csrf-token",
    "tt_password_setup"
  ];

  const isProd = process.env.NODE_ENV === "production";
  const isLocal = request.url.includes("localhost") || request.url.includes("127.0.0.1");
  const secureStr = (isProd && !isLocal) ? "; Secure" : "";
  
  const baseCookie = `Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secureStr}`;

  cookieNames.forEach(name => {
    response.headers.append("Set-Cookie", `${name}=; ${baseCookie}`);
    response.headers.append("Set-Cookie", `${name}=; ${baseCookie}; Domain=.sarthi-woad.vercel.app`);
    response.headers.append("Set-Cookie", `${name}=; ${baseCookie}; Domain=sarthi-woad.vercel.app`);
  });

  return response;
}

/**
 * POST /api/auth/logout
 *
 * Signs out, destroys session, invalidates cache, and clears all session cookies.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get("tt_session")?.value || request.cookies.get("user_session")?.value;
  if (token) {
    try {
      const { verifyJWT } = await import("@/lib/auth/jwt");
      const payload = await verifyJWT(token);
      if (payload?.sessionId) {
        await prisma.session
          .update({
            where: { id: payload.sessionId },
            data: { isValid: false },
          })
          .catch(() => {});
      }
      if (payload?.userId) {
        await prisma.session
          .updateMany({
            where: { userId: payload.userId },
            data: { isValid: false },
          })
          .catch(() => {});
      }
    } catch {
      // Silent fail — token may already be expired
    }
  }

  const response = NextResponse.json({ success: true });

  const cookieNames = [
    "tt_session",
    "user_session",
    "user_role",
    "oauth_state",
    "auth_redirect",
    "next-auth.session-token",
    "__Host-next-auth.csrf-token",
    "tt_password_setup"
  ];

  const isProd = process.env.NODE_ENV === "production";
  const isLocal = request.url.includes("localhost") || request.url.includes("127.0.0.1");
  const secureStr = (isProd && !isLocal) ? "; Secure" : "";
  
  const baseCookie = `Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secureStr}`;

  // Aggressively clear across all domain & path variations
  cookieNames.forEach(name => {
    response.headers.append("Set-Cookie", `${name}=; ${baseCookie}`);
    response.headers.append("Set-Cookie", `${name}=; ${baseCookie}; Domain=.sarthi-woad.vercel.app`);
    response.headers.append("Set-Cookie", `${name}=; ${baseCookie}; Domain=sarthi-woad.vercel.app`);
  });

  const { invalidateUserCache, clearAllUserCache } = await import("@/lib/auth");
  if (token) {
    invalidateUserCache(token);
  }
  clearAllUserCache();

  return response;
}

