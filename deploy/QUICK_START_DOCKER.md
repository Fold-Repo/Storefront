# Quick Start: Complete Docker Setup

## One Script Does Everything! 🚀

Run a single script on your server and you're ready for automated deployments.

**For detailed step-by-step checklist, see:** `deploy/DEPLOYMENT_CHECKLIST.md`

## Step 1: Run the Setup Script

**SSH into your server:**

```bash
ssh ubuntu@145.241.251.29
```

**Run the complete setup script:**

```bash
bash deploy/COMPLETE_DOCKER_SETUP.sh
```

## What the Script Does

The script will:

1. ✅ **Ask for information:**
   - GitHub username/repo
   - GitHub Actions registration token
   - Your domain name

2. ✅ **Install Docker:**
   - Docker Engine
   - Docker Compose

3. ✅ **Setup GitHub Actions Runner:**
   - Downloads runner
   - Configures with your repo
   - Installs as service
   - Starts automatically

4. ✅ **Configure Nginx:**
   - Sets up wildcard routing
   - Configures proxy to Docker
   - Enables site

5. ✅ **Create Docker Network:**
   - Sets up network for containers

## What You Need Before Running

### 1. GitHub Registration Token

**Get it from GitHub:**

1. Go to: **GitHub Repository → Settings → Actions → Runners**
2. Click **"New self-hosted runner"**
3. Select **Linux** and **x64**
4. Copy the token shown (looks like: `AXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

### 2. Information Ready

- GitHub username/organization
- Repository name
- Your domain (e.g., `dfoldlab.co.uk`)

## Step 2: Configure GitHub Secrets

**After script completes, add secrets:**

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Description |
|------------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_MAIN_DOMAIN` | Main domain |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token |
| `CLOUDFLARE_ZONE_ID` | Cloudflare zone ID |

## Step 3: Push to Main

**That's it! Just push:**

```bash
git add .
git commit -m "Add Docker deployment"
git push origin main
```

**GitHub Actions will automatically:**
- Build Docker image
- Deploy container
- Start application
- Health check

## Verify Deployment

**On server:**

```bash
# Check container
docker ps

# Check logs
docker logs storefront-app

# Test app
curl http://localhost:3000
```

**In browser:**
- Visit: `http://yourdomain.com`
- Should see your Next.js app!

## Troubleshooting

### "Permission denied" for Docker

```bash
# Log out and back in
exit
ssh ubuntu@145.241.251.29

# Or use newgrp
newgrp docker
```

### Runner not connecting

```bash
cd ~/actions-runner
sudo ./svc.sh status
sudo ./svc.sh restart
```

### Container won't start

```bash
docker logs storefront-app
docker ps -a
```

## Summary

**One script does everything:**
1. ✅ Run `COMPLETE_DOCKER_SETUP.sh` on server
2. ✅ Add GitHub Secrets
3. ✅ Push to main
4. ✅ Done! 🎉

**No more:**
- ❌ SSH timeout issues
- ❌ Manual deployments
- ❌ Connection problems
- ❌ Build failures

**Just push and deploy!** 🚀
