/**
 * API Route for managing storefront pages
 * 
 * Handles:
 * - Creating new pages
 * - Updating page settings
 * - Listing all pages
 * - Enabling/disabling pages
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  savePageSetting,
  getPageSettingsByStorefront,
  getPageSetting,
  updatePageSetting,
  deletePageSetting,
  createDefaultPageSettings,
} from '@/services/pageSettings';
import {
  canCreatePage,
  incrementPageCount,
  decrementPageCount,
} from '@/services/planLimits';

interface RouteParams {
  params: {
    storefrontId: string;
  };
}

/**
 * GET /api/storefront/[storefrontId]/pages
 * Get all pages for a storefront
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { storefrontId } = params;

    if (!storefrontId) {
      return NextResponse.json(
        { error: 'Storefront ID is required' },
        { status: 400 }
      );
    }

    const pages = await getPageSettingsByStorefront(storefrontId);

    return NextResponse.json({ pages });
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/storefront/[storefrontId]/pages
 * Create a new page
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { storefrontId } = params;
    const body = await request.json();

    if (!storefrontId) {
      return NextResponse.json(
        { error: 'Storefront ID is required' },
        { status: 400 }
      );
    }

    const {
      pageType,
      route,
      contentType,
      dataSource,
      settings,
      userId,
    } = body;

    if (!pageType || !route || !userId) {
      return NextResponse.json(
        { error: 'pageType, route, and userId are required' },
        { status: 400 }
      );
    }

    // Check page limit before creating
    const limitCheck = await canCreatePage(userId, storefrontId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Page limit exceeded',
          message: limitCheck.message || 'You have reached your page limit',
          limit: {
            current: limitCheck.current,
            max: limitCheck.max,
          },
        },
        { status: 403 }
      );
    }

    // Validate route format (should start with /)
    if (!route.startsWith('/')) {
      return NextResponse.json(
        { error: 'Route must start with /' },
        { status: 400 }
      );
    }

    const pageId = await savePageSetting({
      storefrontId,
      userId,
      pageType,
      route,
      contentType: contentType || 'static',
      dataSource: dataSource || {
        type: 'static',
        staticData: {},
      },
      settings: settings || {
        enabled: true,
        showInMenu: false,
        showInFooter: false,
      },
    });

    // Increment page count
    await incrementPageCount(userId, storefrontId);

    return NextResponse.json({
      success: true,
      pageId,
      message: 'Page created successfully',
      limit: {
        current: limitCheck.current + 1,
        max: limitCheck.max,
      },
    });
  } catch (error: any) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/storefront/[storefrontId]/pages/[pageType]
 * Update a page
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { storefrontId } = params;
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('pageType');
    const body = await request.json();

    if (!storefrontId || !pageType) {
      return NextResponse.json(
        { error: 'Storefront ID and pageType are required' },
        { status: 400 }
      );
    }

    const pageSetting = await getPageSetting(storefrontId, pageType);

    if (!pageSetting) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    await updatePageSetting(pageSetting.id, body);

    return NextResponse.json({
      success: true,
      message: 'Page updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/storefront/[storefrontId]/pages/[pageType]
 * Delete a page
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { storefrontId } = params;
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('pageType');
    const userId = searchParams.get('userId');

    if (!storefrontId || !pageType) {
      return NextResponse.json(
        { error: 'Storefront ID and pageType are required' },
        { status: 400 }
      );
    }

    const pageSetting = await getPageSetting(storefrontId, pageType);

    if (!pageSetting) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    await deletePageSetting(pageSetting.id);

    // Decrement page count if userId is provided
    if (userId) {
      await decrementPageCount(userId, storefrontId);
    }

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page', message: error.message },
      { status: 500 }
    );
  }
}
