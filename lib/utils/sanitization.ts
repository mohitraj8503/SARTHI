import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes an object by stripping HTML from all string values.
 * Useful for preventing XSS in form submissions.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [], // No HTML allowed
        ALLOWED_ATTR: [],
      });
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Validates a URL to ensure it's from an approved domain (e.g., YouTube).
 */
export function validateSafeUrl(url: string, allowedDomains: string[]): boolean {
  try {
    const parsed = new URL(url);
    return allowedDomains.some(domain => parsed.hostname.endsWith(domain));
  } catch {
    return false;
  }
}
