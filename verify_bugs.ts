import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import { chromium } from 'playwright';
import fs from 'fs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching user...");
  const user = await prisma.user.findUnique({ where: { email: 'mohitraj8503@gmail.com' } });
  if (!user) {
    console.error("User not found!");
    process.exit(1);
  }
  
  console.log("Creating session...");
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken: crypto.randomBytes(32).toString('hex'),
      isValid: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  console.log("Signing JWT...");
  const JWT_SECRET = "3e9c3be8ce5d7b91d63fb330368c71216357c3be9c3be8ce5d7b91d63fb330";
  const secret = new TextEncoder().encode(JWT_SECRET);
  const payload = {
    userId: user.id,
    role: user.role,
    sessionId: session.id,
    email: user.email,
    name: user.name,
    avatar_url: user.image
  };
  
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS512' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
    
  console.log("Launching playwright...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Verify BUG B - "Sign In" button on homepage
  console.log("Verifying BUG B: Navigating to homepage without cookies...");
  const page1 = await context.newPage();
  await page1.goto('https://sarthi-woad.vercel.app', { waitUntil: 'load' });
  await page1.waitForTimeout(3000); // let hydration settle
  await page1.screenshot({ path: '/home/mohitraj8503/.gemini/antigravity-ide/brain/5919b482-db32-4722-aaec-f79d33ded526/bug_b_homepage.png' });
  
  console.log("Clicking Sign In...");
  try {
     await page1.click('text="Sign In"');
     await page1.waitForTimeout(3000);
     await page1.screenshot({ path: '/home/mohitraj8503/.gemini/antigravity-ide/brain/5919b482-db32-4722-aaec-f79d33ded526/bug_b_login_page.png' });
  } catch(e) { console.error("Could not click Sign In:", e); }
  await page1.close();

  // Now verify Original Incident - Login profile
  console.log("Injecting auth cookie...");
  await context.addCookies([{
    name: 'tt_session',
    value: token,
    domain: 'sarthi-woad.vercel.app',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax'
  }]);

  console.log("Navigating to /admin with cookie...");
  const page2 = await context.newPage();
  await page2.goto('https://sarthi-woad.vercel.app/admin', { waitUntil: 'load' });
  await page2.waitForTimeout(4000); // let page load
  await page2.screenshot({ path: '/home/mohitraj8503/.gemini/antigravity-ide/brain/5919b482-db32-4722-aaec-f79d33ded526/admin_profile.png' });
  
  // Verify BUG A - Logout
  let logoutHeaders: Record<string, string> = {};
  page2.on('response', async (response) => {
    if (response.url().includes('/api/auth/logout')) {
      Object.assign(logoutHeaders, response.headers());
    }
  });

  console.log("Clicking Logout...");
  try {
      if (await page2.isVisible('button:has-text("Logout")')) {
         await page2.click('button:has-text("Logout")');
      } else {
         await page2.evaluate(() => {
             const btns = Array.from(document.querySelectorAll('button, a'));
             const logoutBtn = btns.find(b => b.textContent?.toLowerCase().includes('logout'));
             if (logoutBtn) (logoutBtn as HTMLElement).click();
         });
      }
      
      await page2.waitForTimeout(3000);
      await page2.screenshot({ path: '/home/mohitraj8503/.gemini/antigravity-ide/brain/5919b482-db32-4722-aaec-f79d33ded526/bug_a_after_logout.png' });
  } catch (e) {
      console.log("Failed to click logout via UI, executing POST via script...");
      const res = await page2.evaluate(async () => {
          const r = await fetch('/api/auth/logout', { method: 'POST' });
          return window.location.href;
      });
  }
  
  // Re-fetch headers via direct fetch call to be 100% sure we capture them
  const headersResponse = await page2.evaluate(async () => {
      const res = await fetch('https://sarthi-woad.vercel.app/api/auth/logout', { method: 'POST' });
      const h: Record<string, string> = {};
      res.headers.forEach((v, k) => h[k] = v);
      return h;
  });
  
  // If the browser intercepts it but fetch doesn't have Set-Cookie due to security,
  // we do a curl right here in Node to get the RAW HTTP headers.
  console.log("Running node curl...");
  const rawHeaders = await new Promise((resolve) => {
      const https = require('https');
      const req = https.request('https://sarthi-woad.vercel.app/api/auth/logout', { method: 'POST' }, (res: any) => {
          resolve(res.headers);
      });
      req.end();
  });

  console.log("Raw Node Logout headers:", rawHeaders);
  fs.writeFileSync('/home/mohitraj8503/.gemini/antigravity-ide/brain/5919b482-db32-4722-aaec-f79d33ded526/logout_headers.json', JSON.stringify({ browserHeaders: logoutHeaders, rawHeaders }, null, 2));

  await browser.close();
  console.log("Done!");
}

main().catch(console.error);
