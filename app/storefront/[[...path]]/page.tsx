/**
 * Dynamic Storefront Page Route
 * 
 * This route handles all storefront pages (homepage, products, cart, etc.)
 * It loads the page HTML from storage and injects dynamic data.
 */

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { loadStorefrontPage, loadStorefrontConfig } from '@/services/storefront';
import { injectDynamicData } from '@/lib/dataInjector';
import { getPageSettingByRoute, getPageContent, getPageSettingsByStorefront, PageSetting } from '@/services/pageSettings';

interface StorefrontPageProps {
  params: {
    path: string[];
  };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const promisedParams = await params;
  const headersList = await headers();
  const storefrontId = headersList.get('x-storefront-id');
  const isCustomDomain = headersList.get('x-is-custom-domain') === 'true';

  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('🏪 Storefront page request:', {
      storefrontId,
      isCustomDomain,
      path: promisedParams.path,
      headers: {
        'x-storefront-id': storefrontId,
        'x-storefront-subdomain': headersList.get('x-storefront-subdomain'),
      }
    });
  }

  if (!storefrontId) {
    console.error('❌ No storefront ID in headers');
    notFound();
  }

  // Determine page path (pretty URL - no .html extension)
  const pagePath = promisedParams.path && promisedParams.path.length > 0
    ? `/${promisedParams.path.join('/')}`
    : '/';

  if (process.env.NODE_ENV === 'development') {
    console.log('📄 Resolved page path:', { pagePath, rawPath: promisedParams.path });
  }

  // Load storefront configuration
  const config = await loadStorefrontConfig(storefrontId);

  if (!config) {
    console.error('❌ Storefront config not found for:', storefrontId);
    notFound();
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Storefront config loaded:', {
      companyName: config.companyName,
      subdomain: config.subdomain
    });
  }

  // Check if this is a custom page (testimonial, about, contact, etc.)
  const pageSetting = await getPageSettingByRoute(storefrontId, pagePath, true, config.userId);

  let pageType: string;
  let pageData;
  let customPageContent: any = null;

  if (pageSetting) {
    // Custom page (testimonial, about, etc.)
    pageType = pageSetting.pageType;

    // Try to load custom page HTML, fallback to default page type
    pageData = await loadStorefrontPage(storefrontId, pageType);

    // If custom page HTML doesn't exist, try to load from default pages
    if (!pageData) {
      // Try common page types as fallback
      const fallbackTypes = ['testimonial', 'about', 'contact'];
      for (const fallbackType of fallbackTypes) {
        if (pageType.includes(fallbackType)) {
          pageData = await loadStorefrontPage(storefrontId, fallbackType);
          if (pageData) break;
        }
      }
    }

    // If still no page data, use a generic template
    if (!pageData) {
      pageData = {
        html: generateGenericPageHTML(pageType, pageSetting),
        css: '',
        metadata: {
          title: pageSetting.settings.metaTitle || pageType,
          description: pageSetting.settings.metaDescription || '',
        },
      };
    }

    // Fetch content for custom page
    if (pageSetting.contentType === 'dynamic') {
      customPageContent = await getPageContent(pageSetting);
    } else if (pageSetting.contentType === 'static') {
      customPageContent = pageSetting.dataSource?.staticData || null;
    }
  } else {
    // Standard page (homepage, products, cart, etc.)
    pageType = getPageTypeFromPath(pagePath);
    pageData = await loadStorefrontPage(storefrontId, pageType);

    if (!pageData) {
      notFound();
    }
  }

  // Fetch dynamic data based on page type
  const dynamicData = await fetchDynamicDataForPage(
    storefrontId,
    pageType,
    pagePath,
    customPageContent
  );

  // Inject dynamic data into HTML
  const finalData = { ...dynamicData };
  finalData.menu = generateMenuHTML(dynamicData.menu || [], config);

  const renderedHTML = injectDynamicData(
    pageData.html,
    finalData,
    config
  );

  // Return rendered HTML
  return (
    <div
      dangerouslySetInnerHTML={{ __html: renderedHTML }}
      suppressHydrationWarning
    />
  );
}

/**
 * Get page type from URL path
 * Handles pretty URLs without .html extension
 */
function getPageTypeFromPath(path: string): string {
  // Normalize path (remove trailing slash except for root)
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');

  const pathMap: Record<string, string> = {
    '/': 'homepage',
    '/categories': 'categories',
    '/products': 'products',
    '/cart': 'cart',
    '/checkout': 'checkout',
    '/account': 'account',
    '/search': 'search',
  };

  // Check exact match first
  if (pathMap[normalizedPath]) {
    return pathMap[normalizedPath];
  }

  // Check for product detail (e.g., /products/slug)
  if (normalizedPath.startsWith('/products/')) {
    return 'product-detail';
  }

  // Check for category detail (e.g., /categories/slug)
  if (normalizedPath.startsWith('/categories/')) {
    return 'category-detail';
  }

  // If it's a simple one-level path like /about, try to use the path name as type
  if (normalizedPath.startsWith('/') && !normalizedPath.includes('/', 1)) {
    return normalizedPath.substring(1);
  }

  // Default to homepage
  return 'homepage';
}

