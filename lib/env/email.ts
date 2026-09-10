// lib/env/email.ts

export const emailEnv = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM?.includes('<') 
    ? process.env.EMAIL_FROM 
    : (process.env.EMAIL_FROM ? `SARTHI <${process.env.EMAIL_FROM}>` : 'SARTHI <admin@sarthi.in>'),
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app',
  APP_MODE: process.env.APP_MODE || 'production',
} as const;

export const validateEmailConfig = () => {
  // During CI build, we might not have all env variables.
  // If APP_MODE is development, we fallback to mock.
  if (emailEnv.APP_MODE === 'development' || process.env.NEXT_PHASE === 'phase-production-build') {
    if (!emailEnv.RESEND_API_KEY) {
      console.log('ℹ️ Skipping email config validation: Development mode or Build phase detected.');
      return;
    }
  }

  const missing = Object.entries(emailEnv)
    .filter(([key, val]) => {
        if (key === 'RESEND_API_KEY') return !val;
        return false;
    })
    .map(([key]) => key);
    
  if (missing.length > 0) {
    if (process.env.NODE_ENV === 'production' && emailEnv.APP_MODE !== 'development') {
        throw new Error(`Missing critical email config: ${missing.join(', ')}`);
    } else {
        console.warn(`[Email Config] Missing: ${missing.join(', ')}. Using defaults.`);
    }
  }
  
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_')) {
    console.warn('⚠️ RESEND_API_KEY format looks invalid (should start with re_)');
  }
};
