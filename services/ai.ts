import { GeneratedPage } from "./firebase";
/**
 * AI Service for generating e-commerce site pages
 * 
 * This service handles communication with AI providers (OpenAI, Claude, etc.)
 * to generate HTML/CSS/JS for e-commerce pages based on business requirements.
 */

// Types for AI generation
export interface GeneratePageParams {
  pageType: 'homepage' | 'categories' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'account' | 'search' | 'about' | 'contact' | 'testimonial';
  businessNiche: string;
  companyName: string;
  description: string;
  theme: {
    primaryColor: string;
    fontFamily: string;
    designFeel: string;
  };
  templateHtml?: string; // Optional existing HTML template
  logoUrl?: string;
}


export interface GenerateSiteParams {
  wizardData: {
    ideaScope: string;
    companyName: string;
    description: string;
    subdomain: string;
    logoPreview?: string | null;
    theme?: {
      primaryColor: string;
      fontFamily: string;
      designFeel: string;
      aiDescription?: string;
    };
  };
}

/**
 * Generate a single page using AI
 * 
 * This function can be implemented with:
 * - OpenAI GPT-4
 * - Anthropic Claude
 * - Or your own AI service
 */
export const generatePage = async (params: GeneratePageParams): Promise<GeneratedPage> => {
  // TODO: Implement actual AI generation
  // For now, return a placeholder structure

  const { pageType, businessNiche, companyName, theme, templateHtml } = params;

  // Example: If you have existing HTML, you can customize it
  if (templateHtml) {
    // Customize template with theme and business info
    const customizedHtml = customizeTemplate(templateHtml, {
      primaryColor: theme.primaryColor,
      fontFamily: theme.fontFamily,
      companyName,
      businessNiche,
    });

    return {
      html: customizedHtml,
      css: generateThemeCSS(theme),
      metadata: {
        title: `${companyName} - ${getPageTitle(pageType)}`,
        description: `Browse ${businessNiche} products at ${companyName}`,
      },
    };
  }

  // Otherwise, generate from scratch using AI
  // This would call OpenAI/Claude API
  return await generatePageWithAI(params);
};

/**
 * Generate complete e-commerce site
 */
