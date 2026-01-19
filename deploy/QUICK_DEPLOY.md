# Quick Manual Deployment

## Where to Run the Script

**Run `./deploy/deploy-manual.sh` on your LOCAL PC**, not on the server!

The script:
1. ✅ Builds on your local machine (faster, no timeout)
2. ✅ Packages the build
3. ✅ Uploads to server via `scp`
4. ✅ SSHs into server to deploy

## Step-by-Step

### On Your Local PC:

```bash
# 1. Navigate to project directory
cd /path/to/storeFront

# 2. Set your server IP
export SERVER_IP=your-actual-server-ip

# 3. Run the script
./deploy/deploy-manual.sh
```

### What Happens:

```
[1/5] Building project locally...     ← On your PC
[2/5] Creating deployment package...   ← On your PC
[3/5] Uploading to server...          ← Uploads to server
[4/5] Deploying on server...          ← SSHs and deploys
[5/5] Cleaning up...                  ← On your PC
```

## Alternative: One-Liner

```bash
SERVER_IP=your-server-ip ./deploy/deploy-manual.sh
```

## First Time Setup (On Server)

If you haven't run the setup script yet, do this **on the server** first:

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Run setup script (one time only)
bash deploy/oracle-cloud-setup.sh

# Edit environment variables
nano /var/www/storefront/.env.production
# Add: Firebase keys, Anthropic key, Cloudflare credentials
```

## Troubleshooting

### "Please set SERVER_IP"
```bash
export SERVER_IP=your-actual-server-ip
```

### "Permission denied (publickey)"
- Make sure your SSH key is added to the server
- Or use password: `ssh -o PreferredAuthentications=password ubuntu@your-server-ip`

### "No such file or directory"
- Make sure you're in the project root directory
- The script should be at: `./deploy/deploy-manual.sh`

## Why Build Locally?

- ✅ **Faster**: Your PC is usually faster than a VPS
- ✅ **No timeout**: SSH won't disconnect during long builds
- ✅ **Better debugging**: See build errors immediately
- ✅ **Offline capable**: Build works even if server has issues
