# GitHub Actions SSH Setup

## Quick Answer

**No code changes needed!** The GitHub Actions workflow already handles SSH keys correctly.

## How It Works

The workflow uses `webfactory/ssh-agent@v0.9.0` which automatically:
- ✅ Loads your SSH key from GitHub Secrets
- ✅ Configures SSH to use the key
- ✅ Handles authentication automatically

You just need to add your SSH private key to GitHub Secrets.

## Setup Steps

### 1. Find Your SSH Key

**If using Oracle's key:**
```bash
# Find the key file (usually in Downloads)
ls ~/Downloads/*.pem ~/Downloads/*.key

# Copy the entire content
cat ~/Downloads/your-oracle-key.pem
```

**If using your own key:**
```bash
# Copy your default key
cat ~/.ssh/id_rsa
```

### 2. Add to GitHub Secrets

1. Go to: **GitHub Repository → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Name: `SSH_PRIVATE_KEY`
4. Value: Paste the **entire** private key (including BEGIN/END lines)
5. Click **"Add secret"**

### 3. Add Other Required Secrets

Also add these secrets:

- `SERVER_IP`: `79.72.95.124`
- `SERVER_USER`: `ubuntu`
- `DEPLOY_PATH`: `/var/www/storefront` (optional)

### 4. Test Deployment

Push to `main` branch:
```bash
git push origin main
```

GitHub Actions will automatically deploy!

## Key Differences

| Manual Script | GitHub Actions |
|---------------|----------------|
| Uses `-i` flag with SSH key file | Uses `webfactory/ssh-agent` |
| Set `SSH_KEY` environment variable | Uses `SSH_PRIVATE_KEY` secret |
| Key stored on your local machine | Key stored in GitHub Secrets |

## Important Notes

1. **Use the same key** that works for manual deployment
   - If Oracle key works manually → use Oracle key in GitHub Secrets
   - If your default key works manually → use your default key in GitHub Secrets

2. **The workflow doesn't need code changes**
   - The `webfactory/ssh-agent` action handles everything
   - Just add the key to GitHub Secrets

3. **Security**
   - GitHub Secrets are encrypted
   - Never commit private keys to git
   - Only add to GitHub Secrets

## Troubleshooting

### "Permission denied" in GitHub Actions

1. **Check the key format:**
   - Must include BEGIN and END lines
   - Must be the private key (not `.pub`)

2. **Verify the key works manually:**
   ```bash
   # Test with Oracle key
   ssh -i ~/Downloads/oracle-key.pem ubuntu@79.72.95.124
   
   # Or with default key
   ssh ubuntu@79.72.95.124
   ```
   If manual SSH works, the same key will work in GitHub Actions.

3. **Check GitHub Secrets:**
   - Make sure `SSH_PRIVATE_KEY` is set
   - Make sure `SERVER_IP` and `SERVER_USER` are set
   - Check for typos in secret names

## Workflow Code (Already Correct)

The workflow at `.github/workflows/deploy.yml` already has:

```yaml
- name: Setup SSH
  uses: webfactory/ssh-agent@v0.9.0
  with:
    ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
```

This automatically configures SSH - **no changes needed!**

## Summary

✅ **No code changes needed** - workflow is already correct  
✅ **Just add `SSH_PRIVATE_KEY` to GitHub Secrets**  
✅ **Use the same key that works for manual deployment**  
✅ **The `webfactory/ssh-agent` action handles everything automatically**
