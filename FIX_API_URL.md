# Fix API URL - Update to Shorp Backend

## Problem
Your app is still using `https://api.dfoldlab.co.uk/api/v1` instead of `https://shorp-epos-backend.onrender.com/api/v1`.

## Solution

### Step 1: Update Your Local Environment File

**If you have a `.env.local` file**, update it:

```bash
# Open your .env.local file
nano .env.local
# or
code .env.local
```

**Change this line:**
```env
NEXT_PUBLIC_API_URL=https://api.dfoldlab.co.uk/api/v1
```

**To this:**
```env
NEXT_PUBLIC_API_URL=https://shorp-epos-backend.onrender.com/api/v1
```

**Or remove the line entirely** (the code will use the default):
```env
# Remove or comment out:
# NEXT_PUBLIC_API_URL=https://api.dfoldlab.co.uk/api/v1
```

### Step 2: Restart Your Dev Server

After updating `.env.local`, you **MUST restart** your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Clear Browser Cache (If Needed)

If you still see the old URL after restarting:

1. **Hard refresh** your browser:
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

2. **Or clear browser cache** completely

### Step 4: Verify the Change

Check your browser console - you should now see:
```
[API Request] GET https://shorp-epos-backend.onrender.com/api/v1/...
```

Instead of:
```
[API Request] GET https://api.dfoldlab.co.uk/api/v1/...
```

## For Production/Deployment

### Update Production Environment Variables

**If deploying to:**
- **Vercel**: Update in Project Settings → Environment Variables
- **Netlify**: Update in Site Settings → Environment Variables  
- **Oracle Cloud**: Update `/var/www/storefront/.env.production` on server
- **Docker**: Update in `.env.production` file or Docker environment

**Set:**
```env
NEXT_PUBLIC_API_URL=https://shorp-epos-backend.onrender.com/api/v1
```

**Or remove it** to use the default (recommended).

## Quick Fix Command

Run this in your project root to quickly update `.env.local`:

```bash
# Backup current file
cp .env.local .env.local.backup 2>/dev/null || true

# Update the URL (if file exists)
if [ -f .env.local ]; then
  sed -i.bak 's|https://api.dfoldlab.co.uk/api/v1|https://shorp-epos-backend.onrender.com/api/v1|g' .env.local
  echo "✅ Updated .env.local"
  echo "⚠️  Please restart your dev server: npm run dev"
else
  echo "ℹ️  No .env.local file found. Creating one..."
  echo "NEXT_PUBLIC_API_URL=https://shorp-epos-backend.onrender.com/api/v1" > .env.local
  echo "✅ Created .env.local with correct URL"
fi
```

## Verify Default is Correct

The default URL in code is already correct:
- File: `constants/api.ts`
- Default: `https://shorp-epos-backend.onrender.com/api/v1` ✅

If you don't set `NEXT_PUBLIC_API_URL`, it will use this default automatically.

## Still Not Working?

1. **Check for multiple `.env` files:**
   ```bash
   ls -la .env*
   ```
   Next.js loads in this order (later overrides earlier):
   - `.env`
   - `.env.local`
   - `.env.development` (in dev mode)
   - `.env.production` (in production)

2. **Check what value is actually being used:**
   Add this temporarily to see the value:
   ```typescript
   // In any component or page
   console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
   ```

3. **Rebuild the app:**
   ```bash
   rm -rf .next
   npm run build
   npm run dev
   ```
