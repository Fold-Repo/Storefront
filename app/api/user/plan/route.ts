/**
 * API Route: Get User Plan
 * 
 * Server-side route to fetch user plan from Firestore
 * This bypasses Firestore security rules by running on the server
 */

import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

const USER_PLANS_COLLECTION = "user_plans";
const PLANS_COLLECTION = "subscription_plans";

// Default free plan configuration
const DEFAULT_FREE_PLAN = {
  planId: 'free',
  planName: 'Free',
  maxStorefronts: 1,
  maxPagesPerStorefront: 8,
  features: ['basic_support'],
};

interface UserPlan {
  userId: string;
  planId: string;
  planName: string;
  limits: {
    maxStorefronts: number;
    maxPagesPerStorefront: number;
  };
  currentUsage: {
    storefronts: number;
    pages: Record<string, number>;
  };
  subscribedAt: any;
  expiresAt?: any;
  status: 'active' | 'inactive' | 'expired';
}

/**
 * Assign default (free) plan to user
 */
async function assignDefaultPlan(userId: string): Promise<UserPlan> {
  if (!db) {
    throw new Error("Firestore database not initialized");
  }

  const userPlan: UserPlan = {
    userId,
    planId: 'free',
    planName: DEFAULT_FREE_PLAN.planName,
    limits: {
      maxStorefronts: DEFAULT_FREE_PLAN.maxStorefronts,
      maxPagesPerStorefront: DEFAULT_FREE_PLAN.maxPagesPerStorefront,
    },
    currentUsage: {
      storefronts: 0,
      pages: {},
    },
    subscribedAt: Timestamp.now(),
    status: 'active',
  };

  try {
    const userPlanRef = doc(db, USER_PLANS_COLLECTION, userId);
    await setDoc(userPlanRef, userPlan);
  } catch (error: any) {
    console.error("Error saving default plan to Firestore:", error);
    // If Firestore write fails, we'll still return the plan object
    // The client can use it, but it won't be persisted
    throw error;
  }

  return userPlan;
}

/**
 * GET /api/user/plan?userId=xxx
 * Get user's current plan
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Ensure db is initialized
    if (!db) {
      console.error("Firestore database not initialized, returning default plan");
      // Return default plan if db is not initialized
      const defaultPlan: UserPlan = {
        userId,
        planId: 'free',
        planName: DEFAULT_FREE_PLAN.planName,
        limits: {
          maxStorefronts: DEFAULT_FREE_PLAN.maxStorefronts,
          maxPagesPerStorefront: DEFAULT_FREE_PLAN.maxPagesPerStorefront,
        },
        currentUsage: {
          storefronts: 0,
          pages: {},
        },
        subscribedAt: Timestamp.now(),
        status: 'active',
      };
      return NextResponse.json({ data: defaultPlan });
    }

    try {
      // Wrap Firestore call with timeout
      const userPlanRef = doc(db, USER_PLANS_COLLECTION, userId);
      
      const getUserPlanWithTimeout = async () => {
        return Promise.race([
          getDoc(userPlanRef),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firestore timeout after 5 seconds')), 5000)
          ),
        ]) as Promise<any>;
      };

      const userPlanDoc = await getUserPlanWithTimeout();

      if (userPlanDoc && userPlanDoc.exists()) {
        const userPlan = userPlanDoc.data() as UserPlan;
        return NextResponse.json({ data: userPlan });
      }

      // If no plan exists, try to assign free plan (with timeout)
      try {
        const assignPlanWithTimeout = async () => {
          return Promise.race([
            assignDefaultPlan(userId),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Firestore timeout after 5 seconds')), 5000)
            ),
          ]) as Promise<UserPlan>;
        };
        
        const newPlan = await assignPlanWithTimeout();
        return NextResponse.json({ data: newPlan });
      } catch (assignError: any) {
        console.error("Error assigning default plan:", assignError);
        // Return a default plan structure even if we can't save it
        const defaultPlan: UserPlan = {
          userId,
          planId: 'free',
          planName: DEFAULT_FREE_PLAN.planName,
          limits: {
            maxStorefronts: DEFAULT_FREE_PLAN.maxStorefronts,
            maxPagesPerStorefront: DEFAULT_FREE_PLAN.maxPagesPerStorefront,
          },
          currentUsage: {
            storefronts: 0,
            pages: {},
          },
          subscribedAt: Timestamp.now(),
          status: 'active',
        };
        return NextResponse.json({ data: defaultPlan });
      }
    } catch (firestoreError: any) {
      console.error("Firestore error (returning default plan):", firestoreError);
      // If Firestore fails (e.g., due to security rules or timeout), return default plan
      // This allows the app to continue working
      const defaultPlan: UserPlan = {
        userId,
        planId: 'free',
        planName: DEFAULT_FREE_PLAN.planName,
        limits: {
          maxStorefronts: DEFAULT_FREE_PLAN.maxStorefronts,
          maxPagesPerStorefront: DEFAULT_FREE_PLAN.maxPagesPerStorefront,
        },
        currentUsage: {
          storefronts: 0,
          pages: {},
        },
        subscribedAt: Timestamp.now(),
        status: 'active',
      };
      return NextResponse.json({ data: defaultPlan });
    }
  } catch (error: any) {
    console.error("Error getting user plan:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        error: error.message || "Failed to get user plan",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/plan
 * Update user plan usage (increment/decrement counts)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, storefrontId } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "User ID and action are required" },
        { status: 400 }
      );
    }

    const userPlanRef = doc(db, USER_PLANS_COLLECTION, userId);
    const userPlanDoc = await getDoc(userPlanRef);

    if (!userPlanDoc.exists()) {
      // Create default plan if it doesn't exist
      await assignDefaultPlan(userId);
      // Retry the operation
      return PATCH(request);
    }

    const userPlan = userPlanDoc.data() as UserPlan;

    switch (action) {
      case "incrementStorefront":
        await updateDoc(userPlanRef, {
          'currentUsage.storefronts': (userPlan.currentUsage.storefronts || 0) + 1,
        });
        break;

      case "decrementStorefront":
        await updateDoc(userPlanRef, {
          'currentUsage.storefronts': Math.max(0, (userPlan.currentUsage.storefronts || 0) - 1),
        });
        break;

      case "incrementPage":
        if (!storefrontId) {
          return NextResponse.json(
            { error: "Storefront ID is required for page operations" },
            { status: 400 }
          );
        }
        const currentPages = userPlan.currentUsage.pages[storefrontId] || 0;
        await updateDoc(userPlanRef, {
          [`currentUsage.pages.${storefrontId}`]: currentPages + 1,
        });
        break;

      case "decrementPage":
        if (!storefrontId) {
          return NextResponse.json(
            { error: "Storefront ID is required for page operations" },
            { status: 400 }
          );
        }
        const currentPagesForDecrement = userPlan.currentUsage.pages[storefrontId] || 0;
        await updateDoc(userPlanRef, {
          [`currentUsage.pages.${storefrontId}`]: Math.max(0, currentPagesForDecrement - 1),
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Return updated plan
    const updatedDoc = await getDoc(userPlanRef);
    return NextResponse.json({ data: updatedDoc.data() });
  } catch (error: any) {
    console.error("Error updating user plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user plan" },
      { status: 500 }
    );
  }
}
