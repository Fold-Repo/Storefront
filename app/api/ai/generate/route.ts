/**
 * API Route for AI-powered page generation using Claude 3.5 Sonnet
 * 
 * This route handles server-side AI generation to keep API keys secure.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GeneratePageRequest {
  pageType: 'homepage' | 'categories' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'account' | 'search' | 'testimonial' | 'about' | 'contact';
  businessNiche: string;
  companyName: string;
  description: string;
  theme: {
    primaryColor: string;
    fontFamily: string;
    designFeel: string;
  };
  logoUrl?: string;
}

/**
 * Create a comprehensive prompt for Claude to generate a page
 */
function createDynamicPagePrompt(params: GeneratePageRequest): string {
  const { pageType, businessNiche, companyName, description, theme, logoUrl } = params;

  const pageRequirements = getPageSpecificRequirements(pageType, businessNiche);

  return `You are an expert web developer specializing in modern, responsive e-commerce websites using Tailwind CSS. Generate a complete, production-ready ${pageType} page.

## Business Context
- **Company Name**: ${companyName}
- **Industry/Niche**: ${businessNiche}
- **Description**: ${description}
- **Tone**: Professional, inviting, and industry-appropriate
${logoUrl ? `- **Logo URL**: ${logoUrl}` : ''}

## Design Requirements (CRITICAL)
- **Styling**: You MUST use Tailwind CSS utility classes for ALL styling. DO NOT generate separate CSS files or <style> blocks.
- **Primary Color**: ${theme.primaryColor} (Use CSS custom properties: style="background-color: ${theme.primaryColor}" or create utility classes)
- **Font Family**: ${theme.fontFamily}
- **Design Style**: ${theme.designFeel}
- **Include Tailwind CDN**: Add <script src="https://cdn.tailwindcss.com"></script> in the <head>

## Page-Specific Requirements
${pageRequirements}

## Technical Requirements
1. **Fully Responsive**: Mobile-first design using Tailwind breakpoints (sm:, md:, lg:, xl:).
2. **Modern Layout**: Use flexbox (flex) and grid (grid) utilities. Example: class="container mx-auto px-4"
3. **Whitespace**: Use generous padding and margins (p-8, my-12, gap-6).
4. **Typography**: Use text sizing (text-xl, text-3xl), font weights (font-bold, font-semibold).
5. **Colors**: Use gray scale (bg-gray-50, text-gray-600) and the primary color for accents.
6. **Interactive States**: Include hover effects (hover:bg-blue-600, hover:shadow-lg).
7. **No Dummy Content**: Generate realistic, niche-specific content. NO "Lorem Ipsum".
8. **SEO**: Proper heading hierarchy (single h1, h2 for sections).

## Dynamic Data Placeholders (MUST INCLUDE)
Place these exact placeholders where dynamic data will be injected:
- {{menu}} - Inside <header> or <nav>
- {{footerLinks}} - Inside <footer>
- {{products}} - For product grids (will be replaced by styled cards)
- {{categories}} - For category listings
- {{featuredProducts}} - For featured product section on homepage
- {{breadcrumbs}} - Below header for navigation
- {{companyName}} - For branding

## Client-Side Data Fetching Script (MUST INCLUDE)
Include this script before </body> to enable dynamic data loading:
\`\`\`html
<script>
(function() {
  const storefrontId = window.location.hostname.split('.')[0];
  const API_BASE = '/api/storefront/' + storefrontId;
  
  async function fetchData(endpoint, containerId) {
    try {
      const container = document.getElementById(containerId);
      if (!container) return;
      const res = await fetch(API_BASE + '/' + endpoint);
      if (res.ok) {
        const data = await res.json();
        console.log(endpoint + ' loaded:', data);
      }
    } catch (e) { console.error('Fetch error:', e); }
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    fetchData('products', 'products-container');
    fetchData('categories', 'categories-container');
  });
})();
</script>
\`\`\`

## Output Format (STRICT JSON)
Return ONLY valid JSON in this exact format, no markdown code blocks:
{
  "html": "<complete HTML document with <!DOCTYPE html>, <html>, <head>, <body>>",
  "css": "",
  "js": "",
  "metadata": {
    "title": "SEO optimized page title",
    "description": "Meta description for SEO"
  }
}

## Example HTML Structure
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName} - ${pageType}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(' ', '+')}:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>body { font-family: '${theme.fontFamily}', sans-serif; }</style>
</head>
<body class="bg-gray-50 text-gray-900">
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="text-2xl font-bold" style="color: ${theme.primaryColor}">${companyName}</a>
      {{menu}}
    </nav>
  </header>
  <main>
    <!-- Page content here with Tailwind classes -->
  </main>
  <footer class="bg-gray-900 text-white py-12">
    <!-- Footer content -->
  </footer>
</body>
</html>
\`\`\`

Generate the complete ${pageType} page now. Return ONLY the JSON object, no explanations.`;
}

