# Server Connection Fix - VPS Checklist

## Quick Answer

**Yes, you need to check these on your VPS server:**

1. ✅ Firewall ports (22, 80, 443)
2. ✅ Oracle Cloud Security Lists (firewall rules)
3. ✅ SSH keepalive settings
4. ✅ Port 3000 (internal, should be accessible from localhost)

## Step-by-Step Server Checks

### 1. Check Firewall Status (On Server)

SSH into your server and run:

```bash
# Check UFW firewall status
sudo ufw status verbose

# Should show:
# Status: active
# 22/tcp                     ALLOW       Anywhere    # SSH
# 80/tcp                     ALLOW       Anywhere    # HTTP
# 443/tcp                    ALLOW       Anywhere    # HTTPS
```

**If ports are missing, add them:**

```bash
# Ensure SSH is allowed FIRST (critical!)
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow OpenSSH

# Add web ports
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Enable firewall (if not already enabled)
sudo ufw --force enable

# Verify
sudo ufw status verbose
```

### 2. Check Oracle Cloud Security Lists (CRITICAL!)

Oracle Cloud has its own firewall that can block connections!

**In Oracle Cloud Console:**

1. Go to: **Networking → Virtual Cloud Networks**
2. Click your VCN
3. Click **Security Lists**
4. Click **Default Security List**
5. Click **Ingress Rules**

**Required Rules:**

| Source | IP Protocol | Destination Port Range | Description |
|--------|-------------|----------------------|-------------|
| `0.0.0.0/0` | TCP | 22 | SSH |
| `0.0.0.0/0` | TCP | 80 | HTTP |
| `0.0.0.0/0` | TCP | 443 | HTTPS |

**If missing, add them:**

1. Click **Add Ingress Rules**
2. Fill in:
   - **Source Type:** CIDR
   - **Source CIDR:** `0.0.0.0/0`
   - **IP Protocol:** TCP
   - **Destination Port Range:** `22` (for SSH)
   - **Description:** SSH
3. Click **Add Ingress Rules**
4. Repeat for ports 80 and 443

### 3. Fix SSH Connection Timeout

**On your LOCAL machine, edit SSH config:**

```bash
# Edit SSH config
nano ~/.ssh/config

# Add this (create file if it doesn't exist):
Host 145.241.251.29
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
    ConnectTimeout 10
```

**Or add globally:**

```bash
# Add to ~/.ssh/config
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
```

**On the SERVER, edit SSH daemon config:**

```bash
# Edit SSH server config
sudo nano /etc/ssh/sshd_config

# Add or uncomment these lines:
ClientAliveInterval 60
ClientAliveCountMax 3
TCPKeepAlive yes

# Restart SSH service (Ubuntu uses 'ssh', not 'sshd')
sudo systemctl restart ssh || sudo systemctl restart sshd
```

### 4. Verify Port 3000 (Internal)

Port 3000 is used internally by Next.js - it should NOT be exposed to the internet.

**Check if app is running:**

```bash
# Check PM2 status
pm2 status

# Check if port 3000 is listening (use 'ss' on Ubuntu)
sudo ss -tulpn | grep 3000 || sudo netstat -tulpn | grep 3000
# Should show: tcp 0 0 127.0.0.1:3000 (localhost only)

# Test locally
curl http://localhost:3000
```

**If port 3000 is exposed to internet (BAD):**

```bash
# Check what's listening on 3000
sudo lsof -i:3000

# If it's bound to 0.0.0.0:3000, that's a security risk
# It should be 127.0.0.1:3000 (localhost only)
```

### 5. Test All Ports

**From your LOCAL machine:**

```bash
# Test SSH (port 22)
ssh -v ubuntu@145.241.251.29

# Test HTTP (port 80)
curl -I http://145.241.251.29

# Test HTTPS (port 443)
curl -I https://145.241.251.29
```

**From the SERVER:**

```bash
# Test internal port 3000
curl http://localhost:3000

# Check if Nginx is proxying correctly
curl -H "Host: yourdomain.com" http://localhost
```

## Complete Server Setup Script

Run this on your server to fix everything:

