# Deploying to Vercel with Subdomain Support

This guide explains how to deploy your storefront platform to Vercel and configure your domain to support dynamic subdomains for your users.

## Prerequisites

-   A [Vercel](https://vercel.com) account.
-   A domain name (e.g., `yourdomain.com`).
-   DNS managed by a provider like [Cloudflare](https://cloudflare.com) (Recommended).

---

## Step 1: Deploy to Vercel

1.  Push your code to a GitHub/GitLab/Bitbucket repository.
2.  Import your project into Vercel.
3.  Configure the following **Environment Variables** during or after deployment:
    -   `NEXT_PUBLIC_MAIN_DOMAIN`: Set to your root domain (e.g., `yourdomain.com`).
    -   `NEXT_PUBLIC_STORAGE_BACKEND`: `firebase`
    -   All Firebase configuration variables (API Key, Project ID, etc.).
    -   `CLOUDFLARE_API_TOKEN` & `CLOUDFLARE_ZONE_ID` (if using programmatic DNS).

---

## Step 2: Configure Domains in Vercel

1.  Go to your project in the **Vercel Dashboard**.
2.  Navigate to **Settings > Domains**.
3.  Add your root domain: `yourdomain.com`.
4.  **CRITICAL**: Add a wildcard domain: `*.yourdomain.com`.
    > [!IMPORTANT]
    > The wildcard domain is what allows Vercel to receive requests for any subdomain (e.g., `user1.yourdomain.com`) and pass them to your middleware.

---

## Step 3: Configure DNS (Cloudflare)

To make subdomains work in production, your DNS must point to Vercel's servers.

1.  Log in to **Cloudflare**.
2.  Go to the **DNS** tab for your domain.
3.  Add or update these records:

| Type | Name | Content | Proxy Status |
| :--- | :--- | :--- | :--- |
| **CNAME** | `@` | `cname.vercel-dns.com` | **DNS Only** (Gray Cloud) |
| **CNAME** | `*` | `cname.vercel-dns.com` | **DNS Only** (Gray Cloud) |

> [!TIP]
> While you can use the "Proxied" (Orange Cloud) status, it is often simpler to start with "DNS Only" to ensure Vercel's SSL issuance works without interference.

---

## Step 4: How Routing Works

Once configured, the flow works as follows:

1.  **User visits** `mystore.yourdomain.com`.
2.  **DNS** resolves this via the wildcard `*` record to Vercel.
3.  **Vercel** receives the request because of the `*.yourdomain.com` mapping.
4.  **Middleware** (`proxy.ts`) runs:
    -   Extracts `mystore` from the hostname.
    -   Sets the `x-storefront-id` header.
    -   Rewrites the request internally to `/storefront/mystore`.
5.  **Storefront Page** (`app/storefront/[[...path]]/page.tsx`) fetches data from Firebase for the `mystore` ID and renders the site.

---

## Troubleshooting

-   **Subdomain redirects to main site**: Check that `NEXT_PUBLIC_MAIN_DOMAIN` is exactly right and matches your Host header.
-   **SSL Errors**: Ensure Vercel has finished issuing the certificate for the wildcard domain. This can take up to 30 minutes after DNS changes.
-   **404 Errors**: Ensure you have added `*.yourdomain.com` in the Vercel Domains settings.

---

## Testing with Custom Domains

If a user wants to use their own domain (e.g., `theirdomain.com`):
1.  They must create a **CNAME** record pointing to `cname.vercel-dns.com`.
2.  You must add their domain to your Vercel project (can be done via Vercel API).
3.  Your middleware will detect the different hostname and look up their `storefrontId` in Firebase.
