/**
 * Terminal Client-Side Error Catching System
 * Built for SARTHI Production Grade Reliability
 * Catches: uncaught JS runtime errors, unhandled promise rejections, 
 * ChunkLoadError, failed fetch/API calls, React hydration errors,
 * and missing environment variables
 */

interface ErrorLogPayload {
    type: string;
    message: string;
    stack?: string;
    url?: string;
    userAgent?: string;
    timestamp: string;
    status?: number;
    lineno?: number;
    colno?: number;
    source?: string;
    digest?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;


async function sendToErrorApi(payload: ErrorLogPayload, retryCount = 0): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('/api/errors/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok && retryCount < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return sendToErrorApi(payload, retryCount + 1);
        }
    } catch (_e) {
        if (retryCount < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return sendToErrorApi(payload, retryCount + 1);
        }
    }
}

const originalConsoleError = typeof window !== 'undefined' ? window.console.error : null;

function logClientError(errorData: Partial<ErrorLogPayload>): void {
    const fullLog: ErrorLogPayload = {
        type: errorData.type || 'UNKNOWN_ERROR',
        message: errorData.message || 'Unknown error occurred',
        stack: errorData.stack,
        url: typeof window !== 'undefined' ? window.location.href : 'ssr',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        timestamp: new Date().toISOString(),
        status: errorData.status,
        lineno: errorData.lineno,
        colno: errorData.colno,
        source: errorData.source,
        digest: errorData.digest
    };

    console.group('%c ⚠️ SARTHI_ERROR_MONITOR ', 'background: #dc2626; color: #fff; border-radius: 4px; padding: 2px 6px;');
    if (originalConsoleError) {
        originalConsoleError.apply(console, [`TYPE: ${fullLog.type}`]);
        originalConsoleError.apply(console, [`MESSAGE: ${fullLog.message}`]);
        originalConsoleError.apply(console, [`URL: ${fullLog.url}`]);
        if (fullLog.stack) originalConsoleError.apply(console, [`STACK: ${fullLog.stack}`]);
    }
    console.groupEnd();

    sendToErrorApi(fullLog);
}

function handleChunkError(): void {
    const lastReload = localStorage.getItem('tt_chunk_reload');
    const now = Date.now();
    
    if (!lastReload || (now - parseInt(lastReload)) > 60000) {
        localStorage.setItem('tt_chunk_reload', now.toString());
        console.warn('RECOVERY: ChunkLoadError detected. Initiating clean reload...');
        logClientError({
            type: 'CHUNK_LOAD_ERROR',
            message: 'Dynamic import chunk failed to load, triggering page reload',
            url: window.location.href
        });
        setTimeout(() => window.location.reload(), 1500);
    }
}

if (typeof window !== 'undefined') {
    // Console error override removed to avoid conflicts

    window.onerror = function(message, source, lineno, colno, error) {
        const msgStr = typeof message === 'string' ? message : '';
        const srcStr = typeof source === 'string' ? source : '';
        
        // Ignore Next.js internal flow control errors
        if (msgStr.includes('NEXT_REDIRECT') || msgStr.includes('NEXT_NOT_FOUND')) return;

        const isChunkError = msgStr.includes('Loading chunk') || msgStr.includes('ChunkLoadError') || srcStr.includes('chunk');
        
        logClientError({
            type: isChunkError ? 'CHUNK_LOAD_ERROR' : 'JS_RUNTIME_ERROR',
            message: message?.toString() || 'Unknown error',
            source: source || 'unknown',
            lineno,
            colno,
            stack: error?.stack,
        });
        
        if (isChunkError) {
            handleChunkError();
        }
        
        return false;
    };

    window.onunhandledrejection = function(event) {
        const reason = event.reason;
        const message = reason?.message || reason || 'Unhandled Promise Rejection';
        const msgStr = message.toString();

        if (msgStr.includes('NEXT_REDIRECT') || msgStr.includes('NEXT_NOT_FOUND')) return;
        
        if (msgStr.includes('Loading chunk') || msgStr.includes('ChunkLoadError') || msgStr.includes('Failed to fetch dynamically imported')) {
            handleChunkError();
            return;
        }

        logClientError({
            type: 'UNHANDLED_PROMISE',
            message: message.toString(),
            stack: reason?.stack,
        });
    };

    window.addEventListener('error', function(e) {
        const target = e.target as HTMLScriptElement | HTMLLinkElement | HTMLImageElement;
        if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK' || target.tagName === 'IMG')) {
            const assetUrl = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || 'unknown';
            const isChunkAsset = assetUrl.includes('chunk') || assetUrl.includes('_next/static');
            
            logClientError({
                type: isChunkAsset ? 'CHUNK_ASSET_FAILURE' : 'ASSET_LOAD_FAILURE',
                message: `Failed to load asset: ${assetUrl}`,
                url: window.location.href
            });
            
            if (isChunkAsset) {
                handleChunkError();
            }
        }
    }, true);

    // Fetch override removed to avoid webpack issues

    // XMLHttpRequest overrides removed to avoid webpack issues

    if (typeof (window as any).next === 'undefined') {
        (window as any).next = {};
    }
    
    (window as any).next.error = function(err: Error & { digest?: string }) {
        logClientError({
            type: 'NEXTJS_ERROR',
            message: err.message,
            stack: err.stack,
            digest: err.digest,
            url: window.location.href
        });
    };


    setTimeout(() => {
        const missingVars: string[] = [];
        
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
        if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            missingVars.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
        }
        
        if (missingVars.length > 0) {
            logClientError({
                type: 'MISSING_ENV_VAR',
                message: `Missing required environment variables: ${missingVars.join(', ')}`,
                url: window.location.href
            });
        }
    }, 2000);

    console.log('%c ✓ SARTHI_ERROR_MONITOR ', 'background: #059669; color: #fff; border-radius: 4px; padding: 2px 6px;', 'Client-side error monitoring active');
}
