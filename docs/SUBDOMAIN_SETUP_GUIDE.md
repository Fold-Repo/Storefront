# Subdomain Setup & Configuration Guide

## Overview

Subdomain handling requires **two parts**:
1. **DNS Configuration** - Point subdomains to your server
2. **Application Routing** - Detect and route subdomains (already implemented)

## Current Implementation Status

✅ **Application routing is already implemented** in `middleware.ts`
- Detects subdomain from request headers
- Routes to appropriate storefront
- Works with both subdomains and custom domains

❌ **DNS configuration needs to be set up** (this guide covers that)

## How Subdomains Work

### 1. DNS Level (What You Need to Configure)

When a user visits `mystore.yourdomain.com`:
1. Browser queries DNS for `mystore.yourdomain.com`
2. DNS returns your server's IP address
3. Request goes to your server with `Host: mystore.yourdomain.com` header
4. Your middleware detects the subdomain and routes accordingly

### 2. Application Level (Already Implemented)

Your `middleware.ts` already handles:
- Extracting subdomain from `Host` header
- Routing to storefront pages
- Supporting custom domains

## DNS Provider Options

### Option 1: Cloudflare (Recommended) ⭐

**Why Cloudflare:**
- ✅ **Free wildcard subdomains** (unlimited)
- ✅ **Free SSL certificates** (automatic)
- ✅ **DDoS protection** (included)
- ✅ **CDN** (faster loading)
- ✅ **Easy API** for programmatic subdomain creation
- ✅ **DNS management** via API
- ✅ **Page Rules** for routing

**Cost:** Free tier is sufficient for most use cases

**Setup:**
1. Point your domain to Cloudflare nameservers
2. Add A record: `*.yourdomain.com` → Your server IP
3. Add A record: `yourdomain.com` → Your server IP
4. Enable SSL (automatic)

**API for Dynamic Subdomain Creation:**
```typescript
// Create subdomain programmatically
const response = await fetch('https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'A',
    name: 'mystore', // subdomain
    content: 'YOUR_SERVER_IP',
    ttl: 1, // auto
  }),
});
```

### Option 2: AWS Route 53

**Why Route 53:**
- ✅ **Highly reliable** (AWS infrastructure)
- ✅ **API for automation**
- ✅ **Health checks**
- ✅ **Geographic routing**

**Cost:** ~$0.50/month per hosted zone + $0.40 per million queries

**Setup:**
1. Create hosted zone for your domain
2. Update nameservers at your registrar
3. Create wildcard record: `*.yourdomain.com` → Your server IP

**API for Dynamic Subdomain Creation:**
```typescript
// Using AWS SDK
import { Route53Client, ChangeResourceRecordSetsCommand } from '@aws-sdk/client-route53';

const client = new Route53Client({ region: 'us-east-1' });

await client.send(new ChangeResourceRecordSetsCommand({
  HostedZoneId: 'YOUR_ZONE_ID',
  ChangeBatch: {
    Changes: [{
      Action: 'CREATE',
      ResourceRecordSet: {
        Name: 'mystore.yourdomain.com',
        Type: 'A',
        TTL: 300,
        ResourceRecords: [{ Value: 'YOUR_SERVER_IP' }],
      },
    }],
  },
}));
```

### Option 3: DigitalOcean DNS

**Why DigitalOcean:**
- ✅ **Simple and affordable**
- ✅ **API for automation**
- ✅ **Good for DO hosting**

**Cost:** Free with DigitalOcean hosting

**Setup:**
1. Add domain to DigitalOcean
2. Create wildcard A record: `*.yourdomain.com` → Your server IP

### Option 4: Namecheap / GoDaddy / Other Registrars

**Why Use:**
- ✅ **Simple** if domain is already there
- ✅ **No additional cost**

**Limitations:**
- ❌ **Limited API support**
- ❌ **Manual subdomain creation**
- ❌ **May not support wildcards**

**Setup:**
1. Add wildcard A record: `*.yourdomain.com` → Your server IP
2. Manual subdomain creation (or use API if available)

## Recommended Setup: Cloudflare

### Step 1: Add Domain to Cloudflare

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Add your domain
3. Update nameservers at your registrar (Cloudflare will provide them)

### Step 2: Configure DNS Records

**Option A: Wildcard (Recommended)**

Create a single wildcard record that handles all subdomains:

```
Type: A
Name: *
Content: YOUR_SERVER_IP
Proxy: Enabled (orange cloud) - for CDN and protection
TTL: Auto
```

**Option B: Individual Records (If needed)**

Create individual records for each subdomain:

```
Type: A
Name: mystore
Content: YOUR_SERVER_IP
Proxy: Enabled
```

### Step 3: Enable SSL

1. Go to SSL/TLS settings
2. Set to "Full" or "Full (strict)"
3. Cloudflare automatically provisions SSL certificates

### Step 4: Configure Page Rules (Optional)

For better routing, you can add page rules:

```
URL: *.yourdomain.com/*
Setting: Forwarding URL
Destination: https://yourdomain.com/storefront/$1
Status Code: 301
```

**Note:** This is optional - your middleware already handles routing.

## Programmatic Subdomain Creation

### Using Cloudflare API

Create a service to handle subdomain creation:

```typescript
// services/subdomain.ts
interface CreateSubdomainParams {
  subdomain: string;
  serverIp: string;
}

export async function createSubdomain(params: CreateSubdomainParams) {
  const { subdomain, serverIp } = params;
  
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'A',
        name: subdomain,
        content: serverIp,
        ttl: 1, // auto
        proxied: true, // Enable Cloudflare proxy
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create subdomain');
  }

  return await response.json();
}
```

### Environment Variables

Add to `.env.local`:

