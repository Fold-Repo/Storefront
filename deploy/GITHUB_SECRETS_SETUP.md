# GitHub Secrets Setup Guide

## Overview

To enable automated deployment via GitHub Actions, you need to add secrets to your GitHub repository. These secrets allow GitHub Actions to securely connect to your server and deploy your code.

## Required GitHub Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

### 1. SSH_PRIVATE_KEY

**What it is:** Your private SSH key to connect to the server

**Which key to use:**
- ✅ **Oracle's private key** (if Oracle generated it) - The `.pem` or `.key` file you downloaded
- ✅ **Your own private key** (if you uploaded your public key) - Usually `~/.ssh/id_rsa`

**How to get it:**

**Option A: Using Oracle's Key (Most Common)**
```bash
# Find your Oracle key file (usually in Downloads)
ls ~/Downloads/*.pem ~/Downloads/*.key

# Copy the entire key content
cat ~/Downloads/your-oracle-key.pem
# Copy everything including BEGIN and END lines
```

**Option B: Using Your Own Key**
```bash
# Check if you have a key
cat ~/.ssh/id_rsa

# If you don't have one, generate it:
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy the private key (the one WITHOUT .pub)
cat ~/.ssh/id_rsa
```

**Important:**
- Copy the **entire** private key (starts with `-----BEGIN OPENSSH PRIVATE KEY-----` or `-----BEGIN RSA PRIVATE KEY-----`)
- Include the BEGIN and END lines
- This is your **private** key (not the `.pub` file)
- **Use the same key that works for manual deployment!**

**Add to GitHub Secrets:**
1. Go to: GitHub Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `SSH_PRIVATE_KEY`
4. Value: Paste the entire private key content (including BEGIN/END lines)
5. Click "Add secret"

**Note:** The GitHub Actions workflow uses `webfactory/ssh-agent` which automatically handles the SSH key - you just need to add it to GitHub Secrets. No code changes needed!

---

### 2. SERVER_IP

**What it is:** Your Oracle Cloud server's public IP address

**Value:** `79.72.95.124` (from your setup)

**How to verify:**
```bash
# On your server
curl ifconfig.me
```

---

### 3. SERVER_USER

**What it is:** The username to SSH into your server

**Value:** `ubuntu` (or whatever user you're using)

**Common values:**
- `ubuntu` (Ubuntu servers)
- `opc` (Oracle Linux)
- Your custom username

**How to verify:**
```bash
# Check who you SSH as
# Usually shown in your SSH command: ssh ubuntu@79.72.95.124
```

---

### 4. DEPLOY_PATH (Optional)

**What it is:** The directory where your app is deployed on the server

**Default value:** `/var/www/storefront`

**When to change:** Only if you deployed to a different directory

---

## Step-by-Step Setup

### Step 1: Generate SSH Key (if needed)

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Press Enter to accept default location (~/.ssh/id_rsa)
# Enter a passphrase (optional but recommended)
```

### Step 2: Add Public Key to Server

```bash
# Copy your public key
cat ~/.ssh/id_rsa.pub

# SSH into your server
ssh ubuntu@79.72.95.124

# On the server, add the public key
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "your-public-key-content-here" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 3: Test SSH Connection

```bash
# From your local machine, test SSH without password
ssh ubuntu@79.72.95.124

# Should connect without asking for password
```

### Step 4: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:

#### Secret 1: SSH_PRIVATE_KEY
- **Name:** `SSH_PRIVATE_KEY`
- **Value:** Your private key (from `~/.ssh/id_rsa`)
- **Important:** Copy the entire key including BEGIN/END lines

#### Secret 2: SERVER_IP
- **Name:** `SERVER_IP`
- **Value:** `79.72.95.124`

#### Secret 3: SERVER_USER
- **Name:** `SERVER_USER`
- **Value:** `ubuntu` (or your username)

#### Secret 4: DEPLOY_PATH (Optional)
- **Name:** `DEPLOY_PATH`
- **Value:** `/var/www/storefront`

---

## Quick Reference Table

| Secret Name | Value | Example |
|------------|-------|---------|
| `SSH_PRIVATE_KEY` | Your private SSH key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_IP` | Server IP address | `79.72.95.124` |
| `SERVER_USER` | SSH username | `ubuntu` |
| `DEPLOY_PATH` | Deployment directory | `/var/www/storefront` |

---

## Verification

After adding secrets, test the deployment:

1. **Push to main branch:**
   ```bash
   git push origin main
   ```

2. **Check GitHub Actions:**
   - Go to **Actions** tab in your repository
   - You should see a workflow running
   - Check the logs to verify it connects to your server

3. **Verify deployment:**
   ```bash
   # SSH into server
   ssh ubuntu@79.72.95.124
   
   # Check if code was deployed
   cd /var/www/storefront
   ls -la
   
   # Check PM2 status
   pm2 status
   ```

---

## Troubleshooting

### SSH Connection Fails

**Error:** "Permission denied (publickey)"

**Fix:**
1. Verify public key is in `~/.ssh/authorized_keys` on server
2. Check file permissions: `chmod 600 ~/.ssh/authorized_keys`
3. Verify private key in GitHub Secrets is correct (full key with BEGIN/END)

### Server Not Found

**Error:** "Could not resolve hostname"

**Fix:**
1. Verify `SERVER_IP` is correct
2. Check server is running and accessible
3. Verify firewall allows SSH (port 22)

### Deployment Path Error

**Error:** "No such file or directory"

**Fix:**
1. Verify `DEPLOY_PATH` matches actual deployment directory
2. Check directory exists: `ls -la /var/www/storefront`
3. Verify permissions: `sudo chown -R ubuntu:ubuntu /var/www/storefront`

---

## Security Best Practices

1. **Never commit secrets to git**
   - Secrets should only be in GitHub Secrets
   - Add `.env*` to `.gitignore`

2. **Use strong SSH keys**
   - Use RSA 4096-bit or Ed25519
   - Use a passphrase for your SSH key

3. **Rotate keys regularly**
   - Change SSH keys periodically
   - Update GitHub Secrets when rotating

4. **Limit SSH access**
   - Use key-based authentication only
   - Disable password authentication on server

---

## Your Specific Values

Based on your setup:

```yaml
SSH_PRIVATE_KEY: [Your private SSH key - get from ~/.ssh/id_rsa]
SERVER_IP: 79.72.95.124
SERVER_USER: ubuntu
DEPLOY_PATH: /var/www/storefront
```

---

## Next Steps

After adding secrets:

1. ✅ Push code to trigger deployment
2. ✅ Check GitHub Actions tab
3. ✅ Verify deployment on server
4. ✅ Test your application

---

## Need Help?

If deployment fails:
1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Test SSH connection manually
4. Check server logs: `pm2 logs storefront`
