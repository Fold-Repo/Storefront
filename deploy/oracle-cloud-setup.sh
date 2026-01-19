#!/bin/bash

# ===========================================
# Shorp Storefront Deployment Script
# Oracle Cloud Infrastructure (Ubuntu)
# ===========================================
# Run this script on a fresh Ubuntu server
# Usage: bash oracle-cloud-setup.sh
# ===========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║     Shorp Storefront Server Setup Script       ║"
echo "║     Ubuntu 20.04+ / 22.04+                     ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Please don't run as root. Run as your regular user with sudo access.${NC}"
    exit 1
fi

# =====================
# SAFETY: Pre-allow SSH before anything else
# =====================
echo -e "${YELLOW}Safety check: Ensuring SSH remains accessible...${NC}"
sudo ufw allow 22/tcp comment 'SSH' 2>/dev/null || true
sudo iptables -I INPUT -p tcp --dport 22 -j ACCEPT 2>/dev/null || true
echo -e "${GREEN}✅ SSH port 22 pre-allowed${NC}"
echo ""

# Get domain - using dfoldlab.co.uk as main domain for storefront platform
read -p "Enter your main domain (e.g., dfoldlab.co.uk): " DOMAIN
DOMAIN=${DOMAIN:-dfoldlab.co.uk}  # Default to dfoldlab.co.uk
read -p "Enter your email (for SSL certificate): " EMAIL

echo ""
echo -e "${YELLOW}Starting setup...${NC}"
echo ""

# =====================
# Step 1: Update System
# =====================
echo -e "${GREEN}[1/8] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# =====================
# Step 2: Install Dependencies
# =====================
echo -e "${GREEN}[2/8] Installing dependencies...${NC}"
sudo apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx ufw

# =====================
# Step 3: Install Node.js 20.x (Required: Node 20+)
# =====================
echo -e "${GREEN}[3/8] Installing Node.js 20.x...${NC}"

# Remove any existing Node.js
sudo apt remove -y nodejs npm 2>/dev/null || true

# Install Node.js 20.x from NodeSource (Debian/Ubuntu method)
echo -e "${YELLOW}Downloading Node.js 20.x setup script...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

echo -e "${YELLOW}Installing Node.js 20.x...${NC}"
sudo apt install -y nodejs

# Verify Node.js version (must be 20 or higher)
echo -e "${YELLOW}Verifying Node.js installation...${NC}"
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
NPM_VERSION=$(npm --version)

echo "Node.js version: $(node --version)"
echo "npm version: ${NPM_VERSION}"

# Check if Node.js version is 20 or higher
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ ERROR: Node.js version must be 20 or higher!${NC}"
    echo -e "${RED}   Current version: $(node --version)${NC}"
    echo -e "${RED}   This project requires Node.js 20+${NC}"
    echo -e "${YELLOW}Attempting to fix...${NC}"
    
    # Try alternative installation method
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Re-check version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        echo -e "${RED}❌ Failed to install Node.js 20+. Please install manually.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Node.js $(node --version) installed successfully (meets requirement: 20+)${NC}"

# =====================
# Step 4: Install PM2
# =====================
echo -e "${GREEN}[4/8] Installing PM2...${NC}"
sudo npm install -g pm2

# =====================
# Step 5: Install PostgreSQL (Optional - if needed)
# =====================
echo -e "${GREEN}[5/8] Installing PostgreSQL (optional)...${NC}"
read -p "Do you need PostgreSQL installed? (y/n): " INSTALL_PG

if [ "$INSTALL_PG" == "y" ]; then
    sudo apt install -y postgresql postgresql-contrib
    
    # Start and enable PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Generate random password
    DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
    
    # Create database and user
    sudo -u postgres psql << EOF
CREATE USER shorp WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE shorp_production OWNER shorp;
GRANT ALL PRIVILEGES ON DATABASE shorp_production TO shorp;
\q
EOF
    
    echo -e "${GREEN}PostgreSQL configured successfully${NC}"
    echo -e "${YELLOW}Database Password: ${DB_PASSWORD}${NC}"
else
    echo -e "${YELLOW}Skipping PostgreSQL installation${NC}"
    DB_PASSWORD=""
fi

# =====================
# Step 6: Create Application Directory
# =====================
echo -e "${GREEN}[6/8] Creating application directory...${NC}"
sudo mkdir -p /var/www/storefront
sudo mkdir -p /var/www/backups
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/www/storefront
sudo chown -R $USER:$USER /var/www/backups
sudo chown -R $USER:$USER /var/log/pm2

