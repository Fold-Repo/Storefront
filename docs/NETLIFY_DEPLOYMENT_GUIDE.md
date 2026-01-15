# How to Deploy to Netlify (Simple Version)

This guide shows you how to put your shop on Netlify so everyone can visit it! 🚀

## What is Netlify?
Think of Netlify as a house for your website. You build the website in code, and Netlify gives it a home on the internet.

---

## Step 1: Put Your Code on Netlify

1.  **Log in to Netlify**.
2.  Your site is already created at: **`https://storefronte.netlify.app/`**.
3.  Ensure your **Environment Variables** are set in **Site configuration > Environment variables**:
    -   `NETLIFY_ACCESS_TOKEN`: You make this in User Settings > Applications > New Access Token.
    -   `NETLIFY_SITE_ID`: You find this in Site configuration > General > Site details (API ID).
    -   `NEXT_PUBLIC_MAIN_DOMAIN`: **`dfoldlab.co.uk`**
    -   `NEXT_PUBLIC_STORAGE_BACKEND`: `firebase`

---

## Step 2: Make Subdomains Work (The Magic Part) 🪄

You want users to have sites like `bob.dfoldlab.co.uk` and `alice.dfoldlab.co.uk`.

1.  Go to **Domain Management** in Netlify for your `storefronte` site.
2.  Add your main domain: **`dfoldlab.co.uk`**.
3.  **The Secret Trick**: Click **"Add domain alias"** and type **`*.dfoldlab.co.uk`**.
    -   The `*` is a wildcard. It means "anything".
    -   Now, Netlify will answer the phone for `anything.dfoldlab.co.uk`!

---

## Step 3: Point the Internet to Netlify (Cloudflare & Namecheap)

Since you bought your domain on **Namecheap** but control it with **Cloudflare**, you only need to change settings in **Cloudflare**.

### 1. Check Namecheap (One-Time Only)
Ensure your Namecheap domain uses "**Custom DNS**" pointing to Cloudflare nameservers (e.g., `sara.ns.cloudflare.com`, `todd.ns.cloudflare.com`). **Do not touch Namecheap again.**

### 2. Configure Cloudflare DNS
Log in to Cloudflare, select `dfoldlab.co.uk`, and go to **DNS > Records**.

Add the following 3 records.

| Type | Name | Content / Target | Proxy Status | Why? |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `@` | `storefronte.netlify.app` | **DNS Only** (Grey Cloud) | Points your main site (`dfoldlab.co.uk`) to Netlify. |
| **CNAME** | `www` | `storefronte.netlify.app` | **DNS Only** (Grey Cloud) | Points `www.dfoldlab.co.uk` to Netlify. |
| **CNAME** | `*` | `storefronte.netlify.app` | **DNS Only** (Grey Cloud) | **Crucial**: Sends ALL subdomains (like `bob.dfoldlab.co.uk`) to Netlify. |

> **Important**: Set Proxy Status to **DNS Only (Grey Cloud)** ☁️ initially.
> If you leave it as "Proxied" (Orange Cloud) 🍊, Cloudflare tries to hide the destination, which can confuse Netlify's SSL generation. You can switch to Proxied later if you need Cloudflare features, but "DNS Only" is safest for setup.

**Final Result**:
-   `dfoldlab.co.uk` -> Goes to your main landing page.
-   `cool-store.dfoldlab.co.uk` -> Goes to your app, and your code shows the "Cool Store" page!

---

## Step 4: Using Custom Domains (Like `bob-store.com`)

If a customer (Bob) wants his own domain:

1.  Bob buys `bob-store.com` (from anywhere).
2.  Bob goes to his DNS settings.
3.  He adds a **CNAME** record:
    -   **Host**: `www`
    -   **Value**: `storefronte.netlify.app` (or `dfoldlab.co.uk` if proxied).
4.  **You** (or your app) tells Netlify: "Hey, accept traffic for bob-store.com too!"
    -   Our code uses the **Netlify API** (`addCustomDomainToNetlify`) to do this automatically when Bob clicks "Connect Domain" in his dashboard.

---

## Troubleshooting (Fixing Problems) 🔧

-   **"Site Not Found"**: Did you add the `*.dfoldlab.co.uk` alias in Netlify Domain Settings? Without this, Netlify rejects the subdomains.
-   **"Connection not private"**: Wait 10 minutes. Netlify is making a security certificate that covers `dfoldlab.co.uk` AND `*.dfoldlab.co.uk`.
-   **404 Errors**: Ensure your `netlify.toml` file is in your git repo permissions and does NOT have `publish = ".next"`.
