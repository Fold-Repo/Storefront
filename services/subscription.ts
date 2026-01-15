import apiClient from "@/lib/apiClient";
import { AxiosError } from "axios";
import { ENDPOINT } from "@/constants";

export interface SubscriptionPlan {
  id?: string | number;
  name: string;
  price: number;
  currency?: string;
  description?: string;
  features?: string[];
  popular?: boolean;
  interval?: string; // 'monthly', 'yearly', etc.
  [key: string]: any; // Allow additional fields from backend
}

export interface SubscriptionPlansResponse {
  data?: SubscriptionPlan[];
  plans?: SubscriptionPlan[];
  [key: string]: any;
}

// Default plans to show if API returns no plans
const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 10,
    currency: "GBP",
    description: "Perfect for getting started",
    features: [
      "Up to 50 products",
      "Basic storefront",
      "Email support",
      "Mobile responsive",
    ],
    popular: false,
    interval: "monthly",
  },
  {
    id: "gold",
    name: "Gold",
    price: 15,
    currency: "GBP",
    description: "Best for growing businesses",
    features: [
      "Up to 500 products",
      "Advanced storefront",
      "Priority support",
      "Mobile responsive",
      "Analytics dashboard",
      "Custom domain",
    ],
    popular: true,
    interval: "monthly",
  },
  {
    id: "platinum",
    name: "Platinum",
    price: 20,
    currency: "GBP",
    description: "For established businesses",
    features: [
      "Unlimited products",
      "Premium storefront",
      "24/7 priority support",
      "Mobile responsive",
      "Advanced analytics",
      "Custom domain",
      "API access",
      "White-label options",
    ],
    popular: false,
    interval: "monthly",
  },
];

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const response = await apiClient.get<SubscriptionPlansResponse>(
      ENDPOINT.SUBSCRIPTION.PLANS
    );

    // Handle different response structures
    let plans: SubscriptionPlan[] = [];
    
    if (response.data) {
      // Check if data is an array or has a nested array
      if (Array.isArray(response.data)) {
        plans = response.data;
      } else if (Array.isArray(response.data.data)) {
        plans = response.data.data;
      } else if (Array.isArray(response.data.plans)) {
        plans = response.data.plans;
      }
    }

    // If no plans found, return default plans
    if (!plans || plans.length === 0) {
      console.log("No plans found from API, using default plans");
      return DEFAULT_PLANS;
    }

    // Ensure plans have required fields
    return plans.map((plan) => ({
      ...plan,
      currency: plan.currency || "GBP",
      features: plan.features || [],
      popular: plan.popular || false,
      interval: plan.interval || "monthly",
    }));
  } catch (error: any) {
    // If API fails, return default plans
    console.warn("Failed to fetch subscription plans, using defaults:", error.message);
    
    if (error instanceof AxiosError) {
      // Only use defaults for 503 or network errors, not for 404
      if (error.response?.status === 503 || error.code === "ERR_NETWORK") {
        return DEFAULT_PLANS;
      }
    }
    
    // For other errors, still return defaults as fallback
    return DEFAULT_PLANS;
  }
};
