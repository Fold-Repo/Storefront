# Cloudflare DNS Setup Guide

## Overview

This guide shows you how to configure Cloudflare DNS for the storefront platform with multi-store subdomain routing.

## Domain Structure

- **Main Platform**: `dfoldlab.co.uk` (dashboard, admin, authentication)
- **Store Subdomains**: `*.dfoldlab.co.uk` (e.g., `mystore.dfoldlab.co.uk`, `shop1.dfoldlab.co.uk`)
- **General Website**: `dfoldlab.com` (handled separately, not in this setup)

## Step-by-Step Cloudflare Setup

### 1. Add Domain to Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Add a Site"**
3. Enter `dfoldlab.co.uk`
4. Select a plan (Free tier is sufficient)
5. Cloudflare will scan your existing DNS records

### 2. Update Nameservers

1. Cloudflare will provide you with nameservers (e.g., `alice.ns.cloudflare.com`, `bob.ns.cloudflare.com`)
2. Go to your domain registrar (where you bought `dfoldlab.co.uk`)
3. Update nameservers to Cloudflare's nameservers
4. Wait for DNS propagation (usually 5-30 minutes)

### 3. Configure DNS Records

Once nameservers are updated, add these DNS records in Cloudflare:

#### Required Records

| Type | Name | Content | Proxy Status | TTL |
|------|------|--------|--------------|-----|
| A | `dfoldlab.co.uk` | `YOUR_SERVER_IP` | 🟠 Proxied | Auto |
| A | `www` | `YOUR_SERVER_IP` | 🟠 Proxied | Auto |
| A | `*` | `YOUR_SERVER_IP` | 🟠 Proxied | Auto |

**Important Notes:**
- Replace `YOUR_SERVER_IP` with your Oracle Cloud server's public IP
- The `*` record is the **wildcard** that handles all subdomains
- **Proxy Status**: Enable (orange cloud) for DDoS protection and CDN

### 4. SSL/TLS Configuration

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to **"Full (strict)"**
3. This ensures end-to-end encryption

### 5. Automatic SSL Certificate

Cloudflare will automatically issue SSL certificates for:
- `dfoldlab.co.uk`
- `*.dfoldlab.co.uk` (wildcard)
- `www.dfoldlab.co.uk`

**No manual certificate setup needed!** Cloudflare handles it automatically.

## DNS Record Details

### Main Domain Record

```
Type: A
Name: @ (or dfoldlab.co.uk)
Content: YOUR_SERVER_IP
Proxy: 🟠 Proxied (enabled)
TTL: Auto
```

### WWW Record (Optional)

```
Type: A
Name: www
Content: YOUR_SERVER_IP
Proxy: 🟠 Proxied (enabled)
TTL: Auto
```

### Wildcard Record (Critical for Multi-Store)

```
Type: A
Name: *
Content: YOUR_SERVER_IP
Proxy: 🟠 Proxied (enabled)
TTL: Auto
```

**What this does:**
- Handles ALL subdomains: `store1.dfoldlab.co.uk`, `mystore.dfoldlab.co.uk`, etc.
- No need to create individual DNS records for each store
- Automatically routes any subdomain to your server

## How It Works

### Request Flow

1. **User visits**: `mystore.dfoldlab.co.uk`
2. **DNS lookup**: Cloudflare resolves `*.dfoldlab.co.uk` → Your server IP
3. **Request reaches server**: Nginx receives request with `Host: mystore.dfoldlab.co.uk`
4. **Nginx routing**: Wildcard server block handles it
5. **Next.js middleware**: Extracts subdomain (`mystore`) and routes to storefront

### Example Subdomains

All of these will automatically work (no DNS changes needed):

- `store1.dfoldlab.co.uk` ✅
- `mystore.dfoldlab.co.uk` ✅
- `shop.dfoldlab.co.uk` ✅
- `test-store.dfoldlab.co.uk` ✅
- `anything.dfoldlab.co.uk` ✅

## Cloudflare Settings

### Recommended Settings

1. **SSL/TLS**
   - Encryption mode: **Full (strict)**
   - Always Use HTTPS: **On**
   - Minimum TLS Version: **1.2**

2. **Speed**
   - Auto Minify: Enable for JS, CSS, HTML
   - Brotli: Enable

