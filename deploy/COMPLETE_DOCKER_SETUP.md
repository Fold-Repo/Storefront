# Complete Docker Setup Script

## Overview

This script automates the entire Docker + GitHub Actions setup process:
- Installs Docker and Docker Compose
- Sets up GitHub Actions runner
- Configures Nginx with wildcard routing
- Cleans up old PM2 setup (if exists)
- Creates Docker network

## What Gets Cleaned Up

The script will:
- ✅ Stop and remove PM2 storefront process (if running)
- ✅ Ask if you want to remove `/var/www/storefront` directory (old PM2 deployment)
- ✅ Old `deploy.yml` workflow has been deleted (won't conflict with Docker workflow)

This ensures no conflicts between old PM2 setup and new Docker setup.

## Usage

```bash
# SSH into server
ssh ubuntu@145.241.251.29

# Run the script
bash deploy/COMPLETE_DOCKER_SETUP.sh
```

## What the Script Does

1. **Collects Information:**
   - GitHub username/repo
   - GitHub Actions registration token
   - Domain name

2. **Installs Docker:**
   - Docker Engine
   - Docker Compose

3. **Sets up GitHub Actions Runner:**
   - Downloads runner
   - Configures with your repo
   - Installs as service

4. **Configures Nginx:**
   - Wildcard routing (`*.yourdomain.com`)
   - Main domain routing
   - Proxy to Docker

5. **Cleans Up Old Setup:**
   - Stops PM2 process (if running)
   - Removes old deployment directory (optional)

6. **Creates Docker Network:**
   - Sets up network for containers

## After Running

1. Add GitHub Secrets
2. Push to main branch
3. Watch automated deployment! 🚀
