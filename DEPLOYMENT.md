# Oracle Cloud Deployment Plan - Next.js Storefront

Complete guide for deploying your storefront with automated CI/CD pipeline.

---

## Prerequisites

- Oracle Cloud Ubuntu server (running)
- Public IP address
- Domain: `dfoldlab.co.uk` with DNS access
- GitHub repository
- SSH access to server

---

## Phase 1: Server Initial Setup

### 1.1 Connect to Server
```bash
ssh ubuntu@YOUR_SERVER_IP
```

### 1.2 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install Required Software
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker & Docker Compose
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Install Git
sudo apt install -y git
```

### 1.4 Verify Installations
```bash
node --version  # Should show v20.x
docker --version
nginx -v
```

---

## Phase 2: Domain & DNS Configuration

### 2.1 Update Cloudflare DNS
Point your domain to the Oracle server:

1. **A Record** (Root domain):
   - Type: `A`
   - Name: `@`
   - Content: `YOUR_SERVER_IP`
   - Proxy: `DNS only` (disable orange cloud initially)

2. **A Record** (Wildcard):
   - Type: `A`
   - Name: `*`
   - Content: `YOUR_SERVER_IP`
   - Proxy: `DNS only`

3. **A Record** (www):
   - Type: `A`
   - Name: `www`
   - Content: `YOUR_SERVER_IP`
   - Proxy: `DNS only`

---

## Phase 3: Nginx Configuration

### 3.1 Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/storefront
```

Add this configuration:
```nginx
# Main domain
server {
    listen 80;
    listen [::]:80;
    server_name dfoldlab.co.uk www.dfoldlab.co.uk;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Wildcard subdomain for storefronts
server {
    listen 80;
    listen [::]:80;
    server_name *.dfoldlab.co.uk;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/storefront /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Phase 4: SSL Setup (Wildcard Certificate)

### 4.1 Install Wildcard SSL with Certbot
```bash
sudo certbot certonly --manual --preferred-challenges=dns \
  -d dfoldlab.co.uk -d "*.dfoldlab.co.uk"
```

Follow prompts to add DNS TXT records to Cloudflare:
- Name: `_acme-challenge`
- Type: `TXT`
- Content: (value provided by certbot)

### 4.2 Update Nginx for HTTPS
```bash
sudo nano /etc/nginx/sites-available/storefront
```

Replace with:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name dfoldlab.co.uk www.dfoldlab.co.uk *.dfoldlab.co.uk;
    return 301 https://$host$request_uri;
}

# Main domain HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dfoldlab.co.uk www.dfoldlab.co.uk;

    ssl_certificate /etc/letsencrypt/live/dfoldlab.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dfoldlab.co.uk/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Wildcard subdomain HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name *.dfoldlab.co.uk;

    ssl_certificate /etc/letsencrypt/live/dfoldlab.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dfoldlab.co.uk/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4.3 Restart Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 4.4 Auto-Renewal
```bash
sudo certbot renew --dry-run
```

---

## Phase 5: Docker Setup

### 5.1 Create Dockerfile
In your project root:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 5.2 Update next.config.js
Add standalone output:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ... rest of your config
}

module.exports = nextConfig
```

### 5.3 Create docker-compose.yml
```yaml
version: '3.8'

services:
  storefront:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: storefront-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    networks:
      - storefront-network

networks:
  storefront-network:
    driver: bridge
```

### 5.4 Create .env.production (on server)
```bash
mkdir -p /home/ubuntu/storefront
nano /home/ubuntu/storefront/.env.production
```

Add all your environment variables (Firebase, Anthropic, etc.)

---

## Phase 6: GitHub Actions CI/CD

