# Next Steps After Server Setup

## ✅ What You've Completed

1. ✅ Server setup script (`oracle-cloud-setup.sh`)
2. ✅ Server connection fix (`fix-server-connection.sh`)
3. ✅ Firewall configured
4. ✅ SSH keepalive configured

## 🚀 Next Step: Manual Deployment

**Yes, deploy manually from your local PC now!**

### Step 1: Set Your Server IP

```bash
# On your LOCAL PC
export SERVER_IP=79.72.95.124
```

### Step 2: Set SSH Key (if using Oracle's key)

```bash
# If you're using Oracle's private key
export SSH_KEY=~/Downloads/your-oracle-key.pem

# Or if using your default SSH key, skip this step
```

### Step 3: Run Manual Deployment

```bash
# Make sure you're in the project directory
cd /Users/ogunwolesamuel/development/projects/fold-project/storeFront

# Run the deployment script
./deploy/deploy-manual.sh
```

### What the Script Does

1. ✅ Builds your Next.js app locally (no timeout!)
2. ✅ Packages the build files
3. ✅ Uploads to server via `scp`
4. ✅ SSHs into server and deploys
5. ✅ Restarts PM2

## 📋 Before Deployment Checklist

- [ ] Server IP is set: `export SERVER_IP=79.72.95.124`
- [ ] SSH key is set (if using Oracle key): `export SSH_KEY=/path/to/key.pem`
- [ ] You're in the project root directory
- [ ] Oracle Cloud Security Lists are configured (ports 22, 80, 443 open)
- [ ] Server has `.env.production` file with API keys filled in

## 🔍 If Deployment Fails

### Check SSH Connection First

```bash
# Test SSH connection
ssh -i $SSH_KEY ubuntu@79.72.95.124
# Or without key if using default
ssh ubuntu@79.72.95.124
```

### Common Issues

**"Permission denied"**
- Check SSH key: `export SSH_KEY=/path/to/key.pem`
- Verify key permissions: `chmod 600 /path/to/key.pem`

**"Connection refused"**
- Check Oracle Cloud Security Lists (port 22 must be open)
- Verify firewall: `sudo ufw status` on server

**"Build failed"**
- Check Node.js version: `node -v` (should be 20+)
- Clear cache: `npm cache clean --force`
- Try: `npm install` then `npm run build`

## 📝 After Successful Deployment

### 1. Verify App is Running

```bash
# SSH into server
ssh ubuntu@79.72.95.124

# Check PM2 status
pm2 status

# Check logs
pm2 logs storefront --lines 50

# Test locally
curl http://localhost:3000
```

### 2. Test from Browser

Visit your domain:
- `http://79.72.95.124` (or your domain)
- Should show your Next.js app

### 3. Check Nginx

```bash
# On server
sudo systemctl status nginx
sudo nginx -t
```

## 🎯 After Manual Deployment Works

Once manual deployment is successful, you can:

1. **Set up GitHub Actions** (optional, for auto-deployment)
   - Add GitHub Secrets (see `deploy/GITHUB_SECRETS_SETUP.md`)
   - Push to `main` branch
   - GitHub Actions will auto-deploy

2. **Or continue with manual deployment**
   - Run `./deploy/deploy-manual.sh` whenever you want to deploy

## 📚 Quick Reference

**Deploy command:**
```bash
export SERVER_IP=79.72.95.124
export SSH_KEY=~/Downloads/oracle-key.pem  # If using Oracle key
./deploy/deploy-manual.sh
```

**Check deployment:**
```bash
ssh ubuntu@79.72.95.124 'pm2 status && pm2 logs storefront --lines 20'
```

## ✅ Summary

1. **Set environment variables** (SERVER_IP, SSH_KEY if needed)
2. **Run deployment script** (`./deploy/deploy-manual.sh`)
3. **Verify deployment** (check PM2, test website)
4. **Set up auto-deployment** (optional, GitHub Actions)

You're ready to deploy! 🚀
