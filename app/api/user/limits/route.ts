/**
 * API Route for checking user plan limits
 * 
 * Handles:
 * - Getting user's current plan and limits
 * - Checking if user can create storefronts
 * - Checking if user can create pages
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserPlan,
  canCreateStorefront,
  canCreatePage,
  getUserUsage,
} from '@/services/planLimits';

/**
 * GET /api/user/limits
 * Get user's plan limits and current usage
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const storefrontId = searchParams.get('storefrontId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user plan
    const userPlan = await getUserPlan(userId);
    if (!userPlan) {
      return NextResponse.json(
        { error: 'User plan not found' },
        { status: 404 }
      );
    }

    // Get usage
    const usage = await getUserUsage(userId);

    // Check storefront limit
    const storefrontCheck = await canCreateStorefront(userId);

    // Check page limit if storefrontId is provided
    let pageCheck = null;
    if (storefrontId) {
      pageCheck = await canCreatePage(userId, storefrontId);
    }

    return NextResponse.json({
      plan: {
        planId: userPlan.planId,
        planName: userPlan.planName,
        limits: userPlan.limits,
      },
      usage,
      canCreateStorefront: storefrontCheck.allowed,
      storefrontLimit: {
        current: storefrontCheck.current,
        max: storefrontCheck.max,
        message: storefrontCheck.message,
      },
      canCreatePage: pageCheck
        ? {
            allowed: pageCheck.allowed,
            current: pageCheck.current,
            max: pageCheck.max,
            message: pageCheck.message,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error getting user limits:', error);
    return NextResponse.json(
      { error: 'Failed to get user limits', message: error.message },
      { status: 500 }
    );
  }
}
