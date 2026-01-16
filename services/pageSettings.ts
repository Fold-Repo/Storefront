/**
 * Page Settings Service
 * 
 * Manages page settings and routing configuration for storefronts.
 * Handles both static and dynamic content pages.
 */

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

export interface PageSetting {
  id: string;
  userId: string;
  storefrontId: string; // subdomain
  pageType: string; // 'testimonial', 'about', 'contact', etc.
  parentId: string | null; // Id of the parent page setting
  order: number; // Order in the menu
  route: string; // '/testimonials', '/about', '/contact'
  contentType: 'static' | 'dynamic'; // Static content or dynamic from API
  dataSource?: {
    type: 'firebase' | 'api' | 'static';
    collection?: string; // Firebase collection name
    apiEndpoint?: string; // API endpoint
    staticData?: any; // Static data
  };
  settings: {
    enabled: boolean;
    showInMenu: boolean;
    showInFooter: boolean;
    metaTitle?: string;
    metaDescription?: string;
    [key: string]: any; // Additional settings
  };
  createdAt: any;
  updatedAt: any;
}

const COLLECTION_NAME = "page_settings";

/**
 * Save page setting to Firebase
 */
export async function savePageSetting(
  setting: Omit<PageSetting, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const id = `${setting.userId}_${setting.storefrontId}_${setting.pageType}`;
    const pageSettingRef = doc(db, COLLECTION_NAME, id);

    const pageSetting: PageSetting = {
      ...setting,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(pageSettingRef, pageSetting);
    return id;
  } catch (error) {
    console.error("Error saving page setting:", error);
    throw error;
  }
}

/**
 * Get page setting by storefront and page type
 */
export async function getPageSetting(
  storefrontId: string,
  pageType: string,
  userId?: string
): Promise<PageSetting | null> {
  try {
    // If userId is provided, use the new ID format. Otherwise, fallback to the old one or query.
    if (userId) {
      const id = `${userId}_${storefrontId}_${pageType}`;
      const pageSettingRef = doc(db, COLLECTION_NAME, id);
      const pageSettingDoc = await getDoc(pageSettingRef);
      if (pageSettingDoc.exists()) {
        return pageSettingDoc.data() as PageSetting;
      }
    }

    // Fallback search by storefrontId and pageType if userId is not known or for backward compatibility
    const q = query(
      collection(db, COLLECTION_NAME),
      where("storefrontId", "==", storefrontId),
      where("pageType", "==", pageType)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as PageSetting;
    }

    return null;
  } catch (error) {
    console.error("Error getting page setting:", error);
    return null;
  }
}

/**
 * Get all page settings for a storefront
 */
export async function getPageSettingsByStorefront(
  storefrontId: string,
  onlyEnabled: boolean = true,
  userId?: string
): Promise<PageSetting[]> {
  try {
    let q;
    const conditions = [where("storefrontId", "==", storefrontId)];

    if (userId) {
      conditions.push(where("userId", "==", userId));
    }

    if (onlyEnabled) {
      conditions.push(where("settings.enabled", "==", true));
    }

    q = query(collection(db, COLLECTION_NAME), ...conditions);

    const querySnapshot = await getDocs(q);
    const settings: PageSetting[] = [];

    querySnapshot.forEach((doc) => {
      settings.push(doc.data() as PageSetting);
    });

    return settings;
  } catch (error) {
    console.error("Error getting page settings:", error);
    return [];
  }
}

/**
 * Get page setting by route
 */
export async function getPageSettingByRoute(
  storefrontId: string,
  route: string,
  onlyEnabled: boolean = true,
  userId?: string
): Promise<PageSetting | null> {
  try {
    let q;
    const conditions = [
      where("storefrontId", "==", storefrontId),
      where("route", "==", route)
    ];

    if (userId) {
      conditions.push(where("userId", "==", userId));
    }

    if (onlyEnabled) {
      conditions.push(where("settings.enabled", "==", true));
    }

    q = query(collection(db, COLLECTION_NAME), ...conditions);

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as PageSetting;
    }

    return null;
  } catch (error) {
    console.error("Error getting page setting by route:", error);
    return null;
  }
}

/**
 * Update page setting
 */
