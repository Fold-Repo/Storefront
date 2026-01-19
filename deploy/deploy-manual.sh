#!/bin/bash
# ============================================
# Manual Deployment Script
# ============================================
# Builds locally and deploys to server
# 
# IMPORTANT: Run this on your LOCAL PC, not on the server!
# 
# This script automatically detects if server uses Docker or PM2:
# - Docker: Builds image and runs container
# - PM2: Deploys to /var/www/storefront and uses PM2
#
# Usage:
#   export SERVER_IP=145.241.251.29
#   ./deploy/deploy-manual.sh
#
# Or set inline:
#   SERVER_IP=145.241.251.29 ./deploy/deploy-manual.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration (update these)
SERVER_USER="${SERVER_USER:-ubuntu}"
SERVER_IP="${SERVER_IP:-145.241.251.29}"  # New server IP
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
    SSH_CMD="ssh -i $SSH_KEY -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -o TCPKeepAlive=yes"
    SCP_CMD="scp -i $SSH_KEY -o ServerAliveInterval=60 -o ServerAliveCountMax=3"
    echo -e "${BLUE}Using SSH key: $SSH_KEY${NC}"
else
    # Add keepalive settings even without key
    SSH_CMD="ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -o TCPKeepAlive=yes"
    SCP_CMD="scp -o ServerAliveInterval=60 -o ServerAliveCountMax=3"
fi

# Step 1: Verify Node.js version (required: 18+, recommended: 20+)
echo -e "${GREEN}[1/6] Verifying Node.js version...${NC}"
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
MIN_NODE_VERSION="${MIN_NODE_VERSION:-18}"  # Allow override via env var

if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt "$MIN_NODE_VERSION" ]; then
    echo -e "${RED}❌ Node.js ${MIN_NODE_VERSION}+ is required!${NC}"
    echo "   Current version: $(node -v 2>/dev/null || echo 'not found')"
    echo "   Please install Node.js ${MIN_NODE_VERSION}+ and try again"
    echo "   Using nvm: nvm install ${MIN_NODE_VERSION} && nvm use ${MIN_NODE_VERSION}"
    exit 1
fi

if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Node.js $(node -v) detected (meets minimum: ${MIN_NODE_VERSION}+)${NC}"
    echo -e "${YELLOW}   Note: Node.js 20+ is recommended for best performance${NC}"
else
    echo -e "${GREEN}✅ Node.js $(node -v) detected (meets requirement: ${MIN_NODE_VERSION}+)${NC}"
fi
echo ""

# Step 2: Build locally
echo -e "${GREEN}[2/5] Building project locally...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 3: Create deployment package
echo -e "${GREEN}[3/5] Creating deployment package...${NC}"

# Check if Docker is being used (for Docker, we need source files)
# For PM2, we only need built files
USE_DOCKER=false
if $SSH_CMD $SERVER_USER@$SERVER_IP 'command -v docker &> /dev/null && docker ps &> /dev/null' 2>/dev/null; then
    USE_DOCKER=true
    echo -e "${YELLOW}Docker detected - Including source files for Docker build...${NC}"
fi

if [ "$USE_DOCKER" = true ]; then
    # For Docker: Include source files needed for build
    # Use --no-mac-metadata to suppress macOS extended attributes warnings
    tar --no-mac-metadata --exclude='.DS_Store' --exclude='._*' -czf deploy.tar.gz \
        .next \
        public \
        app \
        components \
        lib \
        services \
        hooks \
        types \
        utils \
        constants \
        contexts \
        views \
        package.json \
        package-lock.json \
        Dockerfile \
        next.config.ts \
        tsconfig.json \
        2>/dev/null || {
        echo -e "${YELLOW}⚠️  Some files missing, continuing...${NC}"
        tar --no-mac-metadata --exclude='.DS_Store' --exclude='._*' -czf deploy.tar.gz .next public package.json package-lock.json Dockerfile 2>/dev/null
    }
else
    # For PM2: Only built files
    # Use --no-mac-metadata to suppress macOS extended attributes warnings
    tar --no-mac-metadata --exclude='.DS_Store' --exclude='._*' -czf deploy.tar.gz \
        .next \
        public \
        package.json \
        package-lock.json \
        ecosystem.config.js \
        next.config.ts \
        tsconfig.json \
        2>/dev/null || {
        echo -e "${YELLOW}⚠️  Some files missing, continuing...${NC}"
        tar --no-mac-metadata --exclude='.DS_Store' --exclude='._*' -czf deploy.tar.gz .next public package.json package-lock.json 2>/dev/null
    }
