# Ready to Run the Setup Script! 🚀

## ✅ Prerequisites Checklist

Before running, make sure you have:

- [x] **Cloudflare DNS configured** (you've done this!)
  - A record: `dfoldlab.co.uk` → Your server IP
  - A record: `*.dfoldlab.co.uk` → Your server IP (wildcard)
  - Proxy enabled (orange cloud)

- [ ] **SSH access to your Oracle Cloud server**
  - You can connect via: `ssh ubuntu@your-server-ip`
  - You have sudo access

- [ ] **Server is running Ubuntu**
  - Check with: `lsb_release -a`

- [ ] **You have 15-20 minutes** (script takes time)

- [ ] **Email address ready** (for SSL certificate)

## 🚀 Step-by-Step: Running the Script

### Step 1: Connect to Your Server

```bash
ssh ubuntu@your-server-ip
# Replace with your actual server IP
```

### Step 2: Upload the Script

You have 3 options:

#### Option A: Clone from GitHub (Recommended)
```bash
# If your repo is on GitHub
git clone <your-repo-url>
cd storeFront/deploy
chmod +x oracle-cloud-setup.sh
```

#### Option B: Copy Script Directly
```bash
# On your local machine (in a new terminal)
scp deploy/oracle-cloud-setup.sh ubuntu@your-server-ip:~/

# Then on server
ssh ubuntu@your-server-ip
chmod +x oracle-cloud-setup.sh
```

#### Option C: Download from GitHub (if public)
```bash
# On server
curl -O https://raw.githubusercontent.com/your-username/repo/main/deploy/oracle-cloud-setup.sh
chmod +x oracle-cloud-setup.sh
```

### Step 3: Run the Script

```bash
bash oracle-cloud-setup.sh
```

## 📋 What the Script Will Ask

1. **Domain**: 
   - Press Enter to use default: `dfoldlab.co.uk`
   - Or type your domain if different

2. **Email**: 
   - Enter your email (for SSL certificate notifications)
   - Example: `your-email@example.com`

3. **PostgreSQL**: 
   - `y` if you need a database
   - `n` if you don't need it (most Next.js apps don't)

4. **DNS Ready?**: 
   - `y` (you've configured Cloudflare!)

5. **SSL Certificate Option**: 
   - `1` for standard (quick, main domain only)
   - `2` for wildcard (supports all subdomains, requires DNS challenge)
   - **Recommendation**: Choose `1` for now, you can upgrade later

6. **Deploy Now?**: 
   - `y` if you want to deploy code immediately
   - `n` if you want to configure environment first

7. **GitHub Repo URL** (if you chose to deploy):
   - Enter your repository URL
   - Example: `https://github.com/username/repo.git`

## ⏱️ What to Expect

The script will:
1. ✅ Update system packages (2-3 minutes)
2. ✅ Install Node.js 20.x (1-2 minutes)
3. ✅ Install PM2 (30 seconds)
4. ✅ Install PostgreSQL (if chosen, 2-3 minutes)
5. ✅ Configure Nginx (1 minute)
6. ✅ Configure firewall (30 seconds)
7. ✅ Get SSL certificate (2-5 minutes)
8. ✅ Create environment file (30 seconds)
9. ✅ Deploy code (if chosen, 5-10 minutes)

**Total time: 15-20 minutes**

## ⚠️ Important Notes

### During Setup:
- **Don't close your SSH session** - Script takes time
- **Don't interrupt** - Let it complete
- **Save any passwords shown** - Especially database password if installed

### After Setup:
1. **Edit environment file** with your API keys:
   ```bash
   nano /var/www/storefront/.env.production
   ```
   Add:
   - Firebase config
   - Anthropic API key
   - Cloudflare API token (if using)
   - Other API keys

2. **If you didn't deploy during setup**, deploy manually:
   ```bash
   cd /var/www/storefront
   git clone <your-repo-url> .
   npm ci
   npm run build
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

## 🧪 Testing After Setup

### 1. Check App Status
```bash
pm2 status
pm2 logs storefront
```

### 2. Test Main Domain
```bash
curl -I https://dfoldlab.co.uk
# Should return 200 OK
```

### 3. Test Subdomain
```bash
curl -I https://teststore.dfoldlab.co.uk
# Should return 200 OK (or your app's response)
```

### 4. Check Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
```

## 🆘 If Something Goes Wrong

### Script Fails?
- Check the error message
- Most issues are fixable
- You can re-run the script (it's mostly safe to re-run)

### Can't SSH Back?
- Check Oracle Cloud console
- Verify security list allows SSH (port 22)
- Try from different network

### SSL Certificate Issues?
- Make sure DNS is fully propagated (can take up to 48 hours)
- Check Cloudflare proxy is enabled
- You can add SSL later: `sudo certbot --nginx -d dfoldlab.co.uk`

### App Not Starting?
```bash
# Check logs
pm2 logs storefront

# Check if port 3000 is in use
sudo netstat -tlnp | grep 3000

# Restart app
pm2 restart storefront
```

## ✅ Success Indicators

You'll know it worked when:
- ✅ Script completes without errors
- ✅ `pm2 status` shows app running
- ✅ `https://dfoldlab.co.uk` loads
- ✅ `https://teststore.dfoldlab.co.uk` loads
- ✅ SSL certificate is valid (green lock in browser)

## 📚 Next Steps After Setup

1. **Configure Environment Variables**
   - Edit `/var/www/storefront/.env.production`
   - Add all your API keys

2. **Set Up GitHub Actions** (for automated deployment)
   - Add GitHub Secrets: `SSH_PRIVATE_KEY`, `SERVER_IP`, `SERVER_USER`
   - Push to main branch to deploy

3. **Create Your First Store**
   - Log in to dashboard
   - Create a store
   - Test subdomain routing

4. **Monitor Logs**
   ```bash
   pm2 logs storefront
   pm2 monit
   ```

## 🎉 You're Ready!

If you've configured Cloudflare DNS, you're good to go! Run the script and follow the prompts.

**Good luck!** 🚀
