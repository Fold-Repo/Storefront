# Complete Deployment Checklist

## Step-by-Step: From Setup to Deployment

### Step 1: Get GitHub Actions Runner Credentials

**On GitHub:**

1. Go to your repository: `https://github.com/YOUR_USERNAME/YOUR_REPO`
2. Click **Settings** (top right)
3. Click **Actions** (left sidebar)
4. Click **Runners** (under Actions)
5. Click **"New self-hosted runner"** button
6. Select:
   - **Operating System:** Linux
   - **Architecture:** x64
7. **Copy the registration token** shown (looks like: `AXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
8. **Note your repository URL** (e.g., `https://github.com/username/repo`)

**✅ You now have:**
- Repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO`
- Registration token: `AXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

---

### Step 2: Run Complete Setup Script on Server

**SSH into your server:**

```bash
ssh ubuntu@145.241.251.29
```

**Run the setup script:**

```bash
bash deploy/COMPLETE_DOCKER_SETUP.sh
```

**The script will ask for:**
1. GitHub username/organization → Enter your GitHub username
2. Repository name → Enter your repo name
3. Registration token → Paste the token from Step 1
4. Domain name → Enter your domain (e.g., `dfoldlab.co.uk`)

**The script will:**
- ✅ Install Docker
- ✅ Setup GitHub Actions runner
- ✅ Configure Nginx with wildcard routing
- ✅ Clean up old PM2 setup
- ✅ Create Docker network

**✅ Setup complete when you see:**
```
╔════════════════════════════════════════════════════════╗
║   Setup Complete! 🎉                                  ║
╚════════════════════════════════════════════════════════╝
```

---

### Step 3: Configure GitHub Secrets

**On GitHub:**

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add each secret one by one:

| Secret Name | Value | Where to Get |
|------------|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://api.dfoldlab.co.uk/api/v1` | Your backend API URL |
| `NEXT_PUBLIC_MAIN_DOMAIN` | `dfoldlab.co.uk` | Your main domain |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIza...` | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `storefront-64d56.firebaseapp.com` | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `storefront-64d56` | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storefront-64d56.firebasestorage.app` | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `695330621735` | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:695330621735:web:...` | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-Z851FP9YGC` | Firebase Console (optional) |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Anthropic Console |
| `CLOUDFLARE_API_TOKEN` | `...` | Cloudflare Dashboard |
| `CLOUDFLARE_ZONE_ID` | `...` | Cloudflare Dashboard |

**✅ All secrets added when:**
- You see all 12 secrets listed in GitHub Secrets page

---

### Step 4: Verify Next.js Config

**On your local PC:**

1. Open `next.config.ts`
2. Verify it has: `output: 'standalone'`

**If missing, add it:**

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',  // ← Must have this for Docker
  // ... rest of config
};
```

**✅ Config verified when:**
- `next.config.ts` contains `output: 'standalone'`

---

### Step 5: Commit and Push to Main

**On your local PC:**

```bash
# Make sure you're in project directory
cd /Users/ogunwolesamuel/development/projects/fold-project/storeFront

# Stage all changes
git add .

# Commit
git commit -m "Add Docker deployment with GitHub Actions"

# Push to main
git push origin main
```

**✅ Code pushed when:**
- You see: `To github.com:... main -> main`
- No errors in terminal

---

### Step 6: Monitor Deployment

**On GitHub:**

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
2. Click on the latest workflow run
3. Watch it execute in real-time

**What to watch for:**
- ✅ "Checkout code" - Green checkmark
- ✅ "Setup Node.js" - Green checkmark
- ✅ "Create .env.production" - Green checkmark
- ✅ "Build Docker image" - Green checkmark (takes a few minutes)
- ✅ "Stop existing container" - Green checkmark
- ✅ "Start new container" - Green checkmark
- ✅ "Wait for health check" - Green checkmark

**✅ Deployment successful when:**
- All steps show green checkmarks
- You see "Deployment Summary" at the end

---

### Step 7: Verify Deployment

**On your server (SSH):**

```bash
# Check container is running
docker ps

# Should show:
# CONTAINER ID   IMAGE              STATUS         PORTS
# xxxxx          storefront:latest  Up X minutes   0.0.0.0:3000->3000/tcp
```

```bash
# Check container logs
docker logs storefront-app --tail 50

# Should show Next.js startup messages
```

```bash
# Test app locally
curl http://localhost:3000

# Should return HTML (not error)
```

**✅ Deployment verified when:**
- Container is running (`docker ps`)
- Logs show app started successfully
- `curl http://localhost:3000` returns HTML

---

### Step 8: Test in Browser

**Open browser:**

1. Visit: `http://yourdomain.com` or `http://145.241.251.29`
2. Should see your Next.js app homepage

**✅ Website working when:**
- Page loads without errors
- You see your app content

---

## Quick Reference Checklist

**Before Running Script:**
- [ ] Have GitHub repository URL
- [ ] Have GitHub Actions registration token
- [ ] Know your domain name
- [ ] SSH access to server

**After Running Script:**
- [ ] Docker installed
- [ ] GitHub Actions runner running
- [ ] Nginx configured
- [ ] Old PM2 cleaned up

**Before Pushing:**
- [ ] All GitHub Secrets added (12 secrets)
- [ ] `next.config.ts` has `output: 'standalone'`
- [ ] Code committed locally

**After Pushing:**
- [ ] GitHub Actions workflow triggered
- [ ] All workflow steps passed
- [ ] Container running on server
- [ ] Website accessible in browser

---

## Troubleshooting

### Runner Not Connecting

```bash
# On server
cd ~/actions-runner
sudo ./svc.sh status
sudo ./svc.sh restart
```

### Container Won't Start

```bash
# Check logs
docker logs storefront-app

# Check if port 3000 is in use
sudo ss -tulpn | grep 3000
```

### Website Not Loading

```bash
# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check container
docker ps
docker logs storefront-app
```

---

## Summary

**Complete process:**
1. ✅ Get GitHub runner credentials
2. ✅ Run `COMPLETE_DOCKER_SETUP.sh` on server
3. ✅ Add GitHub Secrets
4. ✅ Verify `next.config.ts`
5. ✅ Push to main
6. ✅ Monitor deployment
7. ✅ Verify on server
8. ✅ Test in browser

**That's it!** 🚀