/**
 * Get page-specific requirements based on page type and business niche
 */
function getPageSpecificRequirements(
  pageType: GeneratePageRequest['pageType'],
  businessNiche: string
): string {
  const baseRequirements = {
    homepage: `
- Hero section with compelling headline and call-to-action
- Featured products or categories section
- About/description section highlighting the business
- Trust indicators (testimonials, badges, etc.)
- Newsletter signup or promotional section
- Footer with links and company info`,

    categories: `
- Grid or list view of product categories
- Category cards with images and names
- Filter/search functionality (UI only, no backend)
- Breadcrumb navigation
- Category descriptions where appropriate`,

    products: `
- Product grid/list with cards showing:
  - Product image
  - Product name
  - Price
  - "Add to Cart" button
  - Quick view option
- Filter sidebar (by price, category, etc.)
- Sort options (price, popularity, new)
- Pagination controls
- Search bar`,

    'product-detail': `
- Large product image gallery
- Product title and price
- Product description
- Variants selector (size, color, etc.)
- Quantity selector
- "Add to Cart" button
- Product specifications/features
- Related products section
- Reviews section (placeholder)`,

    cart: `
- List of cart items with:
  - Product image
  - Product name
  - Quantity selector
  - Price
  - Remove button
- Cart summary sidebar:
  - Subtotal
  - Shipping estimate
  - Tax
  - Total
- "Continue Shopping" link
- "Proceed to Checkout" button
- Empty cart state`,

    checkout: `
- Multi-step checkout form:
  - Shipping information
  - Payment method selection
  - Order review
- Order summary sidebar
- Form validation indicators
- "Place Order" button
- Security badges/trust indicators`,

    account: `
- Dashboard overview
- Order history list
- Account settings section
- Address book
- Payment methods
- Profile information`,

    search: `
- Search bar with query display
- Search results grid/list
- Filter options
- "No results" state
- Search suggestions`,

    testimonial: `
- Testimonials grid/list layout
- Testimonial cards with:
  - Customer name
  - Testimonial text/quote
  - Customer photo/avatar
  - Rating (stars)
  - Role/company (optional)
- Section for displaying multiple testimonials
- Use placeholder {{testimonials}} for dynamic content`,

    about: `
- About page with company information
- Company history/mission section
- Team members section (optional)
- Values/vision section
- Use placeholder {{content}} for dynamic content`,

    contact: `
- Contact form
- Company contact information
- Map/location (optional)
- Business hours
- Social media links
- Use placeholder {{content}} for dynamic content`,
  };

  const nicheSpecific = getNicheSpecificContent(businessNiche);

  return `${baseRequirements[pageType] || ''}

## Industry-Specific Requirements
${nicheSpecific}`;
}

/**
 * Get niche-specific content and layout suggestions
 */
