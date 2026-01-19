#!/bin/bash
# ============================================
# Manual Deployment Script
# ============================================
# Builds locally and deploys to server
# 
# IMPORTANT: Run this on your LOCAL PC, not on the server!
# 
# Usage:
#   export SERVER_IP=your-server-ip
#   ./deploy/deploy-manual.sh
#
# Or set inline:
#   SERVER_IP=your-server-ip ./deploy/deploy-manual.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration (update these)
SERVER_USER="${SERVER_USER:-ubuntu}"
SERVER_IP="${SERVER_IP:-your-server-ip}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/storefront}"
SSH_KEY="${SSH_KEY:-}"  # Optional: path to SSH private key (e.g., ~/.ssh/oracle-key.pem)

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Manual Deployment Script            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if server IP is set
if [ "$SERVER_IP" == "your-server-ip" ]; then
    echo -e "${RED}❌ Please set SERVER_IP environment variable${NC}"
    echo "   export SERVER_IP=your-actual-server-ip"
    exit 1
fi

# Build SSH command with optional key
SSH_CMD="ssh"
SCP_CMD="scp"
if [ -n "$SSH_KEY" ]; then
    if [ ! -f "$SSH_KEY" ]; then
        echo -e "${RED}❌ SSH key file not found: $SSH_KEY${NC}"
        exit 1
    fi
    # Set correct permissions
    chmod 600 "$SSH_KEY" 2>/dev/null || true
    SSH_CMD="ssh -i $SSH_KEY"
    SCP_CMD="scp -i $SSH_KEY"
    echo -e "${BLUE}Using SSH key: $SSH_KEY${NC}"
fi

# Step 1: Build locally
echo -e "${GREEN}[1/5] Building project locally...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 2: Create deployment package
echo -e "${GREEN}[2/5] Creating deployment package...${NC}"
tar -czf deploy.tar.gz \
    .next \
    public \
    package.json \
    package-lock.json \
    ecosystem.config.js \
    next.config.ts \
    tsconfig.json \
    2>/dev/null || {
    echo -e "${YELLOW}⚠️  Some files missing, continuing...${NC}"
    tar -czf deploy.tar.gz .next public package.json package-lock.json 2>/dev/null
}

echo -e "${GREEN}✅ Package created${NC}"
echo ""

# Step 3: Upload to server
echo -e "${GREEN}[3/5] Uploading to server...${NC}"
$SCP_CMD deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed!${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "  1. If using Oracle's key, set SSH_KEY:"
    echo "     export SSH_KEY=/path/to/oracle-key.pem"
    echo "  2. Test SSH connection:"
    if [ -n "$SSH_KEY" ]; then
        echo "     ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP"
    else
        echo "     ssh $SERVER_USER@$SERVER_IP"
    fi
    echo "  3. Check key permissions: chmod 600 /path/to/key"
    echo "  4. See: deploy/ORACLE_CLOUD_SSH_KEY.md for help"
    exit 1
fi

echo -e "${GREEN}✅ Upload successful${NC}"
echo ""

# Step 4: Deploy on server
echo -e "${GREEN}[4/5] Deploying on server...${NC}"
$SSH_CMD $SERVER_USER@$SERVER_IP << ENDSSH
set -e
cd $DEPLOY_PATH

echo "📦 Extracting deployment package..."
tar -xzf /tmp/deploy.tar.gz

echo "📥 Installing production dependencies..."
npm ci --production

echo "🔄 Reloading application..."
pm2 reload storefront || pm2 start ecosystem.config.js --env production
pm2 save

echo "✅ Deployment complete!"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

# Step 5: Cleanup
echo -e "${GREEN}[5/5] Cleaning up...${NC}"
rm -f deploy.tar.gz

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Successful! 🎉           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Check app status: ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
echo "  2. View logs: ssh $SERVER_USER@$SERVER_IP 'pm2 logs storefront'"
echo "  3. Test site: curl http://localhost:3000"
echo ""