### 6.1 Generate SSH Key on Server
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions  # Copy private key
```

### 6.2 Add Secrets to GitHub
Go to GitHub Repository → Settings → Secrets and variables → Actions

Add:
- `ORACLE_HOST`: Your server IP
- `ORACLE_USERNAME`: `ubuntu`
- `ORACLE_SSH_KEY`: Private key from above
- `ENV_PRODUCTION`: Content of your .env.production file

### 6.3 Create GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Oracle Cloud

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.ORACLE_SSH_KEY }}

      - name: Add server to known hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ secrets.ORACLE_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy to server
        env:
          HOST: ${{ secrets.ORACLE_HOST }}
          USERNAME: ${{ secrets.ORACLE_USERNAME }}
        run: |
          ssh $USERNAME@$HOST << 'ENDSSH'
            set -e
            cd /home/ubuntu/storefront
            
            # Pull latest code
            git pull origin main
            
            # Update environment variables
            echo "${{ secrets.ENV_PRODUCTION }}" > .env.production
            
            # Build and restart with Docker
            docker-compose down
            docker-compose build --no-cache
            docker-compose up -d
            
            # Clean up old images
            docker image prune -af
            
            echo "✅ Deployment completed successfully"
          ENDSSH

      - name: Verify deployment
        env:
          HOST: ${{ secrets.ORACLE_HOST }}
          USERNAME: ${{ secrets.ORACLE_USERNAME }}
        run: |
          ssh $USERNAME@$HOST << 'ENDSSH'
            docker ps | grep storefront-app
          ENDSSH
```

---

## Phase 7: Initial Deployment

### 7.1 Clone Repository on Server
```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git storefront
cd storefront
```

### 7.2 Create .env.production
```bash
nano .env.production
```
Add all environment variables.

### 7.3 Initial Build & Run
```bash
docker-compose build
docker-compose up -d
```

### 7.4 Verify
```bash
docker ps
docker logs storefront-app
curl http://localhost:3000
```

---

## Phase 8: Firewall Configuration

### 8.1 Configure Oracle Cloud Security List
In Oracle Cloud Console:
1. Go to Networking → Virtual Cloud Networks
2. Select your VCN → Security Lists
3. Add Ingress Rules:
   - Port 80 (HTTP): Source `0.0.0.0/0`
   - Port 443 (HTTPS): Source `0.0.0.0/0`
   - Port 22 (SSH): Source `YOUR_IP/32` (restrict to your IP)

### 8.2 Ubuntu Firewall (UFW)
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## Phase 9: Monitoring & Logs

### 9.1 View Application Logs
```bash
docker logs -f storefront-app
```

### 9.2 View Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 9.3 Health Check Script
Create `/home/ubuntu/health-check.sh`:
```bash
#!/bin/bash
if ! docker ps | grep -q storefront-app; then
    echo "Container is down, restarting..."
    cd /home/ubuntu/storefront
    docker-compose up -d
fi
```

Add to crontab:
```bash
crontab -e
# Add: */5 * * * * /home/ubuntu/health-check.sh
```

---

## Deployment Checklist

- [ ] Server setup complete (Node, Docker, Nginx)
- [ ] DNS records configured in Cloudflare
- [ ] Nginx configured for wildcard subdomains
- [ ] SSL certificate installed (wildcard)
- [ ] Dockerfile and docker-compose.yml created
- [ ] .env.production configured on server
- [ ] GitHub Actions workflow created
- [ ] GitHub secrets added
- [ ] SSH key deployed
- [ ] Initial deployment successful
- [ ] Firewall rules configured
- [ ] Monitoring setup

---

## Post-Deployment

### Update Environment Variables
```bash
cd /home/ubuntu/storefront
nano .env.production
docker-compose restart
```

### Manual Deployment
```bash
cd /home/ubuntu/storefront
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Rollback
```bash
cd /home/ubuntu/storefront
git checkout <previous-commit-hash>
docker-compose down
docker-compose build
docker-compose up -d
```

---

## Troubleshooting

### Check if app is running
```bash
curl http://localhost:3000
```

### Verify DNS resolution
```bash
nslookup bukaxp.dfoldlab.co.uk
```

### Test SSL
```bash
curl https://dfoldlab.co.uk
curl https://bukaxp.dfoldlab.co.uk
```

### Container not starting
```bash
docker logs storefront-app
docker-compose down && docker-compose up
```
