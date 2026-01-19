# Oracle Cloud Deployment Guide

This guide helps you deploy the Shorp Storefront application to Oracle Cloud Infrastructure (OCI).

## Prerequisites

- Oracle Cloud account with a compute instance running Oracle Linux 8/9
- Domain name pointing to your server's IP address
- SSH access to your server
- GitHub repository with your code

## Quick Start

### 1. Run Setup Script on Server

SSH into your Oracle Cloud server and run:

```bash
# Download and run the setup script
curl -O https://raw.githubusercontent.com/your-repo/storeFront/main/deploy/oracle-cloud-setup.sh
chmod +x oracle-cloud-setup.sh
bash oracle-cloud-setup.sh
```

Or clone the repo and run:

```bash
git clone <your-repo-url>
cd storeFront/deploy
chmod +x oracle-cloud-setup.sh
bash oracle-cloud-setup.sh
```

### 2. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SSH_PRIVATE_KEY` | Your private SSH key for server access | Content of `~/.ssh/id_rsa` |
| `SERVER_IP` | Your Oracle Cloud server IP | `123.45.67.89` |
| `SERVER_USER` | SSH username | `opc` or `ubuntu` |
| `DEPLOY_PATH` | Deployment path (optional) | `/var/www/storefront` |
| `NEXT_PUBLIC_API_URL` | Your API URL (optional) | `https://api.dfoldlab.co.uk/api/v1` |
| `NEXT_PUBLIC_MAIN_DOMAIN` | Main domain (optional) | `dfoldlab.co.uk` |

### 3. Generate SSH Key Pair (if needed)

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "github-deploy" -f ~/.ssh/github_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server-ip

# Add private key to GitHub Secrets
cat ~/.ssh/github_deploy
# Copy the output and paste into GitHub Secrets → SSH_PRIVATE_KEY
```

### 4. Deploy

Push to main branch:

```bash
git push origin main
```

GitHub Actions will automatically:
1. Build the application
2. Create a deployment package
3. Copy to server
4. Install dependencies
5. Build on server
6. Reload PM2

## Manual Deployment

If you prefer to deploy manually:

```bash
# SSH into server
ssh user@your-server-ip

# Navigate to app directory
cd /var/www/storefront

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build application
npm run build

# Reload PM2
pm2 reload storefront
```

## Environment Variables

Edit the production environment file:

```bash
sudo nano /var/www/storefront/.env.production
```

Required variables:
- `NEXT_PUBLIC_API_URL` - Your backend API URL
- `NEXT_PUBLIC_MAIN_DOMAIN` - Your main domain
- `NEXT_PUBLIC_FIREBASE_*` - Firebase configuration
- `ANTHROPIC_API_KEY` - Anthropic API key for AI features
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token (if using)
- `CLOUDFLARE_ZONE_ID` - Cloudflare Zone ID (if using)

## PM2 Management

```bash
# Check status
pm2 status

# View logs
pm2 logs storefront

# Restart
pm2 restart storefront

# Reload (zero-downtime)
pm2 reload storefront

# Stop
pm2 stop storefront

# Monitor
pm2 monit
```

## Nginx Management

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

## SSL Certificate Management

```bash
# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# Get certificate for new domain
sudo certbot --nginx -d yourdomain.com
```

## Firewall Management (firewalld)

```bash
# Check status
sudo firewall-cmd --list-all

# Add port
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Remove port
sudo firewall-cmd --permanent --remove-port=3000/tcp
sudo firewall-cmd --reload
```

## Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs storefront --lines 50

# Check if port is in use
sudo netstat -tulpn | grep 3000

# Check environment variables
pm2 env storefront
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/storefront.error.log

# Check app logs
pm2 logs storefront
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check Nginx SSL config
sudo nginx -t
```

### Build Failures

```bash
# Check Node.js version (should be 20.x)
node --version

# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Backup and Restore

### Create Backup

```bash
cd /var/www/storefront
tar -czf ~/backup_$(date +%Y%m%d).tar.gz .next package.json package-lock.json .env.production
```

### Restore Backup

```bash
cd /var/www/storefront
tar -xzf ~/backup_YYYYMMDD.tar.gz
pm2 reload storefront
```

## Monitoring

### Check Application Health

```bash
# Health check endpoint (if implemented)
curl http://localhost:3000/api/health

# Check PM2 status
pm2 status

# Monitor resources
pm2 monit
```

### View Logs

```bash
# Application logs
pm2 logs storefront

# Nginx access logs
sudo tail -f /var/log/nginx/storefront.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/storefront.error.log
```

## Security Checklist

- [ ] Firewall configured (SSH, HTTP, HTTPS only)
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Environment variables secured (`.env.production` with 600 permissions)
- [ ] Regular security updates: `sudo dnf update`
- [ ] SSH key authentication only (disable password auth)
- [ ] PM2 running as non-root user
- [ ] Nginx security headers configured

## Oracle Cloud Specific Notes

- **Default User**: Usually `opc` on Oracle Linux
- **Firewall**: Uses `firewalld` (not `ufw`)
- **Package Manager**: Uses `dnf` (not `apt`)
- **Nginx Config**: Located in `/etc/nginx/conf.d/` (not `sites-available`)

## Support

For issues or questions:
1. Check PM2 logs: `pm2 logs storefront`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/storefront.error.log`
3. Verify environment variables are set correctly
4. Ensure Node.js version is 20.x: `node --version`
