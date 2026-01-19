# Production Environment Variables Setup

## Quick Answer

**You DON'T create `.env.production` manually!** The deployment script creates it automatically on the server.

**You DO edit it** after running the setup script to add your API keys.

## How It Works

### Step 1: Run Setup Script (Creates `.env.production` Automatically)

When you run `oracle-cloud-setup.sh`, it automatically creates `/var/www/storefront/.env.production` with a template:

```bash
# On your server
bash deploy/oracle-cloud-setup.sh
```

The script creates the file at: `/var/www/storefront/.env.production`

### Step 2: Edit `.env.production` (Add Your API Keys)

After the script completes, SSH into your server and edit the file:

```bash
# SSH into your server
ssh ubuntu@your-server-ip

# Edit the environment file
sudo nano /var/www/storefront/.env.production
```

Fill in your actual API keys (the script leaves them empty):

```env
# Firebase (REQUIRED - replace empty values)
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=storefront-64d56.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=storefront-64d56
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=storefront-64d56.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=695330621735
NEXT_PUBLIC_FIREBASE_APP_ID=1:695330621735:web:6dbc73154a74c7ae1c8102

# Anthropic AI (REQUIRED - replace empty value)
ANTHROPIC_API_KEY=your-actual-anthropic-key

# Cloudflare (REQUIRED - replace empty values)
CLOUDFLARE_API_TOKEN=your-actual-cloudflare-token
CLOUDFLARE_ZONE_ID=your-actual-zone-id
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Restart Application

After editing `.env.production`, restart the app:

```bash
pm2 reload storefront
# or
pm2 restart storefront
```

## What the Script Creates

The setup script automatically creates `.env.production` with:

✅ **Pre-filled values:**
- `NODE_ENV=production`
- `PORT=3000`
- `NEXT_PUBLIC_API_URL` (default backend URL)
- `NEXT_PUBLIC_MAIN_DOMAIN` (dfoldlab.co.uk)
- Database password (auto-generated)
- JWT secret (auto-generated)

❌ **Empty values (you must fill):**
- All Firebase keys
- Anthropic API key
- Cloudflare credentials

## GitHub Actions Deployment

The GitHub Actions workflow **does NOT** copy `.env.production` from your repo.

**Why?** Security - API keys should never be in git!

**What happens:**
1. First deployment: You manually create/edit `.env.production` on server
2. Subsequent deployments: The file stays on server (not overwritten)
3. PM2 uses `.env.production` when starting the app

## Checklist

- [ ] Run `oracle-cloud-setup.sh` (creates `.env.production` template)
- [ ] SSH into server
- [ ] Edit `/var/www/storefront/.env.production`
- [ ] Add Firebase API keys
- [ ] Add Anthropic API key
- [ ] Add Cloudflare credentials
- [ ] Save file
- [ ] Restart app: `pm2 reload storefront`
- [ ] Verify app is running: `pm2 status`

## Security Notes

1. **File permissions:** The script sets `.env.production` to `600` (read/write for owner only)
2. **Never commit:** `.env.production` is in `.gitignore` - never commit it!
3. **Backup safely:** If backing up, exclude `.env.production` or encrypt it

## Troubleshooting

### App not working after deployment?
- Check `.env.production` exists: `ls -la /var/www/storefront/.env.production`
- Verify values are set: `cat /var/www/storefront/.env.production | grep -v "^#" | grep -v "^$"`
- Check PM2 is using it: `pm2 show storefront | grep NODE_ENV`

### Can't find the file?
- Check if script completed: Look for "Creating environment template..." in script output
- File location: `/var/www/storefront/.env.production`
- Create manually if needed: `sudo nano /var/www/storefront/.env.production`

### Values not taking effect?
- Restart PM2: `pm2 reload storefront`
- Check PM2 ecosystem config uses production env
- Verify file permissions: `ls -l /var/www/storefront/.env.production` (should be `600`)
