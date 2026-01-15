/**
 * Vercel API Service
 * 
 * Handles programmatic domain management using the Vercel REST API.
 * 
 * Documentation: https://vercel.com/docs/rest-api/endpoints/projects#add-a-domain-to-a-project
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // Optional, required for teams

/**
 * Add a custom domain to the Vercel project
 */
export async function addCustomDomainToVercel(domain: string) {
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
        throw new Error('VERCEL_TOKEN or VERCEL_PROJECT_ID environment variables are missing');
    }

    const url = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
        }`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: domain,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Vercel API Error:', error);
        throw new Error(error.error?.message || 'Failed to add domain to Vercel');
    }

    return await response.json();
}

/**
 * Check the verification status of a custom domain
 */
export async function verifyCustomDomainStatus(domain: string) {
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
        throw new Error('VERCEL_TOKEN or VERCEL_PROJECT_ID environment variables are missing');
    }

    const url = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
        }`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to verify domain status');
    }

    const data = await response.json();
    return {
        verified: data.verified,
        verificationIssues: data.verification || [],
    };
}

/**
 * Remove a custom domain from the Vercel project
 */
export async function removeCustomDomainFromVercel(domain: string) {
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
        throw new Error('VERCEL_TOKEN or VERCEL_PROJECT_ID environment variables are missing');
    }

    const url = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
        }`;

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to remove domain from Vercel');
    }

    return await response.json();
}