```bash
#!/bin/bash
# Run on your VPS server

echo "🔧 Fixing server connection issues..."

# 1. Ensure firewall ports are open
echo "📌 Configuring firewall..."
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable

# 2. Configure SSH keepalive
echo "📌 Configuring SSH keepalive..."
sudo sed -i 's/#ClientAliveInterval.*/ClientAliveInterval 60/' /etc/ssh/sshd_config
sudo sed -i 's/#ClientAliveCountMax.*/ClientAliveCountMax 3/' /etc/ssh/sshd_config
sudo sed -i 's/#TCPKeepAlive.*/TCPKeepAlive yes/' /etc/ssh/sshd_config

# Add if not present
if ! grep -q "ClientAliveInterval" /etc/ssh/sshd_config; then
    echo "ClientAliveInterval 60" | sudo tee -a /etc/ssh/sshd_config
fi
if ! grep -q "ClientAliveCountMax" /etc/ssh/sshd_config; then
    echo "ClientAliveCountMax 3" | sudo tee -a /etc/ssh/sshd_config
fi
if ! grep -q "TCPKeepAlive" /etc/ssh/sshd_config; then
    echo "TCPKeepAlive yes" | sudo tee -a /etc/ssh/sshd_config
fi

# Restart SSH
sudo systemctl restart sshd

# 3. Verify ports
echo "📌 Verifying ports..."
echo "Firewall status:"
sudo ufw status verbose

echo ""
echo "Listening ports:"
sudo netstat -tulpn | grep -E ':(22|80|443|3000)'

echo ""
echo "✅ Server configuration complete!"
echo ""
echo "⚠️  IMPORTANT: Check Oracle Cloud Security Lists in the console!"
echo "   Go to: Networking → VCN → Security Lists → Default → Ingress Rules"
echo "   Ensure ports 22, 80, 443 are open from 0.0.0.0/0"
```

## Oracle Cloud Security Lists (MOST IMPORTANT!)

**This is often the cause of connection issues!**

Oracle Cloud has a firewall that's separate from UFW. Even if UFW allows ports, Oracle Cloud Security Lists can block them.

**To fix:**

1. **Log into Oracle Cloud Console**
2. **Navigate to:** Networking → Virtual Cloud Networks
3. **Click your VCN**
4. **Click Security Lists**
5. **Click Default Security List**
6. **Click Ingress Rules**
7. **Add these rules if missing:**

   **Rule 1: SSH**
   - Source: `0.0.0.0/0`
   - Protocol: TCP
   - Port: `22`
   - Description: SSH

   **Rule 2: HTTP**
   - Source: `0.0.0.0/0`
   - Protocol: TCP
   - Port: `80`
   - Description: HTTP

   **Rule 3: HTTPS**
   - Source: `0.0.0.0/0`
   - Protocol: TCP
   - Port: `443`
   - Description: HTTPS

8. **Click Add Ingress Rules** for each

## Quick Diagnostic Commands

**On Server:**

```bash
# Check firewall
sudo ufw status verbose

# Check listening ports (use 'ss' on Ubuntu, or install net-tools)
sudo ss -tulpn | grep -E ':(22|80|443|3000)' || sudo netstat -tulpn | grep -E ':(22|80|443|3000)'

# Check SSH config
sudo grep -E 'ClientAlive|TCPKeepAlive' /etc/ssh/sshd_config

# Check if SSH is running (Ubuntu uses 'ssh', not 'sshd')
sudo systemctl status ssh || sudo systemctl status sshd

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check PM2
pm2 status
pm2 logs storefront --lines 20
```

**From Local Machine:**

```bash
# Test SSH
ssh -v ubuntu@145.241.251.29

# Test ports
nc -zv 145.241.251.29 22   # SSH
nc -zv 145.241.251.29 80   # HTTP
nc -zv 145.241.251.29 443  # HTTPS

# Test HTTP
curl -I http://145.241.251.29
```

## Common Issues

### Issue 1: "Connection refused"

**Cause:** Port blocked by Oracle Cloud Security Lists

**Fix:** Add ingress rules in Oracle Cloud Console (see above)

### Issue 2: "Connection timeout"

**Cause:** SSH keepalive not configured

**Fix:** Configure SSH keepalive (see above)

### Issue 3: "Connection closed"

**Cause:** Firewall or Security List blocking

**Fix:** Check both UFW and Oracle Cloud Security Lists

## Summary Checklist

- [ ] UFW firewall allows ports 22, 80, 443
- [ ] Oracle Cloud Security Lists allow ports 22, 80, 443
- [ ] SSH keepalive configured (server and client)
- [ ] Port 3000 is localhost-only (not exposed)
- [ ] Nginx is running and configured
- [ ] PM2 app is running
- [ ] Can SSH into server
- [ ] Can access HTTP/HTTPS from browser

## Most Common Fix

**90% of connection issues are caused by Oracle Cloud Security Lists!**

Check Oracle Cloud Console → Networking → Security Lists → Ingress Rules

Make sure ports 22, 80, 443 are open from `0.0.0.0/0`.