# =====================
# Step 7: Configure Nginx (HTTP first, SSL added by Certbot)
# =====================
echo -e "${GREEN}[7/8] Configuring Nginx...${NC}"

# Check if Nginx is already installed and running
if systemctl is-active --quiet nginx; then
    echo -e "${YELLOW}Nginx is already running. Stopping to reconfigure...${NC}"
    sudo systemctl stop nginx
fi

# Check if port 80 is in use
if sudo lsof -i:80 > /dev/null 2>&1; then
    echo -e "${YELLOW}Port 80 is in use. Checking what's using it...${NC}"
    sudo lsof -i:80 | head -5
    echo -e "${YELLOW}You may need to stop the service using port 80 first.${NC}"
    read -p "Continue anyway? (y/n): " CONTINUE_NGINX
    if [ "$CONTINUE_NGINX" != "y" ]; then
        echo -e "${RED}Skipping Nginx configuration. Please resolve port 80 conflict first.${NC}"
        exit 1
    fi
fi

# Main platform domain (e.g., dfoldlab.co.uk)
MAIN_DOMAIN=${DOMAIN}
# Wildcard for store subdomains (e.g., *.dfoldlab.co.uk)
# This allows stores like store1.dfoldlab.co.uk, mystore.dfoldlab.co.uk, etc.
WILDCARD_DOMAIN="*.${DOMAIN}"

