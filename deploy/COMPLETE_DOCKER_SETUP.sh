#!/bin/bash
# ============================================
# Complete Docker + GitHub Actions Setup
# ============================================
# This script automates the entire setup process:
# 1. Installs Docker and Docker Compose
# 2. Sets up GitHub Actions runner
# 3. Configures Nginx with wildcard routing
# 4. Prepares everything for automated deployment
#
# Run this ON YOUR SERVER
# Usage: bash deploy/COMPLETE_DOCKER_SETUP.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Complete Docker + GitHub Actions Setup            ║${NC}"
echo -e "${BLUE}║   Automated Deployment Configuration                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}❌ Please don't run as root. Run as your regular user with sudo access.${NC}"
    exit 1
fi

# Add timeout for network operations
export CURL_TIMEOUT=300  # 5 minutes
export WGET_TIMEOUT=300

# ============================================
# Step 1: Collect Information
# ============================================
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Step 1: Collecting Information${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

# Get GitHub repository information
echo -e "${YELLOW}GitHub Repository Information:${NC}"
read -p "Enter your GitHub username/organization: " GITHUB_USER
read -p "Enter your repository name: " GITHUB_REPO
GITHUB_URL="https://github.com/${GITHUB_USER}/${GITHUB_REPO}"

echo ""
echo -e "${YELLOW}To get your registration token:${NC}"
echo "1. Go to: ${GITHUB_URL}/settings/actions/runners/new"
echo "2. Click 'New self-hosted runner'"
echo "3. Select Linux and x64"
echo "4. Copy the token shown"
echo ""
read -p "Enter your GitHub Actions registration token: " REG_TOKEN

if [ -z "$GITHUB_USER" ] || [ -z "$GITHUB_REPO" ] || [ -z "$REG_TOKEN" ]; then
    echo -e "${RED}❌ All fields are required!${NC}"
    exit 1
fi

# Get domain information
echo ""
echo -e "${YELLOW}Domain Information:${NC}"
read -p "Enter your main domain (e.g., dfoldlab.co.uk): " MAIN_DOMAIN
MAIN_DOMAIN=${MAIN_DOMAIN:-dfoldlab.co.uk}

echo ""
echo -e "${GREEN}✅ Information collected${NC}"
echo "  Repository: ${GITHUB_URL}"
echo "  Domain: ${MAIN_DOMAIN}"
echo ""

# ============================================
# Step 2: Install Docker
# ============================================
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Step 2: Installing Docker${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

if command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is already installed${NC}"
    docker --version
else
    echo "Installing Docker..."
    echo -e "${YELLOW}This may take a few minutes...${NC}"
    curl --max-time 300 -fsSL https://get.docker.com -o /tmp/get-docker.sh || {
        echo -e "${RED}❌ Docker download failed. Check internet connection.${NC}"
        exit 1
    }
    sudo sh /tmp/get-docker.sh || {
        echo -e "${RED}❌ Docker installation failed.${NC}"
        exit 1
    }
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Docker installed${NC}"
    echo -e "${YELLOW}⚠️  You'll need to log out and back in for Docker group to take effect${NC}"
    echo -e "${YELLOW}   Continuing with setup...${NC}"
fi

# Install Docker Compose
if command -v docker compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose is already installed${NC}"
    docker compose version
else
    echo "Installing Docker Compose..."
    sudo apt update
    sudo apt install -y docker-compose-plugin
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
fi

echo ""

# ============================================
# Step 3: Setup GitHub Actions Runner
# ============================================
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Step 3: Setting up GitHub Actions Runner${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

RUNNER_DIR="$HOME/actions-runner"
RUNNER_VERSION="2.311.0"

# Create runner directory
mkdir -p $RUNNER_DIR
cd $RUNNER_DIR

# Download runner if not exists
if [ ! -f "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" ]; then
    echo "Downloading GitHub Actions runner..."
    echo -e "${YELLOW}This may take a few minutes...${NC}"
    curl --max-time 600 --progress-bar -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L \
        https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz || {
        echo -e "${RED}❌ Runner download failed. Check internet connection.${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Runner downloaded${NC}"
fi

# Extract if not already extracted
if [ ! -f "./config.sh" ]; then
    echo "Extracting runner..."
    tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
    echo -e "${GREEN}✅ Runner extracted${NC}"
fi

# Configure runner
echo "Configuring runner..."
./config.sh --url $GITHUB_URL --token $REG_TOKEN --name "server-$(hostname)" --work _work --replace

# Install as service
echo ""
echo "Installing runner as service..."
sudo ./svc.sh install

# Start service
sudo ./svc.sh start

# Check status
echo ""
echo -e "${GREEN}Runner status:${NC}"
sudo ./svc.sh status

echo ""
echo -e "${GREEN}✅ GitHub Actions runner configured and running${NC}"
echo ""

# ============================================
# Step 4: Configure Nginx with Wildcard Routing
# ============================================
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Step 4: Configuring Nginx with Wildcard Routing${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
    echo -e "${GREEN}✅ Nginx installed${NC}"
fi

# Create Nginx config with wildcard routing
echo "Creating Nginx configuration with wildcard routing..."
sudo tee /etc/nginx/sites-available/storefront > /dev/null << EOF
upstream storefront_app {
    server 127.0.0.1:3000;  # Docker container port
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

    # Proxy to Docker container
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
    server_name *.${MAIN_DOMAIN};

    # For Certbot verification (wildcard certificates use DNS challenge)
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Proxy to Docker container - Next.js middleware will handle subdomain routing
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

# Enable site
sudo ln -sf /etc/nginx/sites-available/storefront /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test Nginx configuration
echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    echo "Please check the configuration manually"
    exit 1
fi

echo ""

# ============================================
# Step 5: Cleanup Old PM2 Setup (If Exists)
# ============================================
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Step 5: Cleaning Up Old PM2 Setup${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

OLD_DEPLOY_PATH="/var/www/storefront"

# Check if PM2 is running storefront
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "storefront"; then
        echo "Stopping PM2 storefront process..."
        pm2 stop storefront || true
        pm2 delete storefront || true
        echo -e "${GREEN}✅ PM2 storefront stopped and removed${NC}"
    else
        echo -e "${YELLOW}No PM2 storefront process found${NC}"
    fi
else
    echo -e "${YELLOW}PM2 not installed, skipping PM2 cleanup${NC}"
fi

# Remove old deployment directory if it exists
if [ -d "$OLD_DEPLOY_PATH" ]; then
    echo ""
    read -p "Old deployment directory found at $OLD_DEPLOY_PATH. Remove it? (y/n): " REMOVE_OLD
    if [ "$REMOVE_OLD" = "y" ] || [ "$REMOVE_OLD" = "Y" ]; then
        echo "Removing old deployment directory..."
        sudo rm -rf "$OLD_DEPLOY_PATH"
        echo -e "${GREEN}✅ Old deployment directory removed${NC}"
    else
        echo -e "${YELLOW}Keeping old deployment directory${NC}"
    fi
else
    echo -e "${YELLOW}No old deployment directory found${NC}"
fi

echo ""

# ============================================
# Step 6: Create Docker Network
# ============================================
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Step 6: Creating Docker Network${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

# Create network if it doesn't exist
if ! docker network ls | grep -q "storefront-network"; then
    docker network create storefront-network
    echo -e "${GREEN}✅ Docker network created${NC}"
else
    echo -e "${YELLOW}Docker network already exists${NC}"
fi

echo ""

# ============================================
# Step 7: Summary and Next Steps
# ============================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Setup Complete! 🎉                                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✅ Docker installed and configured${NC}"
echo -e "${GREEN}✅ GitHub Actions runner installed and running${NC}"
echo -e "${GREEN}✅ Nginx configured with wildcard routing${NC}"
echo -e "${GREEN}✅ Old PM2 setup cleaned up${NC}"
echo -e "${GREEN}✅ Docker network created${NC}"
echo ""

echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Next Steps:${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}1. Configure GitHub Secrets:${NC}"
echo "   Go to: ${GITHUB_URL}/settings/secrets/actions"
echo "   Add these secrets:"
echo "   - NEXT_PUBLIC_API_URL"
echo "   - NEXT_PUBLIC_MAIN_DOMAIN"
echo "   - NEXT_PUBLIC_FIREBASE_API_KEY"
echo "   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "   - NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo "   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
echo "   - NEXT_PUBLIC_FIREBASE_APP_ID"
echo "   - NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
echo "   - ANTHROPIC_API_KEY"
echo "   - CLOUDFLARE_API_TOKEN"
echo "   - CLOUDFLARE_ZONE_ID"
echo ""

echo -e "${YELLOW}2. Verify Next.js config has 'output: standalone':${NC}"
echo "   Check: next.config.ts should have 'output: \"standalone\"'"
echo ""

echo -e "${YELLOW}3. Push to main branch to trigger deployment:${NC}"
echo "   git add ."
echo "   git commit -m 'Add Docker deployment'"
echo "   git push origin main"
echo ""

echo -e "${YELLOW}4. Monitor deployment:${NC}"
echo "   Go to: ${GITHUB_URL}/actions"
echo "   Watch the workflow run in real-time"
echo ""

echo -e "${YELLOW}5. Verify deployment:${NC}"
echo "   docker ps                    # Check container"
echo "   docker logs storefront-app   # Check logs"
echo "   curl http://localhost:3000   # Test app"
echo ""

echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Important Notes:${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}⚠️  If Docker was just installed:${NC}"
echo "   You may need to log out and back in for Docker group to take effect"
echo "   Or run: newgrp docker"
echo ""

echo -e "${YELLOW}⚠️  Runner Status:${NC}"
echo "   Check: cd ~/actions-runner && sudo ./svc.sh status"
echo "   Restart: cd ~/actions-runner && sudo ./svc.sh restart"
echo ""

echo -e "${YELLOW}⚠️  Nginx Status:${NC}"
echo "   Check: sudo systemctl status nginx"
echo "   Test: sudo nginx -t"
echo ""

echo -e "${GREEN}✅ Everything is ready for automated deployment!${NC}"
echo ""
