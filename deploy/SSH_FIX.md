# Fix SSH "Permission denied (publickey)" Error

## Quick Fix

You're getting this error because SSH can't authenticate. Here's how to fix it:

### Option 1: Use Oracle's Private Key (Most Common)

If Oracle generated a key when you created the instance:

```bash
# 1. Find your Oracle key file (usually in Downloads)
#    Look for: .pem or .key file
ls ~/Downloads/*.pem
ls ~/Downloads/*.key

# 2. Set the key path and run deploy
export SERVER_IP=79.72.95.124
export SSH_KEY=~/Downloads/your-oracle-key.pem  # Update path
./deploy/deploy-manual.sh
```

### Option 2: Use Your Own SSH Key

If you uploaded your own public key to Oracle:

```bash
# 1. Test if your default key works
ssh ubuntu@79.72.95.124

# 2. If that works, deploy without SSH_KEY
export SERVER_IP=79.72.95.124
./deploy/deploy-manual.sh
```

### Option 3: Add Your Public Key to Server

If you don't have a key set up:

```bash
# 1. Generate a new SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 2. Copy public key to server (you'll need password)
ssh-copy-id ubuntu@79.72.95.124

# 3. Test connection
ssh ubuntu@79.72.95.124

# 4. Deploy
export SERVER_IP=79.72.95.124
./deploy/deploy-manual.sh
```

## Step-by-Step: Find Your Oracle Key

1. **Check Downloads folder:**
   ```bash
   ls -la ~/Downloads/*.pem ~/Downloads/*.key
   ```

2. **Check Desktop:**
   ```bash
   ls -la ~/Desktop/*.pem ~/Desktop/*.key
   ```

3. **Search for key files:**
   ```bash
   find ~ -name "*.pem" -o -name "*key*" 2>/dev/null | grep -i oracle
   ```

4. **Once found, set permissions and use it:**
   ```bash
   chmod 600 /path/to/oracle-key.pem
   export SSH_KEY=/path/to/oracle-key.pem
   export SERVER_IP=79.72.95.124
   ./deploy/deploy-manual.sh
   ```

## Test SSH Connection First

Before deploying, test your SSH connection:

```bash
# With Oracle key
ssh -i /path/to/oracle-key.pem ubuntu@79.72.95.124

# Or with your default key
ssh ubuntu@79.72.95.124
```

If SSH works, deployment will work too!

## Updated Deploy Command

The script now supports SSH keys. Use it like this:

```bash
# With Oracle key
export SERVER_IP=79.72.95.124
export SSH_KEY=~/Downloads/oracle-key.pem
./deploy/deploy-manual.sh

# Or without key (if using default SSH key)
export SERVER_IP=79.72.95.124
./deploy/deploy-manual.sh
```

## Still Having Issues?

1. **Check key permissions:**
   ```bash
   chmod 600 /path/to/key.pem
   ```

2. **Verify key format:**
   ```bash
   head -1 /path/to/key.pem
   # Should show: -----BEGIN RSA PRIVATE KEY----- or similar
   ```

3. **Test SSH manually:**
   ```bash
   ssh -i /path/to/key.pem -v ubuntu@79.72.95.124
   # The -v flag shows detailed connection info
   ```

4. **See full guide:**
   - `deploy/ORACLE_CLOUD_SSH_KEY.md` - Complete SSH key guide
