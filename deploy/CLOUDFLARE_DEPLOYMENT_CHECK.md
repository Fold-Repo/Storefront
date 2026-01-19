# Cloudflare and Deployment Issues

## Important: SSH Lag vs Deployment Issues

**SSH lag is NOT caused by Cloudflare!**

- SSH connects directly to your server IP (`145.241.251.29`)
- Cloudflare only affects HTTP/HTTPS traffic (port 80/443)
- SSH uses port 22, which bypasses Cloudflare completely

## However: Cloudflare CAN Affect Deployment If...

### 1. DNS Not Fully Propagated

If you just changed DNS to point to Cloudflare, it might not be ready yet.

**Check:**
```bash
# Check DNS propagation
dig yourdomain.com
nslookup yourdomain.com

# Check if Cloudflare is active
curl -I http://yourdomain.com
# Should show: CF-RAY header (Cloudflare is active)
```

### 2. Cloudflare SSL Mode Issues

If Cloudflare SSL mode is wrong, HTTPS won't work.

**Check in Cloudflare Dashboard:**
- SSL/TLS mode should be: **"Full (strict)"** or **"Full"**
- NOT "Flexible" (causes issues)

### 3. Deployment Not Actually Completed

The deployment might have failed or not finished.

**Check on server:**
```bash
# SSH into server
ssh ubuntu@145.241.251.29

# Check if app is running
pm2 status

# Check logs
pm2 logs storefront --lines 50

# Test locally
curl http://localhost:3000
```

## Step-by-Step: Verify Deployment

### Step 1: Check if Deployment Completed

**On your LOCAL machine, check deployment script output:**
- Did it show `[5/5] Cleaning up...`?
- Did it say "Deployment successful"?
- Any error messages?

### Step 2: Verify App is Running on Server

```bash
# SSH into server
ssh ubuntu@145.241.251.29

# Check PM2
pm2 status
# Should show: storefront | online

# Check if app responds
curl http://localhost:3000
# Should return HTML (not error)
```

### Step 3: Check Nginx Configuration

```bash
# On server
sudo systemctl status nginx
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Step 4: Check Cloudflare DNS

**In Cloudflare Dashboard:**

1. Go to: **DNS → Records**
2. Check A record:
   - **Name:** `@` or `yourdomain.com`
   - **Type:** A
   - **Content:** `145.241.251.29` (your server IP)
   - **Proxy status:** 🟠 Proxied (orange cloud) or ⚪ DNS only (gray cloud)

3. Check www record:
   - **Name:** `www`
   - **Type:** A or CNAME
   - **Content:** `145.241.251.29` or `yourdomain.com`
   - **Proxy status:** Same as above

### Step 5: Check Cloudflare SSL/TLS

**In Cloudflare Dashboard:**

1. Go to: **SSL/TLS → Overview**
2. **SSL/TLS encryption mode:** Should be **"Full (strict)"** or **"Full"**
3. **NOT "Flexible"** (this causes issues)

## Common Issues

### Issue 1: "502 Bad Gateway" or "Connection Refused"

**Cause:** App not running on server

**Fix:**
```bash
# On server
pm2 restart storefront
pm2 logs storefront
```

### Issue 2: "SSL Error" or "Not Secure"

**Cause:** Cloudflare SSL mode is "Flexible"

**Fix:**
- Change Cloudflare SSL mode to "Full (strict)"
- Or use "Full" if you don't have SSL on server yet

### Issue 3: "Site Not Found" or Wrong Content

**Cause:** DNS not propagated or wrong IP

**Fix:**
- Wait 5-10 minutes for DNS propagation
- Verify A record points to `145.241.251.29`
- Check if Cloudflare proxy is enabled (orange cloud)

### Issue 4: Deployment Script Stuck

**Cause:** SSH connection issues or server problems

**Fix:**
- Check SSH connection: `ssh ubuntu@145.241.251.29`
- Check server resources: `top` (on server)
- Check disk space: `df -h` (on server)

## Quick Diagnostic

### Test Direct IP (Bypasses Cloudflare)

```bash
# Test directly to server IP
curl -I http://145.241.251.29

# Should return HTTP response (not error)
```

### Test Through Cloudflare

```bash
# Test through domain
curl -I http://yourdomain.com

# Should return HTTP response with CF-RAY header
```

### Compare Results

- **If direct IP works but domain doesn't:** Cloudflare/DNS issue
- **If both fail:** Server/app issue
- **If both work:** Everything is fine!

## Fix SSH Lag (Separate Issue)

SSH lag is NOT related to Cloudflare. Fix it:

```bash
# Add to ~/.ssh/config
Host 145.241.251.29
    UseDNS no
    GSSAPIAuthentication no
    Compression yes
```

## Summary

**SSH Lag:**
- ❌ NOT caused by Cloudflare
- ✅ Usually DNS lookups or network latency
- ✅ Fix: Add `UseDNS no` to SSH config

**Deployment Issues:**
- ✅ Could be Cloudflare if DNS/SSL wrong
- ✅ Could be app not running on server
- ✅ Check: PM2 status, Nginx, Cloudflare settings

**Next Steps:**
1. Verify deployment completed (check PM2 on server)
2. Test app directly: `curl http://localhost:3000` (on server)
3. Check Cloudflare DNS and SSL settings
4. Fix SSH lag separately (SSH config)
