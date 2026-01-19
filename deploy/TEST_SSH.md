# Test SSH Connection Before Deployment

## Step 1: Test SSH Connection Manually

**Before running the deployment script, test SSH connection:**

```bash
# If using Oracle key
ssh -i ~/Downloads/your-oracle-key.key ubuntu@79.72.95.124

# Or if using default key
ssh ubuntu@79.72.95.124
```

**If SSH works manually, deployment will work too!**

## Step 2: If SSH Fails

### Check Key Permissions

```bash
# Set correct permissions on key file
chmod 600 ~/Downloads/your-oracle-key.key

# Try SSH again
ssh -i ~/Downloads/your-oracle-key.key ubuntu@79.72.95.124
```

### Verify Key File

```bash
# Check if key file exists and is readable
ls -la ~/Downloads/your-oracle-key.key

# Check first line of key (should start with -----BEGIN)
head -1 ~/Downloads/your-oracle-key.key
```

### Test with Verbose Output

```bash
# See detailed connection info
ssh -v -i ~/Downloads/your-oracle-key.key ubuntu@79.72.95.124
```

## Step 3: Common Issues

### "Permission denied (publickey)"

**Cause:** Wrong key or key not on server

**Fix:**
1. Make sure you're using the correct key file
2. Check if the public key is on the server
3. Try adding your public key to server

### "Connection refused"

**Cause:** Port 22 blocked or SSH service not running

**Fix:**
1. Check Oracle Cloud Security Lists (port 22 must be open)
2. Check firewall on server: `sudo ufw status`
3. Check SSH service: `sudo systemctl status ssh` (on server)

### "Connection timeout"

**Cause:** Network issue or wrong IP

**Fix:**
1. Verify server IP: `79.72.95.124`
2. Check if server is running
3. Ping server: `ping 79.72.95.124`

## Step 4: Once SSH Works

After SSH connection works manually, deployment will work:

```bash
export SERVER_IP=79.72.95.124
export SSH_KEY=~/Downloads/your-oracle-key.key
./deploy/deploy-manual.sh
```
