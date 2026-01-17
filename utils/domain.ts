/**
 * Domain utility functions
 */

/**
 * Get the main domain from environment variable or browser host
 * Priority:
 * 1. NEXT_PUBLIC_MAIN_DOMAIN env var (if not localhost)
 * 2. Browser host URL (extract parent domain)
 * 3. Fallback to 'dfoldlab.co.uk'
 */
export function getMainDomain(): string {
  // First check environment variable
  const envDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || process.env.MAIN_DOMAIN;

  if (envDomain && envDomain !== 'localhost' && !envDomain.includes('localhost')) {
    return envDomain;
  }

  // On client-side, try to extract from browser host URL
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;

    // If it's localhost, return fallback
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'dfoldlab.co.uk';
    }

    // Extract parent domain from subdomain
    // e.g., "bukaxp.dfoldlab.co.uk" -> "dfoldlab.co.uk"
    const parts = host.split('.');
    if (parts.length >= 2) {
      // Return last 2 parts for .co.uk, .com, etc.
      // Handle TLDs like .co.uk (3 parts) vs .com (2 parts)
      if (parts.length >= 3 && (parts[parts.length - 2] === 'co' || parts[parts.length - 2] === 'org')) {
        return parts.slice(-3).join('.');
      }
      return parts.slice(-2).join('.');
    }

    return host;
  }

  // Server-side fallback
  return 'dfoldlab.co.uk';
}

/**
 * Get the full subdomain URL
 */
export function getSubdomainUrl(subdomain: string): string {
  const mainDomain = getMainDomain();
  return `https://${subdomain}.${mainDomain}`;
}

/**
 * Get the subdomain with domain suffix (e.g., "mysite.dfoldlab.co.uk")
 */
export function getSubdomainWithDomain(subdomain: string): string {
  const mainDomain = getMainDomain();
  return `${subdomain}.${mainDomain}`;
}

/**
 * Extract subdomain from current host
 * e.g., "bukaxp.dfoldlab.co.uk" -> "bukaxp"
 */
export function getCurrentSubdomain(): string | null {
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname;
  const mainDomain = getMainDomain();

  if (host.endsWith(`.${mainDomain}`)) {
    return host.replace(`.${mainDomain}`, '');
  }

  return null;
}