export async function updatePageSetting(
  id: string,
  updates: Partial<PageSetting>
): Promise<void> {
  try {
    const pageSettingRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(pageSettingRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating page setting:", error);
    throw error;
  }
}

/**
 * Delete page setting
 */
export async function deletePageSetting(id: string): Promise<void> {
  try {
    const pageSettingRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(pageSettingRef);
  } catch (error) {
    console.error("Error deleting page setting:", error);
    throw error;
  }
}

/**
 * Get dynamic content for a page
 */
export async function getPageContent(
  pageSetting: PageSetting
): Promise<any> {
  try {
    if (pageSetting.contentType === 'static') {
      return pageSetting.dataSource?.staticData || null;
    }

    if (pageSetting.contentType === 'dynamic') {
      const { dataSource } = pageSetting;

      if (dataSource?.type === 'firebase' && dataSource.collection) {
        // Fetch from Firebase collection
        const q = query(collection(db, dataSource.collection));
        const querySnapshot = await getDocs(q);
        const data: any[] = [];

        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });

        return data;
      }

      if (dataSource?.type === 'api' && dataSource.apiEndpoint) {
        // Fetch from API
        const response = await fetch(dataSource.apiEndpoint);
        if (response.ok) {
          return await response.json();
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting page content:", error);
    return null;
  }
}

/**
 * Create default page settings for common pages
 */
export async function createDefaultPageSettings(
  storefrontId: string,
  userId: string
): Promise<void> {
  const defaultPages = [
    {
      pageType: 'testimonial',
      route: '/testimonials',
      contentType: 'dynamic' as const,
      parentId: null,
      order: 1,
      dataSource: {
        type: 'firebase' as const,
        collection: `testimonials_${storefrontId}`,
      },
      settings: {
        enabled: false, // Disabled by default, user can enable
        showInMenu: false,
        showInFooter: true,
        metaTitle: 'Testimonials',
        metaDescription: 'Customer testimonials and reviews',
      },
    },
    {
      pageType: 'about',
      route: '/about',
      contentType: 'static' as const,
      parentId: null,
      order: 2,
      dataSource: {
        type: 'static' as const,
        staticData: {
          title: 'About Us',
          content: 'Welcome to our store...',
        },
      },
      settings: {
        enabled: false,
        showInMenu: true,
        showInFooter: true,
        metaTitle: 'About Us',
        metaDescription: 'Learn more about our company',
      },
    },
    {
      pageType: 'contact',
      route: '/contact',
      contentType: 'static' as const,
      parentId: null,
      order: 3,
      dataSource: {
        type: 'static' as const,
        staticData: {
          title: 'Contact Us',
          content: 'Get in touch with us...',
        },
      },
      settings: {
        enabled: false,
        showInMenu: true,
        showInFooter: true,
        metaTitle: 'Contact Us',
        metaDescription: 'Get in touch with us',
      },
    },
  ];

  for (const page of defaultPages) {
    try {
      await savePageSetting({
        storefrontId,
        userId,
        ...page,
      });
    } catch (error) {
      console.error(`Error creating default page ${page.pageType}:`, error);
    }
  }
}

/**
 * Ensure all pages in the site data have a corresponding setting
 */
export async function ensureAllPagesHaveSettings(
  storefrontId: string,
  userId: string,
  availablePageTypes: string[]
): Promise<void> {
  for (const pageType of availablePageTypes) {
    try {
      const existing = await getPageSetting(storefrontId, pageType);

      if (!existing) {
        console.log(`Creating missing setting for page: ${pageType}`);

        // Map common routes
        let route = `/${pageType}`;
        if (pageType === 'home') route = '/';

        await savePageSetting({
          storefrontId,
          userId,
          pageType,
          parentId: null,
          order: 0,
          route,
          contentType: 'static',
          settings: {
            enabled: true, // Existing pages should be enabled by default
            showInMenu: pageType === 'home' ? false : true, // Home usually doesn't need to be in menu if logo links there
            showInFooter: true,
            metaTitle: pageType.charAt(0).toUpperCase() + pageType.slice(1),
          },
        });
      }
    } catch (error) {
      console.error(`Error ensuring setting for ${pageType}:`, error);
    }
  }
}
