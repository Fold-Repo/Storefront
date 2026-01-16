/**
 * Next.js Proxy for Subdomain/Domain Routing
 * 
 * This proxy:
 * 1. Detects subdomain or custom domain
 * 2. Loads the appropriate storefront configuration
 * 3. Routes to the storefront pages
 */

import { NextRequest, NextResponse } from 'next/server';

// Main domain (your platform domain)
// Use NEXT_PUBLIC_ prefix for client-side access, fallback to dfoldlab.co.uk
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || process.env.MAIN_DOMAIN || 'dfoldlab.co.uk';
const STOREFRONT_DOMAIN = process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN || process.env.STOREFRONT_DOMAIN || MAIN_DOMAIN;

export default async function middleware(request: NextRequest) {
    return proxy(request);
}

export async function proxy(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';

    // Log for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Proxy check:', { hostname, pathname: url.pathname, MAIN_DOMAIN });
    }

    // Skip proxy for:
    // - API routes
    // - Static files
    // - _next files
    if (
        url.pathname.startsWith('/api') ||
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/static') ||
        url.pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Skip for main platform routes (dashboard, auth, etc.)
    const platformRoutes = [
        '/dashboard',
        '/signin',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/verify',
        '/editor',
    ];

    if (platformRoutes.some(route => url.pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Extract subdomain or check if it's a custom domain
    const subdomain = extractSubdomain(hostname, MAIN_DOMAIN);

    // Check if it's localhost (development) or the main domain
    const hostWithoutPort = hostname.split(':')[0];
    const isLocalhost = hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1';

    // Also treat .netlify.app technical domains as the main domain to avoid misrouting
    // We also check a hardcoded fallback if MAIN_DOMAIN is missing
    const isMainDomain = hostWithoutPort === MAIN_DOMAIN ||
        hostWithoutPort === `www.${MAIN_DOMAIN}` ||
        hostWithoutPort === 'dfoldlab.co.uk' ||
        hostWithoutPort === 'www.dfoldlab.co.uk' ||
        hostWithoutPort.endsWith('.netlify.app');

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Subdomain extraction:', {
            hostname,
            hostWithoutPort,
            MAIN_DOMAIN,
            subdomain,
            isLocalhost,
            isMainDomain
        });
    }

    // If it's localhost or main domain with no subdomain, it's the main platform
    if ((isLocalhost || isMainDomain) && !subdomain) {
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Main platform route, skipping proxy');
        }
        return NextResponse.next();
    }

    // Check if it's a custom domain (not localhost, not main domain, no subdomain pattern)
    const isCustomDomain = !isLocalhost && !isMainDomain && !subdomain &&
        hostWithoutPort !== MAIN_DOMAIN &&
        !hostWithoutPort.includes(STOREFRONT_DOMAIN);

    // If no subdomain and not a custom domain, it's the main platform
    if (!subdomain && !isCustomDomain) {
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ No subdomain found, skipping proxy');
        }
        return NextResponse.next();
    }

    // Determine storefront identifier
    const storefrontId = subdomain || hostname;

    // Log storefront routing
    if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Routing to storefront:', { storefrontId, subdomain, isCustomDomain, pathname: url.pathname });
    }

    // Add storefront context to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-storefront-id', storefrontId);
    requestHeaders.set('x-storefront-subdomain', subdomain || '');
    requestHeaders.set('x-is-custom-domain', isCustomDomain ? 'true' : 'false');

    // Rewrite to storefront route
    url.pathname = `/storefront${url.pathname === '/' ? '' : url.pathname}`;

    if (process.env.NODE_ENV === 'development') {
        console.log('📝 Rewriting to:', url.pathname);
    }

    return NextResponse.rewrite(url, {
        request: {
            headers: requestHeaders,
        },
    });
}

/**
 * Extract subdomain from hostname
 */
function extractSubdomain(hostname: string, mainDomain: string): string | null {
    // Remove port if present
    const host = hostname.split(':')[0];

    // Check if it's a subdomain
    if (host.endsWith(`.${mainDomain}`)) {
        const subdomain = host.replace(`.${mainDomain}`, '');
        // Exclude www and common utility subdomains
        if (subdomain && subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'api') {
            return subdomain;
        }
    }

    return null;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