fi

echo -e "${GREEN}✅ Package created${NC}"
echo ""

# Step 4: Upload to server (with retry logic)
echo -e "${GREEN}[4/6] Uploading to server...${NC}"

# Test SSH connection first
echo -e "${YELLOW}Testing SSH connection...${NC}"
if ! $SSH_CMD -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_IP 'echo "SSH connection successful"' 2>/dev/null; then
    echo -e "${YELLOW}⚠️  SSH connection test failed. Attempting with verbose output...${NC}"
    $SSH_CMD -v -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP 'echo "SSH connection test"' 2>&1 | head -20 || true
    echo ""
fi

# Upload with retry logic
MAX_RETRIES=3
RETRY_COUNT=0
UPLOAD_SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$UPLOAD_SUCCESS" = false ]; do
    if [ $RETRY_COUNT -gt 0 ]; then
        echo -e "${YELLOW}Retry attempt $RETRY_COUNT of $MAX_RETRIES...${NC}"
        sleep 2
    fi
    
    # Use -o ServerAliveInterval and -o ServerAliveCountMax to keep connection alive
    if $SCP_CMD -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -o ConnectTimeout=30 \
        deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/ 2>&1; then
        UPLOAD_SUCCESS=true
        echo -e "${GREEN}✅ Upload successful${NC}"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo -e "${YELLOW}Upload failed, will retry...${NC}"
        fi
    fi
done

if [ "$UPLOAD_SUCCESS" = false ]; then
    echo -e "${RED}❌ Upload failed after $MAX_RETRIES attempts!${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo ""
    echo "1. Test SSH connection manually:"
    if [ -n "$SSH_KEY" ]; then
        echo "   ssh -i $SSH_KEY -v $SERVER_USER@$SERVER_IP"
    else
        echo "   ssh -v $SERVER_USER@$SERVER_IP"
    fi
    echo ""
    echo "2. Check SSH key (if using):"
    echo "   export SSH_KEY=/path/to/oracle-key.pem"
    echo "   chmod 600 \$SSH_KEY"
    echo ""
    echo "3. Verify server is accessible:"
    echo "   ping $SERVER_IP"
    echo ""
    echo "4. Check server SSH service:"
    echo "   ssh $SERVER_USER@$SERVER_IP 'sudo systemctl status ssh'"
    echo ""
    echo "5. Common fixes:"
    echo "   - Run: deploy/SERVER_CONNECTION_FIX.md on the server"
    echo "   - Check Oracle Cloud Security Lists (ports 22, 80, 443)"
    echo "   - Verify SSH key permissions: chmod 600 /path/to/key"
    echo ""
    echo "6. See documentation:"
    echo "   - deploy/SSH_FIX.md"
    echo "   - deploy/ORACLE_CLOUD_SSH_KEY.md"
    echo "   - deploy/SERVER_CONNECTION_FIX.md"
    exit 1
fi

echo -e "${GREEN}✅ Upload successful${NC}"
echo ""

# Step 5: Deploy on server
echo -e "${GREEN}[5/6] Deploying on server...${NC}"
$SSH_CMD $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

DEPLOY_PATH="${DEPLOY_PATH:-/var/www/storefront}"

# Check if using Docker or PM2
USE_DOCKER=false
if command -v docker &> /dev/null && docker ps &> /dev/null 2>/dev/null; then
    USE_DOCKER=true
fi

if [ "$USE_DOCKER" = true ]; then
    echo "🐳 Docker detected - Using Docker deployment..."
    
    # Create temporary directory for deployment
    DEPLOY_TMP="/tmp/storefront-deploy-$(date +%s)"
    mkdir -p "$DEPLOY_TMP"
    cd "$DEPLOY_TMP"
    
    echo "📦 Extracting deployment package..."
    tar -xzf /tmp/deploy.tar.gz
    
    # Create .env.production if it doesn't exist
    if [ ! -f .env.production ]; then
        echo "⚠️  .env.production not found. Creating template..."
        cat > .env.production << 'ENVEOF'
