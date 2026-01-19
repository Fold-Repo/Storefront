# Docker + GitHub Actions Self-Hosted Runner Setup

## Overview

This setup uses:
- **Docker** for containerized deployments
- **GitHub Actions** with **self-hosted runner** on your server
- **Zero-downtime** deployments with health checks

## Benefits

✅ **Faster deployments** - Build happens on server  
✅ **No SSH timeout issues** - Everything runs locally on server  
✅ **Consistent environment** - Docker ensures same environment every time  
✅ **Easy rollback** - Just restart previous container  
✅ **Automated** - Push to main = automatic deployment  

## Prerequisites

- ✅ Server setup completed (`oracle-cloud-setup.sh` already run)
- ✅ Nginx installed and configured
- ✅ GitHub repository
- ✅ Server accessible from internet (for GitHub Actions runner)

**When to run:** After initial server setup, before first Docker deployment. See `deploy/WHEN_TO_RUN_SETUP.md` for details.

## Step 1: Install Docker and GitHub Actions Runner

**SSH into your server:**

```bash
ssh ubuntu@145.241.251.29
```

**Option A: Use the automated setup script (Recommended)**

```bash
# Run the setup script
bash deploy/SETUP_RUNNER.sh
```

The script will:
- Install Docker
- Install Docker Compose
- Download GitHub Actions runner
- Guide you through runner configuration

**Option B: Manual installation**

```bash
# Update system
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Log out and back in for group changes to take effect
exit
ssh ubuntu@145.241.251.29
```

**See `deploy/WHEN_TO_RUN_SETUP.md` for detailed timing and prerequisites.**

## Step 2: Install GitHub Actions Runner

**On your server:**

```bash
# Create directory for runner
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download runner (replace with your OS/arch)
# For Linux x64:
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Get registration token from GitHub
# Go to: GitHub Repo → Settings → Actions → Runners → New self-hosted runner
# Copy the token shown
```

**Get registration token from GitHub:**

1. Go to: **GitHub Repository → Settings → Actions → Runners**
2. Click **"New self-hosted runner"**
3. Select **Linux** and **x64**
4. Copy the registration token

**Configure runner:**

```bash
# Run config script (use token from GitHub)
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN

# Install as service
sudo ./svc.sh install

# Start service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status
```

## Step 3: Configure GitHub Secrets

**Go to: GitHub Repository → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.dfoldlab.co.uk/api/v1` |
| `NEXT_PUBLIC_MAIN_DOMAIN` | Main domain | `dfoldlab.co.uk` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIza...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `storefront-64d56.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `storefront-64d56` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `storefront-64d56.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `695330621735` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:695330621735:web:...` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | `G-Z851FP9YGC` |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | `...` |
| `CLOUDFLARE_ZONE_ID` | Cloudflare zone ID | `...` |

## Step 4: Update Next.js Config for Docker

**The Dockerfile requires standalone output. Update `next.config.ts`:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... existing config ...
  
  // Add this for Docker
  output: 'standalone',
};

export default nextConfig;
```

## Step 5: Update Nginx Configuration with Wildcard Routing

**On your server, update Nginx to proxy to Docker container with wildcard support:**

```bash
sudo nano /etc/nginx/sites-available/storefront
```

**Use this configuration (supports wildcard subdomains):**

```nginx
upstream storefront_app {
    server 127.0.0.1:3000;  # Docker container port
    keepalive 64;
}

# Main domain server block (platform: dashboard, admin, etc.)
server {
    listen 80;
    listen [::]:80;
    server_name dfoldlab.co.uk www.dfoldlab.co.uk;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://storefront_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
}

# Wildcard subdomain server block for multi-store routing
server {
    listen 80;
    listen [::]:80;
    server_name *.dfoldlab.co.uk;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://storefront_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        # CRITICAL: Pass full Host header for subdomain routing
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
}
```

**Or copy the provided config file:**

```bash
# Copy the provided Nginx config
sudo cp deploy/nginx-docker.conf /etc/nginx/sites-available/storefront

