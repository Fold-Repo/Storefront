# How to Get Server IP from Namecheap Hosting

## Method 1: From Namecheap cPanel (Most Common)

### Step 1: Log into Namecheap
1. Go to: https://www.namecheap.com/
2. Click **"Sign In"** (top right)
3. Enter your credentials

### Step 2: Access Your Hosting Account
1. After logging in, click **"Dashboard"** or **"Account"**
2. Go to **"Hosting List"** or **"Products"** → **"Hosting"**
3. Click on your hosting account

### Step 3: Find Server IP in cPanel
1. Click **"Manage"** or **"cPanel"** button
2. In cPanel, look for **"Server Information"** or **"General Information"** section
3. Look for **"Shared IP Address"** or **"Dedicated IP Address"**
4. Copy the IP address (format: `xxx.xxx.xxx.xxx`)

**Alternative locations in cPanel:**
- **"Stats"** section → **"Server Information"**
- **"Metrics"** → **"Server Information"**
- **"Account Information"** panel

## Method 2: From Namecheap Account Dashboard

### Step 1: Access Hosting Details
1. Log into Namecheap
2. Go to **"Dashboard"** → **"Hosting List"**
3. Click on your hosting package

### Step 2: View Server Details
1. Look for **"Server"** or **"Server Information"** section
2. The IP address should be displayed there
3. It may be labeled as:
   - **"Server IP"**
   - **"Shared IP"**
   - **"Dedicated IP"**
   - **"IP Address"**

## Method 3: Using SSH/Terminal (If You Have Access)

If you have SSH access to your server:

```bash
# Method 1: Using hostname
hostname -I

# Method 2: Using ifconfig
ifconfig | grep "inet " | grep -v 127.0.0.1

# Method 3: Using ip command
ip addr show | grep "inet " | grep -v 127.0.0.1

# Method 4: Using curl to external service
curl ifconfig.me
curl ipinfo.io/ip
```

## Method 4: Check Your Domain's A Record

If your domain is already pointing to your hosting:

1. Go to: https://www.whatsmydns.net/
2. Enter your domain: `dfoldlab.co.uk`
3. Select **"A"** record type
4. Click **"Search"**
5. The IP address shown is your server IP

**Or use command line:**
```bash
nslookup dfoldlab.co.uk
# or
dig dfoldlab.co.uk +short
```

## Method 5: From Namecheap Support

If you can't find it:

1. Contact Namecheap Support
2. Ask: "What is the IP address for my hosting account?"
3. Provide your hosting account username or domain name

## Important Notes

### Shared vs Dedicated IP
- **Shared IP**: Multiple websites share the same IP (most common)
- **Dedicated IP**: Your website has its own unique IP (usually costs extra)

For Cloudflare DNS setup, you can use either, but **shared IP is fine**.

### IPv4 vs IPv6
- Most hosting uses **IPv4** (format: `xxx.xxx.xxx.xxx`)
- Some also have **IPv6** (longer format)
- For Cloudflare, use the **IPv4 address**

## For Cloudflare DNS Setup

Once you have your server IP:

1. **Add to `.env.local`:**
```env
SERVER_IP=your_server_ip_here
```

2. **In Cloudflare DNS:**
   - Type: **A**
   - Name: `*` (for wildcard) or specific subdomain
   - IPv4 address: Your server IP
   - Proxy: **Proxied** (orange cloud) ✅
   - TTL: **Auto**

## Quick Check: Is This the Right IP?

After getting the IP, verify it's correct:

1. **Ping your domain:**
```bash
ping dfoldlab.co.uk
```
The IP shown should match your server IP.

2. **Check current DNS:**
```bash
nslookup dfoldlab.co.uk
```

## Common Namecheap Hosting IP Formats

Namecheap hosting IPs typically look like:
- `xxx.xxx.xxx.xxx` (IPv4)
- Usually starts with numbers like `185.`, `198.`, `162.`, etc.

## Troubleshooting

### Can't Find IP in cPanel
- Check if you're logged into the correct hosting account
- Look in different sections (Stats, Metrics, Account Info)
- Contact Namecheap support

### IP Not Working with Cloudflare
- Ensure the IP is correct (IPv4, not IPv6)
- Wait for DNS propagation (5-30 minutes)
- Check if your hosting allows external DNS (some require using Namecheap DNS)

### Need to Use Namecheap DNS Instead
If your hosting requires Namecheap DNS:
1. Use Namecheap's DNS management
2. Add A record: `*` → Your server IP
3. Update nameservers at Cloudflare (if using Cloudflare)

## Next Steps

After getting your server IP:

1. ✅ Add to `.env.local`: `SERVER_IP=your_ip_here`
2. ✅ Configure Cloudflare DNS with the IP
3. ✅ Test subdomain creation
4. ✅ Verify DNS propagation

## Support Links

- **Namecheap Support**: https://www.namecheap.com/support/
- **Namecheap Knowledge Base**: https://www.namecheap.com/support/knowledgebase/
- **Namecheap Live Chat**: Available in your account dashboard
