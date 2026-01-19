# Fix Slow/Laggy SSH Sessions

## Common Causes

### 1. DNS Lookup Issues (Most Common)

SSH tries to resolve hostnames, which can cause delays.

**Fix:**
```bash
# On your LOCAL machine, edit SSH config
nano ~/.ssh/config

# Add this (create file if it doesn't exist):
Host 145.241.251.29
    GSSAPIAuthentication no
    UseDNS no
    AddressFamily inet

# Or globally:
Host *
    GSSAPIAuthentication no
    UseDNS no
```

**On the SERVER:**
```bash
# Edit SSH daemon config
sudo nano /etc/ssh/sshd_config

# Add or uncomment:
UseDNS no
GSSAPIAuthentication no

# Restart SSH
sudo systemctl restart ssh
```

### 2. Network Latency

High latency between your location and server.

**Fix:**
- Use compression for slow connections
- Enable connection multiplexing

```bash
# Add to ~/.ssh/config
Host 145.241.251.29
    Compression yes
    ControlMaster auto
    ControlPath ~/.ssh/control-%h-%p-%r
    ControlPersist 10m
```

### 3. Server Resource Issues

Server is overloaded or low on resources.

**Check on server:**
```bash
# Check CPU usage
top

# Check memory
free -h

# Check disk I/O
iostat -x 1

# Check load average
uptime
```

**Fix:**
- Restart services if needed
- Check for runaway processes
- Consider upgrading server resources

### 4. SSH Keepalive Not Configured

Connection times out and reconnects, causing lag.

**Fix (already done in fix-server-connection.sh):**
```bash
# On server - should already be set
ClientAliveInterval 60
ClientAliveCountMax 3
TCPKeepAlive yes

# On client - add to ~/.ssh/config
Host 145.241.251.29
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
```

### 5. Slow Terminal Rendering

Terminal emulator or shell configuration issues.

**Fix:**
```bash
# Disable fancy prompts if using zsh/oh-my-zsh
# Simplify your .zshrc or .bashrc

# Use faster shell
/bin/bash  # Instead of zsh if zsh is slow
```

### 6. Oracle Cloud Network Issues

Oracle Cloud network routing can cause latency.

**Check:**
```bash
# Test latency
ping 145.241.251.29

# Test connection speed
curl -o /dev/null -s -w "Time: %{time_total}s\n" http://145.241.251.29
```

## Quick Fixes

### Option 1: Optimize SSH Config (Recommended)

**On your LOCAL machine:**

```bash
# Edit SSH config
nano ~/.ssh/config

# Add this for your server:
Host 145.241.251.29
    # Disable DNS lookups
    UseDNS no
    GSSAPIAuthentication no
    
    # Enable compression
    Compression yes
    
    # Connection multiplexing (reuse connections)
    ControlMaster auto
    ControlPath ~/.ssh/control-%h-%p-%r
    ControlPersist 10m
    
    # Keepalive
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
    
    # Faster cipher (if supported)
    Ciphers aes128-ctr,aes192-ctr,aes256-ctr
```

### Option 2: Fix Server-Side

**On your SERVER:**

```bash
# Edit SSH daemon config
sudo nano /etc/ssh/sshd_config

# Add or uncomment:
UseDNS no
GSSAPIAuthentication no
MaxStartups 10:30:100

# Restart SSH
sudo systemctl restart ssh
```

### Option 3: Use Mosh (Mobile Shell)

For very slow/unstable connections:

```bash
# Install mosh (on both client and server)
# macOS: brew install mosh
# Ubuntu: sudo apt install mosh

# Use instead of SSH
mosh ubuntu@145.241.251.29
```

## Diagnostic Commands

### Test Connection Speed

```bash
# Time SSH connection
time ssh ubuntu@145.241.251.29 'echo "Connected"'

# Test with verbose output
ssh -v ubuntu@145.241.251.29 2>&1 | grep -E "time|delay|slow"
```

### Check Server Performance

```bash
# SSH into server and run:
top
htop  # If installed
iostat -x 1
vmstat 1
```

### Network Diagnostics

```bash
# Test latency
ping -c 10 145.241.251.29

# Test connection
traceroute 145.241.251.29

# Test bandwidth
curl -o /dev/null http://145.241.251.29
```

## Most Common Fix

**90% of slow SSH issues are DNS-related!**

Add to `~/.ssh/config` on your local machine:

```bash
Host 145.241.251.29
    UseDNS no
    GSSAPIAuthentication no
```

This usually fixes it immediately!

## For Deployment Script

The deployment script uses SSH, so slow SSH will make deployment slow too.

**Quick fix:**
```bash
# Add to ~/.ssh/config before running deployment
Host 145.241.251.29
    UseDNS no
    Compression yes
    ControlMaster auto
    ControlPath ~/.ssh/control-%h-%p-%r
    ControlPersist 10m
```

Then run deployment again - it should be faster!

## Summary

**Most likely causes:**
1. DNS lookups (most common) → Fix: `UseDNS no`
2. Network latency → Fix: Enable compression
3. Server overload → Check server resources
4. Keepalive not configured → Already fixed in script

**Quick fix:**
Add `UseDNS no` to your `~/.ssh/config` - this fixes most cases!