# Create Nginx config - HTTP ONLY first (Certbot will add SSL)
sudo tee /etc/nginx/sites-available/storefront > /dev/null << EOF
upstream storefront_app {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Main domain server block (platform: dashboard, admin, etc.)
server {
    listen 80;
    listen [::]:80;
    server_name ${MAIN_DOMAIN} www.${MAIN_DOMAIN};

    # For Certbot verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Proxy to app (will redirect to HTTPS after Certbot configures SSL)
    location / {
        proxy_pass http://storefront_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
}

# Wildcard subdomain server block for multi-store routing
# This handles all subdomains like store1.${MAIN_DOMAIN}, store2.${MAIN_DOMAIN}, etc.
server {
    listen 80;
    listen [::]:80;
    server_name ${WILDCARD_DOMAIN};

    # For Certbot verification (wildcard certificates use DNS challenge)
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Proxy to app - Next.js middleware will handle subdomain routing
    location / {
        proxy_pass http://storefront_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        # CRITICAL: Pass the full Host header so Next.js middleware can extract subdomain
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
}
EOF

# Check for existing conflicting Nginx configs
echo -e "${YELLOW}Checking for existing Nginx configurations...${NC}"
if [ -f /etc/nginx/sites-enabled/shorp-api ]; then
    echo -e "${YELLOW}Found existing shorp-api config. Disabling it...${NC}"
    sudo rm -f /etc/nginx/sites-enabled/shorp-api
    echo -e "${GREEN}✅ Disabled shorp-api config${NC}"
fi

# Disable any other conflicting configs
for config in /etc/nginx/sites-enabled/*; do
    if [ -f "$config" ] && [ "$(basename "$config")" != "storefront" ]; then
        echo -e "${YELLOW}Disabling conflicting config: $(basename "$config")${NC}"
        sudo rm -f "$config"
    fi
done

# Enable site by creating symlink
sudo ln -sf /etc/nginx/sites-available/storefront /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Ensure web root exists for Certbot
sudo mkdir -p /var/www/html

# Test Nginx configuration BEFORE starting
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
NGINX_TEST_OUTPUT=$(sudo nginx -t 2>&1)
NGINX_TEST_STATUS=$?

if [ $NGINX_TEST_STATUS -ne 0 ]; then
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    echo -e "${YELLOW}Error output:${NC}"
    echo "$NGINX_TEST_OUTPUT"
    echo ""
    
    # Check for SSL certificate issues in existing configs
    if echo "$NGINX_TEST_OUTPUT" | grep -q "ssl_certificate.*is defined"; then
        echo -e "${YELLOW}⚠️  Found SSL certificate issue in existing configs${NC}"
        echo -e "${YELLOW}Removing conflicting SSL configs...${NC}"
        
        # Find and disable configs with SSL issues
        for config_file in /etc/nginx/sites-enabled/*; do
            if [ -f "$config_file" ] && grep -q "listen.*ssl" "$config_file" 2>/dev/null; then
                if ! grep -q "ssl_certificate" "$config_file" 2>/dev/null; then
                    CONFIG_NAME=$(basename "$config_file")
                    echo -e "${YELLOW}Removing broken SSL config: ${CONFIG_NAME}${NC}"
                    sudo rm -f "$config_file"
                fi
            fi
        done
        
        # Also check for shorp-api specifically
        if [ -f /etc/nginx/sites-enabled/shorp-api ]; then
            echo -e "${YELLOW}Removing shorp-api config (has SSL issues)...${NC}"
            sudo rm -f /etc/nginx/sites-enabled/shorp-api
        fi
        
        # Test again
        echo -e "${YELLOW}Retesting Nginx configuration...${NC}"
        if sudo nginx -t 2>&1; then
            echo -e "${GREEN}✅ Configuration fixed!${NC}"
        else
            echo -e "${RED}❌ Still has errors. Manual intervention needed.${NC}"
            echo -e "${YELLOW}List of enabled configs:${NC}"
            ls -la /etc/nginx/sites-enabled/ || true
            echo ""
            echo -e "${YELLOW}Please manually fix or remove conflicting configs:${NC}"
            echo "  sudo rm /etc/nginx/sites-enabled/shorp-api"
            echo "  sudo nginx -t"
            exit 1
        fi
    else
        echo -e "${YELLOW}Checking configuration file for errors...${NC}"
        sudo nginx -T 2>&1 | grep -i error | head -10 || true
        echo ""
        echo -e "${YELLOW}Troubleshooting:${NC}"
        echo "  1. Check config syntax: sudo nginx -t"
        echo "  2. View full config: sudo nginx -T"
        echo "  3. Check for syntax errors in: /etc/nginx/sites-available/storefront"
        echo "  4. List enabled configs: ls -la /etc/nginx/sites-enabled/"
        exit 1
    fi
fi

# Enable Nginx service
echo -e "${YELLOW}Enabling Nginx service...${NC}"
sudo systemctl enable nginx || {
    echo -e "${YELLOW}Warning: Could not enable nginx service. Continuing...${NC}"
}

# Start Nginx
echo -e "${YELLOW}Starting Nginx service...${NC}"
if sudo systemctl start nginx; then
    echo -e "${GREEN}✅ Nginx started successfully${NC}"
    # Verify it's running
    sleep 2
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Nginx may not be running. Checking status...${NC}"
        sudo systemctl status nginx --no-pager -l | head -15 || true
    fi
else
    echo -e "${RED}❌ Failed to start Nginx${NC}"
    echo -e "${YELLOW}Checking status and logs...${NC}"
    echo ""
    echo -e "${BLUE}=== Nginx Status ===${NC}"
    sudo systemctl status nginx --no-pager -l | head -20 || true
    echo ""
    echo -e "${BLUE}=== Recent Nginx Logs ===${NC}"
    sudo journalctl -xeu nginx.service --no-pager -n 30 || true
    echo ""
    echo -e "${YELLOW}Troubleshooting steps:${NC}"
    echo "  1. Check if port 80 is in use: sudo lsof -i:80"
    echo "  2. Check Nginx config: sudo nginx -t"
    echo "  3. Check Nginx error log: sudo tail -f /var/log/nginx/error.log"
    echo "  4. Try starting manually: sudo systemctl start nginx"
    echo ""
    read -p "Continue anyway? (y/n): " CONTINUE_AFTER_NGINX_ERROR
    if [ "$CONTINUE_AFTER_NGINX_ERROR" != "y" ]; then
        echo -e "${RED}Exiting. Please fix Nginx issues and run the script again.${NC}"
        exit 1
    fi
    echo -e "${YELLOW}Continuing despite Nginx error...${NC}"
fi

echo -e "${GREEN}✅ Nginx configured (HTTP only for now)${NC}"

# =====================
# Step 8: Configure Firewall (SAFE - SSH First!)
# =====================
echo -e "${GREEN}[8/8] Configuring firewall...${NC}"

# CRITICAL: Ensure SSH is allowed BEFORE anything else
echo -e "${YELLOW}Ensuring SSH access is preserved...${NC}"

# Configure UFW rules BEFORE enabling
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw allow 'Nginx Full'

# Double-check SSH is in the rules before enabling
if sudo ufw status | grep -q "22/tcp\|OpenSSH"; then
    echo -e "${GREEN}✅ SSH rule confirmed. Safe to enable firewall.${NC}"
    sudo ufw --force enable
    
    # Save iptables rules for persistence
    sudo apt install -y iptables-persistent 2>/dev/null || true
    sudo netfilter-persistent save 2>/dev/null || true
else
    echo -e "${RED}⚠️  WARNING: SSH rule not found. Skipping firewall enable for safety.${NC}"
    echo -e "${YELLOW}Please manually configure firewall later.${NC}"
fi

# Show firewall status
echo -e "${GREEN}Firewall status:${NC}"
sudo ufw status verbose

# =====================
# Get SSL Certificate
# =====================
echo -e "${GREEN}Getting SSL certificate...${NC}"
echo -e "${YELLOW}Note: Make sure your domain DNS points to this server's IP first!${NC}"
echo -e "${YELLOW}Server IP: $(curl -s ifconfig.me)${NC}"
echo ""

read -p "Is your DNS configured and pointing to this server? (y/n): " DNS_READY

if [ "$DNS_READY" == "y" ]; then
    echo ""
    echo -e "${YELLOW}SSL Certificate Options:${NC}"
    echo "  1. Standard certificate (main domain only) - Quick setup"
    echo "  2. Wildcard certificate (*.${MAIN_DOMAIN}) - Supports all subdomains, requires DNS challenge"
    echo "  3. Skip SSL setup (use Cloudflare SSL) - Recommended if using Cloudflare with Full (strict)"
    echo ""
    read -p "Choose option (1, 2, or 3, default: 3): " SSL_OPTION
    SSL_OPTION=${SSL_OPTION:-3}
    
    if [ "$SSL_OPTION" == "3" ]; then
        echo -e "${GREEN}Skipping SSL setup - Using Cloudflare SSL${NC}"
        echo -e "${YELLOW}Note: Make sure Cloudflare SSL/TLS mode is set to 'Full (strict)'${NC}"
        echo -e "${YELLOW}Cloudflare will handle SSL automatically for all domains and subdomains.${NC}"
        SSL_OPTION="skip"
    fi
    
    if [ "$SSL_OPTION" == "2" ]; then
        echo -e "${YELLOW}Wildcard SSL Certificate Setup${NC}"
        echo -e "${YELLOW}For wildcard certificates, you need to use DNS challenge.${NC}"
        echo -e "${YELLOW}Certbot will ask you to add a TXT record to your DNS.${NC}"
        echo ""
        read -p "Do you have access to add DNS TXT records? (y/n): " DNS_ACCESS
        
        if [ "$DNS_ACCESS" == "y" ]; then
            # Install certbot DNS plugins (optional, for automated DNS)
            sudo apt install -y python3-certbot-dns-cloudflare python3-certbot-dns-route53 2>/dev/null || true
            
            # Request wildcard certificate with DNS challenge
            echo -e "${YELLOW}Requesting wildcard certificate for ${MAIN_DOMAIN}...${NC}"
            if sudo certbot certonly --manual --preferred-challenges dns \
                -d "${MAIN_DOMAIN}" \
                -d "*.${MAIN_DOMAIN}" \
                --agree-tos \
                -m "${EMAIL}" \
                --manual-public-ip-logging-ok; then
                
                echo -e "${GREEN}✅ Wildcard certificate obtained${NC}"
                # Configure Nginx to use the wildcard certificate
                echo -e "${YELLOW}Configuring Nginx with wildcard certificate...${NC}"
                sudo certbot --nginx -d "${MAIN_DOMAIN}" -d "*.${MAIN_DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" 2>/dev/null || {
                    echo -e "${YELLOW}Note: You may need to manually configure Nginx SSL blocks for wildcard certificate.${NC}"
                    echo -e "${YELLOW}Certificate location: /etc/letsencrypt/live/${MAIN_DOMAIN}/${NC}"
                }
            else
                echo -e "${RED}❌ Failed to obtain wildcard certificate${NC}"
                echo -e "${YELLOW}Skipping SSL setup. You can use Cloudflare SSL instead.${NC}"
                SSL_OPTION="skip"
            fi
        else
            echo -e "${YELLOW}Skipping wildcard SSL. You can set it up later with:${NC}"
            echo "   sudo certbot certonly --manual --preferred-challenges dns -d ${MAIN_DOMAIN} -d *.${MAIN_DOMAIN}"
            SSL_OPTION="1"  # Fall back to standard
        fi
    fi
    
    if [ "$SSL_OPTION" == "1" ]; then
        # Standard certificate for main domain
        echo -e "${GREEN}Getting standard SSL certificate...${NC}"
        sudo certbot --nginx -d ${MAIN_DOMAIN} -d www.${MAIN_DOMAIN} --non-interactive --agree-tos -m ${EMAIL}
        
        # Note about subdomains
        echo -e "${YELLOW}⚠️  Note: Standard certificate only covers ${MAIN_DOMAIN} and www.${MAIN_DOMAIN}${NC}"
        echo -e "${YELLOW}   Subdomains will work but browsers may show certificate warnings.${NC}"
        echo -e "${YELLOW}   For production, consider getting a wildcard certificate.${NC}"
    fi
    
    # Test auto-renewal (only if SSL was configured)
    if [ "$SSL_OPTION" != "skip" ]; then
        sudo certbot renew --dry-run 2>/dev/null || true
    fi
    
    # Add security headers to SSL server blocks (only if SSL was configured)
    if [ "$SSL_OPTION" != "skip" ] && grep -q "ssl_certificate" /etc/nginx/sites-available/storefront; then
        echo -e "${GREEN}✅ SSL certificate installed successfully${NC}"
        
        # Add security headers to both server blocks
        sudo sed -i '/server_name.*'"${MAIN_DOMAIN}"'/a\
    \
    # Security headers\
    add_header X-Frame-Options "SAMEORIGIN" always;\
    add_header X-Content-Type-Options "nosniff" always;\
    add_header X-XSS-Protection "1; mode=block" always;\
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\
    \
    # Logging\
    access_log /var/log/nginx/storefront.access.log;\
    error_log /var/log/nginx/storefront.error.log;\
    \
    client_max_body_size 50M;\
    \
    gzip on;\
    gzip_vary on;\
    gzip_min_length 1024;\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;' /etc/nginx/sites-available/storefront 2>/dev/null || true
        
        sudo nginx -t && sudo systemctl reload nginx
    fi
else
    echo -e "${YELLOW}Skipping SSL for now. Run this later to get SSL:${NC}"
    echo "   # Standard certificate:"
    echo "   sudo certbot --nginx -d ${MAIN_DOMAIN} -d www.${MAIN_DOMAIN}"
    echo ""
    echo "   # Wildcard certificate (for subdomains):"
    echo "   sudo certbot certonly --manual --preferred-challenges dns -d ${MAIN_DOMAIN} -d *.${MAIN_DOMAIN}"
fi  # End of DNS_READY check

# =====================
# Create Environment Template
# =====================
echo -e "${GREEN}Creating environment template...${NC}"

cat > /var/www/storefront/.env.production << EOF
# Server
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://api.dfoldlab.co.uk/api/v1
NEXT_PUBLIC_MAIN_DOMAIN=dfoldlab.co.uk

# Database (if using PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shorp_production
DB_USER=shorp
DB_PASSWORD=${DB_PASSWORD}

# JWT (generate a secure key)
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# Firebase (add your Firebase config)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Anthropic AI
ANTHROPIC_API_KEY=

# Cloudflare (for DNS management)
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ZONE_ID=

# Add your other environment variables below:
# SENDGRID_API_KEY=
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
EOF

chmod 600 /var/www/storefront/.env.production

# =====================
# Create PM2 Ecosystem
# =====================
echo -e "${GREEN}Creating PM2 ecosystem config...${NC}"

cat > /var/www/storefront/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'storefront',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/storefront',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/storefront-error.log',
    out_file: '/var/log/pm2/storefront-out.log',
    time: true,
    merge_logs: true,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
EOF

# =====================
# Setup PM2 Startup
# =====================
echo -e "${GREEN}Configuring PM2 startup...${NC}"
pm2 startup systemd -u $USER --hp /home/$USER
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

# =====================
# Optional: First Deployment
# =====================
echo ""
read -p "Do you want to deploy the code now? (y/n): " DO_DEPLOY

if [ "$DO_DEPLOY" == "y" ]; then
    echo ""
    read -p "Enter your GitHub repository URL (e.g., https://github.com/user/repo.git): " REPO_URL
    
    echo -e "${GREEN}Cloning repository...${NC}"
    cd /var/www/storefront
    git clone $REPO_URL .
    
    # Verify Node.js version before proceeding (required: Node 20+)
    echo -e "${YELLOW}Verifying Node.js version requirement...${NC}"
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        echo -e "${RED}❌ ERROR: Node.js version must be 20 or higher!${NC}"
        echo -e "${RED}   Current version: $(node --version)${NC}"
        echo -e "${RED}   This project requires Node.js 20+${NC}"
        echo -e "${YELLOW}Please install Node.js 20+ and run the script again.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js $(node --version) confirmed (meets requirement: 20+)${NC}"
    
    echo -e "${GREEN}Installing dependencies...${NC}"
    npm ci --production=false
    
    echo -e "${GREEN}Building application...${NC}"
    npm run build
    
    echo -e "${GREEN}Starting application with PM2...${NC}"
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    echo -e "${GREEN}Application deployed and running!${NC}"
    
    # Health check
    sleep 5
    if curl -sf http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  App may still be starting. Check: pm2 logs storefront${NC}"
    fi
fi

# =====================
# Summary
# =====================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Setup Completed Successfully!         ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Server Information:${NC}"
echo "─────────────────────────────────────────────────"
echo -e "Main Domain:      ${GREEN}https://${MAIN_DOMAIN}${NC} (platform: dashboard, admin)"
echo -e "Wildcard:         ${GREEN}*.${MAIN_DOMAIN}${NC} (stores: store1.${MAIN_DOMAIN}, etc.)"
echo -e "App Directory:    ${GREEN}/var/www/storefront${NC}"
echo -e "Environment File: ${GREEN}/var/www/storefront/.env.production${NC}"
echo ""
echo -e "${YELLOW}📝 Multi-Store Routing:${NC}"
echo "   Nginx is configured to handle wildcard subdomains."
echo "   Any subdomain (e.g., mystore.${MAIN_DOMAIN}) will route to your Next.js app."
echo "   Next.js middleware will handle the subdomain routing logic."
echo ""
echo -e "${YELLOW}📋 Cloudflare DNS Setup Required:${NC}"
echo "   1. Add A record: ${MAIN_DOMAIN} → $(curl -s ifconfig.me)"
echo "   2. Add A record: *.${MAIN_DOMAIN} → $(curl -s ifconfig.me) (wildcard)"
echo "   3. Enable Proxy (orange cloud) for DDoS protection"
echo "   4. SSL/TLS mode: Full (strict)"
echo ""

if [ "$INSTALL_PG" == "y" ]; then
    echo -e "${BLUE}Database Information:${NC}"
    echo "─────────────────────────────────────────────────"
    echo -e "Host:     localhost"
    echo -e "Port:     5432"
    echo -e "Database: shorp_production"
    echo -e "User:     shorp"
    echo -e "Password: ${YELLOW}${DB_PASSWORD}${NC}"
    echo ""
    echo -e "${RED}⚠️  IMPORTANT: Save the database password above!${NC}"
    echo ""
fi

echo -e "${BLUE}Next Steps (if you didn't deploy yet):${NC}"
echo "─────────────────────────────────────────────────"
echo ""
echo -e "${YELLOW}Step 1: Edit environment file with your secrets${NC}"
echo "   nano /var/www/storefront/.env.production"
echo "   (Add Firebase, Anthropic, Cloudflare, and other API keys)"
echo ""
echo -e "${YELLOW}Step 2: Add GitHub Secrets for CI/CD${NC}"
echo "   Go to: GitHub Repo → Settings → Secrets → Actions"
echo "   Add these secrets:"
echo "   ┌─────────────────────┬─────────────────────────────────┐"
echo "   │ SSH_PRIVATE_KEY     │ Content of your private SSH key │"
echo "   │ SERVER_IP           │ $(curl -s ifconfig.me)              │"
echo "   │ SERVER_USER         │ $USER                            │"
echo "   │ DEPLOY_PATH         │ /var/www/storefront              │"
echo "   └─────────────────────┴─────────────────────────────────┘"
echo ""
echo -e "${YELLOW}Step 3: Push to main branch to deploy${NC}"
echo "   git push origin main"
echo ""
echo -e "${YELLOW}Or deploy manually:${NC}"
echo "   cd /var/www/storefront"
echo "   git pull origin main"
echo "   npm ci"
echo "   npm run build"
echo "   pm2 reload storefront"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "─────────────────────────────────────────────────"
echo "pm2 status              # Check app status"
echo "pm2 logs storefront     # View logs"
echo "pm2 reload storefront   # Reload app"
echo "pm2 restart storefront  # Restart app"
echo "sudo nginx -t           # Test nginx config"
echo "sudo systemctl reload nginx # Reload nginx"
echo "sudo certbot renew      # Renew SSL certificates"
echo "sudo ufw status verbose # Check firewall rules"
echo ""