export const generateCompleteSite = async (params: GenerateSiteParams): Promise<Record<string, GeneratedPage>> => {
  const { wizardData } = params;

  // Start with essential pages only to reduce generation time
  // Additional pages can be generated on-demand later
  const essentialPages: Array<GeneratePageParams['pageType']> = [
    'homepage',
    'products',
    'product-detail',
    'cart',
    'checkout',
  ];

  // Optional pages (can be generated later)
  const optionalPages: Array<GeneratePageParams['pageType']> = [
    'categories',
    'account',
    'search',
    'testimonial',
    'about',
    'contact',
  ];

  console.log('🚀 Starting complete site generation for:', wizardData.companyName);
  console.log(`📋 Will generate ${essentialPages.length} essential pages first`);

  const generatedPages: Record<string, GeneratedPage> = {};
  const theme = wizardData.theme || {
    primaryColor: '#3B82F6',
    fontFamily: 'Inter',
    designFeel: 'modern',
  };

  // Generate essential pages first
  for (let i = 0; i < essentialPages.length; i++) {
    const pageType = essentialPages[i];
    try {
      console.log(`📄 Generating essential page ${i + 1}/${essentialPages.length}: ${pageType}`);
      const startTime = Date.now();

      const page = await generatePage({
        pageType,
        businessNiche: wizardData.ideaScope,
        companyName: wizardData.companyName,
        description: wizardData.description,
        theme,
        logoUrl: wizardData.logoPreview || undefined,
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      generatedPages[pageType] = page;
      console.log(`✅ Successfully generated ${pageType} in ${duration}s`);
    } catch (error: any) {
      console.error(`❌ Error generating ${pageType}:`, error);
      // Add a fallback page so the site generation doesn't completely fail
      generatedPages[pageType] = {
        html: generateBasicHTML({
          pageType,
          businessNiche: wizardData.ideaScope,
          companyName: wizardData.companyName,
          description: wizardData.description,
          theme,
        }),
        css: generateThemeCSS(theme),
        metadata: {
          title: `${wizardData.companyName} - ${getPageTitle(pageType)}`,
          description: wizardData.description,
        },
      };
      console.log(`⚠️ Using fallback template for ${pageType}`);
    }
  }

  // Generate optional pages with basic templates (faster)
  for (const pageType of optionalPages) {
    console.log(`📄 Creating basic template for optional page: ${pageType}`);
    generatedPages[pageType] = {
      html: generateBasicHTML({
        pageType,
        businessNiche: wizardData.ideaScope,
        companyName: wizardData.companyName,
        description: wizardData.description,
        theme,
      }),
      css: generateThemeCSS(theme),
      metadata: {
        title: `${wizardData.companyName} - ${getPageTitle(pageType)}`,
        description: wizardData.description,
      },
    };
  }

  console.log('🎉 Complete site generation finished. Generated pages:', Object.keys(generatedPages).length);
  return generatedPages;
};

/**
 * Generate page using AI (Claude 3.5 Sonnet)
 * 
 * Calls the server-side API route to generate pages using Claude
 */
async function generatePageWithAI(params: GeneratePageParams): Promise<GeneratedPage> {
  try {
    console.log('🔄 Generating page with AI:', params.pageType);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('⏱️ Request timeout for:', params.pageType);
      controller.abort();
    }, 120000); // 2 minute timeout

    try {
      // Call our server-side API route
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageType: params.pageType,
          businessNiche: params.businessNiche,
          companyName: params.companyName,
          description: params.description,
          theme: params.theme,
          logoUrl: params.logoUrl,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('📡 API response status:', response.status, response.statusText);

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          error = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('❌ API error:', error);
        throw new Error(error.message || error.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API response received:', { success: data.success, hasPage: !!data.page });

      if (!data.success || !data.page) {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Invalid response from AI service');
      }

      return data.page;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout: AI generation took too long (2 minutes)');
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('❌ Error calling AI generation API:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });

    // Fallback to basic template if AI generation fails
    console.warn('⚠️ Falling back to basic template for:', params.pageType);
    return {
      html: generateBasicHTML(params),
      css: generateThemeCSS(params.theme),
      metadata: {
        title: `${params.companyName} - ${getPageTitle(params.pageType)}`,
        description: params.description,
      },
    };
  }
}

/**
 * Customize existing HTML template
 */
function customizeTemplate(html: string, customizations: {
  primaryColor: string;
  fontFamily: string;
  companyName: string;
  businessNiche: string;
}): string {
  let customized = html;

  // Replace CSS variables
  customized = customized.replace(/--primary-color:\s*[^;]+/g, `--primary-color: ${customizations.primaryColor}`);
  customized = customized.replace(/font-family:\s*[^;]+/g, `font-family: ${customizations.fontFamily}, sans-serif`);

  // Replace company name placeholders
  customized = customized.replace(/\{\{companyName\}\}/g, customizations.companyName);
  customized = customized.replace(/\{\{businessNiche\}\}/g, customizations.businessNiche);

  return customized;
}

/**
 * Generate theme CSS
 */
function generateThemeCSS(theme: GeneratePageParams['theme']): string {
  return `
    :root {
      --primary-color: ${theme.primaryColor};
      --font-family: ${theme.fontFamily}, sans-serif;
    }
    
    body {
      font-family: var(--font-family);
    }
    
    .primary-bg {
      background-color: var(--primary-color);
    }
    
    .primary-text {
      color: var(--primary-color);
    }
    
    /* Add more theme-based styles */
  `;
}

/**
 * Generate basic HTML structure with Tailwind CSS styling
 * This provides high-quality fallback templates for each page type
 */
function generateBasicHTML(params: GeneratePageParams): string {
  const { pageType, companyName, businessNiche, theme, description } = params;
  const year = new Date().getFullYear();

  // Common head section with Tailwind CDN
  const head = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName} - ${getPageTitle(pageType)}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(' ', '+')}:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      body { font-family: '${theme.fontFamily}', sans-serif; }
      .primary-bg { background-color: ${theme.primaryColor}; }
      .primary-text { color: ${theme.primaryColor}; }
      .primary-border { border-color: ${theme.primaryColor}; }
    </style>
  `;

  // Common header with dynamic menu placeholder
  const header = `
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" class="text-2xl font-bold primary-text">${companyName}</a>
        {{menu}}
      </nav>
    </header>
  `;

  // Common footer
  const footer = `
    <footer class="bg-gray-900 text-white py-12">
      <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-4">${companyName}</h3>
          <p class="text-gray-400">${description || 'Your trusted ' + businessNiche + ' store.'}</p>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Quick Links</h4>
          {{footerLinks}}
        </div>
        <div>
          <h4 class="font-semibold mb-4">Contact</h4>
          <p class="text-gray-400">Email: info@{{companyName}}.com</p>
        </div>
        <div>
          <h4 class="font-semibold mb-4">Follow Us</h4>
          <div class="flex gap-4">
            <a href="#" class="text-gray-400 hover:text-white">Twitter</a>
            <a href="#" class="text-gray-400 hover:text-white">Facebook</a>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
        &copy; ${year} ${companyName}. All rights reserved.
      </div>
    </footer>
  `;

  // Data fetching script placeholder
  const dataFetchScript = `
    <script>
      // Dynamic Data Fetching Script
      (function() {
        const API_BASE = '/api';
        const storefrontId = window.location.hostname.split('.')[0]; // Extract subdomain

        async function fetchProducts() {
          try {
            const container = document.getElementById('products-container');
            if (!container) return;
            const res = await fetch(API_BASE + '/storefront/' + storefrontId + '/products');
            if (!res.ok) return;
            const data = await res.json();
            // Render logic can be added here or rely on server-side injection
            console.log('Products fetched:', data);
          } catch (e) { console.error('Failed to fetch products', e); }
        }

        async function fetchCategories() {
          try {
            const container = document.getElementById('categories-container');
            if (!container) return;
            const res = await fetch(API_BASE + '/storefront/' + storefrontId + '/categories');
            if (!res.ok) return;
            const data = await res.json();
            console.log('Categories fetched:', data);
          } catch (e) { console.error('Failed to fetch categories', e); }
        }

        document.addEventListener('DOMContentLoaded', function() {
          fetchProducts();
          fetchCategories();
        });
      })();
    </script>
  `;

  // Page-specific content
  let mainContent = '';
  switch (pageType) {
    case 'homepage':
      mainContent = `
        <!-- Hero Section -->
        <section class="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-24">
          <div class="container mx-auto px-4 text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6">Welcome to ${companyName}</h1>
            <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">${description || 'Discover exceptional ' + businessNiche + ' products curated just for you.'}</p>
            <a href="/products" class="inline-block primary-bg text-white px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity">Shop Now</a>
          </div>
        </section>
        <!-- Featured Products -->
        <section class="py-16 bg-gray-50">
          <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-10">Featured Products</h2>
            <div id="products-container">{{featuredProducts}}</div>
          </div>
        </section>
        <!-- Categories -->
        <section class="py-16">
          <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-10">Shop by Category</h2>
            <div id="categories-container">{{categories}}</div>
          </div>
        </section>
      `;
      break;
    case 'products':
      mainContent = `
        {{breadcrumbs}}
        <section class="py-12">
          <div class="container mx-auto px-4">
            <h1 class="text-3xl font-bold mb-8">Our Products</h1>
            <div id="products-container">{{products}}</div>
          </div>
        </section>
      `;
      break;
    case 'product-detail':
      mainContent = `
        {{breadcrumbs}}
        <section class="py-12">
          <div class="container mx-auto px-4">
            <div class="grid md:grid-cols-2 gap-12">
              <div class="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
                <img src="{{product.image}}" alt="{{product.name}}" class="max-h-full object-contain"/>
              </div>
              <div>
                <h1 class="text-3xl font-bold mb-4">{{product.name}}</h1>
                <p class="text-2xl primary-text font-semibold mb-6">{{product.price}}</p>
                <p class="text-gray-600 mb-8">{{product.description}}</p>
                <button class="primary-bg text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 w-full md:w-auto">Add to Cart</button>
              </div>
            </div>
          </div>
        </section>
      `;
      break;
    case 'categories':
      mainContent = `
        {{breadcrumbs}}
        <section class="py-12">
          <div class="container mx-auto px-4">
            <h1 class="text-3xl font-bold mb-8">Shop by Category</h1>
            <div id="categories-container">{{categories}}</div>
          </div>
        </section>
      `;
      break;
    case 'cart':
      mainContent = `
        <section class="py-12">
          <div class="container mx-auto px-4">
            <h1 class="text-3xl font-bold mb-8">Your Cart</h1>
            <div id="cart-items" class="bg-white rounded-xl shadow p-6">
              <p class="text-gray-500 text-center py-12">Your cart is empty.</p>
            </div>
            <div class="mt-8 flex justify-end">
              <a href="/checkout" class="primary-bg text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90">Proceed to Checkout</a>
            </div>
          </div>
        </section>
      `;
      break;
    case 'checkout':
      mainContent = `
        <section class="py-12">
          <div class="container mx-auto px-4 max-w-2xl">
            <h1 class="text-3xl font-bold mb-8 text-center">Checkout</h1>
            <form class="space-y-6 bg-white p-8 rounded-xl shadow">
              <div><label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea></div>
              <button type="submit" class="w-full primary-bg text-white py-3 rounded-lg font-semibold hover:opacity-90">Place Order</button>
            </form>
          </div>
        </section>
      `;
      break;
    case 'about':
      mainContent = `
        <section class="py-16">
          <div class="container mx-auto px-4 max-w-3xl text-center">
            <h1 class="text-4xl font-bold mb-6">About ${companyName}</h1>
            <p class="text-xl text-gray-600 mb-8">${description || 'We are passionate about bringing you the best ' + businessNiche + ' products.'}</p>
            <div class="grid md:grid-cols-3 gap-8 mt-12">
              <div class="p-6 bg-gray-50 rounded-xl"><h3 class="font-bold text-lg mb-2">Our Mission</h3><p class="text-gray-600">To deliver quality and value to our customers.</p></div>
              <div class="p-6 bg-gray-50 rounded-xl"><h3 class="font-bold text-lg mb-2">Our Vision</h3><p class="text-gray-600">To be a leader in the ${businessNiche} industry.</p></div>
              <div class="p-6 bg-gray-50 rounded-xl"><h3 class="font-bold text-lg mb-2">Our Values</h3><p class="text-gray-600">Integrity, Quality, Customer Focus.</p></div>
            </div>
          </div>
        </section>
      `;
      break;
    case 'contact':
      mainContent = `
        <section class="py-16">
          <div class="container mx-auto px-4 max-w-2xl">
            <h1 class="text-4xl font-bold mb-6 text-center">Contact Us</h1>
            <p class="text-center text-gray-600 mb-10">Have questions? We'd love to hear from you.</p>
            <form class="space-y-6 bg-white p-8 rounded-xl shadow">
              <div><label class="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">Message</label><textarea rows="5" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea></div>
              <button type="submit" class="w-full primary-bg text-white py-3 rounded-lg font-semibold hover:opacity-90">Send Message</button>
            </form>
          </div>
        </section>
      `;
      break;
    case 'testimonial':
      mainContent = `
        <section class="py-16 bg-gray-50">
          <div class="container mx-auto px-4">
            <h1 class="text-4xl font-bold mb-10 text-center">What Our Customers Say</h1>
            <div class="grid md:grid-cols-3 gap-8">{{testimonials}}</div>
          </div>
        </section>
      `;
      break;
    case 'account':
      mainContent = `
        <section class="py-12">
          <div class="container mx-auto px-4 max-w-4xl">
            <h1 class="text-3xl font-bold mb-8">My Account</h1>
            <div class="grid md:grid-cols-3 gap-6">
              <a href="/account/orders" class="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow"><h3 class="font-bold">Order History</h3><p class="text-gray-500 text-sm">View past orders</p></a>
              <a href="/account/settings" class="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow"><h3 class="font-bold">Account Settings</h3><p class="text-gray-500 text-sm">Manage your profile</p></a>
              <a href="/account/addresses" class="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow"><h3 class="font-bold">Addresses</h3><p class="text-gray-500 text-sm">Manage your addresses</p></a>
            </div>
          </div>
        </section>
      `;
      break;
    case 'search':
      mainContent = `
        {{breadcrumbs}}
        <section class="py-12">
          <div class="container mx-auto px-4">
            <h1 class="text-3xl font-bold mb-8">Search Results</h1>
            <div class="mb-8"><input type="text" placeholder="Search products..." class="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"></div>
            <div id="products-container">{{products}}</div>
          </div>
        </section>
      `;
      break;
    default:
      mainContent = `
        <section class="py-16">
          <div class="container mx-auto px-4 text-center">
            <h1 class="text-4xl font-bold mb-6">${getPageTitle(pageType)}</h1>
            <p class="text-gray-600">Welcome to ${companyName}.</p>
          </div>
        </section>
      `;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>${head}</head>
    <body class="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
      ${header}
      <main class="flex-grow">${mainContent}</main>
      ${footer}
      ${dataFetchScript}
    </body>
    </html>
  `;
}

/**
 * Get page title
 */
function getPageTitle(pageType: GeneratePageParams['pageType']): string {
  const titles: Record<GeneratePageParams['pageType'], string> = {
    'homepage': 'Home',
    'categories': 'Categories',
    'products': 'Products',
    'product-detail': 'Product Details',
    'cart': 'Shopping Cart',
    'checkout': 'Checkout',
    'account': 'My Account',
    'search': 'Search Results',
    'about': 'About Us',
    'contact': 'Contact Us',
    'testimonial': 'Testimonials',
  };

  return titles[pageType] || 'Page';
}

/**
 * Create AI prompt for page generation
 */
function createPromptForPage(params: GeneratePageParams): string {
  const { pageType, businessNiche, companyName, description, theme } = params;

  return `
Generate a complete, modern, responsive e-commerce ${pageType} page with the following requirements:

Business Information:
- Company Name: ${companyName}
- Business Niche: ${businessNiche}
- Description: ${description}

Design Requirements:
- Primary Color: ${theme.primaryColor}
- Font Family: ${theme.fontFamily}
- Design Feel: ${theme.designFeel}

Page Requirements:
- Fully responsive (mobile, tablet, desktop)
- Modern, clean design
- Accessible (WCAG compliant)
- Fast loading
- SEO optimized

Please provide:
1. Complete HTML structure
2. CSS styles (inline or separate)
3. Any necessary JavaScript
4. Ensure the design matches the ${theme.designFeel} aesthetic
5. Tailor content and layout to ${businessNiche} industry

Return the code in a structured format that can be easily parsed.
  `;
}
