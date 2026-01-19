# Server Back Up - Next Steps

## Step 1: Verify Server is Accessible

### Test SSH Connection

```bash
# Test SSH (with your key if using Oracle key)
ssh -i ~/Downloads/your-oracle-key.key ubuntu@145.241.251.29

# Or with default key
ssh ubuntu@145.241.251.29
```

**If SSH works, continue. If not, check:**
- Oracle Cloud Security Lists (port 22 must be open)
- Server is actually running
- Correct IP address

### Test Server Response

```bash
# Test if server responds
ping 145.241.251.29

# Test HTTP (if Nginx is running)
curl -I http://145.241.251.29
```

## Step 2: Check Current Deployment Status

### Check if App is Already Running

```bash
# SSH into server
ssh ubuntu@145.241.251.29

# Check PM2 status
pm2 status

# Check if app is running
curl http://localhost:3000
```

**Results:**
- ✅ **If PM2 shows "storefront | online"** → App is running, you're good!
- ❌ **If PM2 shows nothing or "stopped"** → Need to deploy

### Check Deployment Directory

```bash
# On server
ls -la /var/www/storefront

# Check if .next directory exists
ls -la /var/www/storefront/.next
```

## Step 3: Deploy (If Needed)

### If App is NOT Running

**Option A: Quick Deploy (if code is already on server)**

```bash
# SSH into server
ssh ubuntu@145.241.251.29

# Navigate to app directory
cd /var/www/storefront

# Install dependencies
npm ci --production

# Build (if needed)
npm run build

# Start/restart PM2
pm2 restart storefront || pm2 start ecosystem.config.js --env production
pm2 save
```

**Option B: Full Deployment from Local PC**

```bash
# On your LOCAL PC
export SERVER_IP=145.241.251.29
export SSH_KEY=~/Downloads/your-oracle-key.key  # If using Oracle key

# Run deployment script
./deploy/deploy-manual.sh
```

## Step 4: Verify Deployment

### Check App Status

```bash
# On server
pm2 status
pm2 logs storefront --lines 20

# Test app
curl http://localhost:3000
```

### Check Nginx

```bash
# On server
sudo systemctl status nginx
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Test from Browser

- Direct IP: `http://145.241.251.29`
- Domain (if configured): `http://yourdomain.com`

## Step 5: Fix Any Issues

### If PM2 App Won't Start

```bash
# Check logs
pm2 logs storefront --err

# Check environment variables
pm2 env storefront

# Check if .env.production exists
cat /var/www/storefront/.env.production

# Restart
pm2 restart storefront
```

### If Nginx Shows 502 Error

```bash
# Check if app is running
pm2 status

# Check if app responds
curl http://localhost:3000

# If not, restart app
pm2 restart storefront
```

### If Port 3000 Not Listening

```bash
# Check what's using port 3000
sudo ss -tulpn | grep 3000

# Check PM2
pm2 status
pm2 restart storefront
```

## Quick Checklist

- [ ] Server is accessible via SSH
- [ ] PM2 is installed and running
- [ ] App is deployed to `/var/www/storefront`
- [ ] `.env.production` exists with API keys
- [ ] PM2 shows app as "online"
- [ ] App responds: `curl http://localhost:3000`
- [ ] Nginx is running and configured
- [ ] Website accessible from browser

## Most Likely Next Step

**If deployment was interrupted:**

1. **Check if app is running:**
   ```bash
   ssh ubuntu@145.241.251.29 'pm2 status'
   ```

2. **If not running, deploy:**
   ```bash
   # On local PC
   export SERVER_IP=145.241.251.29
   export SSH_KEY=~/Downloads/your-oracle-key.key
   ./deploy/deploy-manual.sh
   ```

3. **If running, verify:**
   ```bash
   ssh ubuntu@145.241.251.29 'curl -I http://localhost:3000'
   ```

## Summary

**Server is back up - now:**

1. ✅ **Test SSH** - Make sure you can connect
2. ✅ **Check deployment status** - Is app running?
3. ✅ **Deploy if needed** - Run deployment script
4. ✅ **Verify** - Check PM2, test website

**Quick command to check everything:**
```bash
ssh ubuntu@145.241.251.29 'pm2 status && curl -I http://localhost:3000 && sudo systemctl status nginx --no-pager | head -5'
```
