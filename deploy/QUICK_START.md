# Quick Start - Oracle Cloud Deployment

## 🚀 Fast Deployment (5 Minutes)

### Step 1: Run Setup Script on Server

```bash
# SSH into your Oracle Cloud server
ssh opc@your-server-ip

# Download and run setup script
curl -O https://raw.githubusercontent.com/your-repo/storeFront/main/deploy/oracle-cloud-setup.sh
chmod +x oracle-cloud-setup.sh
bash oracle-cloud-setup.sh
```

**What it does:**
- ✅ Installs Node.js 20.x
- ✅ Installs PM2, Nginx, PostgreSQL (optional)
- ✅ Configures firewall
- ✅ Sets up SSL certificate
- ✅ Creates PM2 config

### Step 2: Configure GitHub Secrets

Go to: **GitHub Repo → Settings → Secrets → Actions**

Add these secrets:

```
SSH_PRIVATE_KEY    → Your private SSH key
SERVER_IP          → Your Oracle Cloud server IP
SERVER_USER        → opc (or your username)
DEPLOY_PATH        → /var/www/storefront
```

### Step 3: Push to Deploy

```bash
git push origin main
```

That's it! 🎉 GitHub Actions will automatically deploy.

## 📋 What Gets Installed

- **Node.js 20.x** - Required runtime
- **PM2** - Process manager (runs your app)
- **Nginx** - Reverse proxy (handles SSL, routing)
- **PostgreSQL** - Database (optional)
- **Certbot** - SSL certificates
- **firewalld** - Firewall management

## 🔧 Manual Deployment

If you prefer manual deployment:

```bash
ssh opc@your-server-ip
cd /var/www/storefront
git pull origin main
npm ci
npm run build
pm2 reload storefront
```

## 📝 Environment Variables

Edit: `/var/www/storefront/.env.production`

Required:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_MAIN_DOMAIN`
- Firebase config
- Anthropic API key

## 🐛 Troubleshooting

**App won't start?**
```bash
pm2 logs storefront
```

**Nginx 502 error?**
```bash
pm2 status
sudo tail -f /var/log/nginx/storefront.error.log
```

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.