# Update domain if different (replace dfoldlab.co.uk with your domain)
sudo sed -i 's/dfoldlab.co.uk/yourdomain.com/g' /etc/nginx/sites-available/storefront

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Test Deployment

**Push to main branch:**

```bash
git add .
git commit -m "Add Docker deployment"
git push origin main
```

**Watch deployment:**

1. Go to: **GitHub Repository → Actions**
2. Watch the workflow run
3. Check logs in real-time

**Verify on server:**

```bash
# Check container
docker ps

# Check logs
docker logs storefront-app

# Test app
curl http://localhost:3000
```

## Step 7: Stop PM2 (If Previously Used)

**If you were using PM2, stop it:**

```bash
# Stop PM2 app
pm2 stop storefront
pm2 delete storefront

# Docker will handle the app now
```

## Troubleshooting

### Runner Not Connecting

```bash
# Check runner status
sudo ./svc.sh status

# Check logs
sudo journalctl -u actions.runner.* -f

# Restart runner
sudo ./svc.sh restart
```

### Docker Build Fails

```bash
# Check Docker logs
docker logs storefront-app

# Rebuild manually
docker build -t storefront:latest .

# Test container
docker run -p 3000:3000 storefront:latest
```

### Container Won't Start

```bash
# Check container logs
docker logs storefront-app

# Check if port is in use
sudo ss -tulpn | grep 3000

# Remove old container
docker rm -f storefront-app
```

### Health Check Fails

```bash
# Check if app is responding
curl http://localhost:3000

# Check container status
docker ps -a

# Check logs
docker logs storefront-app --tail 50
```

## Manual Deployment (If Needed)

**If you need to deploy manually:**

```bash
# On server
cd ~/actions-runner/_work/YOUR_REPO/YOUR_REPO

# Build
docker build -t storefront:latest .

# Stop old container
docker stop storefront-app || true
docker rm storefront-app || true

# Start new container
docker run -d \
  --name storefront-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  storefront:latest
```

## Rollback

**If deployment fails, rollback to previous image:**

```bash
# List images
docker images

# Tag previous image
docker tag storefront:previous storefront:latest

# Restart container
docker restart storefront-app
```

## Maintenance

### Update Runner

```bash
cd ~/actions-runner
./run.sh stop
# Download new version
# Extract and run config again
```

### Clean Up Old Images

```bash
# Remove unused images
docker image prune -a

# Remove old containers
docker container prune
```

## Summary

✅ **Docker installed** on server  
✅ **GitHub Actions runner** installed and running  
✅ **GitHub Secrets** configured  
✅ **Next.js config** updated for standalone  
✅ **Nginx** configured to proxy to Docker  
✅ **Push to main** = automatic deployment  

## Files Created

- `Dockerfile` - Multi-stage Docker build
- `docker-compose.yml` - Docker Compose configuration
- `.dockerignore` - Files to exclude from Docker build
- `.github/workflows/deploy-docker.yml` - GitHub Actions workflow
- `deploy/nginx-docker.conf` - Nginx config with wildcard routing support
- `deploy/SETUP_RUNNER.sh` - Automated Docker and runner setup script
- `deploy/WHEN_TO_RUN_SETUP.md` - Guide on when to run setup script
- `deploy/DOCKER_GITHUB_ACTIONS_SETUP.md` - This guide

## Next Steps

1. **Run `SETUP_RUNNER.sh` on server** (see `deploy/WHEN_TO_RUN_SETUP.md` for timing)
2. Configure GitHub Secrets
3. Update Nginx config with wildcard routing (use `deploy/nginx-docker.conf`)
4. Push to main branch
5. Watch it deploy automatically! 🚀

**Important:** See `deploy/WHEN_TO_RUN_SETUP.md` for detailed instructions on when and how to run the setup script.
