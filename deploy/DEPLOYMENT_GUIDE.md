# Oracle Cloud Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Shorp Storefront Next.js application to Oracle Cloud Infrastructure (OCI).

## Prerequisites

- ✅ Oracle Cloud account with a compute instance
- ✅ Oracle Linux 8 or 9 installed
- ✅ Domain name configured with DNS pointing to your server IP
- ✅ SSH access to your server
- ✅ GitHub repository with your code

## Step 1: Initial Server Setup

### 1.1 Connect to Your Server

```bash
ssh opc@your-server-ip
# or
ssh ubuntu@your-server-ip
```

### 1.2 Run the Setup Script

```bash
# Download the script
curl -O https://raw.githubusercontent.com/your-org/storeFront/main/deploy/oracle-cloud-setup.sh

# Or clone the repository
git clone <your-repo-url>
cd storeFront/deploy

# Make executable and run
chmod +x oracle-cloud-setup.sh
bash oracle-cloud-setup.sh
```

The script will:
- ✅ Update system packages
- ✅ Install Node.js 20.x
- ✅ Install PM2 for process management
- ✅ Install and configure Nginx
- ✅ Install PostgreSQL (optional)
- ✅ Configure firewall (firewalld)
- ✅ Set up SSL certificate (if DNS is ready)
- ✅ Create PM2 ecosystem config
- ✅ Create environment file template

### 1.3 Save Important Information

After the script completes, save:
- Database password (if PostgreSQL was installed)
- Server IP address
- Domain name

## Step 2: Configure Environment Variables

> **Note:** The setup script automatically creates `.env.production` with a template. You just need to fill in your API keys.

Edit the production environment file:

```bash
nano /var/www/storefront/.env.production
```

The script already created this file with default values. You just need to fill in the empty API keys:

**Required - Fill these empty values:**

```env
# Server
NODE_ENV=production
PORT=3000

# Public URLs
NEXT_PUBLIC_API_URL=https://api.dfoldlab.co.uk/api/v1
NEXT_PUBLIC_MAIN_DOMAIN=dfoldlab.co.uk

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Anthropic AI
ANTHROPIC_API_KEY=your-anthropic-key

# Cloudflare (optional)
CLOUDFLARE_API_TOKEN=your-token
CLOUDFLARE_ZONE_ID=your-zone-id

# Database (if using)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shorp_production
DB_USER=shorp
DB_PASSWORD=your-db-password
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

## Step 3: Set Up GitHub Actions

### 3.1 Generate SSH Key Pair

On your local machine:

```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "github-deploy" -f ~/.ssh/github_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_deploy.pub opc@your-server-ip

# Display private key (copy this)
cat ~/.ssh/github_deploy
```

### 3.2 Add GitHub Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Click **"New repository secret"** and add:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `SSH_PRIVATE_KEY` | Content of `~/.ssh/github_deploy` | Private SSH key for deployment |
| `SERVER_IP` | Your server IP | Oracle Cloud server IP address |
| `SERVER_USER` | `opc` or your username | SSH username |
| `DEPLOY_PATH` | `/var/www/storefront` | Deployment directory (optional) |
| `NEXT_PUBLIC_API_URL` | `https://api.dfoldlab.co.uk/api/v1` | API URL (optional) |
| `NEXT_PUBLIC_MAIN_DOMAIN` | `dfoldlab.co.uk` | Main domain (optional) |

## Step 4: Deploy

### 4.1 Automatic Deployment (Recommended)

Push to main branch:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions will automatically:
1. ✅ Build the application
2. ✅ Create deployment package
3. ✅ Copy to server via SSH
4. ✅ Install dependencies
5. ✅ Build on server
6. ✅ Reload PM2

### 4.2 Manual Deployment

If you prefer manual deployment:

```bash
# SSH into server
ssh opc@your-server-ip

# Navigate to app directory
cd /var/www/storefront

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build application
npm run build

# Reload PM2 (zero-downtime)
pm2 reload storefront

# Save PM2 configuration
pm2 save
```

## Step 5: Verify Deployment

