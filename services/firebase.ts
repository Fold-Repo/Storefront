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
import { User } from "firebase/auth";

export interface WizardThemeSettings {
  primaryColor: string;
  fontFamily: string;
  designFeel: string;
  aiDescription?: string;
  [key: string]: any;
}

export interface WizardData {
  ideaScope: string;
  companyName: string;
  description: string;
  subdomain: string;
  logo: string | null; // URL or base64
  logoPreview: string | null;
  theme?: WizardThemeSettings;
  userId?: string;
  userEmail?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface GeneratedPage {
  html: string;
  css: string;
  js?: string;
  metadata?: {
    title: string;
    description: string;
  };
}

export interface GeneratedSite {
  userId: string;
  userEmail: string;
  subdomain: string;
  companyName: string;
  businessNiche: string;
  theme: WizardThemeSettings;
  pages: Record<string, GeneratedPage>;
  customDomain?: string;
  domainVerification?: {
    status: 'pending' | 'verified' | 'failed';
    lastChecked?: any;
    reason?: string;
  };
  generatedAt: any;
  updatedAt: any;
  status: "generating" | "completed" | "failed";
}

const COLLECTION_NAME = "storefront_wizards";

/**
 * Save wizard data to Firebase
 */
export const saveWizardToFirebase = async (
  data: WizardData,
  user: User | { email: string; uid: string } | null
): Promise<void> => {
  try {
    if (!user) {
      throw new Error("User must be authenticated to save to Firebase");
    }

    const userId = user.uid || (user as any).id;
    const userEmail = user.email || (user as any).email;

    const wizardData: WizardData = {
      ...data,
      userId,
      userEmail,
      updatedAt: new Date(),
    };

    // Check if wizard already exists for this user
    const wizardRef = doc(db, COLLECTION_NAME, userId);
    const wizardDoc = await getDoc(wizardRef);

    if (wizardDoc.exists()) {
      // Update existing wizard
      await updateDoc(wizardRef, wizardData as any);
    } else {
      // Create new wizard
      wizardData.createdAt = new Date();
      await setDoc(wizardRef, wizardData);
    }
  } catch (error) {
    console.error("Error saving wizard to Firebase:", error);
    throw error;
  }
};

/**
 * Load wizard data from Firebase
 */
export const loadWizardFromFirebase = async (
  user: User | { email: string; uid: string }
): Promise<WizardData | null> => {
  try {
    const userId = user.uid || (user as any).id;
    const wizardRef = doc(db, COLLECTION_NAME, userId);
    const wizardDoc = await getDoc(wizardRef);

    if (wizardDoc.exists()) {
      return wizardDoc.data() as WizardData;
    }

    return null;
  } catch (error) {
    console.error("Error loading wizard from Firebase:", error);
    return null;
  }
};

/**
 * Save wizard data locally (for unauthenticated users)
 */
export const saveWizardLocally = (data: WizardData): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("wizard_data_local", JSON.stringify(data));
    localStorage.setItem("wizard_data_timestamp", new Date().toISOString());
  } catch (error) {
    console.error("Error saving wizard locally:", error);
  }
};

/**
 * Load wizard data from local storage
 */
export const loadWizardLocally = (): WizardData | null => {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem("wizard_data_local");
    if (data) {
      return JSON.parse(data) as WizardData;
    }
  } catch (error) {
    console.error("Error loading wizard locally:", error);
  }

  return null;
};

/**
 * Clear local wizard data
 */
export const clearWizardLocally = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("wizard_data_local");
  localStorage.removeItem("wizard_data_timestamp");
};

/**
 * Check if local wizard data exists
 */
export const hasLocalWizardData = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("wizard_data_local");
};

/**
 * Save generated site to Firebase
 */
export const saveGeneratedSiteToFirebase = async (
  site: GeneratedSite,
  user: User | { email: string; uid: string } | { user_id: number; email: string } | any
): Promise<void> => {
  try {
    // Handle different user object types
    const userId = user?.uid || (user as any)?.id || (user as any)?.user_id;

    if (!userId) {
      throw new Error("User ID is missing from user object");
    }

    // Convert userId to string if it's a number (for user_id from UserData)
    const userIdString = String(userId);

    const siteRef = doc(db, "storefront_sites", userIdString);

    const siteData: GeneratedSite = {
      ...site,
      updatedAt: new Date(),
    };

    const siteDoc = await getDoc(siteRef);

    if (siteDoc.exists()) {
      await updateDoc(siteRef, siteData as any);
    } else {
      siteData.generatedAt = new Date();
      await setDoc(siteRef, siteData);
    }
  } catch (error) {
    console.error("Error saving generated site to Firebase:", error);
    throw error;
  }
};

/**
 * Load generated site from Firebase
 */
