# Dynamic Routing & Page Management Guide

## Overview

This system provides:
- ✅ **Pretty URLs** (no .html extension)
- ✅ **Dynamic page routing** for any page type
- ✅ **Static and dynamic content** support
- ✅ **Firebase-based page settings** per user/storefront
- ✅ **Automatic route generation** for new pages

## How It Works

### 1. Pretty URLs

All pages use clean URLs without `.html` extension:
- ✅ `mystore.com/testimonials` (not `testimonials.html`)
- ✅ `mystore.com/about` (not `about.html`)
- ✅ `mystore.com/products` (not `products.html`)

### 2. Route Resolution

The system resolves routes in this order:

1. **Custom Pages** (testimonial, about, contact, etc.)
   - Check `page_settings` collection in Firebase
   - Match route to page setting
   - Load page HTML and content

2. **Standard Pages** (homepage, products, cart, etc.)
   - Use predefined page types
   - Load from generated pages

3. **Dynamic Routes** (product detail, category detail)
   - Pattern matching (e.g., `/products/slug`)
   - Load data based on slug

### 3. Page Settings Structure

Each page has settings stored in Firebase:

```typescript
{
  id: "mystore_testimonial",
  userId: "user123",
  storefrontId: "mystore",
  pageType: "testimonial",
  route: "/testimonials",
  contentType: "dynamic", // or "static"
  dataSource: {
    type: "firebase", // or "api" or "static"
    collection: "testimonials_mystore", // Firebase collection
    // OR
    apiEndpoint: "https://api.example.com/testimonials",
    // OR
    staticData: { title: "...", content: "..." }
  },
  settings: {
    enabled: true,
    showInMenu: true,
    showInFooter: true,
    metaTitle: "Testimonials",
    metaDescription: "Customer reviews"
  }
}
```

## Creating a New Page

### Example: Testimonials Page

#### Step 1: Create Page Setting

```typescript
import { savePageSetting } from '@/services/pageSettings';

await savePageSetting({
  storefrontId: 'mystore',
  userId: 'user123',
  pageType: 'testimonial',
  route: '/testimonials',
  contentType: 'dynamic',
  dataSource: {
    type: 'firebase',
    collection: 'testimonials_mystore',
  },
  settings: {
    enabled: true,
    showInMenu: true,
    showInFooter: true,
    metaTitle: 'Testimonials',
    metaDescription: 'Customer reviews and testimonials',
  },
});
```

#### Step 2: Generate Page HTML (Optional)

If you want custom HTML for the page, generate it via AI:

```typescript
// In your wizard or page generation flow
const testimonialPage = await generatePage({
  pageType: 'testimonial',
  businessNiche: 'Fashion',
  companyName: 'My Store',
  description: '...',
  theme: { ... },
});
```

#### Step 3: Add Testimonials Data to Firebase

Create a collection `testimonials_mystore`:

```typescript
// Firebase collection: testimonials_mystore
{
  id: "test1",
  name: "John Doe",
  text: "Great products!",
  role: "Customer",
  rating: 5,
  avatar: "https://...",
  createdAt: timestamp
}
```

#### Step 4: Access the Page

Visit: `mystore.yourdomain.com/testimonials`

The system will:
1. Detect the route `/testimonials`
2. Load page settings from Firebase
3. Fetch testimonials from `testimonials_mystore` collection
4. Inject data into HTML
5. Render the page

## Static vs Dynamic Content

### Static Content

For pages with fixed content (About, Contact):

```typescript
await savePageSetting({
  storefrontId: 'mystore',
  userId: 'user123',
  pageType: 'about',
  route: '/about',
  contentType: 'static',
  dataSource: {
    type: 'static',
    staticData: {
      title: 'About Us',
      content: '<p>We are a company...</p>',
      sections: [
        {
          title: 'Our Mission',
          content: 'To provide...'
        }
      ]
    },
  },
  settings: {
    enabled: true,
    showInMenu: true,
  },
});
```

### Dynamic Content

For pages that fetch data (Testimonials, Blog, Products):