/**
 * Generate generic HTML for custom pages that don't have generated HTML
 */
function generateGenericPageHTML(pageType: string, pageSetting: any): string {
  const title = pageSetting.settings.metaTitle || pageType;
  const description = pageSetting.settings.metaDescription || '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <meta name="description" content="${description}">
    </head>
    <body>
      <header>
        <nav>{{menu}}</nav>
      </header>
      <main>
        <h1>${title}</h1>
        <div class="page-content">
          {{content}}
        </div>
      </main>
      <footer>
        {{footerLinks}}
      </footer>
    </body>
    </html>
  `;
}

/**
 * Fetch dynamic data for a specific page
 */
async function fetchDynamicDataForPage(
  storefrontId: string,
  pageType: string,
  pagePath: string,
  customPageContent?: any
): Promise<Record<string, any>> {
  const data: Record<string, any> = {};

  try {
    // Fetch common data (menu, footer links)
    const [menu, footerLinks, siteSettings, featuredProducts] = await Promise.all([
      fetchMenu(storefrontId),
      fetchFooterLinks(storefrontId),
      fetchSiteSettings(storefrontId),
      fetchFeaturedProducts(storefrontId),
    ]);

    data.menu = menu;
    data.footerLinks = footerLinks;
    data.siteSettings = siteSettings;
    data.featuredProducts = featuredProducts;

    // Calculate breadcrumbs from path
    const pathSegments = pagePath.split('/').filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      url: '/' + pathSegments.slice(0, index + 1).join('/')
    }));

    // Add Home as the root breadcrumb
    breadcrumbs.unshift({ label: 'Home', url: '/' });
    data.breadcrumbs = breadcrumbs;

    // Handle custom pages (testimonial, about, contact, etc.)
    if (customPageContent !== null && customPageContent !== undefined) {
      // Inject custom page content
      if (pageType === 'testimonial') {
        data.testimonials = customPageContent;
        data.content = customPageContent; // Generic content placeholder
      } else {
        data.content = customPageContent;
      }
    }

    // Fetch page-specific data
    switch (pageType) {
      case 'homepage':
        data.categories = await fetchCategories(storefrontId, { limit: 6 });
        break;

      case 'products':
        data.products = await fetchProducts(storefrontId, {});
        data.categories = await fetchCategories(storefrontId);
        break;

      case 'product-detail':
        const productSlug = pagePath.split('/').pop();
        data.product = await fetchProductBySlug(storefrontId, productSlug || '');
        data.relatedProducts = await fetchRelatedProducts(storefrontId, productSlug || '');
        break;

      case 'categories':
        data.categories = await fetchCategories(storefrontId);
        break;

      case 'category-detail':
        const categorySlug = pagePath.split('/').pop();
        data.category = await fetchCategoryBySlug(storefrontId, categorySlug || '');
        data.products = await fetchProducts(storefrontId, { category: categorySlug });
        break;

      case 'testimonial':
        // Testimonials are already in customPageContent
        if (!data.testimonials) {
          data.testimonials = customPageContent || [];
        }
        break;

      case 'cart':
        // Cart data is typically client-side, but we can preload
        break;

      case 'search':
        // Search results are typically client-side
        break;
    }
  } catch (error) {
    console.error('Error fetching dynamic data:', error);
    // Return empty data on error
  }

  return data;
}

// Data fetching functions (implement these based on your API)
async function fetchMenu(storefrontId: string) {
  const settings = await getPageSettingsByStorefront(storefrontId);

  // Filter only those that should be in menu
  const menuSettings = settings.filter(s => s.settings.showInMenu);

  // Map to common format
  const allItems = menuSettings.map(s => ({
    id: s.id,
    parentId: s.parentId,
    order: s.order || 0,
    label: s.settings.metaTitle || s.pageType,
    route: s.route,
    children: [] as any[]
  }));

  // Build tree
  const menuTree: any[] = [{ label: 'Home', route: '/', order: -1, children: [] }];
  const idMap = new Map();

  allItems.forEach(item => idMap.set(item.id, item));

  allItems.forEach(item => {
    if (item.parentId && idMap.has(item.parentId)) {
      idMap.get(item.parentId).children.push(item);
    } else {
      menuTree.push(item);
    }
  });

  // Sort by order
  const sortRecursive = (items: any[]) => {
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    items.forEach(item => {
      if (item.children.length > 0) sortRecursive(item.children);
    });
  };

  sortRecursive(menuTree);
  return menuTree;
}

/**
 * Generate Tailwind CSS Menu HTML
 */
function generateMenuHTML(menuItems: any[], config: any): string {
  const primaryColor = config.theme?.primaryColor || '#3b82f6';
  const isSinglePage = config.layout === 'single-page';

  const formatRoute = (route: string) => {
    if (!isSinglePage) return route;
    if (route === '/') return '#home';
    // Convert /products to #products, etc.
    return '#' + route.replace(/^\//, '');
  };

  const renderDesktopItem = (item: any) => {
    const route = formatRoute(item.route);
    if (item.children && item.children.length > 0) {
      return `
        <div class="relative group/menu">
          <button class="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-[${primaryColor}] transition-colors uppercase tracking-widest px-4 py-2">
            ${item.label}
            <svg class="w-4 h-4 transition-transform group-hover/menu:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div class="absolute left-0 top-full hidden group-hover/menu:block min-w-[220px] bg-white shadow-2xl border border-gray-100 rounded-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            ${item.children.map((child: any) => `
              <a href="${formatRoute(child.route)}" class="block px-6 py-2.5 text-xs font-bold text-gray-600 hover:text-[${primaryColor}] hover:bg-gray-50 transition-all uppercase tracking-widest">
                ${child.label}
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }
    return `
      <a href="${route}" class="text-sm font-bold text-gray-700 hover:text-[${primaryColor}] transition-colors uppercase tracking-widest px-4 py-2">
        ${item.label}
      </a>
    `;
  };

  const renderMobileItem = (item: any) => {
    const route = formatRoute(item.route);
    if (item.children && item.children.length > 0) {
      return `
        <div class="space-y-1 py-2">
          <div class="px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">${item.label}</div>
          ${item.children.map((child: any) => `
            <a href="${formatRoute(child.route)}" class="block px-8 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-[${primaryColor}] uppercase tracking-widest">
              ${child.label}
            </a>
          `).join('')}
        </div>
      `;
    }
    return `
      <a href="${route}" class="block px-6 py-4 text-base font-black text-gray-900 hover:bg-gray-50 transition-all uppercase tracking-widest border-l-4 border-transparent hover:border-[${primaryColor}]">
        ${item.label}
      </a>
    `;
  };

  const links = menuItems.map(item => renderDesktopItem(item)).join('');
  const mobileLinks = menuItems.map(item => renderMobileItem(item)).join('');

  return `
    <nav class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 uppercase">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[${primaryColor}] to-indigo-600 flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
              <span class="text-white font-black text-xl italic">${config.companyName?.charAt(0) || 'S'}</span>
            </div>
            <span class="text-xl font-black text-gray-900 tracking-tight uppercase">${config.companyName || 'Storefront'}</span>
          </div>

          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center space-x-1">
            ${links}
            <button class="ml-6 px-6 py-2.5 bg-gray-900 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl hover:bg-[${primaryColor}] hover:scale-105 transition-all">
              Shop Now
            </button>
          </div>

          <!-- Mobile Toggle -->
          <button id="mobile-menu-toggle" class="md:hidden p-2 text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 8h16M4 16h16"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-100 overflow-y-auto max-h-[80vh] transition-all duration-300 shadow-2xl">
        <div class="py-4 space-y-1">
          ${mobileLinks}
          <div class="px-6 py-6 border-t border-gray-50">
            <button class="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all">
              Shop Now
            </button>
          </div>
        </div>
      </div>

      <script>
        (function() {
          const toggle = document.getElementById('mobile-menu-toggle');
          const menu = document.getElementById('mobile-menu');
          if (toggle && menu) {
            toggle.addEventListener('click', () => {
              menu.classList.toggle('hidden');
            });
          }
        })();
      </script>
    </nav>
  `;
}

async function fetchFooterLinks(storefrontId: string) {
  // TODO: Implement API call to fetch footer links
  return [];
}

async function fetchSiteSettings(storefrontId: string) {
  // TODO: Implement API call to fetch site settings
  return {};
}

async function fetchFeaturedProducts(storefrontId: string) {
  try {
    const res = await fetch('https://fakestoreapi.com/products?limit=4');
    const products = await res.json();
    return products.map((p: any) => ({
      id: p.id,
      name: p.title,
      price: p.price.toFixed(2),
      image: p.image,
      description: p.description
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

async function fetchCategories(storefrontId: string, options?: { limit?: number }) {
  try {
    const res = await fetch('https://fakestoreapi.com/products/categories');
    const categories = await res.json();
    const mapped = categories.map((cat: string) => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      slug: cat
    }));
    return options?.limit ? mapped.slice(0, options.limit) : mapped;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function fetchProducts(storefrontId: string, filters?: { category?: string }) {
  try {
    const url = filters?.category
      ? `https://fakestoreapi.com/products/category/${filters.category}`
      : 'https://fakestoreapi.com/products';

    const res = await fetch(url);
    const products = await res.json();

    return products.map((p: any) => ({
      id: p.id,
      name: p.title,
      price: p.price.toFixed(2),
      image: p.image,
      description: p.description
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function fetchProductBySlug(storefrontId: string, slug: string) {
  try {
    // FakeStoreAPI uses numeric IDs, but we can treat the slug as an ID for testing
    const id = slug.match(/^\d+$/) ? slug : '1';
    const res = await fetch(`https://fakestoreapi.com/products/${id}`);
    const p = await res.json();

    return {
      id: p.id,
      name: p.title,
      price: p.price.toFixed(2),
      image: p.image,
      description: p.description
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function fetchRelatedProducts(storefrontId: string, productSlug: string) {
  // TODO: Implement API call to fetch related products
  return [];
}

async function fetchCategoryBySlug(storefrontId: string, slug: string) {
  // TODO: Implement API call to fetch category by slug
  return null;
}
