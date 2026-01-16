/**
 * Domain utility functions
 */

/**
 * Get the main domain from environment variable
 * Falls back to 'dfoldlab.co.uk' if not set
 */
export function getMainDomain(): string {
  const domain = (typeof window !== 'undefined')
    ? process.env.NEXT_PUBLIC_MAIN_DOMAIN
    : (process.env.NEXT_PUBLIC_MAIN_DOMAIN || process.env.MAIN_DOMAIN);

  if (!domain || domain === 'localhost') {
    return 'dfoldlab.co.uk';
  }

  return domain;
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
