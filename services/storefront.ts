/**
 * Storefront Service
 * 
 * Handles loading storefront pages and configuration from storage
 * Supports both Firebase and Supabase (with migration path)
 */

import { loadGeneratedSiteFromFirebase } from './firebase';

// Storage backend type
type StorageBackend = 'firebase' | 'supabase' | 's3';

// Get storage backend from environment
const STORAGE_BACKEND: StorageBackend =
  (process.env.NEXT_PUBLIC_STORAGE_BACKEND as StorageBackend) || 'firebase';

export interface StorefrontConfig {
  userId: string;
  userEmail: string;
  subdomain: string;
  customDomain?: string;
  companyName: string;
  businessNiche: string;
  theme: {
    primaryColor: string;
    fontFamily: string;
    designFeel: string;
  };
  layout: 'single-page' | 'multi-page';
  logoUrl?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface StorefrontPage {
  html: string;
  css: string;
  js?: string;
  metadata?: {
    title: string;
    description: string;
  };
}

/**
 * Load storefront configuration by subdomain or custom domain
 */
export async function loadStorefrontConfig(
  identifier: string
): Promise<StorefrontConfig | null> {
  switch (STORAGE_BACKEND) {
    case 'firebase':
      return await loadStorefrontConfigFromFirebase(identifier);
    case 'supabase':
      return await loadStorefrontConfigFromSupabase(identifier);
    case 's3':
      return await loadStorefrontConfigFromS3(identifier);
    default:
      return await loadStorefrontConfigFromFirebase(identifier);
  }
}

/**
 * Load a specific page for a storefront
 */
export async function loadStorefrontPage(
  storefrontId: string,
  pageType: string
): Promise<StorefrontPage | null> {
  switch (STORAGE_BACKEND) {
    case 'firebase':
      return await loadStorefrontPageFromFirebase(storefrontId, pageType);
    case 'supabase':
      return await loadStorefrontPageFromSupabase(storefrontId, pageType);
    case 's3':
      return await loadStorefrontPageFromS3(storefrontId, pageType);
    default:
      return await loadStorefrontPageFromFirebase(storefrontId, pageType);
  }
}

// Firebase implementations
async function loadStorefrontConfigFromFirebase(
  identifier: string
): Promise<StorefrontConfig | null> {
  try {
    const { db } = await import('@/lib/firebaseConfig');
    const { collection, query, where, getDocs, limit } = await import('firebase/firestore');

    // Query by subdomain (identifier could be subdomain or userId)
    const sitesRef = collection(db, 'storefront_sites');

    // Try to find by subdomain first
    const subdomainQuery = query(
      sitesRef,
      where('subdomain', '==', identifier),
      limit(1)
    );

    const subdomainSnapshot = await getDocs(subdomainQuery);

    if (!subdomainSnapshot.empty) {
      const doc = subdomainSnapshot.docs[0];
      const data = doc.data();

      return {
        userId: data.userId,
        userEmail: data.userEmail,
        subdomain: data.subdomain,
        customDomain: data.customDomain,
        companyName: data.companyName,
        businessNiche: data.businessNiche,
        theme: data.theme,
        layout: data.layout || 'multi-page',
        logoUrl: data.logoUrl,
        status: data.status || 'active',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }

    // If not found by subdomain, try by userId
    const userIdQuery = query(
      sitesRef,
      where('userId', '==', identifier),
      limit(1)
    );

    const userIdSnapshot = await getDocs(userIdQuery);

    if (!userIdSnapshot.empty) {
      const doc = userIdSnapshot.docs[0];
      const data = doc.data();

      return {
        userId: data.userId,
        userEmail: data.userEmail,
        subdomain: data.subdomain,
        customDomain: data.customDomain,
        companyName: data.companyName,
        businessNiche: data.businessNiche,
        theme: data.theme,
        layout: data.layout || 'multi-page',
        logoUrl: data.logoUrl,
        status: data.status || 'active',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }

    // 3. Try by customDomain (for custom domain routing)
    const customDomainQuery = query(
      sitesRef,
      where('customDomain', '==', identifier),
      limit(1)
    );

    const customDomainSnapshot = await getDocs(customDomainQuery);

    if (!customDomainSnapshot.empty) {
      const doc = customDomainSnapshot.docs[0];
      const data = doc.data();

      return {
        userId: data.userId,
        userEmail: data.userEmail,
        subdomain: data.subdomain,
        customDomain: data.customDomain,
        companyName: data.companyName,
        businessNiche: data.businessNiche,
        theme: data.theme,
        layout: data.layout || 'multi-page',
        logoUrl: data.logoUrl,
        status: data.status || 'active',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error loading storefront config from Firebase:', error);
    return null;
  }
}

async function loadStorefrontPageFromFirebase(
  storefrontId: string,
  pageType: string
): Promise<StorefrontPage | null> {
  try {
    const { db } = await import('@/lib/firebaseConfig');
    const { collection, query, where, getDocs, limit, doc, getDoc } = await import('firebase/firestore');

    // First, find the storefront by subdomain or userId
    const sitesRef = collection(db, 'storefront_sites');

    // Try by subdomain first
    let siteDoc = null;
    const subdomainQuery = query(
      sitesRef,
      where('subdomain', '==', storefrontId),
      limit(1)
    );

    const subdomainSnapshot = await getDocs(subdomainQuery);

    if (!subdomainSnapshot.empty) {
      siteDoc = subdomainSnapshot.docs[0].data();
    } else {
      // Try by userId
      const userIdQuery = query(
        sitesRef,
        where('userId', '==', storefrontId),
        limit(1)
      );

      const userIdSnapshot = await getDocs(userIdQuery);
      if (!userIdSnapshot.empty) {
        siteDoc = userIdSnapshot.docs[0].data();
      }
    }

    if (!siteDoc || !siteDoc.pages) {
      return null;
    }

    // Extract the requested page
    const page = siteDoc.pages[pageType];

    if (!page) {
      return null;
    }

    return {
      html: page.html || '',
      css: page.css || '',
      js: page.js,
      metadata: page.metadata || {
        title: `${siteDoc.companyName} - ${pageType}`,
        description: '',
      },
    };
  } catch (error) {
    console.error('Error loading page from Firebase:', error);
    return null;
  }
}

// Supabase implementations (placeholder)
async function loadStorefrontConfigFromSupabase(
  identifier: string
): Promise<StorefrontConfig | null> {
  // TODO: Implement Supabase query
  return null;
}

async function loadStorefrontPageFromSupabase(
  storefrontId: string,
  pageType: string
): Promise<StorefrontPage | null> {
  // TODO: Implement Supabase query
  return null;
}

// S3 implementations (placeholder)
async function loadStorefrontConfigFromS3(
  identifier: string
): Promise<StorefrontConfig | null> {
  // TODO: Implement S3 config loading
  return null;
}

async function loadStorefrontPageFromS3(
  storefrontId: string,
  pageType: string
): Promise<StorefrontPage | null> {
  // TODO: Implement S3 page loading
  return null;
}
