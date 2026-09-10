import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Centralized Redirect Logic (Rule #10)
 * 
 * Ensures users are consistent routed to their primary workspace.
 */
export function getDashboardRouteForRole(role: string, onboarded: boolean = true): string {
    const normalizedRole = role?.toUpperCase();
    if (!onboarded) return '/onboarding';
    
    if (['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(normalizedRole)) {
        return '/admin/dashboard';
    } else if (['TEACHER', 'INSTRUCTOR', 'TRAINER', 'FACULTY'].includes(normalizedRole)) {
        return '/teacher/dashboard';
    } else if (normalizedRole === 'MENTOR') {
        return '/mentor/dashboard';
    } else {
        return '/dashboard';
    }
}

export function isRouteAllowedForRole(route: string, role: string): boolean {
    if (!route || !role) return true;
    const normalizedRole = role.toUpperCase();
    const cleanRoute = route.split('?')[0].toLowerCase();

    if (cleanRoute.startsWith('/admin')) {
        return ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(normalizedRole);
    }
    if (cleanRoute.startsWith('/teacher') || cleanRoute.startsWith('/trainer')) {
        return ['TEACHER', 'INSTRUCTOR', 'TRAINER', 'FACULTY', 'ADMIN'].includes(normalizedRole);
    }
    if (cleanRoute.startsWith('/mentor')) {
        return ['MENTOR', 'ADMIN'].includes(normalizedRole);
    }
    if (cleanRoute.startsWith('/marketing')) {
        return ['ASSOCIATE', 'MARKETING_PARTNER', 'ADMIN'].includes(normalizedRole);
    }
    return true;
}

export function redirectByRole(
    role: string, 
    router: AppRouterInstance, 
    onboarded: boolean = true,
    requestedRedirectUrl?: string | null
) {
    let targetRoute = getDashboardRouteForRole(role, onboarded);

    if (requestedRedirectUrl && requestedRedirectUrl.startsWith('/') && !requestedRedirectUrl.startsWith('/login')) {
        const cleanUrl = requestedRedirectUrl.split('?')[0];
        if (isRouteAllowedForRole(cleanUrl, role)) {
            targetRoute = cleanUrl;
        }
    }

    console.log('[NAV] redirect requested: ' + targetRoute, { source: 'redirectByRole', role });
    if (typeof window !== 'undefined') {
        if (window.location.pathname !== targetRoute) {
            window.location.href = targetRoute;
        }
    } else {
        router.push(targetRoute);
    }
}
