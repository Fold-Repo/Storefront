# Commands to Push Code

## Step 1: Add All Changes

```bash
git add .
```

## Step 2: Commit Changes

```bash
git commit -m "Add deployment setup and WhatsApp Commerce features"
```

## Step 3: Push to GitHub (This will trigger deployment)

```bash
git push origin main
```

## Step 4: Monitor Deployment

1. Go to GitHub → **Actions** tab
2. Watch the deployment workflow run
3. Check for any errors

## If GitHub Secrets Are Not Set

**Don't push yet!** First add the secrets:

1. Go to: **GitHub Repo → Settings → Secrets and variables → Actions**
2. Add these secrets:
   - `SSH_PRIVATE_KEY` - Your Oracle private key content
   - `SERVER_IP` - `145.241.251.29`
   - `SERVER_USER` - `ubuntu`
3. Then push