```typescript
await savePageSetting({
  storefrontId: 'mystore',
  userId: 'user123',
  pageType: 'testimonial',
  route: '/testimonials',
  contentType: 'dynamic',
  dataSource: {
    type: 'firebase',
    collection: 'testimonials_mystore',
  },
  settings: {
    enabled: true,
  },
});
```

## Data Placeholders

In your generated HTML, use these placeholders:

### For Testimonials:
```html
<div class="testimonials-section">
  {{testimonials}}
</div>
```

### For Generic Content:
```html
<div class="page-content">
  {{content}}
</div>
```

### For Custom Data:
```html
<div>
  <h1>{{customData.title}}</h1>
  <p>{{customData.description}}</p>
</div>
```

## API Endpoints

### Get All Pages
```
GET /api/storefront/[storefrontId]/pages
```

### Create Page
```
POST /api/storefront/[storefrontId]/pages
Body: {
  pageType: "testimonial",
  route: "/testimonials",
  contentType: "dynamic",
  dataSource: { ... },
  settings: { ... },
  userId: "user123"
}
```

### Update Page
```
PATCH /api/storefront/[storefrontId]/pages?pageType=testimonial
Body: {
  settings: { enabled: false }
}
```

### Delete Page
```
DELETE /api/storefront/[storefrontId]/pages?pageType=testimonial
```

## Default Pages

When a storefront is created, default pages are available (but disabled):

- **Testimonials** (`/testimonials`) - Dynamic from Firebase
- **About** (`/about`) - Static content
- **Contact** (`/contact`) - Static content

Enable them by updating settings:

```typescript
await updatePageSetting(pageId, {
  settings: {
    enabled: true,
    showInMenu: true,
  }
});
```

## Firebase Collections

### Page Settings Collection: `page_settings`

Structure:
```
page_settings/
  {storefrontId}_{pageType}/
    - id
    - userId
    - storefrontId
    - pageType
    - route
    - contentType
    - dataSource
    - settings
    - createdAt
    - updatedAt
```

### Dynamic Content Collections

For dynamic pages, create collections like:
- `testimonials_{storefrontId}`
- `blog_posts_{storefrontId}`
- `faq_{storefrontId}`
- etc.

## Example: Complete Testimonials Flow

### 1. Create Page Setting
```typescript
const pageId = await savePageSetting({
  storefrontId: 'mystore',
  userId: 'user123',
  pageType: 'testimonial',
  route: '/testimonials',
  contentType: 'dynamic',
  dataSource: {
    type: 'firebase',
    collection: 'testimonials_mystore',
  },
  settings: {
    enabled: true,
    showInMenu: true,
    showInFooter: true,
  },
});
```

### 2. Add Testimonials to Firebase
```typescript
// In Firebase Console or via code
await addDoc(collection(db, 'testimonials_mystore'), {
  name: 'John Doe',
  text: 'Amazing products!',
  role: 'Customer',
  rating: 5,
  avatar: 'https://...',
  createdAt: new Date(),
});
```

### 3. Generate Page HTML (Optional)
```typescript
// If you want custom HTML
const html = await generatePage({
  pageType: 'testimonial',
  // ... other params
});
// Save to Firebase
```

### 4. Access Page
Visit: `mystore.yourdomain.com/testimonials`

The system automatically:
- ✅ Detects route
- ✅ Loads page settings
- ✅ Fetches testimonials from Firebase
- ✅ Injects into HTML
- ✅ Renders page

## Troubleshooting

### Page Not Found
- Check if page setting exists in Firebase
- Verify `settings.enabled` is `true`
- Check route matches exactly (case-sensitive)

### No Content Showing
- Verify data exists in Firebase collection
- Check `dataSource.collection` name matches
- Verify `contentType` is correct

### Route Not Working
- Ensure route starts with `/`
- Check middleware is routing correctly
- Verify subdomain is detected

## Best Practices

1. **Use descriptive page types**: `testimonial`, `about`, `contact`, `blog`
2. **Keep routes consistent**: Use lowercase, hyphens for spaces
3. **Enable pages gradually**: Start with `enabled: false`, test, then enable
4. **Cache page settings**: Store in memory/Redis for performance
5. **Validate routes**: Ensure no conflicts with standard pages
