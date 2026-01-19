# Troubleshooting: Script Hanging

## Don't Delete the Instance!

The script might be hanging, but we can fix it without deleting anything.

## Quick Diagnosis

**Check what's happening:**

```bash
# On server, check if script is still running
ps aux | grep COMPLETE_DOCKER_SETUP

# Check what process is using resources
top

# Check network activity
sudo ss -tulpn | head -20
```

## Common Hang Points & Fixes

### 1. Hanging at Docker Installation

**Symptom:** Script stuck at "Installing Docker..."

**Fix:**
```bash
# Cancel script (Ctrl+C)
# Install Docker manually
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sudo sh /tmp/get-docker.sh
sudo usermod -aG docker $USER

# Then continue with script or run remaining steps manually
```

### 2. Hanging at Runner Download

**Symptom:** Script stuck at "Downloading GitHub Actions runner..."

**Fix:**
```bash
# Cancel script (Ctrl+C)
# Download runner manually
cd ~/actions-runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract
tar xzf actions-runner-linux-x64-2.311.0.tar.gz

# Continue with script or configure manually
```

### 3. Hanging at Runner Configuration

**Symptom:** Script waiting for input

**Fix:**
```bash
# Check if script is waiting for input
# Press Enter or provide the input it's asking for
```

### 4. Network Timeout

**Symptom:** Downloads timing out

**Fix:**
```bash
# Increase timeout or download manually
# Check internet connection
ping -c 3 8.8.8.8
```

## Resume Setup Manually

**If script hangs, you can continue manually:**

### Step 1: Check What's Already Done

```bash
# Check if Docker is installed
docker --version

# Check if runner is downloaded
ls -la ~/actions-runner/

# Check if Nginx is configured
sudo nginx -t
```

### Step 2: Complete Missing Steps

**If Docker not installed:**
```bash
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sudo sh /tmp/get-docker.sh
sudo usermod -aG docker $USER
newgrp docker  # Or log out and back in
```

**If Runner not configured:**
```bash
cd ~/actions-runner
# Get token from GitHub (see Step 1 in checklist)
./config.sh --url https://github.com/YOUR_USER/YOUR_REPO --token YOUR_TOKEN
sudo ./svc.sh install
sudo ./svc.sh start
```

**If Nginx not configured:**
```bash
# Copy config
sudo cp deploy/nginx-docker.conf /etc/nginx/sites-available/storefront
# Update domain if needed
sudo nginx -t
sudo systemctl reload nginx
```

## Alternative: Use Individual Scripts

**Instead of one big script, use smaller scripts:**

```bash
# 1. Install Docker only
bash deploy/SETUP_RUNNER.sh  # (first part installs Docker)

# 2. Configure runner manually
cd ~/actions-runner
./config.sh --url YOUR_REPO_URL --token YOUR_TOKEN
sudo ./svc.sh install
sudo ./svc.sh start

# 3. Configure Nginx manually
sudo cp deploy/nginx-docker.conf /etc/nginx/sites-available/storefront
sudo nginx -t && sudo systemctl reload nginx
```

## Check Current Status

**Run this to see what's done:**

```bash
echo "=== Docker ==="
docker --version 2>/dev/null || echo "Not installed"

echo ""
echo "=== Runner ==="
cd ~/actions-runner 2>/dev/null && sudo ./svc.sh status || echo "Not configured"

echo ""
echo "=== Nginx ==="
sudo nginx -t 2>&1 | head -3

echo ""
echo "=== Docker Network ==="
docker network ls | grep storefront || echo "Not created"
```

## Force Kill and Restart

**If script is completely stuck:**

```bash
# Find and kill the script
ps aux | grep COMPLETE_DOCKER_SETUP
kill -9 PROCESS_ID

# Or kill all bash processes (be careful!)
# pkill -f COMPLETE_DOCKER_SETUP

# Then restart script or continue manually
```

## Quick Fix: Skip to What Works

**If script keeps hanging, do it step by step:**

1. **Install Docker manually** (if not done)
2. **Download runner manually** (if not done)
3. **Configure runner manually** (if not done)
4. **Configure Nginx manually** (if not done)
5. **Create network manually** (if not done)

**Then skip to:**
- Add GitHub Secrets
- Push to main
- Deploy!

## Summary

**Don't delete instance!** Instead:

1. ✅ **Check what's done** - See what completed
2. ✅ **Continue manually** - Complete remaining steps
3. ✅ **Or restart script** - It will skip already-done steps
4. ✅ **Or use smaller scripts** - Break it into parts

**The script is idempotent** - Running it again won't break things, it will skip what's already done.
