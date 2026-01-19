#!/bin/bash
# ============================================
# Server Connection Fix Script
# ============================================
# Run this ON YOUR VPS SERVER to fix connection issues
# Usage: bash fix-server-connection.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Server Connection Fix Script        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# 1. Configure Firewall
echo -e "${GREEN}[1/4] Configuring firewall...${NC}"
sudo ufw allow 22/tcp comment 'SSH' 2>/dev/null || true
sudo ufw allow OpenSSH 2>/dev/null || true
sudo ufw allow 80/tcp comment 'HTTP' 2>/dev/null || true
sudo ufw allow 443/tcp comment 'HTTPS' 2>/dev/null || true

# Enable firewall if not already enabled
if ! sudo ufw status | grep -q "Status: active"; then
    echo -e "${YELLOW}Enabling firewall...${NC}"
    sudo ufw --force enable
fi

echo -e "${GREEN}✅ Firewall configured${NC}"
sudo ufw status verbose | head -10
echo ""

# 2. Configure SSH Keepalive
echo -e "${GREEN}[2/4] Configuring SSH keepalive...${NC}"

# Backup SSH config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d_%H%M%S)

# Add or update SSH keepalive settings
if grep -q "^ClientAliveInterval" /etc/ssh/sshd_config; then
    sudo sed -i 's/^ClientAliveInterval.*/ClientAliveInterval 60/' /etc/ssh/sshd_config
else
    echo "ClientAliveInterval 60" | sudo tee -a /etc/ssh/sshd_config > /dev/null
fi

if grep -q "^ClientAliveCountMax" /etc/ssh/sshd_config; then
    sudo sed -i 's/^ClientAliveCountMax.*/ClientAliveCountMax 3/' /etc/ssh/sshd_config
else
    echo "ClientAliveCountMax 3" | sudo tee -a /etc/ssh/sshd_config > /dev/null
fi

if grep -q "^TCPKeepAlive" /etc/ssh/sshd_config; then
    sudo sed -i 's/^TCPKeepAlive.*/TCPKeepAlive yes/' /etc/ssh/sshd_config
else
    echo "TCPKeepAlive yes" | sudo tee -a /etc/ssh/sshd_config > /dev/null
fi

# Disable DNS lookups (fixes slow SSH)
if grep -q "^UseDNS" /etc/ssh/sshd_config; then
    sudo sed -i 's/^UseDNS.*/UseDNS no/' /etc/ssh/sshd_config
else
    echo "UseDNS no" | sudo tee -a /etc/ssh/sshd_config > /dev/null
fi

# Disable GSSAPI (can cause delays)
if grep -q "^GSSAPIAuthentication" /etc/ssh/sshd_config; then
    sudo sed -i 's/^GSSAPIAuthentication.*/GSSAPIAuthentication no/' /etc/ssh/sshd_config
else
    echo "GSSAPIAuthentication no" | sudo tee -a /etc/ssh/sshd_config > /dev/null
fi

# Test SSH config (try both sshd and ssh)
SSH_SERVICE=""
if systemctl list-units | grep -q "ssh.service"; then
    SSH_SERVICE="ssh"
elif systemctl list-units | grep -q "sshd.service"; then
    SSH_SERVICE="sshd"
else
    # Default to ssh for Ubuntu
    SSH_SERVICE="ssh"
fi

# Test config (sshd binary is usually available even if service is named 'ssh')
if sudo sshd -t 2>/dev/null || sudo /usr/sbin/sshd -t 2>/dev/null; then
    echo -e "${GREEN}✅ SSH config is valid${NC}"
    sudo systemctl restart $SSH_SERVICE
    echo -e "${GREEN}✅ SSH service ($SSH_SERVICE) restarted${NC}"
else
    echo -e "${YELLOW}⚠️  Could not test SSH config, but continuing...${NC}"
    # Try to restart anyway
    sudo systemctl restart $SSH_SERVICE 2>/dev/null || true
fi
echo ""

# 3. Verify Ports
echo -e "${GREEN}[3/4] Verifying ports...${NC}"
echo "Listening ports:"
# Use 'ss' (modern) or 'netstat' (if installed)
if command -v ss &> /dev/null; then
    sudo ss -tulpn | grep -E ':(22|80|443|3000)' || echo "No matching ports found"
elif command -v netstat &> /dev/null; then
    sudo netstat -tulpn | grep -E ':(22|80|443|3000)' || echo "No matching ports found"
else
    echo "Installing net-tools to check ports..."
    sudo apt install -y net-tools 2>/dev/null || true
    sudo netstat -tulpn | grep -E ':(22|80|443|3000)' || echo "No matching ports found"
fi
echo ""

# 4. Check Services
echo -e "${GREEN}[4/4] Checking services...${NC}"

# Check SSH (Ubuntu uses 'ssh', not 'sshd')
if sudo systemctl is-active --quiet ssh 2>/dev/null || sudo systemctl is-active --quiet sshd 2>/dev/null; then
    echo -e "${GREEN}✅ SSH service is running${NC}"
else
    echo -e "${YELLOW}⚠️  SSH service check failed (may be named 'ssh' or 'sshd')${NC}"
    # Try to find the actual service name
    if systemctl list-units | grep -q "ssh.service"; then
        echo -e "${GREEN}✅ SSH service found as 'ssh.service'${NC}"
    elif systemctl list-units | grep -q "sshd.service"; then
        echo -e "${GREEN}✅ SSH service found as 'sshd.service'${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not determine SSH service name${NC}"
    fi
fi

# Check Nginx
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx is not running (may not be installed)${NC}"
fi

# Check PM2
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "storefront"; then
        echo -e "${GREEN}✅ PM2 app (storefront) is running${NC}"
    else
        echo -e "${YELLOW}⚠️  PM2 app (storefront) is not running${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 is not installed${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Configuration Complete!             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Check Oracle Cloud Security Lists!${NC}"
echo ""
echo "Oracle Cloud has its own firewall that can block connections."
echo "You MUST check Security Lists in the Oracle Cloud Console:"
echo ""
echo "1. Go to: Oracle Cloud Console → Networking → Virtual Cloud Networks"
echo "2. Click your VCN"
echo "3. Click Security Lists → Default Security List"
echo "4. Click Ingress Rules"
echo "5. Ensure these rules exist:"
echo "   - Port 22 (SSH) from 0.0.0.0/0"
echo "   - Port 80 (HTTP) from 0.0.0.0/0"
echo "   - Port 443 (HTTPS) from 0.0.0.0/0"
echo ""
echo -e "${GREEN}✅ Server-side configuration complete!${NC}"
echo ""
