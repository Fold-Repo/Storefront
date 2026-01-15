# AI-Powered E-commerce Site Generation - Analysis & Implementation Plan

## Overview
This document analyzes options for generating complete e-commerce websites using AI, based on user inputs from the wizard (business niche, theming, company info).

## AI Options Analysis

### Option 1: OpenAI GPT-4 / GPT-4 Turbo (Recommended)
**Pros:**
- Excellent at generating HTML/CSS/JS code
- Can understand context and business requirements
- Supports function calling for structured output
- Good at following design patterns and best practices
- Cost-effective for code generation

**Cons:**
- Requires API key and costs per request
- Rate limits on free tier
- May need multiple API calls for complete site

**Implementation:**
- Use `openai` npm package
- Generate pages one at a time or in batches
- Store prompts as templates

### Option 2: Anthropic Claude (Alternative)
**Pros:**
- Excellent code generation capabilities
- Good at following complex instructions
- Strong context understanding

**Cons:**
- Requires API key
- Similar pricing to OpenAI

### Option 3: Use Existing HTML Templates + AI Enhancement
**Pros:**
- Faster generation
- More consistent output
- Can use your existing HTML as base
- Lower API costs

**Cons:**
- Less creative/flexible
- Requires maintaining template library

**Recommended Approach:** Hybrid - Use templates as base, AI to customize

## Implementation Strategy

### Phase 1: AI Service Setup
1. **Choose AI Provider** (Recommend OpenAI GPT-4)
2. **Create AI Service** (`services/ai.ts`)
   - Generate page HTML/CSS/JS
   - Customize based on theme and business niche
   - Return structured page data

### Phase 2: Page Generation
Generate the following pages for each e-commerce site:

#### Core Pages:
1. **Homepage** (`/`)
   - Hero section with business branding
   - Featured products/categories
   - Call-to-action sections
   - Business description

2. **Categories Page** (`/categories`)
   - Category grid/list
   - Category images
   - Filter/search functionality

3. **Category Detail** (`/categories/[slug]`)
   - Products in category
   - Category description
   - Filters and sorting

4. **Product Listing** (`/products`)
   - Product grid/list view
   - Search and filters
   - Pagination

5. **Product Detail** (`/products/[slug]`)
   - Product images
   - Description and specs
   - Add to cart
   - Related products

6. **Shopping Cart** (`/cart`)
   - Cart items list
   - Quantity updates
   - Remove items
   - Subtotal calculation

7. **Checkout** (`/checkout`)
   - Shipping information
   - Payment method
   - Order summary
   - Place order button

#### Additional Pages:
8. **User Account/Dashboard** (`/account`)
   - Order history
   - Profile settings
   - Addresses

9. **Search Results** (`/search`)
   - Search query display
   - Filtered product results

10. **About/Contact** (`/about`, `/contact`)
    - Business information
    - Contact form

### Phase 3: Firebase Data Structure

```typescript
interface GeneratedSite {
  userId: string;
  userEmail: string;
  subdomain: string;
  companyName: string;
  businessNiche: string; // ideaScope
  theme: {
    primaryColor: string;
    fontFamily: string;
    designFeel: string;
  };
  pages: {
    [pageId: string]: {
      route: string; // e.g., "/", "/products", "/cart"
      name: string; // "Homepage", "Products", "Cart"
      html: string;
      css: string;
      js?: string; // Optional JavaScript
      components?: string[]; // Component references
      metadata?: {
        title: string;
        description: string;
      };
    };
  };
  generatedAt: Date;
  updatedAt: Date;
  status: "generating" | "completed" | "failed";
}
```

### Phase 4: Generation Process

1. **Collect Input Data:**
   - Business niche (ideaScope)
   - Company name
   - Description
   - Theme settings (color, font, design feel)
   - Logo (if available)

2. **Generate Pages:**
   - Create AI prompts for each page type
   - Generate HTML/CSS tailored to:
     - Business niche (fashion, electronics, food, etc.)
     - Theme (color, font, design feel)
     - Company branding