### 5.1 Check Application Status

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs storefront --lines 50

# Check if app is responding
curl http://localhost:3000
```

### 5.2 Check Nginx

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/storefront.access.log
```

### 5.3 Test Your Domain

Open your browser and visit:
```
https://yourdomain.com
```

## Common Commands

### PM2 Management

```bash
pm2 status              # Check app status
pm2 logs storefront     # View logs
pm2 reload storefront   # Reload (zero-downtime)
pm2 restart storefront  # Restart
pm2 stop storefront     # Stop
pm2 delete storefront   # Remove from PM2
pm2 monit               # Monitor resources
```

### Nginx Management

```bash
sudo nginx -t                    # Test configuration
sudo systemctl reload nginx      # Reload (no downtime)
sudo systemctl restart nginx     # Restart
sudo systemctl status nginx      # Check status
sudo tail -f /var/log/nginx/storefront.error.log  # Error logs
```

### SSL Certificate

```bash
sudo certbot certificates        # List certificates
sudo certbot renew               # Renew certificates
sudo certbot renew --dry-run     # Test renewal
```

### Firewall

```bash
sudo firewall-cmd --list-all              # List all rules
sudo firewall-cmd --add-port=3000/tcp    # Add port
sudo firewall-cmd --reload                # Reload firewall
```

## Troubleshooting

### App Won't Start

```bash
# Check PM2 logs
pm2 logs storefront --err --lines 100

# Check if port is in use
sudo netstat -tulpn | grep 3000

# Check environment variables
pm2 env storefront

# Restart PM2
pm2 restart storefront
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check app logs
pm2 logs storefront

# Check Nginx error logs
sudo tail -f /var/log/nginx/storefront.error.log

# Verify app is listening on port 3000
curl http://localhost:3000
```

### Build Failures

```bash
# Check Node.js version (should be 20.x)
node --version

# Clear npm cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install

# Check disk space
df -h
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check Nginx SSL config
sudo nginx -t

# View certificate details
sudo certbot certificates
```

## Oracle Cloud Specific Notes

### Default User
- Oracle Linux typically uses `opc` as the default user
- Some instances may use `ubuntu` or a custom user

### Package Manager
- Uses `dnf` (not `apt`)
- Example: `sudo dnf install package-name`

### Firewall
- Uses `firewalld` (not `ufw`)
- Commands: `sudo firewall-cmd --add-service=http`

### Nginx Configuration
- Config files in `/etc/nginx/conf.d/` (not `sites-available`)
- Main config: `/etc/nginx/nginx.conf`

### Service Management
- Uses `systemctl` (same as Ubuntu)
- Example: `sudo systemctl restart nginx`

## Security Best Practices

1. **Keep system updated**
   ```bash
   sudo dnf update -y
   ```

2. **Secure SSH**
   - Use SSH keys only
   - Disable password authentication
   - Change default SSH port (optional)

3. **Firewall rules**
   - Only allow necessary ports (22, 80, 443)
   - Block all other ports

4. **Environment variables**
   - Keep `.env.production` with 600 permissions
   - Never commit secrets to git

5. **Regular backups**
   ```bash
   # Backup application
   tar -czf ~/backup_$(date +%Y%m%d).tar.gz /var/www/storefront
   ```

## Monitoring

### Set Up Monitoring (Optional)

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Health Check Endpoint

Create a health check endpoint in your Next.js app:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

Then monitor it:
```bash
curl https://yourdomain.com/api/health
```

## Rollback Procedure

If deployment fails:

```bash
# SSH into server
ssh opc@your-server-ip

# Navigate to backups
cd /var/www/backups

# List backups
ls -lh

# Restore from backup
cd /var/www/storefront
tar -xzf /var/www/backups/storefront_backup_YYYYMMDD_HHMMSS.tar.gz

# Restart app
pm2 reload storefront
```

## Support

For issues:
1. Check PM2 logs: `pm2 logs storefront`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/storefront.error.log`
3. Verify environment variables
4. Check Node.js version: `node --version` (should be 20.x)
