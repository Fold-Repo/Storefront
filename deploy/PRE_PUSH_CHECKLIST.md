# Pre-Push Checklist - Verify Everything is Ready

## ✅ Quick Verification Checklist

Before pushing to GitHub, verify these items:

### 1. GitHub Secrets ✅

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Verify these secrets exist:

- [ ] `SSH_PRIVATE_KEY` - Your Oracle private key or local SSH key
- [ ] `SERVER_IP` - `145.241.251.29`
- [ ] `SERVER_USER` - `ubuntu` (or your username)
- [ ] `DEPLOY_PATH` - `/var/www/storefront` (optional)

**How to check:**
1. Go to your GitHub repo
2. Click **Settings** → **Secrets and variables** → **Actions**
3. You should see all 3-4 secrets listed

---

### 2. Server Setup ✅

Verify server is ready:

- [ ] Server is running and accessible
- [ ] SSH connection works
- [ ] Nginx is running
- [ ] PM2 is installed
- [ ] `/var/www/storefront` directory exists

**Test commands:**
```bash
# Test SSH
ssh ubuntu@145.241.251.29

# On server, check services
sudo systemctl status nginx
pm2 --version
ls -la /var/www/storefront
```

---

### 3. Code is Ready ✅

- [ ] All changes committed
- [ ] `.env.production` template is ready (on server)
- [ ] No sensitive data in code
- [ ] `.gitignore` includes `.env*` files

**Check:**
```bash
git status
# Should show "nothing to commit" or only files you want to push
```

---

### 4. GitHub Actions Workflow ✅

- [ ] `.github/workflows/deploy.yml` exists
- [ ] Workflow file is correct

**Check:**
```bash
ls -la .github/workflows/deploy.yml
cat .github/workflows/deploy.yml | head -20
```

---

## 🚀 Ready to Push?

If all checkboxes above are ✅, you're ready!

### Push Command

```bash
# Make sure you're on main/master branch
git checkout main

# Push to trigger deployment
git push origin main
```

---

## 📊 Monitor Deployment

After pushing:

1. **Go to GitHub Actions:**
   - Click **Actions** tab in your repository
   - You should see a workflow run starting

2. **Watch the logs:**
   - Click on the running workflow
   - Watch each step complete
   - Check for any errors

3. **Verify on server:**
   ```bash
   ssh ubuntu@145.241.251.29
   cd /var/www/storefront
   pm2 status
   pm2 logs storefront
   ```

---

## ⚠️ Common Issues

### GitHub Actions Fails

**"Permission denied (publickey)"**
- Check `SSH_PRIVATE_KEY` secret is correct
- Verify key includes BEGIN/END lines
- Test SSH manually: `ssh -i key.pem ubuntu@145.241.251.29`

**"Could not resolve hostname"**
- Check `SERVER_IP` secret is correct: `145.241.251.29`
- Verify server is running

**"No such file or directory"**
- Check `DEPLOY_PATH` matches: `/var/www/storefront`
- Verify directory exists on server

### Deployment Succeeds but App Doesn't Work

1. **Check PM2:**
   ```bash
   pm2 status
   pm2 logs storefront
   ```

2. **Check Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. **Check environment file:**
   ```bash
   cat /var/www/storefront/.env.production
   # Make sure API keys are set
   ```

---

## ✅ Success Indicators

You'll know it worked when:

- ✅ GitHub Actions shows green checkmark
- ✅ `pm2 status` shows app running
- ✅ `https://dfoldlab.co.uk` loads
- ✅ No errors in `pm2 logs storefront`

---

## 🎯 Quick Commands

```bash
# 1. Check git status
git status

# 2. Add and commit (if needed)
git add .
git commit -m "Ready for deployment"

# 3. Push to trigger deployment
git push origin main

# 4. Watch deployment
# Go to GitHub → Actions tab

# 5. Verify on server
ssh ubuntu@145.241.251.29
pm2 status
curl http://localhost:3000
```

---

## 📝 Final Checklist

Before pushing, make sure:

- [ ] All GitHub Secrets are set
- [ ] Server is accessible via SSH
- [ ] Code is committed
- [ ] You're on the correct branch (main/master)
- [ ] `.github/workflows/deploy.yml` exists

**If all checked → You're ready to push!** 🚀
