# API Keys Setup Guide

## Quick Links

### 1. Cloudflare Sign Up
🔗 **Sign Up**: https://dash.cloudflare.com/sign-up

### 2. Anthropic Claude Sign Up
🔗 **Sign Up**: https://console.anthropic.com/signup

---

## Cloudflare Setup

### Step 1: Sign Up
1. Go to: https://dash.cloudflare.com/sign-up
2. Enter your email and password
3. Verify your email address
4. Complete the signup process

### Step 2: Add Your Domain
1. After logging in, click **"Add a Site"**
2. Enter your domain name (e.g., `yourdomain.com`)
3. Choose a plan (Free plan is sufficient)
4. Click **"Continue"**

### Step 3: Get Your Zone ID
1. After adding your domain, you'll see the dashboard
2. Click on your domain name
3. Scroll down to **"API"** section on the right sidebar
4. Your **Zone ID** is displayed there (copy it)

### Step 4: Create API Token
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Click **"Edit zone DNS"** template (or create custom token)
4. Set permissions:
   - **Zone** → **DNS** → **Edit**
5. Set zone resources:
   - **Include** → **Specific zone** → Select your domain
6. Click **"Continue to summary"**
7. Click **"Create Token"**
8. **Copy the token immediately** (you won't see it again!)

### Step 5: Configure DNS
1. Go back to your domain dashboard
2. Click **"DNS"** in the left menu
3. Add a wildcard A record:
   - **Type**: A
   - **Name**: `*` (asterisk for wildcard)
   - **IPv4 address**: Your server IP address
   - **Proxy status**: Proxied (orange cloud) ✅
   - **TTL**: Auto
4. Click **"Save"**

### Step 6: Update Nameservers
1. Cloudflare will show you nameservers (e.g., `alice.ns.cloudflare.com`)
2. Go to your domain registrar (where you bought the domain)
3. Update nameservers to Cloudflare's nameservers
4. Wait for DNS propagation (usually 5-30 minutes)

### Step 7: Enable SSL
1. Go to **SSL/TLS** in the left menu
2. Set encryption mode to **"Full"** or **"Full (strict)"**
3. Cloudflare will automatically provision SSL certificates

### Environment Variables
Add to `.env.local`:
```env
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ZONE_ID=your_zone_id_here
SERVER_IP=your_server_ip_address
NEXT_PUBLIC_MAIN_DOMAIN=yourdomain.com
```

---

## Anthropic Claude Setup

### Step 1: Sign Up
1. Go to: https://console.anthropic.com/signup
2. Enter your email address
3. Verify your email
4. Complete the signup process

### Step 2: Add Payment Method
1. After signing up, you'll need to add a payment method
2. Go to: https://console.anthropic.com/settings/billing
3. Click **"Add Payment Method"**
4. Enter your credit card details
5. Claude uses pay-as-you-go pricing (very affordable)

### Step 3: Create API Key
1. Go to: https://console.anthropic.com/settings/keys
2. Click **"Create Key"**
3. Give it a name (e.g., "Storefront Generator")
4. Click **"Create Key"**
5. **Copy the API key immediately** (starts with `sk-ant-`)

### Step 4: Check Pricing
- **Claude 3.5 Sonnet**: $3 per 1M input tokens, $15 per 1M output tokens
- **Estimated cost per storefront**: ~$0.41 (8 pages)
- Very affordable for development and production

### Step 5: Test API Key (Optional)
You can test your API key using curl:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Environment Variables
Add to `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

---

## Complete .env.local Template

Create `.env.local` in your project root:

```env
# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
CLOUDFLARE_ZONE_ID=your_cloudflare_zone_id_here
SERVER_IP=your_server_ip_address
NEXT_PUBLIC_MAIN_DOMAIN=yourdomain.com

# Anthropic Claude Configuration
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Firebase Configuration (if not already set)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# API Configuration
NEXT_PUBLIC_API_URL=your_api_url_here
```

---

## Quick Reference Links

### Cloudflare
- **Sign Up**: https://dash.cloudflare.com/sign-up
- **Dashboard**: https://dash.cloudflare.com
- **API Tokens**: https://dash.cloudflare.com/profile/api-tokens
- **Documentation**: https://developers.cloudflare.com/api

### Anthropic Claude
- **Sign Up**: https://console.anthropic.com/signup
- **Console**: https://console.anthropic.com
- **API Keys**: https://console.anthropic.com/settings/keys
- **Pricing**: https://www.anthropic.com/pricing
- **Documentation**: https://docs.anthropic.com

---

## Security Best Practices

1. **Never commit `.env.local` to git** (it's already in `.gitignore`)
2. **Use environment variables** for all API keys
3. **Rotate API keys** periodically
4. **Use least privilege** for API tokens (Cloudflare)
5. **Monitor usage** in both dashboards
6. **Set up billing alerts** (Claude)

---

## Troubleshooting

### Cloudflare
- **API token not working**: Check permissions and zone resources
- **DNS not resolving**: Wait for propagation (up to 48 hours, usually 5-30 min)
- **SSL not working**: Ensure proxy is enabled (orange cloud)

### Anthropic Claude
- **API key invalid**: Check if key starts with `sk-ant-`
- **Rate limits**: Check your usage in the console
- **Billing issues**: Verify payment method is active

---

## Next Steps

1. ✅ Sign up for Cloudflare
2. ✅ Add domain and get Zone ID
3. ✅ Create API token
4. ✅ Configure DNS wildcard
5. ✅ Sign up for Anthropic Claude
6. ✅ Create API key
7. ✅ Add all keys to `.env.local`
8. ✅ Restart your dev server
9. ✅ Test subdomain creation
10. ✅ Test AI page generation

---

## Cost Estimates

### Cloudflare
- **Free tier**: Unlimited subdomains, free SSL, CDN, DDoS protection
- **Cost**: $0/month (free tier is sufficient)

### Anthropic Claude
- **Per storefront**: ~$0.41 (8 pages)
- **100 storefronts/month**: ~$41/month
- **1,000 storefronts/month**: ~$410/month
- Very affordable compared to alternatives!

---

## Support

- **Cloudflare Support**: https://support.cloudflare.com
- **Anthropic Support**: support@anthropic.com
- **Documentation**: See links above