```env
# Cloudflare
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id

# Server IP (for DNS records)
SERVER_IP=your_server_ip_address
```

## Server Configuration

### For Vercel Deployment

Vercel automatically handles subdomains if:
1. Domain is added to Vercel project
2. DNS points to Vercel
3. Wildcard domain is configured in Vercel dashboard

**Steps:**
1. Go to Vercel project settings
2. Add domain: `yourdomain.com`
3. Add wildcard: `*.yourdomain.com`
4. Update DNS to point to Vercel (they provide nameservers)

### For Custom Server (Node.js/Next.js)

Your middleware already handles subdomain detection. Just ensure:

1. **Server listens on all interfaces:**
```typescript
// next.config.ts or server setup
// Already handled by Next.js
```

2. **Environment variables:**
```env
NEXT_PUBLIC_MAIN_DOMAIN=yourdomain.com
NEXT_PUBLIC_STOREFRONT_DOMAIN=yourdomain.com
```

3. **Deploy with proper domain configuration**

### For Docker/Kubernetes

Ensure:
- Ingress controller handles subdomains
- DNS points to ingress IP
- SSL certificates are configured (Let's Encrypt)

## Custom Domain Support

For users who want to use their own domain (e.g., `mystore.com` instead of `mystore.yourdomain.com`):

### Option 1: CNAME Record (Recommended)

User adds CNAME record:
```
Type: CNAME
Name: @ (or www)
Target: mystore.yourdomain.com
```

Your server detects custom domain via middleware.

### Option 2: A Record

User adds A record pointing to your server IP:
```
Type: A
Name: @
Content: YOUR_SERVER_IP
```

Then add domain mapping in your database:
```typescript
// Store custom domain → subdomain mapping
await saveDomainMapping({
  customDomain: 'mystore.com',
  subdomain: 'mystore',
  storefrontId: 'mystore',
});
```

## Complete Implementation Example

### 1. Create Subdomain Service

```typescript
// services/subdomain.ts
import { createSubdomain } from './cloudflare'; // or your DNS provider

export async function setupStorefrontSubdomain(
  subdomain: string,
  storefrontId: string
) {
  try {
    // Create DNS record
    await createSubdomain({
      subdomain,
      serverIp: process.env.SERVER_IP!,
    });

    // Store subdomain mapping in database
    await saveSubdomainMapping({
      subdomain,
      storefrontId,
      status: 'active',
    });

    return { success: true, subdomain: `${subdomain}.yourdomain.com` };
  } catch (error) {
    console.error('Error setting up subdomain:', error);
    throw error;
  }
}
```

### 2. API Route for Subdomain Creation

```typescript
// app/api/storefront/[storefrontId]/subdomain/route.ts
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { storefrontId } = params;
  const { subdomain } = await request.json();

  // Validate subdomain format
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(subdomain)) {
    return NextResponse.json(
      { error: 'Invalid subdomain format' },
      { status: 400 }
    );
  }

  // Check if subdomain is available
  const exists = await checkSubdomainExists(subdomain);
  if (exists) {
    return NextResponse.json(
      { error: 'Subdomain already taken' },
      { status: 409 }
    );
  }

  // Create subdomain
  const result = await setupStorefrontSubdomain(subdomain, storefrontId);

  return NextResponse.json(result);
}
```

### 3. Update Wizard to Create Subdomain

```typescript
// In your wizard completion handler
const handleWizardComplete = async (data: StorefrontData) => {
  // ... existing code ...

  // Create subdomain
  try {
    await fetch(`/api/storefront/${data.subdomain}/subdomain`, {
      method: 'POST',
      body: JSON.stringify({ subdomain: data.subdomain }),
    });
  } catch (error) {
    console.error('Error creating subdomain:', error);
    // Continue anyway - subdomain might already exist
  }
};
```

## Testing Locally

### Option 1: Edit /etc/hosts

Add to `/etc/hosts` (Mac/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 mystore.localhost
127.0.0.1 teststore.localhost
```

Then visit: `http://mystore.localhost:3000`

### Option 2: Use ngrok or similar

1. Install ngrok: `npm install -g ngrok`
2. Run: `ngrok http 3000`
3. Use ngrok subdomain: `mystore.ngrok.io`

## Cost Comparison

| Provider | Cost | Wildcard Support | API | SSL |
|----------|------|------------------|-----|-----|
| **Cloudflare** | Free | ✅ Yes | ✅ Yes | ✅ Free |
| **AWS Route 53** | ~$0.50/mo | ✅ Yes | ✅ Yes | ✅ Via ACM |
| **DigitalOcean** | Free* | ✅ Yes | ✅ Yes | ✅ Via Let's Encrypt |
| **Namecheap** | Free | ⚠️ Limited | ❌ No | ❌ Manual |
| **GoDaddy** | Free | ⚠️ Limited | ⚠️ Limited | ❌ Manual |

*Free with DigitalOcean hosting

## Final Recommendation

### Use Cloudflare ⭐

**Reasons:**
1. ✅ **Free wildcard subdomains** (unlimited)
2. ✅ **Free SSL** (automatic)
3. ✅ **API for automation**
4. ✅ **DDoS protection**
5. ✅ **CDN included**
6. ✅ **Easy setup**

**Setup Steps:**
1. Add domain to Cloudflare
2. Update nameservers
3. Add wildcard A record: `*` → Your server IP
4. Enable SSL
5. Use API to create subdomains programmatically

## Next Steps

1. **Choose DNS provider** (recommend Cloudflare)
2. **Set up wildcard DNS record**
3. **Create subdomain service** (optional, for automation)
4. **Test with local hosts file**
5. **Deploy and configure production DNS**

Your middleware is already set up - you just need DNS configuration!
