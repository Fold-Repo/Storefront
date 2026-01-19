# Nginx Troubleshooting Guide

## Common Error: "Job for nginx.service failed"

This error usually means Nginx couldn't start. Here's how to fix it:

## Quick Fix Commands

Run these commands on your server to diagnose and fix:

```bash
# 1. Check Nginx configuration syntax
sudo nginx -t

# 2. Check what's using port 80
sudo lsof -i:80

# 3. Check Nginx status
sudo systemctl status nginx

# 4. Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log
sudo journalctl -xeu nginx.service -n 50
```

## Common Issues and Solutions

### Issue 1: Port 80 Already in Use

**Symptoms:**
- Error: "Address already in use"
- `sudo lsof -i:80` shows another process

**Solution:**
```bash
# Find what's using port 80
sudo lsof -i:80

# Stop Apache (if installed)
sudo systemctl stop apache2
sudo systemctl disable apache2

# Or stop the conflicting service
sudo systemctl stop <service-name>
```

### Issue 2: Configuration Syntax Error

**Symptoms:**
- `sudo nginx -t` shows errors
- Error mentions "syntax error"

**Solution:**
```bash
# Test config
sudo nginx -t

# View full config to find errors
sudo nginx -T

# Check the config file
sudo nano /etc/nginx/sites-available/storefront
```

### Issue 3: Missing Directories

**Symptoms:**
- Error about missing directories
- `/var/www/html` doesn't exist

**Solution:**
```bash
# Create required directories
sudo mkdir -p /var/www/html
sudo mkdir -p /var/log/nginx
sudo chown -R www-data:www-data /var/www/html
```

### Issue 4: Nginx Not Installed Properly

**Symptoms:**
- `nginx: command not found`
- Service doesn't exist

**Solution:**
```bash
# Reinstall Nginx
sudo apt remove nginx nginx-common
sudo apt install nginx

# Verify installation
nginx -v
```

## Step-by-Step Fix

### 1. Stop Nginx (if running)
```bash
sudo systemctl stop nginx
```

### 2. Check Configuration
```bash
# Test the config
sudo nginx -t

# If there are errors, fix them
sudo nano /etc/nginx/sites-available/storefront
```

### 3. Check Port 80
```bash
# See what's using port 80
sudo lsof -i:80

# If something else is using it, stop it
sudo systemctl stop <service-name>
```

### 4. Start Nginx
```bash
# Start Nginx
sudo systemctl start nginx

# Check status
sudo systemctl status nginx

# Enable auto-start
sudo systemctl enable nginx
```

## Manual Configuration Check

If the script failed, you can manually verify the config:

```bash
# 1. Check if config file exists
ls -la /etc/nginx/sites-available/storefront

# 2. Check if symlink exists
ls -la /etc/nginx/sites-enabled/storefront

# 3. Test config
sudo nginx -t

# 4. View config
sudo cat /etc/nginx/sites-available/storefront
```

## Expected Nginx Config

Your config should look like this:

```nginx
upstream storefront_app {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name dfoldlab.co.uk www.dfoldlab.co.uk;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        proxy_pass http://storefront_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name *.dfoldlab.co.uk;
    
    # Same config as above
}
```

## After Fixing

Once Nginx starts successfully:

```bash
# Verify it's running
sudo systemctl status nginx

# Test from browser
curl -I http://localhost

# Check logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Continue Script After Fix

If you fixed the Nginx issue, you can continue the script from where it left off, or re-run it (it's safe to re-run).

## Still Having Issues?

1. **Check system resources:**
   ```bash
   free -h
   df -h
   ```

2. **Check system logs:**
   ```bash
   sudo dmesg | tail -20
   sudo journalctl -xe | tail -50
   ```

3. **Try starting Nginx manually:**
   ```bash
   sudo /usr/sbin/nginx -t
   sudo /usr/sbin/nginx
   ```

4. **Check SELinux/AppArmor (if enabled):**
   ```bash
   sudo aa-status  # AppArmor
   sudo getenforce  # SELinux
   ```
