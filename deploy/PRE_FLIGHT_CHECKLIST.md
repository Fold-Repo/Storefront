# Pre-Flight Checklist - Before Running Setup Script

## ✅ Check These Before Running

### 1. Server Access
- [ ] You can SSH into your Oracle Cloud server
- [ ] You have sudo/root access
- [ ] Server is running Ubuntu 20.04+ or 22.04+
- [ ] Server has at least 2GB RAM and 20GB disk space

### 2. Domain & DNS
- [ ] You have a domain name ready (e.g., `storefront.dfoldlab.co.uk`)
- [ ] DNS A record points to your server IP
- [ ] DNS has propagated (check with `nslookup yourdomain.com`)
- [ ] You know your server's public IP address

### 3. Email Address
- [ ] You have an email for SSL certificate (Let's Encrypt)
- [ ] Email is accessible (for certificate notifications)

### 4. GitHub Repository
- [ ] Your code is in a GitHub repository
- [ ] Repository is accessible (public or you have SSH access)
- [ ] You know the repository URL

### 5. Environment Variables Ready
- [ ] You have your Firebase configuration
- [ ] You have Anthropic API key (if using AI features)
- [ ] You have Cloudflare API token (if using custom domains)
- [ ] You have any other API keys ready

### 6. Backup Plan
- [ ] You have a way to access the server if something goes wrong
- [ ] You've noted down your current server IP
- [ ] You have SSH key backup

---

## 🚀 Ready to Run?

If you've checked all the above, you're ready!

### Step 1: Connect to Server

```bash
ssh ubuntu@your-server-ip
# or
ssh opc@your-server-ip
```

### Step 2: Download Script

```bash
# Option A: Download directly
curl -O https://raw.githubusercontent.com/your-repo/storeFront/main/deploy/oracle-cloud-setup.sh

# Option B: Clone repository
git clone <your-repo-url>
cd storeFront/deploy
```

### Step 3: Make Executable

```bash
chmod +x oracle-cloud-setup.sh
```

### Step 4: Run Script

```bash
bash oracle-cloud-setup.sh
```

---

## ⚠️ Important Notes

### During Setup:
1. **Don't close your SSH session** - Script takes 10-15 minutes
2. **Answer prompts carefully** - Especially domain and email
3. **Save the database password** - If PostgreSQL is installed, you'll need it
4. **Wait for DNS** - If DNS isn't ready, you can skip SSL and add it later

### After Setup:
1. **Edit environment file** - Add your API keys to `.env.production`
2. **Test the deployment** - Make sure app starts correctly
3. **Set up GitHub Actions** - For automated deployments

---

## 🆘 If Something Goes Wrong

### Can't SSH back in?
- Check Oracle Cloud console
- Verify security list allows SSH (port 22)
- Try from different network

### Script fails?
- Check the error message
- Most issues are fixable
- You can re-run the script (it's mostly idempotent)

### Need to start over?
- Script is safe to run multiple times
- It won't break existing setup
- Can re-run to fix issues

---

## 📋 What the Script Will Ask

1. **Domain name** - e.g., `storefront.dfoldlab.co.uk`
2. **Email address** - For SSL certificate
3. **Install PostgreSQL?** - (y/n) - Only if you need a database
4. **DNS ready?** - (y/n) - For SSL certificate
5. **Deploy now?** - (y/n) - Deploy code immediately
6. **GitHub repo URL** - If you choose to deploy

---

## ✅ You're Ready If:

- ✅ You can SSH into server
- ✅ You have a domain name
- ✅ DNS points to your server (or you'll add SSL later)
- ✅ You have 15-20 minutes
- ✅ You have your API keys ready (can add later)

**Then go ahead and run it!** 🚀
