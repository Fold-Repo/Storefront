# Server IP Updated

## New Server IP

**Old IP:** `79.72.95.124`  
**New IP:** `145.241.251.29`

## Updated Files

All deployment documentation and scripts have been updated to use the new IP:

- ✅ All `.md` documentation files
- ✅ `deploy-manual.sh` (default IP updated)
- ✅ All SSH examples
- ✅ All server connection examples

## Quick Reference

**SSH into new server:**
```bash
ssh ubuntu@145.241.251.29
```

**Or with key:**
```bash
ssh -i ~/Downloads/your-oracle-key.key ubuntu@145.241.251.29
```

**Set for deployment:**
```bash
export SERVER_IP=145.241.251.29
./deploy/deploy-manual.sh
```

## Important: Update These

### 1. GitHub Secrets

If you're using GitHub Actions, update the `SERVER_IP` secret:

1. Go to: GitHub Repository → Settings → Secrets → Actions
2. Find `SERVER_IP` secret
3. Update value to: `145.241.251.29`

### 2. Oracle Cloud Security Lists

Make sure the new IP is configured in Oracle Cloud:

1. Go to: Oracle Cloud Console → Networking → Security Lists
2. Verify ingress rules allow ports 22, 80, 443 from `0.0.0.0/0`
3. The rules apply to all IPs, so no change needed if already configured

### 3. DNS Records (If Using Domain)

If you're using a domain name, update DNS A records:

- Point `@` (root) to `145.241.251.29`
- Point `www` to `145.241.251.29`
- Point `*` (wildcard) to `145.241.251.29`

### 4. Cloudflare DNS (If Using Cloudflare)

Update Cloudflare DNS records:

1. Go to: Cloudflare Dashboard → DNS → Records
2. Update A records to point to `145.241.251.29`

## Test Connection

**Before running setup, test SSH:**

```bash
# Test SSH connection
ssh ubuntu@145.241.251.29

# Or with key
ssh -i ~/Downloads/your-oracle-key.key ubuntu@145.241.251.29
```

## Run Setup

**Now run the setup script:**

```bash
# SSH into new server
ssh ubuntu@145.241.251.29

# Run setup
bash deploy/COMPLETE_DOCKER_SETUP.sh
```

## Summary

✅ **All documentation updated** to use `145.241.251.29`  
✅ **Scripts updated** with new default IP  
✅ **Ready to deploy** to new server  

Just update GitHub Secrets and DNS records, then proceed with setup!
