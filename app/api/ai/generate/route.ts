/**
 * API Route for AI-powered page generation using Claude Haiku 4.5
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
    secondaryColor?: string;
    accentColor?: string;
    fontFamily: string;
    designFeel: string;
    primaryCtaText?: string;
    secondaryCtaText?: string;
  };
  logoUrl?: string;
  layout?: 'single-page' | 'multi-page';
  planTier?: 'Lite' | 'Pro' | 'Enterprise' | 'Free';
}

/**
 * Create a comprehensive prompt for Claude Haiku to generate a unique, controlled storefront page
 */
function createDynamicPagePrompt(params: GeneratePageRequest): string {
  const { pageType, businessNiche, companyName, description, theme, logoUrl, layout, planTier: requestedPlanTier } = params;
  const isSinglePage = layout === 'single-page';
  const storeVersionId = `v${Date.now()}`;
  const promptVersion = 'shorp-storefront-v2.0';
  
  // Use requested plan tier, or determine based on layout as fallback
  const planTier = requestedPlanTier || (isSinglePage ? 'Lite' : 'Pro');

  console.log(`📋 Generating ${pageType} for ${companyName}${isSinglePage ? ' (Single Page Layout)' : ''}`);

  // Map page types to block types
  const pageBlockMapping: Record<string, string[]> = {
    'homepage': ['hero', 'cta', 'featured-products'],
    'products': ['product-grid'],
    'cart': ['cart-items', 'order-summary', 'empty-state'],
    'account': ['auth', 'profile', 'order-history'],
    'checkout': ['checkout-form', 'payment'],
  };

  const requiredBlocks = pageBlockMapping[pageType] || ['content'];

  return `You are a senior frontend engineer and UI system architect building a CONTROLLED, AI-GENERATED STOREFRONT SYSTEM for Shorp.

Your task is to generate a COMPLETE e-commerce UI using:
- Semantic HTML5
- Tailwind CSS utilities ONLY
- Minimal vanilla JavaScript
- NO frameworks, NO external libraries

This system MUST be compatible with GrapesJS.

--------------------------------------------------
INPUT VARIABLES (FROM SHORP WIZARD)
--------------------------------------------------

PROMPT VERSION:
${promptVersion}

STORE VERSION ID:
${storeVersionId}

SUBSCRIPTION PLAN:
${planTier}

BRAND TOKENS:
${theme.primaryColor} (PRIMARY_COLOR)
${theme.secondaryColor || theme.primaryColor} (SECONDARY_COLOR)
${theme.accentColor || theme.primaryColor} (ACCENT_COLOR)

CONTENT TOKENS:
${companyName} (STORE_NAME)
${description} (STORE_TAGLINE)
${theme.primaryCtaText || 'Shop Now'} (PRIMARY_CTA_TEXT)
${theme.secondaryCtaText || 'Learn More'} (SECONDARY_CTA_TEXT)

BUSINESS CONTEXT:
${businessNiche} (BUSINESS_TYPE)

--------------------------------------------------
CRITICAL LAYOUT CONTROL RULES
--------------------------------------------------

1. ALL dynamic data blocks MUST be:
   - NON-EDITABLE in GrapesJS
   - CONTENT-LOCKED
   - STRUCTURE-LOCKED

2. Users MUST be able to:
   - DELETE an entire block
   - DRAG a new block from the block library
   - NOT edit internal structure or text of dynamic blocks

3. This prevents users from breaking:
   - Dynamic data bindings
   - Layout logic
   - Backend injections

--------------------------------------------------
GRAPESJS ENFORCEMENT RULES
--------------------------------------------------

Every dynamic block MUST include the following attributes:

- data-gjs-editable="false"
- data-gjs-droppable="false"
- data-gjs-selectable="true"
- data-gjs-removable="true"
- data-gjs-hoverable="true"

Static layout wrappers MAY be:
- draggable
- droppable

Each block MUST include:
- data-block-id="UNIQUE_ID"
- data-block-type="${requiredBlocks.join(' | ')}"

--------------------------------------------------
TAILWIND RULES
--------------------------------------------------

- Tailwind utilities ONLY
- Use brand tokens via arbitrary values:
  bg-[${theme.primaryColor}]
  text-[${theme.primaryColor}]
- NO <style> tags
- NO external fonts or images (use Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script>)

--------------------------------------------------
SUBSCRIPTION PLAN UI RULES
--------------------------------------------------

${planTier}:
${planTier === 'Lite' ? '- Fewer blocks\n- Simple spacing\n- Minimal transitions' : planTier === 'Pro' ? '- More block variations\n- Advanced grid layouts\n- Hover effects' : '- Rich layout composition\n- Advanced spacing rhythm\n- Micro-interactions (JS-light)'}

--------------------------------------------------
VERSIONING & ROLLBACK SYSTEM (MANDATORY)
--------------------------------------------------

You MUST generate:

1️⃣ CURRENT VERSION UI
2️⃣ PREVIOUS VERSION SNAPSHOTS (MAX 3)

Rules:
- Each version must have:
  - version_id (v1, v2, v3…)
  - created_at timestamp
  - page + block map
- Only 3 historical versions are kept
- Oldest version is discarded on new save

Version rollback MUST be possible by:
- Replacing HTML_OUTPUT with previous snapshot
- No regeneration required

--------------------------------------------------
OUTPUT FORMAT (STRICT)
--------------------------------------------------

Return ONLY these root objects as valid JSON:

1️⃣ VERSION_HISTORY (JSON)
2️⃣ LAYOUT_SCHEMA (JSON)
3️⃣ HTML_OUTPUT (HTML + JS)

NO explanations
NO markdown code blocks
ONLY valid JSON

--------------------------------------------------
VERSION_HISTORY FORMAT
--------------------------------------------------

{
  "current_version": "${storeVersionId}",
  "history": [
    { "version": "v1", "timestamp": "${new Date(Date.now() - 86400000).toISOString()}" },
    { "version": "v2", "timestamp": "${new Date(Date.now() - 43200000).toISOString()}" },
    { "version": "${storeVersionId}", "timestamp": "${new Date().toISOString()}" }
  ]
}

--------------------------------------------------
LAYOUT_SCHEMA FORMAT
--------------------------------------------------

{
  "page": "${pageType}",
  "version": "${storeVersionId}",
  "blocks": [
    {
      "block_id": "hero-001",
      "block_type": "hero",
      "editable": false,
      "draggable": false,
      "removable": true,
      "injectables": ["STORE_NAME", "STORE_TAGLINE"]
    }
  ]
}

--------------------------------------------------
HTML_OUTPUT RULES
--------------------------------------------------

- Each page wrapped in:
  <section data-page="${pageType}" data-version="${storeVersionId}">
- Each block MUST include:
  data-block-id
  data-block-type
  GrapesJS control attributes
- Dynamic content MUST be placeholders:
  <!-- {{PLACEHOLDER}} -->
- JS included ONCE at bottom
- Use Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script>
- Generate UNIQUE, CREATIVE content specific to ${businessNiche} - NO generic templates
- Create compelling, industry-specific copy that stands out
- Use varied layouts and creative design patterns

--------------------------------------------------
PAGES TO GENERATE
--------------------------------------------------

${pageType === 'homepage' ? `1️⃣ HOMEPAGE
- Locked hero block (non-editable) with unique ${businessNiche}-specific messaging
- CTA block (locked) with compelling call-to-action
- Featured products block (locked) with ${businessNiche} product showcase
- Footer` : pageType === 'products' ? `2️⃣ PRODUCTS PAGE
- Product grid block (locked) optimized for ${businessNiche}
- Footer` : pageType === 'cart' ? `3️⃣ CART PAGE
- Cart items block (locked)
- Order summary block (locked)
- Empty state block
- Footer` : pageType === 'account' ? `4️⃣ ACCOUNT PAGE
- Auth block (locked)
- Profile block (locked)
- Order history block (locked)
- Footer` : pageType === 'checkout' ? `5️⃣ CHECKOUT & PAYMENT PAGE
- Checkout form block (locked)
- Payment block (locked)
- Payment modals (locked): Success modal, Failure modal` : `CUSTOM PAGE: ${pageType}
- Generate appropriate blocks for this page type`}

--------------------------------------------------
ACCESSIBILITY
--------------------------------------------------

- Labels
- Focus states
- Keyboard-safe modals
- aria attributes

--------------------------------------------------
FINAL VALIDATION
--------------------------------------------------

- Dynamic blocks are NOT editable
- Blocks can be deleted & replaced
- Layout integrity preserved
- 3-step rollback supported
- Tailwind-only
- Production-ready
- UNIQUE content for ${businessNiche} - be creative and specific

RETURN ONLY valid JSON with these three keys:
{
  "VERSION_HISTORY": {...},
  "LAYOUT_SCHEMA": {...},
  "HTML_OUTPUT": "<!DOCTYPE html>..."
}`;
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
- "About Us" section highlighting the business story and mission
- "Contact Us" section with a contact form and business info
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
 * Parse Claude's response to extract VERSION_HISTORY, LAYOUT_SCHEMA, and HTML_OUTPUT
 */
function parseClaudeResponse(responseText: string): {
  html: string;
  css: string;
  js?: string;
  metadata: {
    title: string;
    description: string;
  };
  versionHistory?: any;
  layoutSchema?: any;
} {
  try {
    // Try to parse as JSON first - new format with VERSION_HISTORY, LAYOUT_SCHEMA, HTML_OUTPUT
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Check for new format
      if (parsed.VERSION_HISTORY || parsed.LAYOUT_SCHEMA || parsed.HTML_OUTPUT) {
        // Extract HTML from HTML_OUTPUT
        const htmlOutput = parsed.HTML_OUTPUT || '';
        
        // Extract JS from HTML if present
        const jsMatch = htmlOutput.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
        let js = '';
        if (jsMatch) {
          js = jsMatch.map((m: string) => {
            const content = m.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
            return content ? content[1] : '';
          }).join('\n');
        }
        
        // Extract title from HTML
        const titleMatch = htmlOutput.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : 'Generated Page';
        
        // Extract meta description
        const descMatch = htmlOutput.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        const description = descMatch ? descMatch[1] : 'AI-generated e-commerce page';
        
        return {
          html: htmlOutput,
          css: '', // No separate CSS in new format (Tailwind only)
          js: js,
          metadata: {
            title,
            description,
          },
          versionHistory: parsed.VERSION_HISTORY,
          layoutSchema: parsed.LAYOUT_SCHEMA,
        };
      }
      
      // Fallback to old format for backward compatibility
      if (parsed.html) {
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

// Route segment config for deployment
export const maxDuration = 180; // 3 minutes (for platforms that support it)
export const runtime = 'nodejs'; // Use Node.js runtime

/**
 * POST /api/ai/generate
 * Generate a single page using Claude Haiku 4.5
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

    // Call Claude API with timeout wrapper
    const claudePromise = anthropic.messages.create({
      model: 'claude-haiku-4-5', // Claude Haiku 4.5 (matches pattern used in other routes)
      max_tokens: 8000, // Increased for structured output with version history and schema
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Add timeout (2 minutes) to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Claude API request timeout after 2 minutes'));
      }, 120000);
    });

    const message = await Promise.race([claudePromise, timeoutPromise]);

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
