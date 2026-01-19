# When to Run SETUP_RUNNER.sh

## Quick Answer

**Run `SETUP_RUNNER.sh` AFTER you've completed the initial server setup but BEFORE your first deployment.**

## Detailed Timeline

### Stage 1: Initial Server Setup (Already Done ✅)

You've already completed:
- ✅ Server setup script (`oracle-cloud-setup.sh`)
- ✅ Nginx configuration
- ✅ Firewall setup
- ✅ Server connection fixes

**Status:** Server is ready, but using PM2 for deployment.

### Stage 2: Install Docker and GitHub Actions Runner (Next Step)

**When:** Now (before switching to Docker deployment)

**What to do:**
1. SSH into your server
2. Run `SETUP_RUNNER.sh`
3. Configure GitHub Secrets
4. Push to main to trigger first Docker deployment

**Run this:**
```bash
# SSH into server
ssh ubuntu@145.241.251.29

# Run setup script
bash deploy/SETUP_RUNNER.sh
```

### Stage 3: First Docker Deployment

**When:** After runner is set up

**What happens:**
- Push to main branch
- GitHub Actions triggers
- Runner builds Docker image
- Container starts
- App is live

### Stage 4: Stop PM2 (After Docker Works)

**When:** After confirming Docker deployment works

**What to do:**
```bash
# On server
pm2 stop storefront
pm2 delete storefront
```

## Step-by-Step: Complete Setup Order

### 1. Initial Server Setup (✅ Already Done)

```bash
# You've already run this
bash deploy/oracle-cloud-setup.sh
```

### 2. Install Docker and Runner (Do This Now)

```bash
# SSH into server
ssh ubuntu@145.241.251.29

# Run setup script
bash deploy/SETUP_RUNNER.sh
```

**What it does:**
- Installs Docker
- Installs Docker Compose
- Downloads GitHub Actions runner
- Configures runner (you'll need GitHub token)
- Installs runner as service

### 3. Configure GitHub Secrets

**Go to:** GitHub Repository → Settings → Secrets and variables → Actions

**Add all environment variables** (Firebase, Anthropic, Cloudflare, etc.)

### 4. Update Nginx for Wildcard Routing

```bash
# On server
sudo nano /etc/nginx/sites-available/storefront

# Use the wildcard configuration (see deploy/nginx-docker.conf)
# Or copy the provided file:
sudo cp deploy/nginx-docker.conf /etc/nginx/sites-available/storefront
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Push to Main (First Docker Deployment)

```bash
# On your local PC
git add .
git commit -m "Add Docker deployment with wildcard routing"
git push origin main
```

### 6. Verify Deployment

```bash
# On server
docker ps
docker logs storefront-app
curl http://localhost:3000
```

### 7. Stop PM2 (After Docker Works)

```bash
# On server
pm2 stop storefront
pm2 delete storefront
```

## Prerequisites Before Running SETUP_RUNNER.sh

**Make sure you have:**
- ✅ Server is accessible via SSH
- ✅ You have sudo access on server
- ✅ GitHub repository URL ready
- ✅ GitHub registration token (get from GitHub UI)

## Getting GitHub Registration Token

**Before running the script, get your token:**

1. Go to: **GitHub Repository → Settings → Actions → Runners**
2. Click **"New self-hosted runner"**
3. Select **Linux** and **x64**
4. Copy the token shown (looks like: `AXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

**The script will ask for:**
- Repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO`
- Registration token: `AXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

## What SETUP_RUNNER.sh Does

1. **Installs Docker** (if not already installed)
2. **Installs Docker Compose** (if not already installed)
3. **Downloads GitHub Actions runner** to `~/actions-runner`
4. **Configures runner** with your repo URL and token
5. **Installs runner as systemd service**
6. **Starts the runner service**

## After Running SETUP_RUNNER.sh

**Next steps:**
1. ✅ Configure GitHub Secrets
2. ✅ Update Nginx config for wildcard routing
3. ✅ Push to main branch
4. ✅ Watch deployment in GitHub Actions
5. ✅ Verify app is running
6. ✅ Stop PM2 (if previously used)

## Troubleshooting

### "Docker group changes require logout"

**After installing Docker:**
```bash
# Log out and back in
exit
ssh ubuntu@145.241.251.29

# Verify Docker works
docker ps
```

### "Runner not connecting"

**Check runner status:**
```bash
cd ~/actions-runner
sudo ./svc.sh status
sudo journalctl -u actions.runner.* -f
```

### "Permission denied for Docker"

**Add user to docker group:**
```bash
sudo usermod -aG docker $USER
# Log out and back in
```

## Summary

**Run SETUP_RUNNER.sh:**
- ✅ **After** initial server setup is complete
- ✅ **Before** first Docker deployment
- ✅ **When** you're ready to switch from PM2 to Docker
- ✅ **Now** is a good time!

**Order:**
1. Server setup (✅ Done)
2. **Run SETUP_RUNNER.sh** ← You are here
3. Configure GitHub Secrets
4. Update Nginx
5. Push to main
6. Verify deployment
