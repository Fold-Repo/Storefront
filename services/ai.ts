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
 * Generate basic HTML structure
 */
function generateBasicHTML(params: GeneratePageParams): string {
  const { pageType, companyName, businessNiche } = params;

  // Basic HTML structure - this would be enhanced with AI
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${companyName} - ${getPageTitle(pageType)}</title>
    </head>
    <body>
      <header>
        <nav>
          <h1>${companyName}</h1>
          <!-- Navigation items -->
        </nav>
      </header>
      <main>
        <!-- Page-specific content for ${pageType} -->
        <h2>${getPageTitle(pageType)}</h2>
        <p>Welcome to ${companyName} - Your ${businessNiche} store</p>
      </main>
      <footer>
        <p>&copy; ${new Date().getFullYear()} ${companyName}</p>
      </footer>
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