3. **Caching**
   - Caching Level: **Standard**
   - Browser Cache TTL: **4 hours**

4. **Security**
   - Security Level: **Medium**
   - Bot Fight Mode: **On** (Free tier)
   - Challenge Passage: **30 minutes**

### Page Rules (Optional)

Create a page rule for API routes to bypass cache:

```
URL: dfoldlab.co.uk/api/*
Settings:
  - Cache Level: Bypass
```

## Testing DNS Configuration

### 1. Check DNS Resolution

```bash
# Check main domain
dig dfoldlab.co.uk

# Check wildcard
dig store1.dfoldlab.co.uk

# Check from different location
nslookup dfoldlab.co.uk 8.8.8.8
```

### 2. Verify Cloudflare Proxy

```bash
# Check if Cloudflare is proxying
curl -I https://dfoldlab.co.uk

# Should see Cloudflare headers:
# CF-Ray: xxxxx
# Server: cloudflare
```

### 3. Test Subdomain

```bash
# Test any subdomain
curl -I https://teststore.dfoldlab.co.uk

# Should return 200 OK (or your app's response)
```

## Troubleshooting

### Subdomains Not Working

1. **Check DNS Records**
   - Verify wildcard `*` record exists
   - Ensure it points to correct server IP
   - Check Proxy is enabled (orange cloud)

2. **Check DNS Propagation**
   ```bash
   dig store1.dfoldlab.co.uk
   # Should return your server IP
   ```

3. **Check Nginx Config**
   ```bash
   sudo nginx -T | grep "server_name"
   # Should show wildcard server block
   ```

4. **Check Cloudflare Proxy**
   - Disable proxy temporarily (gray cloud)
   - Test if subdomain works
   - Re-enable proxy (orange cloud)

### SSL Certificate Issues

1. **Check SSL Status**
   - Go to Cloudflare → SSL/TLS → Overview
   - Should show "Full (strict)" and valid certificate

2. **Force SSL**
   - Enable "Always Use HTTPS" in SSL/TLS settings
   - Create page rule: `http://*dfoldlab.co.uk/*` → Always Use HTTPS

### Performance Issues

1. **Disable Cloudflare Proxy Temporarily**
   - Change DNS record from 🟠 Proxied to ⚪ DNS only
   - Test if issue persists
   - If fixed, it's a Cloudflare caching issue

2. **Purge Cache**
   - Go to Caching → Configuration
   - Click "Purge Everything"

## Security Considerations

### DDoS Protection

- **Proxy enabled** (orange cloud) provides DDoS protection
- Cloudflare automatically blocks malicious traffic
- Free tier includes basic DDoS protection

### Rate Limiting

- Consider setting up rate limiting rules
- Protect API endpoints from abuse
- Cloudflare Pro plan includes advanced rate limiting

### Firewall Rules

Create firewall rules to:
- Block known bad IPs
- Rate limit per IP
- Protect specific endpoints

## Cost

- **Free Tier**: Sufficient for most use cases
  - Unlimited DNS records
  - Free SSL certificates
  - Basic DDoS protection
  - CDN included

- **Pro Tier** ($20/month): If you need
  - Advanced rate limiting
  - Image optimization
  - Advanced analytics

## Quick Reference

### DNS Records Summary

```
dfoldlab.co.uk          A    → YOUR_SERVER_IP  (🟠 Proxied)
www.dfoldlab.co.uk      A    → YOUR_SERVER_IP  (🟠 Proxied)
*.dfoldlab.co.uk        A    → YOUR_SERVER_IP  (🟠 Proxied)
```

### Server IP

Get your server IP:
```bash
curl ifconfig.me
```

### Verify Setup

```bash
# Test main domain
curl -I https://dfoldlab.co.uk

# Test any subdomain
curl -I https://teststore.dfoldlab.co.uk

# Check DNS
dig dfoldlab.co.uk
dig *.dfoldlab.co.uk
```

## Next Steps

After DNS is configured:

1. ✅ Run the deployment script on your server
2. ✅ SSL certificates will be handled by Cloudflare
3. ✅ Test subdomain routing
4. ✅ Create your first store and test

## Support

- Cloudflare Docs: https://developers.cloudflare.com/dns/
- Cloudflare Community: https://community.cloudflare.com/
