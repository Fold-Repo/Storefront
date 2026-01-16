/**
 * Cloudflare DNS Service
 * 
 * Handles programmatic subdomain creation and management via Cloudflare API
 */

interface CreateDNSRecordParams {
  subdomain: string;
  serverIp: string;
  proxied?: boolean; // Enable Cloudflare proxy (CDN + protection)
}

interface UpdateDNSRecordParams {
  recordId: string;
  subdomain: string;
  serverIp: string;
  proxied?: boolean;
}

interface CloudflareResponse<T> {
  success: boolean;
  result: T;
  errors?: any[];
}

interface DNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  ttl: number;
}

/**
 * Create a DNS A record for a subdomain
 */
export async function createSubdomainDNSRecord(
  params: CreateDNSRecordParams
): Promise<DNSRecord> {
  const { subdomain, serverIp, proxied = true } = params;

  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    throw new Error('Cloudflare credentials not configured');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'A',
        name: subdomain,
        content: serverIp,
        ttl: 1, // Auto TTL
        proxied: proxied, // Enable Cloudflare proxy (CDN + protection)
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to create DNS record: ${error.errors?.[0]?.message || 'Unknown error'}`
    );
  }

  const data: CloudflareResponse<DNSRecord> = await response.json();

  if (!data.success) {
    throw new Error(
      `Cloudflare API error: ${data.errors?.[0]?.message || 'Unknown error'}`
    );
  }

  return data.result;
}

/**
 * Update an existing DNS record
 */
export async function updateSubdomainDNSRecord(
  params: UpdateDNSRecordParams
): Promise<DNSRecord> {
  const { recordId, subdomain, serverIp, proxied = true } = params;

  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    throw new Error('Cloudflare credentials not configured');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'A',
        name: subdomain,
        content: serverIp,
        ttl: 1,
        proxied: proxied,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to update DNS record: ${error.errors?.[0]?.message || 'Unknown error'}`
    );
  }

  const data: CloudflareResponse<DNSRecord> = await response.json();

  if (!data.success) {
    throw new Error(
      `Cloudflare API error: ${data.errors?.[0]?.message || 'Unknown error'}`
    );
  }

  return data.result;
}

/**
 * Get DNS record by subdomain
 */
export async function getDNSRecordBySubdomain(
  subdomain: string
): Promise<DNSRecord | null> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    throw new Error('Cloudflare credentials not configured');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${subdomain}&type=A`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get DNS record: ${error.errors?.[0]?.message || 'Unknown error'}`
    );
  }

  const data: CloudflareResponse<DNSRecord[]> = await response.json();

  if (!data.success || !data.result || data.result.length === 0) {
    return null;
  }

  return data.result[0];
}

/**
 * Delete a DNS record
 */
export async function deleteSubdomainDNSRecord(recordId: string): Promise<void> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    throw new Error('Cloudflare credentials not configured');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to delete DNS record: ${error.errors?.[0]?.message || 'Unknown error'}`
    );
  }

  const data: CloudflareResponse<any> = await response.json();

  if (!data.success) {
    throw new Error(
      `Cloudflare API error: ${data.errors?.[0]?.message || 'Unknown error'}`
    );
  }
}

/**
 * Check if subdomain DNS record exists
 */
export async function subdomainExists(subdomain: string): Promise<boolean> {
  try {
    const record = await getDNSRecordBySubdomain(subdomain);
    return record !== null;
  } catch (error) {
    console.error('Error checking subdomain:', error);
    return false;
  }
}

/**
 * Setup subdomain for a storefront
 * Creates DNS record and returns the full domain
 */
export async function setupStorefrontSubdomain(
  subdomain: string,
  serverIp: string
): Promise<{ success: boolean; domain: string; recordId: string }> {
  try {
    // Validate subdomain format
    if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(subdomain)) {
      throw new Error('Invalid subdomain format. Use lowercase letters, numbers, and hyphens only.');
    }

    // Check if subdomain already exists
    const existing = await getDNSRecordBySubdomain(subdomain);
    if (existing) {
      // Update existing record
      const updated = await updateSubdomainDNSRecord({
        recordId: existing.id,
        subdomain,
        serverIp,
      });
      return {
        success: true,
        domain: `${subdomain}.${process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'dfoldlab.co.uk'}`,
        recordId: updated.id,
      };
    }

    // Create new DNS record
    const record = await createSubdomainDNSRecord({
      subdomain,
      serverIp,
      proxied: true, // Enable Cloudflare proxy for CDN and protection
    });

    const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN && process.env.NEXT_PUBLIC_MAIN_DOMAIN !== 'localhost')
      ? process.env.NEXT_PUBLIC_MAIN_DOMAIN
      : 'dfoldlab.co.uk';

    return {
      success: true,
      domain: `${subdomain}.${mainDomain}`,
      recordId: record.id,
    };
  } catch (error: any) {
    console.error('Error setting up subdomain:', error);
    throw error;
  }
}
