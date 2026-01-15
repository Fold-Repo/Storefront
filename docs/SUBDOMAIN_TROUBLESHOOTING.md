# Subdomain Troubleshooting Guide

## Issue: Subdomain Shows Default Hosting Page

If visiting `https://marketplaces.dfoldlab.co.uk/` shows the default hosting page instead of your storefront, check the following:

### 1. **Next.js Middleware/Proxy Configuration**

Next.js requires middleware to be in a file named `middleware.ts` (not `proxy.ts`). 

**Solution**: Rename `proxy.ts` to `middleware.ts` and update the export:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'dfoldlab.co.uk';

export function middleware(request: NextRequest) {
  // ... (same logic as proxy function)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 2. **Environment Variables**

Ensure `NEXT_PUBLIC_MAIN_DOMAIN` is set correctly in your production environment:

```bash
NEXT_PUBLIC_MAIN_DOMAIN=dfoldlab.co.uk
```

**Important**: 
- Use `NEXT_PUBLIC_` prefix for client-side access
- Do NOT include `https://` - just the domain name
- Restart your Next.js server after changing environment variables

### 3. **DNS Configuration**

Verify DNS settings for the subdomain:

1. **A Record**: Point `marketplaces.dfoldlab.co.uk` to your server IP
2. **Wildcard Record**: Consider adding `*.dfoldlab.co.uk` → Server IP for all subdomains

Check DNS with:
```bash
nslookup marketplaces.dfoldlab.co.uk
dig marketplaces.dfoldlab.co.uk +short
```

### 4. **Server Configuration**

If using a reverse proxy (Nginx, Apache, etc.), ensure:

1. **Virtual Host** is configured for `*.dfoldlab.co.uk`
2. **Proxy Pass** points to your Next.js server (usually `http://localhost:3000`)
3. **Host Header** is preserved

Example Nginx config:
```nginx
server {
    listen 80;
    server_name *.dfoldlab.co.uk dfoldlab.co.uk;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. **Firebase Storefront Data**

Verify the storefront exists in Firebase:

1. Check Firestore collection `storefront_sites`
2. Ensure document has:
   - `subdomain: "marketplaces"`
   - `pages` object with at least `homepage` key
   - Valid `html` and `css` for each page

### 6. **Debugging Steps**

Enable debug logging in `proxy.ts`/`middleware.ts`:

```typescript
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  console.log('🔍 Middleware triggered:', { 
    hostname, 
    pathname: request.nextUrl.pathname,
    MAIN_DOMAIN: process.env.NEXT_PUBLIC_MAIN_DOMAIN 
  });
  // ... rest of logic
}
```

Check server logs when visiting the subdomain to see:
- Is middleware being triggered?
- Is subdomain being extracted correctly?
- Is storefront config being loaded?

### 7. **Common Issues**

#### Issue: "Default hosting page" appears
**Cause**: Request not reaching Next.js server
**Solution**: Check DNS and server configuration

#### Issue: 404 Not Found
**Cause**: Storefront not found in Firebase
**Solution**: Verify storefront exists with correct subdomain

#### Issue: Blank page
**Cause**: Storefront pages missing HTML/CSS
**Solution**: Regenerate storefront or check Firebase data

### 8. **Testing Locally**

Test subdomain routing locally:

1. Add to `/etc/hosts`:
   ```
   127.0.0.1 marketplaces.dfoldlab.co.uk
   ```

2. Visit `http://marketplaces.dfoldlab.co.uk:3000`

3. Check server logs for middleware execution

### 9. **Production Deployment Checklist**

- [ ] `NEXT_PUBLIC_MAIN_DOMAIN` set in production environment
- [ ] `middleware.ts` (or `proxy.ts`) exists and exports correctly
- [ ] DNS records point to server IP
- [ ] Server configured to handle subdomains
- [ ] Storefront data exists in Firebase
- [ ] Firebase security rules allow read access
- [ ] Next.js server is running and accessible

### 10. **Quick Fix Commands**

```bash
# Check if middleware is recognized
ls -la middleware.ts

# Check environment variables
echo $NEXT_PUBLIC_MAIN_DOMAIN

# Test DNS
nslookup marketplaces.dfoldlab.co.uk

# Check Next.js logs
tail -f .next/server.log
```

---

## Recent Fixes Applied

1. ✅ **Fixed `loadStorefrontConfigFromFirebase`**: Now actually queries Firebase by subdomain
2. ✅ **Fixed `loadStorefrontPageFromFirebase`**: Now loads pages from Firebase correctly
3. ✅ **Added debug logging**: To help identify where requests are failing
4. ✅ **Updated domain fallback**: Changed to `dfoldlab.co.uk`

If issues persist, check server logs and Firebase console for errors.