3. **Save to Firebase:**
   - Store complete site structure
   - Link to user account
   - Enable updates/regeneration

## Using Existing HTML Templates

### Approach A: Template-Based Generation
1. Create base HTML templates for each page type
2. Use AI to:
   - Customize colors (replace CSS variables)
   - Adjust fonts
   - Modify content based on business niche
   - Add/remove sections based on design feel

### Approach B: AI-From-Scratch Generation
1. Provide AI with:
   - Business context
   - Theme requirements
   - Page requirements
2. Generate complete HTML/CSS/JS
3. More flexible but slower

### Recommended: Hybrid Approach
1. Use templates for structure
2. AI customizes:
   - Colors and styling
   - Content and copy
   - Layout adjustments
   - Component selection

## Technical Implementation

### 1. AI Service (`services/ai.ts`)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

interface GeneratePageParams {
  pageType: 'homepage' | 'products' | 'cart' | 'checkout' | ...;
  businessNiche: string;
  companyName: string;
  description: string;
  theme: {
    primaryColor: string;
    fontFamily: string;
    designFeel: string;
  };
  templateHtml?: string; // Optional existing HTML
}

export const generatePage = async (params: GeneratePageParams) => {
  // Create prompt based on page type and requirements
  // Call OpenAI API
  // Return generated HTML/CSS/JS
};
```

### 2. Site Generation Service (`services/siteGenerator.ts`)

```typescript
export const generateCompleteSite = async (
  wizardData: WizardData,
  user: User
) => {
  const pages = [
    'homepage',
    'categories',
    'products',
    'product-detail',
    'cart',
    'checkout',
    'account',
    'search',
  ];
  
  const generatedPages = {};
  
  for (const pageType of pages) {
    const page = await generatePage({
      pageType,
      businessNiche: wizardData.ideaScope,
      companyName: wizardData.companyName,
      description: wizardData.description,
      theme: wizardData.theme,
    });
    
    generatedPages[pageType] = page;
  }
  
  // Save to Firebase
  await saveGeneratedSiteToFirebase({
    userId: user.uid,
    userEmail: user.email,
    subdomain: wizardData.subdomain,
    pages: generatedPages,
    // ... other data
  });
};
```

### 3. Firebase Storage Structure

```
storefront_sites/
  {userId}/
    pages/
      homepage/
        html: "..."
        css: "..."
        js: "..."
      products/
        ...
    metadata/
      theme: {...}
      businessInfo: {...}
    generatedAt: timestamp
```

## Cost Considerations

### OpenAI Pricing (as of 2024):
- GPT-4 Turbo: ~$0.01 per 1K input tokens, $0.03 per 1K output tokens
- Estimated cost per site: $0.50 - $2.00 (depending on page count and complexity)

### Optimization:
- Cache common templates
- Generate pages on-demand
- Use GPT-3.5 for simpler pages (cheaper)

## Recommended Implementation Steps

1. **Set up OpenAI API**
   - Get API key
   - Add to environment variables
   - Install `openai` package

2. **Create AI Service**
   - Basic page generation function
   - Template customization
   - Error handling

3. **Update Wizard**
   - Add "Generate Site" button after AI Design step
   - Show generation progress
   - Handle errors gracefully

4. **Firebase Integration**
   - Create `storefront_sites` collection
   - Save generated pages
   - Link to user account

5. **Page Rendering**
   - Create dynamic route handler
   - Render generated HTML/CSS
   - Handle navigation between pages

## Next Steps

1. Choose AI provider (recommend OpenAI)
2. Set up API keys
3. Create basic AI service
4. Test with one page type
5. Expand to all page types
6. Integrate with Firebase
7. Add to wizard flow

## Questions to Consider

1. **Do you have existing HTML templates?** 
   - If yes, we can use them as base
   - If no, AI generates from scratch

2. **Budget for AI API calls?**
   - Determines which model to use
   - Affects generation strategy

3. **Real-time generation or background job?**
   - Real-time: User waits during generation
   - Background: Generate async, notify when done

4. **Regeneration capability?**
   - Allow users to regenerate pages
   - Save version history
