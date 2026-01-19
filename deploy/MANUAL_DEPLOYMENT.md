# Manual Deployment Guide

## Quick Answer

**Yes, deploy manually first!** Then set up GitHub Actions auto-deployment later once everything is working.

## Why Manual Deployment First?

- ✅ Avoids SSH timeout issues during long builds
- ✅ Lets you verify everything works before automating
- ✅ Easier to debug issues
- ✅ Build locally (faster) then deploy

## Manual Deployment Steps

### Option 1: Build Locally, Deploy to Server (Recommended)

This avoids SSH timeout issues:

```bash
# 1. Build locally (on your machine)
npm run build

# 2. Create deployment package
tar -czf deploy-package.tar.gz \
  .next \
  public \
  package.json \
  package-lock.json \
  next.config.ts \
  tsconfig.json \
  ecosystem.config.js

# 3. Copy to server
scp deploy-package.tar.gz ubuntu@your-server-ip:/tmp/

# 4. SSH and deploy
ssh ubuntu@your-server-ip
cd /var/www/storefront
tar -xzf /tmp/deploy-package.tar.gz
npm ci --production
pm2 reload storefront
```

### Option 2: Build on Server (Use Screen/Tmux)

If you want to build on the server, use `screen` or `tmux` to keep the session alive:

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Start a screen session (keeps running if connection drops)
screen -S deploy

# Navigate to project
cd /var/www/storefront

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build (this takes time - screen keeps it running)
npm run build

# Restart app
pm2 reload storefront

# Detach from screen: Ctrl+A then D
# Reattach later: screen -r deploy
```

### Option 3: Quick Manual Deploy Script

Create a simple deploy script:

```bash
#!/bin/bash
# save as: deploy-manual.sh

SERVER_USER="ubuntu"
SERVER_IP="your-server-ip"
DEPLOY_PATH="/var/www/storefront"

echo "🔨 Building locally..."
npm run build

echo "📦 Creating deployment package..."
tar -czf deploy.tar.gz .next public package.json package-lock.json ecosystem.config.js

echo "📤 Uploading to server..."
scp deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

echo "🚀 Deploying on server..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /var/www/storefront
tar -xzf /tmp/deploy.tar.gz
npm ci --production
pm2 reload storefront
echo "✅ Deployment complete!"
ENDSSH

echo "🧹 Cleaning up..."
rm deploy.tar.gz
```

Make it executable:
```bash
chmod +x deploy-manual.sh
./deploy-manual.sh
```

## Step-by-Step: First Manual Deployment

### 1. Run Setup Script (One Time)

```bash
# On your server
bash deploy/oracle-cloud-setup.sh
```

This sets up:
- Node.js, PM2, Nginx
- Creates `/var/www/storefront/.env.production`
- Sets up PM2 ecosystem

### 2. Configure Environment Variables

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Edit environment file
nano /var/www/storefront/.env.production

# Add your API keys (Firebase, Anthropic, Cloudflare)
# Save: Ctrl+X, Y, Enter
```

### 3. Deploy Code Manually

```bash
# On your local machine
cd /path/to/storeFront

# Build
npm run build

# Create package
tar -czf deploy.tar.gz .next public package.json package-lock.json ecosystem.config.js

# Upload
scp deploy.tar.gz ubuntu@your-server-ip:/tmp/

# Deploy on server
ssh ubuntu@your-server-ip
cd /var/www/storefront
tar -xzf /tmp/deploy.tar.gz
npm ci --production
pm2 reload storefront
pm2 save
```

### 4. Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs storefront

# Test the site
curl http://localhost:3000
```

## Setting Up Auto-Deployment Later

Once manual deployment works, enable GitHub Actions:

1. **Set GitHub Secrets** (see `deploy/GITHUB_SECRETS_SETUP.md`):
   - `SSH_PRIVATE_KEY`
   - `SERVER_IP`
   - `SERVER_USER`
   - `DEPLOY_PATH`

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **GitHub Actions will automatically:**
   - Build the project
   - Deploy to server
   - Reload PM2

## Troubleshooting SSH Timeout

### Problem: "Broken pipe" during build

**Solution 1: Build locally**
- Build on your machine (faster, no timeout)
- Upload built files to server

**Solution 2: Use screen/tmux**
```bash
# Start screen session
screen -S build

# Run build (survives disconnects)
npm run build

# Detach: Ctrl+A, D
# Reattach: screen -r build
```

**Solution 3: Increase SSH timeout**
```bash
# Add to ~/.ssh/config
Host your-server
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

## Quick Deploy Commands

### One-liner (after initial setup)

```bash
npm run build && \
tar -czf deploy.tar.gz .next public package.json package-lock.json ecosystem.config.js && \
scp deploy.tar.gz ubuntu@your-server-ip:/tmp/ && \
ssh ubuntu@your-server-ip "cd /var/www/storefront && tar -xzf /tmp/deploy.tar.gz && npm ci --production && pm2 reload storefront"
```

### Using PM2 Ecosystem

The `ecosystem.config.js` file is already created by the setup script. PM2 will automatically use `.env.production` when you run:

```bash
pm2 start ecosystem.config.js --env production
```

## Next Steps

1. ✅ Deploy manually first (verify everything works)
2. ✅ Test all features (auth, AI generation, etc.)
3. ✅ Once stable, enable GitHub Actions
4. ✅ Future deployments will be automatic

## Files Created

- `deploy/MANUAL_DEPLOYMENT.md` - This guide
- `deploy/ENV_PRODUCTION_SETUP.md` - Environment variables guide
