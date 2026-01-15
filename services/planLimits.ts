/**
 * Plan Limits Service
 * 
 * Manages subscription plan limits for:
 * - Number of storefronts per user
 * - Number of pages per storefront
 * 
 * Limits are stored in Firebase and checked before creation
 */

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export interface PlanLimits {
  planId: string;
  planName: string;
  maxStorefronts: number;
  maxPagesPerStorefront: number;
  features: string[];
  createdAt: any;
  updatedAt: any;
}

export interface UserPlan {
  userId: string;
  planId: string;
  planName: string;
  limits: {
    maxStorefronts: number;
    maxPagesPerStorefront: number;
  };
  currentUsage: {
    storefronts: number;
    pages: Record<string, number>; // storefrontId -> page count
  };
  subscribedAt: any;
  expiresAt?: any;
  status: 'active' | 'inactive' | 'expired';
}

const PLANS_COLLECTION = "subscription_plans";
const USER_PLANS_COLLECTION = "user_plans";

/**
 * Default plans configuration
 */
export const DEFAULT_PLANS: PlanLimits[] = [
  {
    planId: 'free',
    planName: 'Free',
    maxStorefronts: 1,
    maxPagesPerStorefront: 8, // Standard pages (homepage, products, etc.)
    features: ['basic_support'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    planId: 'starter',
    planName: 'Starter',
    maxStorefronts: 1,
    maxPagesPerStorefront: 15,
    features: ['basic_support', 'custom_pages'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    planId: 'professional',
    planName: 'Professional',
    maxStorefronts: 3,
    maxPagesPerStorefront: 50,
    features: ['priority_support', 'custom_pages', 'custom_domain'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    planId: 'enterprise',
    planName: 'Enterprise',
    maxStorefronts: 10,
    maxPagesPerStorefront: 100,
    features: ['priority_support', 'custom_pages', 'custom_domain', 'api_access'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Initialize default plans in Firebase
 */
export async function initializeDefaultPlans(): Promise<void> {
  try {
    for (const plan of DEFAULT_PLANS) {
      const planRef = doc(db, PLANS_COLLECTION, plan.planId);
      const planDoc = await getDoc(planRef);

      if (!planDoc.exists()) {
        await setDoc(planRef, plan);
      }
    }
  } catch (error) {
    console.error('Error initializing default plans:', error);
    throw error;
  }
}

/**
 * Get plan limits by plan ID
 */
export async function getPlanLimits(planId: string): Promise<PlanLimits | null> {
  try {
    const planRef = doc(db, PLANS_COLLECTION, planId);
    const planDoc = await getDoc(planRef);

    if (planDoc.exists()) {
      return planDoc.data() as PlanLimits;
    }

    return null;
  } catch (error) {
    console.error('Error getting plan limits:', error);
    return null;
  }
}

/**
 * Get user's current plan
 * Uses API route to bypass Firestore security rules
 */
export async function getUserPlan(userId: string): Promise<UserPlan | null> {
  try {
    // Use API route instead of direct Firestore access
    const response = await fetch(`/api/user/plan?userId=${encodeURIComponent(userId)}`);

    if (!response.ok) {
      throw new Error(`Failed to get user plan: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('Error getting user plan:', error);
    return null;
  }
}

/**
 * Assign default (free) plan to user
 * Uses API route to bypass Firestore security rules
 * Note: This is automatically handled by getUserPlan when no plan exists
 */
export async function assignDefaultPlan(userId: string): Promise<UserPlan> {
  try {
    // Use getUserPlan which will automatically assign default plan if none exists
    const userPlan = await getUserPlan(userId);
    if (!userPlan) {
      throw new Error('Failed to assign default plan');
    }
    return userPlan;
  } catch (error) {
    console.error('Error assigning default plan:', error);
    throw error;
  }
}

/**
 * Update user plan
 */
export async function updateUserPlan(
  userId: string,
  planId: string
): Promise<UserPlan> {
  try {
    const plan = await getPlanLimits(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    const userPlan = await getUserPlan(userId);
    if (!userPlan) {
      throw new Error('User plan not found');
    }

    const updatedPlan: UserPlan = {
      ...userPlan,
      planId,
      planName: plan.planName,
      limits: {
        maxStorefronts: plan.maxStorefronts,
        maxPagesPerStorefront: plan.maxPagesPerStorefront,
      },
      status: 'active',
    };

    const userPlanRef = doc(db, USER_PLANS_COLLECTION, userId);
    await updateDoc(userPlanRef, updatedPlan as any);

    return updatedPlan;
  } catch (error) {
    console.error('Error updating user plan:', error);
    throw error;
  }
}

/**
 * Check if user can create more storefronts
 */
export async function canCreateStorefront(userId: string): Promise<{
  allowed: boolean;
  current: number;
  max: number;
  message?: string;
}> {
  try {
    const userPlan = await getUserPlan(userId);
    if (!userPlan) {
      return {
        allowed: false,
        current: 0,
        max: 0,
        message: 'User plan not found',
      };
    }

    const current = userPlan.currentUsage.storefronts;
    const max = userPlan.limits.maxStorefronts;

    if (current >= max) {
      return {
        allowed: false,
        current,
        max,
        message: `You have reached your plan limit of ${max} storefront${max > 1 ? 's' : ''}. Please upgrade your plan to create more storefronts.`,
      };
    }

    return {
      allowed: true,
      current,
      max,
    };
  } catch (error) {
    console.error('Error checking storefront limit:', error);
    return {
      allowed: false,
      current: 0,
      max: 0,
      message: 'Error checking limits',
    };
  }
}

/**
 * Check if user can create more pages for a storefront
 */
export async function canCreatePage(
  userId: string,
  storefrontId: string
): Promise<{
  allowed: boolean;
  current: number;
  max: number;
  message?: string;
}> {
  try {
    const userPlan = await getUserPlan(userId);
    if (!userPlan) {
      return {
        allowed: false,
        current: 0,
        max: 0,
        message: 'User plan not found',
      };
    }

    const current = userPlan.currentUsage.pages[storefrontId] || 0;
    const max = userPlan.limits.maxPagesPerStorefront;

    if (current >= max) {
      return {
        allowed: false,
        current,
        max,
        message: `You have reached your plan limit of ${max} pages per storefront. Please upgrade your plan to create more pages.`,
      };
    }

    return {
      allowed: true,
      current,
      max,
    };
  } catch (error) {
    console.error('Error checking page limit:', error);
    return {
      allowed: false,
      current: 0,
      max: 0,
      message: 'Error checking limits',
    };
  }
}

/**
 * Increment storefront count when a storefront is created
 * Uses API route to bypass Firestore security rules
 */
export async function incrementStorefrontCount(userId: string): Promise<void> {
  try {
    const response = await fetch('/api/user/plan', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action: 'incrementStorefront',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to increment storefront count');
    }
  } catch (error) {
    console.error('Error incrementing storefront count:', error);
    throw error;
  }
}

/**
 * Increment page count when a page is created
 * Uses API route to bypass Firestore security rules
 */
export async function incrementPageCount(
  userId: string,
  storefrontId: string
): Promise<void> {
  try {
    const response = await fetch('/api/user/plan', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action: 'incrementPage',
        storefrontId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to increment page count');
    }
  } catch (error) {
    console.error('Error incrementing page count:', error);
    throw error;
  }
}

/**
 * Decrement storefront count when a storefront is deleted
 * Uses API route to bypass Firestore security rules
 */
export async function decrementStorefrontCount(userId: string): Promise<void> {
  try {
    const response = await fetch('/api/user/plan', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action: 'decrementStorefront',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to decrement storefront count');
    }
  } catch (error) {
    console.error('Error decrementing storefront count:', error);
    throw error;
  }
}

/**
 * Decrement page count when a page is deleted
 * Uses API route to bypass Firestore security rules
 */
export async function decrementPageCount(
  userId: string,
  storefrontId: string
): Promise<void> {
  try {
    const response = await fetch('/api/user/plan', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action: 'decrementPage',
        storefrontId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to decrement page count');
    }
  } catch (error) {
    console.error('Error decrementing page count:', error);
    throw error;
  }
}

/**
 * Get current usage for a user
 */
export async function getUserUsage(userId: string): Promise<{
  storefronts: { current: number; max: number };
  pages: Record<string, { current: number; max: number }>;
}> {
  try {
    const userPlan = await getUserPlan(userId);
    if (!userPlan) {
      return {
        storefronts: { current: 0, max: 0 },
        pages: {},
      };
    }

    const pages: Record<string, { current: number; max: number }> = {};
    Object.keys(userPlan.currentUsage.pages).forEach(storefrontId => {
      pages[storefrontId] = {
        current: userPlan.currentUsage.pages[storefrontId] || 0,
        max: userPlan.limits.maxPagesPerStorefront,
      };
    });

    return {
      storefronts: {
        current: userPlan.currentUsage.storefronts || 0,
        max: userPlan.limits.maxStorefronts,
      },
      pages,
    };
  } catch (error) {
    console.error('Error getting user usage:', error);
    return {
      storefronts: { current: 0, max: 0 },
      pages: {},
    };
  }
}