NODE_ENV=production
PORT=3000
# Add your environment variables here
ENVEOF
        echo "⚠️  Please update .env.production with your API keys!"
    fi
    
    echo "🔨 Building Docker image..."
    docker build -t storefront:latest . || {
        echo "❌ Docker build failed!"
        exit 1
    }
    
    echo "🛑 Stopping existing container..."
    docker stop storefront-app 2>/dev/null || true
    docker rm storefront-app 2>/dev/null || true
    
    # Create network if it doesn't exist
    if ! docker network ls | grep -q "storefront-network"; then
        echo "🌐 Creating Docker network..."
        docker network create storefront-network
    fi
    
    echo "🚀 Starting new container..."
    docker run -d \
        --name storefront-app \
        --restart unless-stopped \
        -p 3000:3000 \
        --env-file .env.production \
        --network storefront-network \
        storefront:latest || {
        echo "❌ Container start failed!"
        exit 1
    }
    
    echo "🧹 Cleaning up temporary files..."
    cd /
    rm -rf "$DEPLOY_TMP"
    
    echo "✅ Docker deployment complete!"
else
    echo "📦 Using PM2 deployment..."
    
    # Verify Node.js version on server (required: 18+, recommended: 20+)
    echo "🔍 Verifying Node.js version on server..."
    SERVER_NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    MIN_NODE_VERSION="${MIN_NODE_VERSION:-18}"  # Allow override via env var
    
    if [ -z "$SERVER_NODE_VERSION" ] || [ "$SERVER_NODE_VERSION" -lt "$MIN_NODE_VERSION" ]; then
        echo "❌ ERROR: Server Node.js version must be ${MIN_NODE_VERSION}+!"
        echo "   Current version: $(node -v 2>/dev/null || echo 'not found')"
        echo "   Please install Node.js ${MIN_NODE_VERSION}+ on the server first"
        if [ "$MIN_NODE_VERSION" = "20" ]; then
            echo "   Run: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
        else
            echo "   Run: curl -fsSL https://deb.nodesource.com/setup_${MIN_NODE_VERSION}.x | sudo -E bash - && sudo apt-get install -y nodejs"
        fi
        exit 1
    fi
    
    if [ "$SERVER_NODE_VERSION" -lt 20 ]; then
        echo "⚠️  Server Node.js $(node -v) confirmed (meets minimum: ${MIN_NODE_VERSION}+)"
        echo "   Note: Node.js 20+ is recommended for best performance"
    else
        echo "✅ Server Node.js $(node -v) confirmed (meets requirement: ${MIN_NODE_VERSION}+)"
    fi
    
    # Create deployment directory if it doesn't exist
    if [ ! -d "$DEPLOY_PATH" ]; then
        echo "Creating deployment directory..."
        sudo mkdir -p "$DEPLOY_PATH"
        sudo chown "$USER:$USER" "$DEPLOY_PATH"
    fi
    
    cd "$DEPLOY_PATH"
    
    echo "📦 Extracting deployment package..."
    tar -xzf /tmp/deploy.tar.gz
    
    echo "📥 Installing production dependencies..."
    npm ci --production
    
    echo "🔄 Reloading application..."
    pm2 reload storefront || pm2 start ecosystem.config.js --env production || {
        echo "⚠️  PM2 start failed. Make sure ecosystem.config.js exists."
        exit 1
    }
    pm2 save
    
    echo "✅ PM2 deployment complete!"
fi
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

# Step 6: Cleanup
echo -e "${GREEN}[6/6] Cleaning up...${NC}"
rm -f deploy.tar.gz

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Successful! 🎉           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Check app status:"
echo "     - Docker: ssh $SERVER_USER@$SERVER_IP 'docker ps'"
echo "     - PM2: ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
echo "  2. View logs:"
echo "     - Docker: ssh $SERVER_USER@$SERVER_IP 'docker logs storefront-app'"
echo "     - PM2: ssh $SERVER_USER@$SERVER_IP 'pm2 logs storefront'"
echo "  3. Test site: ssh $SERVER_USER@$SERVER_IP 'curl http://localhost:3000'"
echo ""
echo -e "${YELLOW}Note: For automated Docker deployment, use GitHub Actions instead.${NC}"
echo "   See: deploy/DEPLOYMENT_CHECKLIST.md"
echo ""
