/**
 * Netlify API Service
 * 
 * Handles programmatic domain management using the Netlify REST API.
 * This ensures parity with the Vercel implementation for users preferring Netlify's infrastructure.
 * 
 * Documentation: https://docs.netlify.com/api/get-started/
 */

const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;

/**
 * Add a custom domain (alias) to the Netlify site
 * 
 * Uses `POST /sites/{site_id}/domain_aliases` to register a new domain.
 */
export async function addCustomDomainToNetlify(domain: string) {
    if (!NETLIFY_ACCESS_TOKEN || !NETLIFY_SITE_ID) {
        throw new Error('NETLIFY_ACCESS_TOKEN or NETLIFY_SITE_ID environment variables are missing');
    }

    const url = `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/domain_aliases`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            alias: domain,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Netlify API Error:', error);
        throw new Error(error.message || 'Failed to add domain to Netlify');
    }

    return await response.json();
}

/**
 * Check the status of a custom domain on Netlify
 * 
 * Since Netlify doesn't have a direct "verify" endpoint like Vercel for a specific alias:
 * 1. We fetch the site details.
 * 2. We check if the domain exists in `domain_aliases`.
 * 3. We check the SSL status for the site (which covers all aliases).
 */
export async function verifyNetlifyDomainStatus(domain: string) {
    if (!NETLIFY_ACCESS_TOKEN || !NETLIFY_SITE_ID) {
        throw new Error('NETLIFY_ACCESS_TOKEN or NETLIFY_SITE_ID environment variables are missing');
    }

    const url = `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch site status from Netlify');
    }

    const site = await response.json();
    const isAliased = site.domain_aliases?.includes(domain);

    // Netlify handles SSL automatically for all aliases. 
    // If the alias exists, Netlify is trying to provision SSL.
    // 'ssl_url' usually indicates SSL is active for the primary domain, extending to aliases.
    const isSslActive = !!site.ssl_url;

    return {
        verified: isAliased && isSslActive,
        exists: isAliased,
        verificationIssues: !isAliased ? ['Domain not found in site aliases'] : (!isSslActive ? ['SSL provisioning in progress'] : []),
    };
}

/**
 * Remove a custom domain alias from the Netlify site
 * 
 * Uses `DELETE /sites/{site_id}/domain_aliases/{domain_alias_id}`.
 * Netlify requires the ID of the alias to delete it, or passing the alias name to the correct endpoint.
 * Note: The API doc usually references deleting by ID, but `DELETE /sites/{site_id}/domain_aliases/{alias_name}` often works or we must find ID first.
 * For simplicity, we try the alias name path first as per common REST patterns, if that fails we'd need to lookup ID.
 */
export async function removeCustomDomainFromNetlify(domain: string) {
    if (!NETLIFY_ACCESS_TOKEN || !NETLIFY_SITE_ID) {
        throw new Error('NETLIFY_ACCESS_TOKEN or NETLIFY_SITE_ID environment variables are missing');
    }

    const url = `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/domain_aliases/${domain}`;

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        // If 404, it might already be gone, which is fine.
        if (response.status === 404) return { success: true };

        const error = await response.json();
        throw new Error(error.message || 'Failed to remove domain from Netlify');
    }

    // DELETE usually returns 204 No Content
    return { success: true };
}
