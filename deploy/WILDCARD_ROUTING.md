# Wildcard Subdomain Routing Configuration

## Overview

The Nginx configuration supports **wildcard subdomain routing** for multi-store functionality. This allows any subdomain (e.g., `store1.dfoldlab.co.uk`, `store2.dfoldlab.co.uk`) to automatically route to your Next.js application, which then handles the storefront routing logic.

## How It Works

### 1. DNS Level
- **Wildcard DNS Record**: `*.dfoldlab.co.uk` → Server IP
- All subdomains point to the same server
- No need to create individual DNS records for each store

### 2. Nginx Level
- **Wildcard Server Block**: `server_name *.dfoldlab.co.uk;`
- Captures all subdomain requests
- Passes the full `Host` header to Next.js (critical for subdomain detection)

### 3. Next.js Middleware Level
- Extracts subdomain from `Host` header
- Routes to appropriate storefront
- Handles both subdomains and custom domains

## Nginx Configuration

The setup script creates two server blocks:

### Main Domain Block
```nginx
server {
    listen 80;
    server_name dfoldlab.co.uk www.dfoldlab.co.uk;
    # ... proxy configuration
}
```

### Wildcard Subdomain Block
```nginx
server {
    listen 80;
    server_name *.dfoldlab.co.uk;
    # ... proxy configuration
    # CRITICAL: proxy_set_header Host $host; (preserves subdomain)
}
```

## SSL Certificate Options

### Option 1: Standard Certificate (Quick Setup)
- Covers: `dfoldlab.co.uk` and `www.dfoldlab.co.uk`
- **Limitation**: Subdomains will work but browsers may show certificate warnings
- **Use case**: Development or if you only need the main domain

### Option 2: Wildcard Certificate (Recommended for Production)
- Covers: `*.dfoldlab.co.uk` (all subdomains)
- **Requires**: DNS challenge (manual TXT record)
- **Use case**: Production with multiple stores
- **Command**: 
  ```bash
  sudo certbot certonly --manual --preferred-challenges dns \
    -d dfoldlab.co.uk -d *.dfoldlab.co.uk
  ```

## DNS Configuration

### Cloudflare (Recommended)
1. Add A record: `dfoldlab.co.uk` → Server IP
2. Add A record: `*.dfoldlab.co.uk` → Server IP (wildcard)
3. Enable "Proxy" (orange cloud) for DDoS protection
4. SSL/TLS mode: Full (strict)

### Other DNS Providers
- Add A record: `*.yourdomain.com` → Server IP
- Ensure wildcard DNS is supported (most providers support this)

## Testing

### Test Subdomain Routing
```bash
# Test from server
curl -H "Host: teststore.dfoldlab.co.uk" http://localhost

# Test from browser
# Visit: http://teststore.dfoldlab.co.uk
```

### Verify Nginx Configuration
```bash
# Test Nginx config
sudo nginx -t

# Check if wildcard is configured
sudo nginx -T | grep "server_name"
```

## Troubleshooting

### Subdomains Not Working

1. **Check DNS**
   ```bash
   dig teststore.dfoldlab.co.uk
   # Should return your server IP
   ```

2. **Check Nginx Config**
   ```bash
   sudo nginx -T | grep -A 5 "server_name.*\*"
   # Should show wildcard server block
   ```

3. **Check Host Header**
   - Ensure `proxy_set_header Host $host;` is set
   - Next.js middleware needs the full hostname

4. **Check Firewall**
   ```bash
   sudo ufw status
   # Ports 80 and 443 should be open
   ```

### SSL Certificate Issues

1. **Wildcard Certificate Not Working**
   - Verify certificate includes `*.dfoldlab.co.uk`
   - Check certificate: `sudo certbot certificates`
   - Ensure Nginx SSL config uses wildcard certificate

2. **Certificate Warnings on Subdomains**
   - Standard certificate doesn't cover subdomains
   - Get wildcard certificate for production

## Production Checklist

- [ ] Wildcard DNS record configured (`*.yourdomain.com`)
- [ ] Nginx wildcard server block configured
- [ ] Wildcard SSL certificate installed (for production)
- [ ] `proxy_set_header Host $host;` is set in Nginx
- [ ] Next.js middleware is working
- [ ] Tested with multiple subdomains
- [ ] SSL auto-renewal configured

## Example: Adding a New Store

1. **No DNS changes needed** (wildcard handles it)
2. **No Nginx changes needed** (wildcard handles it)
3. **Just create the store** in your application
4. **Subdomain automatically works** (e.g., `newstore.dfoldlab.co.uk`)

## Security Considerations

- Wildcard certificates are secure and standard practice
- Each subdomain is isolated by Next.js middleware
- Consider rate limiting per subdomain
- Monitor for abuse of subdomain creation

## References

- Next.js Middleware: `middleware.ts`
- Domain Utilities: `utils/domain.ts`
- Storefront Routing: `app/storefront/[[...path]]/page.tsx`
