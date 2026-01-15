# Claude 3.5 Sonnet Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### 2. Add API Key to Environment Variables

Add your Anthropic API key to `.env.local`:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

**Note**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 3. Get Your API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into `.env.local`

## How It Works

### Architecture

1. **Client Side** (`services/ai.ts`)
   - `generateCompleteSite()` - Generates all 8 pages
   - `generatePage()` - Generates a single page
   - Calls server-side API route

2. **Server Side** (`app/api/ai/generate/route.ts`)
   - Receives page generation requests
   - Calls Claude 3.5 Sonnet API
   - Returns generated HTML/CSS/JS
   - Keeps API key secure (server-side only)

3. **Claude Integration**
   - Uses `claude-3-5-sonnet-20241022` model
   - Generates complete, responsive pages
   - Tailored to business niche and theme
   - Returns structured JSON with HTML/CSS/JS

### Generated Pages

The system generates 8 pages per storefront:

1. **Homepage** - Hero, featured products, about section
2. **Categories** - Category grid with filters
3. **Products** - Product listing with search/filters
4. **Product Detail** - Individual product page
5. **Cart** - Shopping cart with items
6. **Checkout** - Multi-step checkout form
7. **Account** - User dashboard and settings
8. **Search** - Search results page

### Features

- ✅ **Dynamic Generation** - No predefined templates
- ✅ **Industry-Specific** - Tailored to business niche
- ✅ **Theme-Aware** - Uses colors, fonts, design style
- ✅ **Responsive** - Mobile-first design
- ✅ **Accessible** - WCAG 2.1 AA compliant
- ✅ **SEO Optimized** - Proper meta tags and structure
- ✅ **Tailwind CSS** - Uses utility classes

## Cost Estimation

**Per Storefront (8 pages):**
- Input tokens: ~16,000
- Output tokens: ~24,000
- **Total cost: ~$0.41 per storefront**

**Monthly (100 storefronts):**
- **Total cost: ~$41/month**

## Testing

To test the implementation:

1. Complete the wizard with your business details
2. Click "Generate Storefront"
3. Watch the console for generation progress
4. Check Firebase for saved pages
5. View pages in the dashboard

## Troubleshooting

### Error: "ANTHROPIC_API_KEY is not configured"
- Make sure `.env.local` exists
- Verify the key is named `ANTHROPIC_API_KEY`
- Restart your dev server after adding the key

### Error: "Failed to generate page"
- Check API key is valid
- Verify you have API credits
- Check network connection
- Review server logs for detailed errors

### Pages not generating
- Check browser console for errors
- Verify API route is accessible
- Check Firebase permissions
- Review `services/ai.ts` error handling

## Next Steps

1. ✅ Install `@anthropic-ai/sdk`
2. ✅ Add `ANTHROPIC_API_KEY` to `.env.local`
3. ✅ Test with one page type
4. ✅ Scale to all 8 pages
5. ✅ Monitor costs and usage
6. ✅ Optimize prompts if needed

## API Route Details

**Endpoint**: `POST /api/ai/generate`

**Request Body**:
```json
{
  "pageType": "homepage",
  "businessNiche": "Fashion & Apparel",
  "companyName": "My Store",
  "description": "A modern fashion store",
  "theme": {
    "primaryColor": "#3B82F6",
    "fontFamily": "Inter",
    "designFeel": "modern"
  },
  "logoUrl": "https://example.com/logo.png"
}
```

**Response**:
```json
{
  "success": true,
  "page": {
    "html": "<html>...</html>",
    "css": "/* styles */",
    "js": "// javascript",
    "metadata": {
      "title": "My Store - Home",
      "description": "..."
    }
  }
}
```
