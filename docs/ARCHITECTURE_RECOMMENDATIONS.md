# Architecture Recommendations for Dynamic Storefronts

## 1. HTML vs Preact/React for Performance

### Recommendation: **Hybrid Approach - HTML with Client-Side Hydration**

**Why HTML is Better for Your Use Case:**

1. **GrapesJS Compatibility**: GrapesJS edits HTML directly. Using pure HTML makes editing seamless.
2. **Performance**: Static HTML loads faster, better for SEO, and works without JavaScript.
3. **Cost**: No need for React hydration overhead.
4. **Flexibility**: Can inject dynamic data via API calls without framework constraints.

**Architecture:**

```
┌─────────────────────────────────────────┐
│  AI Generates HTML/CSS/JS               │
│  (Saved to Firebase/S3)                │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Next.js Middleware                     │
│  - Detects subdomain/domain             │
│  - Loads page HTML from storage         │
│  - Injects dynamic data placeholders    │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Server-Side Rendering (SSR)            │
│  - Renders HTML with data               │
│  - Fast initial load                    │
│  - SEO-friendly                         │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Client-Side Hydration (Optional)       │
│  - Lightweight JS for interactivity     │
│  - API calls for dynamic updates        │
│  - No heavy framework needed            │
└─────────────────────────────────────────┘
```

**Implementation Strategy:**

1. **AI Generates**: Pure HTML with data placeholders (`{{products}}`, `{{menu}}`, etc.)
2. **Server Renders**: Next.js replaces placeholders with actual data
3. **Client Hydrates**: Light JavaScript for cart, search, filters (no React needed)
4. **GrapesJS Edits**: Edits the HTML directly, saves back to storage

## 2. Storage Recommendations

### Option 1: **Hybrid Approach (Recommended)**

**Firebase Firestore** (for editing/metadata) + **S3/CDN** (for serving pages)

**Pros:**
- ✅ Fast reads from CDN (cheaper than Firestore reads)
- ✅ Firebase for real-time editing with GrapesJS
- ✅ Better cost at scale
- ✅ Better performance (CDN caching)

**Cost Comparison (1M page views/month):**
- Firestore reads: $0.06 per 100K = $0.60
- S3 + CloudFront: ~$0.10-0.20
- **Total: ~$0.70-0.80/month**

**vs Pure Firestore:**
- Firestore reads: $0.06 per 100K = $6.00
- **10x more expensive!**

### Option 2: **Supabase (PostgreSQL + Storage)**

**Pros:**
- ✅ Cheaper than Firestore
- ✅ Better for complex queries
- ✅ Built-in storage (S3-compatible)
- ✅ Real-time subscriptions
- ✅ Better performance

**Cost:**
- Free tier: 500MB database, 1GB storage
- Pro: $25/month (8GB database, 100GB storage)
- **Much cheaper than Firestore at scale**

### Option 3: **Vercel Blob + Postgres**

**Pros:**
- ✅ Integrated with Next.js
- ✅ Edge caching
- ✅ Simple setup

**Cost:**
- Blob: $0.15/GB storage, $0.40/GB bandwidth
- Postgres: $20/month (256GB)

### **Final Recommendation: Supabase**

**Why Supabase:**
1. **Cost**: 10x cheaper than Firestore for reads
2. **Performance**: PostgreSQL is faster for queries
3. **Storage**: Built-in S3-compatible storage
4. **Real-time**: WebSocket support for live editing
5. **Scalability**: Better for high traffic

**Migration Path:**
- Keep Firebase for auth (if already set up)
- Use Supabase for page storage and data
- Or migrate everything to Supabase

## 3. Dynamic Data Architecture

### Data Flow

```
User visits: mystore.yourdomain.com/products
                    │
                    ▼
        ┌───────────────────────┐
        │  Next.js Middleware   │
        │  - Extract subdomain   │
        │  - Load site config   │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Load Page HTML       │
        │  from Supabase/S3     │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Fetch Dynamic Data   │
        │  - Products API        │
        │  - Menu API            │
        │  - Footer links API    │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Inject Data          │
        │  - Replace {{data}}   │
        │  - Server-side render │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Send to Client       │
        │  - Fast initial load  │
        │  - SEO-friendly       │
        └───────────────────────┘
```

### Page Structure with Data Placeholders

**Generated HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>{{pageTitle}}</title>
  <meta name="description" content="{{pageDescription}}">
</head>
<body>
  <nav>
    {{menuItems}}
  </nav>
  
  <main>
    {{pageContent}}
    
    <!-- Products page example -->
    <div id="products-container">
      {{products}}
    </div>
  </main>
  
  <footer>
    {{footerLinks}}
  </footer>
  
  <script>
    // Lightweight JS for interactivity
    // No heavy framework needed
  </script>
</body>
</html>
```

## 4. Implementation Plan

### Phase 1: Storage Migration (Optional)
- [ ] Set up Supabase project
- [ ] Create tables for pages, sites, settings
- [ ] Migrate existing Firebase data
- [ ] Update save/load functions

### Phase 2: Subdomain Routing
- [ ] Create Next.js middleware
- [ ] Detect subdomain/domain
- [ ] Route to appropriate storefront
- [ ] Load site configuration

### Phase 3: Dynamic Data Injection
- [ ] Create API routes for data fetching
- [ ] Update page rendering to inject data
- [ ] Add caching layer
- [ ] Optimize performance

### Phase 4: Client-Side Interactivity
- [ ] Add lightweight JS for cart
- [ ] Implement search/filter functionality
- [ ] Add form handling
- [ ] Optimize bundle size

## 5. Cost Analysis

### Scenario: 1,000 storefronts, 10K page views/month each

**Firebase Firestore:**
- Reads: 10M × $0.06/100K = $6,000/month
- Writes: 1K × $0.18/100K = $1.80/month
- Storage: 10GB × $0.18/GB = $1.80/month
- **Total: ~$6,003/month**

**Supabase:**
- Database: $25/month (Pro plan)
- Storage: 10GB included
- Bandwidth: Included
- **Total: $25/month**

**Savings: 99.6% cheaper with Supabase!**

### Recommendation: **Migrate to Supabase**
