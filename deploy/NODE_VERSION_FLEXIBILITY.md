# Node.js Version Flexibility

## Overview

The deployment scripts now support **Node.js 18+** (minimum) with **Node.js 20+** recommended for best performance.

## Version Requirements

- **Minimum:** Node.js 18.0.0
- **Recommended:** Node.js 20.0.0+
- **Docker:** Uses Node.js 20 (via `node:20-alpine` image)

## Why This Change?

Some servers may have Node.js 18 installed, and requiring Node.js 20+ would disrupt existing deployments. The scripts now:

1. ✅ Accept Node.js 18+ as minimum
2. ⚠️  Warn if using Node.js 18 (recommends upgrading to 20)
3. ✅ Use Node.js 20 in Docker (automatic)

## Override Minimum Version

You can override the minimum Node.js version via environment variable:

```bash
# Require Node.js 20+ (strict)
export MIN_NODE_VERSION=20
./deploy/deploy-manual.sh

# Allow Node.js 18+ (default)
export MIN_NODE_VERSION=18
./deploy/deploy-manual.sh
```

## Docker Deployment

Docker deployments **always use Node.js 20** via the `node:20-alpine` image in the Dockerfile. This ensures consistent builds regardless of the server's Node.js version.

## PM2 Deployment

PM2 deployments check the server's Node.js version:
- ✅ **18+**: Works (with warning if < 20)
- ❌ **< 18**: Fails with clear error message

## Upgrading Node.js on Server

If you want to upgrade to Node.js 20 on your server:

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node -v  # Should show v20.x.x
```

## Summary

| Deployment Method | Node.js Version | Notes |
|------------------|----------------|-------|
| **Docker** | 20 (automatic) | Uses `node:20-alpine` image |
| **PM2** | 18+ (minimum) | Warns if < 20, recommends upgrade |
| **Local Build** | 18+ (minimum) | Warns if < 20, recommends upgrade |

## Fixed Issues

1. ✅ **Node.js 18 compatibility**: Scripts now accept Node.js 18+
2. ✅ **Tar warnings**: Added `--no-mac-metadata` to suppress macOS extended attributes warnings
3. ✅ **Flexible version check**: Can override minimum version via `MIN_NODE_VERSION` env var
