# Environment Variables Setup Guide

## Quick Answer

**You can build the project WITHOUT environment variables!** The build will complete successfully using placeholder values.

However, **runtime features will NOT work** without proper environment variables.

## Build vs Runtime

### ✅ Build Time (Works Without Env Vars)
- TypeScript compilation
- Next.js static page generation
- Code bundling
- All build processes complete successfully

### ⚠️ Runtime (Needs Env Vars)
- Firebase authentication
- AI-powered page generation
- Subdomain creation
- API calls to backend

## Setup Options

### Option 1: Build Only (No Env Vars Needed)
If you just want to verify the build works:

```bash
git clone <your-repo-url>
cd storeFront
npm install
npm run build
```

✅ Build will succeed
❌ App won't work at runtime (auth, AI, etc. will fail)

### Option 2: Full Setup (Recommended)
For the app to work properly, set up environment variables:

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd storeFront

# 2. Copy the example file
cp .env.example .env.local

# 3. Edit .env.local with your values
nano .env.local  # or use your preferred editor

# 4. Install dependencies
npm install

# 5. Build
npm run build

# 6. Run
npm start
```

## Minimum Required Variables

For basic functionality, you need at least:

```env
# Firebase (for authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=storefront-64d56.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=storefront-64d56

# Anthropic AI (for page generation)
ANTHROPIC_API_KEY=your-key-here

# Cloudflare (for subdomain management)
CLOUDFLARE_API_TOKEN=your-token-here
CLOUDFLARE_ZONE_ID=your-zone-id-here
```

## Getting Your API Keys

### Firebase
1. Go to https://console.firebase.google.com/
2. Select project: **storefront-64d56**
3. Click ⚙️ > Project Settings
4. Scroll to "Your apps" > Web app
5. Copy the config values

### Anthropic (Claude)
1. Go to https://console.anthropic.com/
2. Navigate to API Keys
3. Create a new API key
4. Copy the key

### Cloudflare
1. Go to https://dash.cloudflare.com/
2. Select your domain (dfoldlab.co.uk)
3. Get Zone ID from right sidebar
4. Go to Profile > API Tokens
5. Create token with Zone > DNS > Edit permissions

## Testing Build Without Env Vars

To test that the build works without environment variables:

```bash
# Remove or rename .env.local
mv .env.local .env.local.backup

# Build
npm run build

# Should complete successfully ✅
```

## Production Deployment

For production, you MUST set all environment variables in your deployment platform:

- **Vercel**: Project Settings > Environment Variables
- **Netlify**: Site Settings > Environment Variables
- **Oracle Cloud**: Edit `/var/www/storefront/.env.production`

See [deploy/DEPLOYMENT_GUIDE.md](./deploy/DEPLOYMENT_GUIDE.md) for details.

## Troubleshooting

### Build Fails with Firebase Error
✅ **Fixed!** The build now handles missing Firebase keys gracefully.

### Runtime Errors
- Check that `.env.local` exists and has correct values
- Restart dev server after changing `.env.local`
- Verify API keys are valid and not expired

### Still Having Issues?
1. Check `.env.local` file exists in project root
2. Verify no typos in variable names
3. Ensure no extra spaces around `=` sign
4. Restart your dev server: `npm run dev`
