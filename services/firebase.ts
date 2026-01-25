import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc
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
  layout?: 'single-page' | 'multi-page';
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
  layout: 'single-page' | 'multi-page';
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

/**
 * Remove undefined values from an object recursively
 * Firebase does not support undefined values
 */
export const sanitizeData = (data: any): any => {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: any = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== undefined) {
      sanitized[key] = sanitizeData(value);
    }
  });
  return sanitized;
};

const COLLECTION_NAME = "storefront_wizards";

/**
 * Helper to extract a string userId from various user object formats
 */
const extractUserId = (user: any): string | null => {
  if (!user) return null;
  const id = user.uid || user.id || user.user_id;
  return id ? String(id) : null;
};

/**
 * Save wizard data to Firebase
 */
export const saveWizardToFirebase = async (
  data: WizardData,
  user: User | { email: string; uid: string } | any
): Promise<void> => {
  try {
    const userId = extractUserId(user);

    // Validate userId - Firebase doc() requires a non-empty string
    if (!userId) {
      console.warn("Invalid userId, falling back to localStorage");
      throw new Error("Invalid user ID - cannot save to Firebase");
    }

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
      await updateDoc(wizardRef, sanitizeData(wizardData));
    } else {
      // Create new wizard
      wizardData.createdAt = new Date();
      await setDoc(wizardRef, sanitizeData(wizardData));
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
  user: User | { email: string; uid: string } | any
): Promise<WizardData | null> => {
  const userId = extractUserId(user);
  if (!userId) return null;

  try {
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
  localStorage.removeItem("storefront_wizard_data");
  localStorage.removeItem("storefront_wizard_data_step");
};

/**
 * Clear wizard data from Firebase
 */
export const clearWizardFromFirebase = async (
  user: User | { email: string; uid: string } | any
): Promise<void> => {
  const userId = extractUserId(user);
  if (!userId) return;

  try {
    const wizardRef = doc(db, COLLECTION_NAME, userId);
    const wizardDoc = await getDoc(wizardRef);

    if (wizardDoc.exists()) {
      await deleteDoc(wizardRef);
      console.log("Wizard data cleared from Firebase");
    }
  } catch (error) {
    console.error("Error clearing wizard from Firebase:", error);
    // Don't throw - this is a cleanup operation
  }
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
 * Uses subdomain as document ID for multi-site support
 * Also maintains a legacy copy at userId for backward compatibility
 */
export const saveGeneratedSiteToFirebase = async (
  site: GeneratedSite,
  user: User | { email: string; uid: string } | { user_id: number; email: string } | any
): Promise<void> => {
  try {
    // Handle different user object types
    const userId = extractUserId(user);

    if (!userId) {
      console.error("Firebase Service: User ID missing", { user });
      throw new Error("User ID is missing from user object");
    }

    if (!site.subdomain) {
      console.error("Firebase Service: Subdomain missing from site data");
      throw new Error("Subdomain is required to save site");
    }

    console.log(`Firebase Service: Saving site for userId: ${userId}, subdomain: ${site.subdomain}`);

    const siteData: GeneratedSite = {
      ...site,
      userId: userId, // Ensure userId in data matches
      updatedAt: new Date(),
    };

    // Save to multi-site collection using subdomain as doc ID
    const multiSiteRef = doc(db, "user_storefronts", site.subdomain);
    const multiSiteDoc = await getDoc(multiSiteRef);

    if (multiSiteDoc.exists()) {
      console.log("Firebase Service: Updating existing site in multi-site collection");
      await updateDoc(multiSiteRef, sanitizeData(siteData));
    } else {
      console.log("Firebase Service: Creating new site in multi-site collection");
      siteData.generatedAt = new Date();
      await setDoc(multiSiteRef, sanitizeData(siteData));
    }

    // Also save to legacy collection (backward compatibility - first site only)
    const legacySiteRef = doc(db, "storefront_sites", userId);
    const legacySiteDoc = await getDoc(legacySiteRef);

    if (!legacySiteDoc.exists()) {
      // Only save to legacy if no site exists there yet
      console.log("Firebase Service: Also saving to legacy collection for backward compat");
      await setDoc(legacySiteRef, sanitizeData(siteData));
    }

    console.log("Firebase Service: Site saved successfully");
  } catch (error: any) {
    console.error("Firebase Service: Error saving generated site to Firebase:", error);
    if (error.code === 'permission-denied') {
      throw new Error("Permission denied. Please checking your login status.");
    }
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
  const userId = extractUserId(user);
  if (!userId) {
    console.error("User ID is missing from user object", { user });
    return null;
  }

  try {
    // 1. First attempt: Load from multi-site collection by querying for this userId
    console.log("🔍 Loading site for userId:", userId);

    const sitesRef = collection(db, "user_storefronts");
    const q = query(sitesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Sort by updatedAt descending and pick the latest one
      const sites = querySnapshot.docs.map(doc => doc.data() as GeneratedSite);
      sites.sort((a, b) => {
        const dateA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : (a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : 0);
        const dateB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : (b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : 0);
        return dateB - dateA;
      });
      console.log("✅ Found site in user_storefronts:", sites[0].subdomain);
      return sites[0];
    }

    // 2. Second attempt: Check legacy collection (for earlier users)
    const legacyRef = doc(db, "storefront_sites", userId);
    const legacyDoc = await getDoc(legacyRef);

    if (legacyDoc.exists()) {
      console.log("✅ Found site in legacy collection");
      return legacyDoc.data() as GeneratedSite;
    }

    console.log("❌ No site found for user");
    return null;
  } catch (error: any) {
    console.error("Firebase Service: Error loading generated site:", error);

    // Log permission errors specifically for debugging
    if (error.code === 'permission-denied') {
      console.error("🔒 Firestore Permission Denied:", {
        collection: "user_storefronts",
        userId,
        errorCode: error.code,
        errorMessage: error.message
      });
    }

    // Progressive backoff for retries
    if (retries > 0) {
      console.log(`🔄 Retrying load (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
      return loadGeneratedSiteFromFirebase(user, retries - 1);
    }

    return null;
  }
};

/**
 * Load ALL generated sites for a user (multi-site support)
 * Uses a collection query to find all sites belonging to a user
 */
export const loadAllUserSites = async (
  user: User | { email: string; uid: string } | { user_id: number; email: string } | any
): Promise<GeneratedSite[]> => {
  const userId = extractUserId(user);
  if (!userId) {
    console.error("User ID is missing from user object");
    return [];
  }

  try {
    const sites: GeneratedSite[] = [];

    // 1. Check the multi-site collection
    try {
      const sitesRef = collection(db, 'user_storefronts');
      const q = query(sitesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      snapshot.docs.forEach(doc => {
        sites.push(doc.data() as GeneratedSite);
      });
    } catch (multiSiteError) {
      console.warn('Error loading from user_storefronts:', multiSiteError);
    }

    // 2. Check the legacy collection
    try {
      const legacyRef = doc(db, 'storefront_sites', userId);
      const legacyDoc = await getDoc(legacyRef);

      if (legacyDoc.exists()) {
        const legacyData = legacyDoc.data() as GeneratedSite;
        // Avoid duplicates if already found in multi-site
        if (!sites.find(s => s.subdomain === legacyData.subdomain)) {
          sites.push(legacyData);
        }
      }
    } catch (legacyError) {
      console.warn('Error loading from legacy storefront_sites:', legacyError);
    }

    // Sort by updatedAt descending
    sites.sort((a, b) => {
      const dateA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : (a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : 0);
      const dateB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : (b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : 0);
      return dateB - dateA;
    });

    return sites;
  } catch (error: any) {
    console.error("Error loading user sites:", error);
    return [];
  }
};

