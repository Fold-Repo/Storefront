#!/bin/bash
# ============================================
# Check Setup Status
# ============================================
# Run this to see what's already done
# Usage: bash deploy/CHECK_STATUS.sh

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=== Checking Setup Status ==="
echo ""

# Check Docker
echo -n "Docker: "
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Installed${NC} ($(docker --version | cut -d' ' -f3))"
else
    echo -e "${RED}❌ Not installed${NC}"
fi

# Check Docker Compose
echo -n "Docker Compose: "
if command -v docker compose &> /dev/null; then
    echo -e "${GREEN}✅ Installed${NC}"
else
    echo -e "${RED}❌ Not installed${NC}"
fi

# Check Runner
echo -n "GitHub Actions Runner: "
if [ -d "$HOME/actions-runner" ] && [ -f "$HOME/actions-runner/config.sh" ]; then
    if sudo systemctl is-active --quiet actions.runner.* 2>/dev/null; then
        echo -e "${GREEN}✅ Installed and running${NC}"
    else
        echo -e "${YELLOW}⚠️  Installed but not running${NC}"
    fi
else
    echo -e "${RED}❌ Not installed${NC}"
fi

# Check Nginx
echo -n "Nginx: "
if command -v nginx &> /dev/null; then
    if sudo systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Installed and running${NC}"
    else
        echo -e "${YELLOW}⚠️  Installed but not running${NC}"
    fi
else
    echo -e "${RED}❌ Not installed${NC}"
fi

# Check Nginx config
echo -n "Nginx Config (storefront): "
if [ -f "/etc/nginx/sites-available/storefront" ]; then
    if sudo nginx -t &>/dev/null; then
        echo -e "${GREEN}✅ Configured and valid${NC}"
    else
        echo -e "${YELLOW}⚠️  Configured but invalid${NC}"
    fi
else
    echo -e "${RED}❌ Not configured${NC}"
fi

# Check Docker network
echo -n "Docker Network (storefront-network): "
if docker network ls 2>/dev/null | grep -q "storefront-network"; then
    echo -e "${GREEN}✅ Created${NC}"
else
    echo -e "${RED}❌ Not created${NC}"
fi

# Check PM2 (old setup)
echo -n "PM2 Storefront (old setup): "
if command -v pm2 &> /dev/null; then
    if pm2 list 2>/dev/null | grep -q "storefront"; then
        echo -e "${YELLOW}⚠️  Still running (should be stopped)${NC}"
    else
        echo -e "${GREEN}✅ Not running (good)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 not installed${NC}"
fi

# Check old deployment directory
echo -n "Old Deployment Dir (/var/www/storefront): "
if [ -d "/var/www/storefront" ]; then
    echo -e "${YELLOW}⚠️  Still exists (can be removed)${NC}"
else
    echo -e "${GREEN}✅ Not found (good)${NC}"
fi

echo ""
echo "=== Summary ==="
echo "Run this to see what needs to be done next"
