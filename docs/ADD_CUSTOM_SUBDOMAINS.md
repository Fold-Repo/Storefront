# 🌐 How to add `app` and `api` subdomains

This guide explains how to set up `app.dfoldlab.co.uk` and `api.dfoldlab.co.uk` manually.

---

## 1. Setting up `app.dfoldlab.co.uk`
(Intended to point to your main Next.js App/Dashboard)

### Step A: Cloudflare (DNS)
1. Log in to your **Cloudflare Dashboard**.
2. Select the `dfoldlab.co.uk` zone.
3. Go to **DNS** > **Records**.
4. Click **Add Record**:
   - **Type:** `CNAME`
   - **Name:** `app`
   - **Target:** `shorp-landing.netlify.app` (Use the URL of your Dashboard project)
   - **Proxy status:** Proxied (Orange cloud)
5. Click **Save**.

### Step B: Netlify (Domain Registration)
*Since this is a platform subdomain, Netlify needs to know about it.*
1. Log in to your **Netlify Dashboard**.
2. Go to **Site settings** > **Domain management** > **Custom domains**.
3. Click **Add custom domain**.
4. Enter `app.dfoldlab.co.uk` and click **Verify**.
5. Once added, Netlify will automatically provision an SSL certificate for it.

---

## 2. Setting up `api.dfoldlab.co.uk` (Optional)
**Note**: The application now uses `https://shorp-epos-backend.onrender.com/api/v1` directly. The `api.dfoldlab.co.uk` subdomain is optional and only needed if you want a custom domain for your API.

If you want to set up the custom API subdomain:

### Step A: Cloudflare (DNS)
1. Log in to your **Cloudflare Dashboard**.
2. Select the `dfoldlab.co.uk` zone.
3. Go to **DNS** > **Records**.
4. Click **Add Record**:
   - **Type:** `CNAME`
   - **Name:** `api`
   - **Target:** `shorp-epos-backend.onrender.com`
   - **Proxy status:** Proxied (Orange cloud)
5. Click **Save**.

### Step B: Render (Configuration)
1. Log in to your **Render Dashboard**.
2. Go to your **Web Service** (`shorp-epos-backend`).
3. Go to **Settings** > **Custom Domains**.
4. Click **Add Custom Domain**.
5. Enter `api.dfoldlab.co.uk` and click **Save**.

**Important**: The app now uses `https://shorp-epos-backend.onrender.com/api/v1` by default. If you want to use `api.dfoldlab.co.uk` instead, you must set `NEXT_PUBLIC_API_URL=https://api.dfoldlab.co.uk/api/v1` in your environment variables.

---

## 3. How the App Handles This
I have already updated your `middleware.ts` to recognize these names. 

- **`app.dfoldlab.co.uk`**: The app will treat this just like the main domain (`dfoldlab.co.uk`). It will NOT try to look for a storefront named "app". It will show your main landing/dashboard routes.
- **`api.dfoldlab.co.uk`**: Traffic for this subdomain will go straight from Cloudflare to Render. It will **completely bypass** your Next.js app on Netlify.

---

## ✅ Verification
1. Open [app.dfoldlab.co.uk](https://app.dfoldlab.co.uk). You should see your main Next.js site.
2. The API is available at: `https://shorp-epos-backend.onrender.com/api/v1`
3. (Optional) If you set up `api.dfoldlab.co.uk`, test it at: [api.dfoldlab.co.uk/api/v1](https://api.dfoldlab.co.uk/api/v1)
