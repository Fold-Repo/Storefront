# Fix "Connection closed by [IP] port 22" Error

## Problem

You're seeing:
```
Connection closed by 145.241.251.29 port 22
scp: Connection closed
```

This means the SSH connection is being terminated during file transfer.

## Quick Fixes

### 1. Test SSH Connection First

```bash
# Test basic SSH connection
ssh ubuntu@145.241.251.29

# Or with key
ssh -i /path/to/key.pem ubuntu@145.241.251.29
```

If this fails, the issue is with SSH authentication or server access.

### 2. Use SSH Key (If Not Already)

```bash
export SSH_KEY=/path/to/oracle-key.pem
chmod 600 $SSH_KEY
export SERVER_IP=145.241.251.29
./deploy/deploy-manual.sh
```

### 3. Check Server SSH Service

SSH into the server and check:

```bash
ssh ubuntu@145.241.251.29
sudo systemctl status ssh
# or
sudo systemctl status sshd
```

If not running:
```bash
sudo systemctl start ssh
sudo systemctl enable ssh
```

### 4. Run Server Connection Fix Script

On the server, run:

```bash
bash deploy/SERVER_CONNECTION_FIX.sh
```

Or manually:

```bash
# On the server
sudo ufw allow 22/tcp
sudo systemctl restart ssh
```

### 5. Check Oracle Cloud Security Lists

1. Go to: Oracle Cloud Console → Networking → Virtual Cloud Networks
2. Click your VCN
3. Click Security Lists → Default Security List
4. Click Ingress Rules
5. Ensure port 22 (SSH) is open from `0.0.0.0/0`

### 6. Configure SSH Keepalive (Client Side)

Add to `~/.ssh/config`:

```
Host 145.241.251.29
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
    Compression yes
```

### 7. Use Manual Upload with Retry

The deploy script now includes:
- ✅ Automatic retry (3 attempts)
- ✅ SSH keepalive settings
- ✅ Connection timeout handling
- ✅ Better error messages

If it still fails, try manual upload:

```bash
# Upload manually with retry
scp -o ServerAliveInterval=60 -o ServerAliveCountMax=3 \
    deploy.tar.gz ubuntu@145.241.251.29:/tmp/
```

### 8. Check File Size

Large files might timeout. Check size:

```bash
ls -lh deploy.tar.gz
```

If > 100MB, consider:
- Excluding more files from tar
- Using rsync instead
- Uploading in chunks

### 9. Network/Firewall Issues

```bash
# Test connectivity
ping 145.241.251.29

# Test port 22
nc -zv 145.241.251.29 22

# Test with telnet
telnet 145.241.251.29 22
```

### 10. Server-Side SSH Configuration

On the server, check `/etc/ssh/sshd_config`:

```bash
sudo nano /etc/ssh/sshd_config
```

Ensure these are set:
```
ClientAliveInterval 60
ClientAliveCountMax 3
TCPKeepAlive yes
```

Then restart SSH:
```bash
sudo systemctl restart ssh
```

## Updated Deploy Script

The `deploy-manual.sh` script now includes:
- ✅ SSH connection test before upload
- ✅ Automatic retry (3 attempts)
- ✅ SSH keepalive settings
- ✅ Better error messages with troubleshooting steps

## Still Having Issues?

1. **Check server logs:**
   ```bash
   ssh ubuntu@145.241.251.29 'sudo tail -f /var/log/auth.log'
   ```

2. **Try verbose SSH:**
   ```bash
   ssh -vvv ubuntu@145.241.251.29
   ```

3. **Check if server is overloaded:**
   ```bash
   ssh ubuntu@145.241.251.29 'uptime && free -h'
   ```

4. **Verify DNS resolution:**
   ```bash
   nslookup 145.241.251.29
   ```

## Common Causes

1. **SSH service not running** - Most common
2. **Firewall blocking port 22** - Check UFW and Oracle Cloud
3. **SSH key authentication failing** - Check key permissions
4. **Server overloaded** - Check server resources
5. **Network timeout** - Use keepalive settings
6. **Large file transfer** - Use compression or chunk upload

## Next Steps

1. ✅ Test SSH connection manually
2. ✅ Run `SERVER_CONNECTION_FIX.sh` on server
3. ✅ Check Oracle Cloud Security Lists
4. ✅ Try deploy script again (now has retry logic)
5. ✅ Check server logs if still failing