function getNicheSpecificContent(businessNiche: string): string {
  const niche = businessNiche.toLowerCase();

  if (niche.includes('fashion') || niche.includes('clothing') || niche.includes('apparel')) {
    return `- Focus on visual appeal with high-quality product images
- Include size charts and fit information
- Show styling suggestions or lookbooks
- Emphasize color and style variations
- Use elegant, modern layouts`;
  }

  if (niche.includes('electronics') || niche.includes('tech') || niche.includes('gadget')) {
    return `- Highlight technical specifications
- Include comparison features
- Show product ratings and reviews prominently
- Emphasize warranty and support information
- Use clean, technical layouts`;
  }

  if (niche.includes('food') || niche.includes('restaurant') || niche.includes('grocery')) {
    return `- Show appetizing food images
- Include nutritional information
- Highlight ingredients and sourcing
- Show delivery/pickup options
- Use warm, inviting color schemes`;
  }

  if (niche.includes('beauty') || niche.includes('cosmetic') || niche.includes('skincare')) {
    return `- Emphasize product benefits and ingredients
- Show before/after or usage images
- Include skin type matching
- Highlight cruelty-free or organic badges
- Use elegant, luxurious layouts`;
  }

  if (niche.includes('home') || niche.includes('furniture') || niche.includes('decor')) {
    return `- Show products in room settings
- Include dimensions and materials
- Show color/material variations
- Emphasize style and aesthetic
- Use spacious, lifestyle-focused layouts`;
  }

  // Default for other niches
  return `- Tailor content and imagery to ${businessNiche} industry
- Use appropriate product presentation
- Include relevant product information
- Match industry standards and expectations`;
}

/**
 * Parse Claude's response to extract HTML, CSS, JS, and metadata
 */
function parseClaudeResponse(responseText: string): {
  html: string;
  css: string;
  js?: string;
  metadata: {
    title: string;
    description: string;
  };
} {
  try {
    // Try to parse as JSON first
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        html: parsed.html || '',
        css: parsed.css || '',
        js: parsed.js || '',
        metadata: parsed.metadata || {
          title: 'Page',
          description: '',
        },
      };
    }
  } catch (error) {
    console.warn('Failed to parse JSON response, extracting from text:', error);
  }

  // Fallback: Extract from markdown code blocks or plain text
  const htmlMatch = responseText.match(/```html\n([\s\S]*?)```/) ||
    responseText.match(/<html[\s\S]*?<\/html>/i) ||
    responseText.match(/<body[\s\S]*?<\/body>/i);

  const cssMatch = responseText.match(/```css\n([\s\S]*?)```/) ||
    responseText.match(/<style>([\s\S]*?)<\/style>/i);

  const jsMatch = responseText.match(/```javascript\n([\s\S]*?)```/) ||
    responseText.match(/```js\n([\s\S]*?)```/) ||
    responseText.match(/<script>([\s\S]*?)<\/script>/i);

  return {
    html: htmlMatch ? htmlMatch[1] || htmlMatch[0] : '<div>Generated page</div>',
    css: cssMatch ? cssMatch[1] || '' : '',
    js: jsMatch ? jsMatch[1] || '' : '',
    metadata: {
      title: 'Generated Page',
      description: 'AI-generated e-commerce page',
    },
  };
}

/**
 * POST /api/ai/generate
 * Generate a single page using Claude 3.5 Sonnet
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received request to /api/ai/generate');

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY is not configured');
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: GeneratePageRequest = await request.json();
    console.log('📋 Request body:', {
      pageType: body.pageType,
      companyName: body.companyName,
      businessNiche: body.businessNiche,
      hasTheme: !!body.theme,
    });

    // Validate required fields
    if (!body.pageType || !body.companyName || !body.businessNiche || !body.theme) {
      console.error('❌ Missing required fields:', {
        pageType: !!body.pageType,
        companyName: !!body.companyName,
        businessNiche: !!body.businessNiche,
        theme: !!body.theme,
      });
      return NextResponse.json(
        { error: 'Missing required fields: pageType, companyName, businessNiche, theme' },
        { status: 400 }
      );
    }

    // Create prompt
    const prompt = createDynamicPagePrompt(body);
    console.log('🤖 Calling Claude API for page:', body.pageType);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000, // Enough for complete HTML/CSS/JS
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log('✅ Claude API responded');

    // Extract response text
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    if (!responseText) {
      console.error('❌ Empty response from Claude API');
      return NextResponse.json(
        { error: 'Empty response from Claude API' },
        { status: 500 }
      );
    }

    console.log('📝 Parsing Claude response (length:', responseText.length, ')');

    // Parse response
    const parsed = parseClaudeResponse(responseText);

    console.log('✅ Successfully parsed response for page:', body.pageType);

    // Return generated page
    return NextResponse.json({
      success: true,
      page: parsed,
    });

  } catch (error: any) {
    console.error('❌ Error generating page with Claude:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });

    return NextResponse.json(
      {
        error: 'Failed to generate page',
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