export const loadGeneratedSiteFromFirebase = async (
  user: User | { email: string; uid: string } | { user_id: number; email: string } | any,
  retries: number = 3
): Promise<GeneratedSite | null> => {
  try {
    // Handle different user object types
    const userId = user?.uid || (user as any)?.id || (user as any)?.user_id;

    if (!userId) {
      console.error("User ID is missing from user object", { user });
      return null;
    }

    // Convert userId to string if it's a number (for user_id from UserData)
    const userIdString = String(userId);

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 Firestore Read Debug:", {
        userId,
        userIdString,
        collection: "storefront_sites",
        documentId: userIdString,
        userObject: {
          hasUid: !!user?.uid,
          hasId: !!(user as any)?.id,
          hasUserId: !!(user as any)?.user_id,
          email: (user as any)?.email
        }
      });
    }

    const siteRef = doc(db, "storefront_sites", userIdString);

    // Try to enable network if offline (silently - don't log errors)
    try {
      const { enableNetwork } = await import("firebase/firestore");
      await enableNetwork(db);
      // Small delay to let network stabilize
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (networkError) {
      // Silently fail - network might already be enabled
    }

    // Add timeout wrapper (10 second timeout)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase request timeout after 10 seconds')), 10000)
    );

    const siteDoc = await Promise.race([
      getDoc(siteRef),
      timeoutPromise
    ]) as any;

    if (process.env.NODE_ENV === 'development') {
      console.log("📄 Firestore Response:", {
        exists: siteDoc?.exists(),
        hasData: !!siteDoc?.data(),
        error: siteDoc?.code || siteDoc?.message
      });
    }

    if (siteDoc && siteDoc.exists()) {
      const data = siteDoc.data() as GeneratedSite;
      if (process.env.NODE_ENV === 'development') {
        console.log("✅ Document loaded successfully:", {
          companyName: data.companyName,
          subdomain: data.subdomain,
          pagesCount: Object.keys(data.pages || {}).length
        });
      }
      return data;
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn("⚠️ Document does not exist in Firestore:", {
        collection: "storefront_sites",
        documentId: userIdString,
        suggestion: "Make sure you've created a storefront first"
      });
    }

    return null;
  } catch (error: any) {
    // Log permission errors specifically for debugging
    if (error.code === 'permission-denied') {
      const userId = (user as any)?.uid || (user as any)?.id || (user as any)?.user_id;
      console.error("🔒 Firestore Permission Denied:", {
        collection: "storefront_sites",
        documentId: String(userId || 'unknown'),
        errorCode: error.code,
        errorMessage: error.message,
        suggestion: "Check Firestore security rules for 'storefront_sites' collection. Rules should allow read: if true"
      });
    }

    // Handle offline error specifically (check first to avoid logging expected errors)
    if (error.code === 'unavailable' || error.message?.includes('offline') || error.message?.includes('Failed to get document') || error.message?.includes('Could not reach')) {
      // Only log retry attempts in development or if it's the first retry
      if (retries === 3 || process.env.NODE_ENV === 'development') {
        console.warn("🔄 Firebase is offline, retrying...", { retries, errorCode: error.code });
      }

      // Retry with exponential backoff
      if (retries > 0) {
        const delay = 1000 * (4 - retries); // 1s, 2s, 3s delays
        await new Promise(resolve => setTimeout(resolve, delay));

        // Try to enable network before retry
        try {
          const { enableNetwork } = await import("firebase/firestore");
          await enableNetwork(db);
          // Wait a bit for network to stabilize
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (networkError) {
          // Silently fail - network might already be enabled
        }

        return loadGeneratedSiteFromFirebase(user, retries - 1);
      } else {
        // Use console.warn instead of console.error for expected offline scenarios
        // This is an expected error when Firebase is offline, not a critical failure
        if (process.env.NODE_ENV === 'development') {
          console.warn("⚠️ Max retries reached. Firebase appears to be offline or unreachable.");
          console.warn("💡 This is usually due to:");
          console.warn("   1. Network connectivity issues");
          console.warn("   2. Firebase security rules blocking access");
          console.warn("   3. Firebase project configuration issues");
          console.warn("   4. Firestore backend being temporarily unavailable");
        }
        // Return null instead of throwing to allow graceful handling
        // The component will handle the null case and show appropriate error
        return null;
      }
    }

    // For timeout errors
    if (error.message?.includes('timeout') || error.message?.includes('Firebase request timeout')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("⏱️ Firebase request timed out");
      }
      return null;
    }

    // For permission errors
    if (error.code === 'permission-denied') {
      if (process.env.NODE_ENV === 'development') {
        console.warn("🔒 Firebase permission denied. Check your security rules.");
      }
      return null;
    }

    // For all other unexpected errors, log and return null
    console.error("❌ Unexpected error loading site from Firebase:", error);
    return null;
  }
};
