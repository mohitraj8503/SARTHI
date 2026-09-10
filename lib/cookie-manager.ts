export type CookieCategory = 'essential' | 'functional' | 'analytics' | 'marketing';

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

export const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: '',
  version: '1.0',
};

class CookieManager {
  private categories: Record<CookieCategory, string[]>;
  private readonly STORAGE_KEY = 'cookie_consent_preferences';
  private readonly VERSION = '1.0';

  constructor() {
    this.categories = {
      essential: ['session_id', 'csrf_token', 'next-auth.session-token', '__Host-next-auth.csrf-token'],
      functional: ['language', 'theme', 'font_size', 'remember_me'],
      analytics: ['_ga', '_gid', '_hjSession', '_clck'],
      marketing: ['_fbp', 'gclid', 'ads_prefs']
    };
  }

  /**
   * Initialize cookie consent system
   */
  public initialize(): CookiePreferences | null {
    if (typeof window === 'undefined') return null;
    
    // Check if consent already exists
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validate version if needed
        if (parsed.version === this.VERSION) {
          this.applyConsents(parsed);
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cookie preferences', e);
      }
    }
    return null;
  }

  /**
   * Save user preferences
   */
  public savePreferences(preferences: CookiePreferences): void {
    if (typeof window === 'undefined') return;

    const finalPrefs = {
      ...preferences,
      essential: true, // Always true
      timestamp: new Date().toISOString(),
      version: this.VERSION
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalPrefs));
    this.applyConsents(finalPrefs);
    
    // Log consent action (internal logic or API call)
    console.log('Cookie preferences saved:', finalPrefs);
  }

  /**
   * Apply consents (load scripts, etc.)
   */
  private applyConsents(prefs: CookiePreferences): void {
    if (typeof window === 'undefined') return;

    if (prefs.analytics) {
      this.loadAnalyticsScripts();
    }
    
    if (prefs.marketing) {
      this.loadMarketingScripts();
    }
    
    // Clear cookies if consent revoked
    if (!prefs.analytics) this.clearCookies('analytics');
    if (!prefs.marketing) this.clearCookies('marketing');
    if (!prefs.functional) this.clearCookies('functional');
  }

  /**
   * Set a cookie safely based on categories
   */
  public setCookie(name: string, value: string, days: number, category: CookieCategory): boolean {
    if (typeof window === 'undefined') return false;

    // Check if we have consent for this category (except essential which is implicit)
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored && category !== 'essential') return false;

    if (stored) {
      const prefs = JSON.parse(stored);
      if (!prefs[category]) return false;
    }

    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const isSecure = window.location.protocol === 'https:';
    
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${isSecure ? ';Secure' : ''}`;
    return true;
  }

  /**
   * Get a cookie value
   */
  public getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }

  /**
   * Delete a cookie
   */
  public deleteCookie(name: string): void {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  /**
   * Clear all cookies for a specific category
   */
  private clearCookies(category: CookieCategory): void {
    const cookiesToDelete = this.categories[category];
    cookiesToDelete.forEach(name => this.deleteCookie(name));
    
    // Also try to find cookies that start with known prefixes
    if (category === 'analytics') {
      this.deleteCookiesByPrefix('_ga');
      this.deleteCookiesByPrefix('_gid');
    }
  }

  private deleteCookiesByPrefix(prefix: string): void {
     if (typeof document === 'undefined') return;
     const cookies = document.cookie.split(';');
     for (let i = 0; i < cookies.length; i++) {
         const cookie = cookies[i].trim();
         const eqPos = cookie.indexOf('=');
         const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
         if (name.startsWith(prefix)) {
             this.deleteCookie(name);
         }
     }
  }

  // --- Mock Implementations for Script Loading ---

  private loadAnalyticsScripts() {
    console.log('Loading Analytics Scripts (Google Analytics, Hotjar)...');
    // Implementation would insert <script> tags here
    // loadScript('https://www.googletagmanager.com/gtag/js?id=UA-XXXXX-Y');
  }

  private loadMarketingScripts() {
    console.log('Loading Marketing Scripts (Facebook Pixel, Ads)...');
    // loadScript('https://connect.facebook.net/en_US/fbevents.js');
  }
}

export const cookieManager = new CookieManager();
