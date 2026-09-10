import { z } from 'zod';
import { hasPwnedPassword } from 'hibp';

export const passwordSchema = z.string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter") 
  .regex(/[0-9]/, "Must contain number")
  .regex(/[^A-Za-z0-9]/, "Must contain special character")
  .refine(async (pwd) => {
    // Check against breached passwords (async)
    try {
      const breached = await hasPwnedPassword(pwd);
      return !breached;
    } catch (e) {
      console.warn('HIBP check failed, allowing password.');
      return true; // Fallback to allowing if API is down
    }
  }, "Password appears in known data breaches");
