#!/bin/bash
# ============================================
# GitHub Actions Runner Setup Script
# ============================================
# Run this ON YOUR SERVER to set up GitHub Actions runner
# Usage: bash deploy/SETUP_RUNNER.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   GitHub Actions Runner Setup          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Please don't run as root. Run as your regular user.${NC}"
    exit 1
fi

# Step 1: Install Docker
echo -e "${GREEN}[1/4] Installing Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is already installed${NC}"
    docker --version
else
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Docker installed${NC}"
    echo -e "${YELLOW}⚠️  You need to log out and back in for Docker group to take effect${NC}"
fi
echo ""

# Step 2: Install Docker Compose
echo -e "${GREEN}[2/4] Installing Docker Compose...${NC}"
if command -v docker compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose is already installed${NC}"
    docker compose version
else
    sudo apt install -y docker-compose-plugin
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
fi
echo ""

# Step 3: Download GitHub Actions Runner
echo -e "${GREEN}[3/4] Downloading GitHub Actions Runner...${NC}"
RUNNER_DIR="$HOME/actions-runner"
mkdir -p $RUNNER_DIR
cd $RUNNER_DIR

# Get latest runner version
RUNNER_VERSION="2.311.0"
RUNNER_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"

if [ ! -f "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" ]; then
    echo "Downloading runner..."
    curl -o actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L $RUNNER_URL
    tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
    echo -e "${GREEN}✅ Runner downloaded${NC}"
else
    echo -e "${YELLOW}Runner already downloaded${NC}"
fi
echo ""

# Step 4: Configure Runner
echo -e "${GREEN}[4/4] Configure GitHub Actions Runner${NC}"
echo ""
echo -e "${YELLOW}To get your registration token:${NC}"
echo "1. Go to: GitHub Repository → Settings → Actions → Runners"
echo "2. Click 'New self-hosted runner'"
echo "3. Select Linux and x64"
echo "4. Copy the token shown"
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo): " REPO_URL
read -p "Enter your registration token: " REG_TOKEN

if [ -z "$REPO_URL" ] || [ -z "$REG_TOKEN" ]; then
    echo -e "${RED}❌ Repository URL and token are required${NC}"
    exit 1
fi

# Configure runner
./config.sh --url $REPO_URL --token $REG_TOKEN

# Install as service
echo ""
echo -e "${GREEN}Installing runner as service...${NC}"
sudo ./svc.sh install

# Start service
sudo ./svc.sh start

# Check status
echo ""
echo -e "${GREEN}Runner status:${NC}"
sudo ./svc.sh status

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup Complete! 🎉                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Configure GitHub Secrets (see deploy/DOCKER_GITHUB_ACTIONS_SETUP.md)"
echo "2. Update next.config.ts to include 'output: standalone'"
echo "3. Push to main branch to trigger deployment"
echo ""
echo -e "${YELLOW}Note: If Docker was just installed, log out and back in for group changes${NC}"
echo ""
