/**
 * Domain utility functions
 */

/**
 * Get the main domain from environment variable
 * Falls back to 'dfoldlab.co.uk' if not set
 */
export function getMainDomain(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_ prefix
    return process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'dfoldlab.co.uk';
  }
  // Server-side: can use either prefix
  return process.env.NEXT_PUBLIC_MAIN_DOMAIN || process.env.MAIN_DOMAIN || 'dfoldlab.co.uk';
}

/**
 * Get the full subdomain URL
 */
export function getSubdomainUrl(subdomain: string): string {
  const mainDomain = getMainDomain();
  return `https://${subdomain}.${mainDomain}`;
}

/**
 * Get the subdomain with domain suffix (e.g., "mysite.storefront.com")
 */
export function getSubdomainWithDomain(subdomain: string): string {
  const mainDomain = getMainDomain();
  return `${subdomain}.${mainDomain}`;
}
