/**
 * API Route for managing storefront subdomains
 * 
 * Handles:
 * - Creating subdomain DNS records
 * - Checking subdomain availability
 * - Updating subdomain configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  setupStorefrontSubdomain,
  subdomainExists,
  getDNSRecordBySubdomain,
  deleteSubdomainDNSRecord,
} from '@/services/cloudflare';

interface RouteParams {
  params: Promise<{
    storefrontId: string;
  }>;
}

/**
 * GET /api/storefront/[storefrontId]/subdomain
 * Check subdomain status
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { storefrontId } = await params;
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain') || storefrontId;

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      );
    }

    // Check if subdomain exists
    const exists = await subdomainExists(subdomain);
    const record = exists ? await getDNSRecordBySubdomain(subdomain) : null;

    return NextResponse.json({
      subdomain,
      exists,
      domain: exists
        ? `${subdomain}.${process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'dfoldlab.co.uk'}`
        : null,
      record: record
        ? {
          id: record.id,
          type: record.type,
          proxied: record.proxied,
          ttl: record.ttl,
        }
        : null,
    });
  } catch (error: any) {
    console.error('Error checking subdomain:', error);
    return NextResponse.json(
      { error: 'Failed to check subdomain', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/storefront/[storefrontId]/subdomain
 * Create or update subdomain
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { storefrontId } = await params;
    const body = await request.json();
    const { subdomain, serverIp } = body;

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      );
    }

    // Validate subdomain format
    if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(subdomain)) {
      return NextResponse.json(
        {
          error: 'Invalid subdomain format',
          message:
            'Subdomain must contain only lowercase letters, numbers, and hyphens. Must start and end with alphanumeric characters.',
        },
        { status: 400 }
      );
    }

    // Get server IP from environment or request
    const ip = serverIp || process.env.SERVER_IP;

    if (!ip) {
      return NextResponse.json(
        {
          error: 'Server IP is required',
          message:
            'Provide serverIp in request body or set SERVER_IP environment variable',
        },
        { status: 400 }
      );
    }

    // Setup subdomain
    const result = await setupStorefrontSubdomain(subdomain, ip);

    // Register with Netlify automatically
    try {
      const { addCustomDomainToNetlify } = await import('@/services/netlify');
      const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'dfoldlab.co.uk';
      const fullDomain = `${subdomain}.${mainDomain}`;
      await addCustomDomainToNetlify(fullDomain);
    } catch (error: any) {
      console.error('Netlify registration error:', error);
      // We don't fail the request because DNS is already successfully set up
    }

    return NextResponse.json({
      success: true,
      subdomain: result.domain,
      recordId: result.recordId,
      message: 'Subdomain created successfully and registered with Netlify',
    });
  } catch (error: any) {
    console.error('Error creating subdomain:', error);
    return NextResponse.json(
      { error: 'Failed to create subdomain', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/storefront/[storefrontId]/subdomain
 * Delete subdomain DNS record
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { storefrontId } = await params;
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain') || storefrontId;

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      );
    }

    // Get DNS record
    const record = await getDNSRecordBySubdomain(subdomain);

    if (!record) {
      return NextResponse.json(
        { error: 'Subdomain not found' },
        { status: 404 }
      );
    }

    // Delete DNS record
    await deleteSubdomainDNSRecord(record.id);

    return NextResponse.json({
      success: true,
      message: 'Subdomain deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting subdomain:', error);
    return NextResponse.json(
      { error: 'Failed to delete subdomain', message: error.message },
      { status: 500 }
    );
  }
}
