import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFileSync, existsSync, readFileSync } from 'fs';

type ApiHandler = (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>;
type ApiMiddleware = (req: NextRequest, handler: ApiHandler) => Promise<NextResponse>;

interface WrapperOptions {
    slowThreshold?: number;
    requiredEnv?: string[];
    rateLimit?: { max: number; windowMs: number };
}

interface RouteConfig {
    GET?: ApiHandler;
    POST?: ApiHandler;
    PUT?: ApiHandler;
    DELETE?: ApiHandler;
    PATCH?: ApiHandler;
}

function logErrorToFile(error: unknown, requestId: string, url: string): void {
    try {
        const logPath = path.join(process.cwd(), 'error-logs.json');
        let logs: unknown[] = [];
        
        if (existsSync(logPath)) {
            const content = readFileSync(logPath, 'utf8');
            logs = JSON.parse(content || '[]');
        }
        
        const errorLog = {
            id: Math.random().toString(36).substring(2, 11),
            type: 'API_ERROR',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            url,
            userAgent: 'server',
            timestamp: new Date().toISOString(),
            requestId,
            count: 1
        };
        
        logs.unshift(errorLog);
        
        if (logs.length > 200) logs = logs.slice(0, 200);
        
        writeFileSync(logPath, JSON.stringify(logs, null, 2));
    } catch (e) {
        console.error('Failed to write error log:', e);
    }
}

export function createApiHandler(config: RouteConfig, options: WrapperOptions = {}) {
    const { slowThreshold = 500, requiredEnv = [] } = options;
    
    return async (req: NextRequest): Promise<NextResponse> => {
        const startTime = Date.now();
        const requestId = req.headers.get('x-request-id') || Math.random().toString(36).substring(7);
        const method = req.method.toUpperCase();
        
        try {
            for (const envVar of requiredEnv) {
                if (!process.env[envVar]) {
                    console.error(`[API_WRAPPER] Missing required env: ${envVar}`);
                    return NextResponse.json({
                        success: false,
                        error: 'INTERNAL_CONFIGURATION_ERROR',
                        code: 500
                    }, { status: 500 });
                }
            }
            
            const handler = config[method as keyof RouteConfig];
            
            if (!handler) {
                return NextResponse.json({
                    success: false,
                    error: 'METHOD_NOT_ALLOWED',
                    code: 405
                }, { status: 405 });
            }
            
            const response = await handler(req);
            
            const duration = Date.now() - startTime;
            if (duration > slowThreshold) {
                console.warn(`[SLOW_API] ${method} ${req.url} took ${duration}ms (threshold: ${slowThreshold}ms)`);
            }
            
            response.headers.set('x-request-id', requestId);
            response.headers.set('x-response-time', `${duration}ms`);
            
            return response;
            
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'INTERNAL_EXCEPTION';
            const statusCode = error instanceof Error && (error as any).statusCode ? (error as any).statusCode : 500;
            
            console.error(`[API_WRAPPER_ERROR] ${method} ${req.url}:`, errorMessage);
            
            logErrorToFile(error, requestId, req.url);
            
            return NextResponse.json({
                success: false,
                error: errorMessage,
                code: statusCode,
                requestId
            }, { status: statusCode >= 400 && statusCode < 600 ? statusCode : 500 });
        }
    };
}

export function withApiWrapper(handler: ApiHandler, options: WrapperOptions = {}): ApiHandler {
    const { slowThreshold = 500, requiredEnv = [] } = options;
    
    return async (req: NextRequest, ...args: unknown[]) => {
        const startTime = Date.now();
        const requestId = req.headers.get('x-request-id') || Math.random().toString(36).substring(7);
        
        try {
            for (const envVar of requiredEnv) {
                if (!process.env[envVar]) {
                    return NextResponse.json({
                        success: false,
                        error: 'MISSING_CONFIGURATION',
                        code: 500,
                        details: `Environment variable ${envVar} is not configured`
                    }, { status: 500 });
                }
            }
            
            const response = await handler(req, ...args);
            
            const duration = Date.now() - startTime;
            if (duration > slowThreshold) {
                console.warn(`[SLOW_RESPONSE] ${req.method} ${req.url} took ${duration}ms`);
            }
            
            response.headers.set('x-request-id', requestId);
            response.headers.set('x-response-time', `${duration}ms`);
            
            return response;
            
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const stack = error instanceof Error ? error.stack : undefined;
            
            console.error(`[API_EXCEPTION] Request ${requestId}:`, error);
            
            logErrorToFile(error, requestId, req.url);
            
            return NextResponse.json({
                success: false,
                error: errorMessage,
                code: 500,
                requestId,
                ...(process.env.NODE_ENV === 'development' && { stack })
            }, { status: 500 });
        }
    };
}
