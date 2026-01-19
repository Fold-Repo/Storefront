# Oracle Cloud SSH Key Guide

## Understanding Oracle Cloud SSH Keys

When you create an Oracle Cloud instance, you have two options for SSH access:

### Option 1: Oracle-Generated Key Pair
- Oracle generates a key pair for you
- You download the **private key** during instance creation
- The public key is automatically added to the instance
- **Use this private key** for GitHub Actions

### Option 2: Your Own SSH Key
- You upload your **public key** to Oracle Cloud
- You keep your **private key** on your local machine
- **Use your own private key** for GitHub Actions

---

## Which Key Do You Have?

### Check if Oracle Generated Your Key

1. **Do you have a `.pem` or `.key` file?**
   - Usually named like: `ssh-key-2024-01-19.key` or `instance-key.pem`
   - This is Oracle's private key - **use this one!**

2. **Did you download a key when creating the instance?**
   - If yes, that's Oracle's private key
   - **Use this for GitHub Actions**

### Check if You Used Your Own Key

1. **Did you upload a public key to Oracle Cloud?**
   - If yes, you're using your own key
   - Use your local `~/.ssh/id_rsa` (or similar)

2. **Can you SSH without specifying a key file?**
   ```bash
   ssh ubuntu@145.241.251.29
   # If this works, you're using your own key
   ```

---

## How to Use Oracle's Private Key

### If You Have Oracle's Private Key File

1. **Find the key file:**
   - Usually in Downloads folder
   - Or wherever you saved it during instance creation
   - File extension: `.pem`, `.key`, or no extension

2. **Set correct permissions:**
   ```bash
   chmod 600 /path/to/oracle-private-key.pem
   ```

3. **Test SSH connection:**
   ```bash
   ssh -i /path/to/oracle-private-key.pem ubuntu@145.241.251.29
   ```

4. **For GitHub Actions:**
   - Copy the **entire content** of the Oracle private key file
   - Add it as `SSH_PRIVATE_KEY` in GitHub Secrets
   - Include the BEGIN and END lines

---

## How to Use Your Own SSH Key

### If You Uploaded Your Public Key to Oracle

1. **Your private key is on your local machine:**
   ```bash
   cat ~/.ssh/id_rsa
   # or
   cat ~/.ssh/id_ed25519
   ```

2. **Test SSH connection:**
   ```bash
   ssh ubuntu@145.241.251.29
   # Should work without -i flag
   ```

3. **For GitHub Actions:**
   - Copy the content of your local private key
   - Add it as `SSH_PRIVATE_KEY` in GitHub Secrets

---

## Quick Check: Which Key Am I Using?

Run this to check:

```bash
# Try SSH with your default key
ssh ubuntu@145.241.251.29

# If that works, you're using your own key
# Use: ~/.ssh/id_rsa (or id_ed25519)

# If that fails, you need Oracle's key
# Look for: .pem or .key file in Downloads
```

---

## For GitHub Actions

### Using Oracle's Private Key

1. **Get the key content:**
   ```bash
   cat /path/to/oracle-private-key.pem
   ```

2. **Copy the entire output** (including BEGIN/END lines)

3. **Add to GitHub Secrets:**
   - Name: `SSH_PRIVATE_KEY`
   - Value: Paste the entire key content

### Using Your Own Private Key

1. **Get the key content:**
   ```bash
   cat ~/.ssh/id_rsa
   # or
   cat ~/.ssh/id_ed25519
   ```

2. **Copy the entire output** (including BEGIN/END lines)

3. **Add to GitHub Secrets:**
   - Name: `SSH_PRIVATE_KEY`
   - Value: Paste the entire key content

---

## Important Notes

1. **Never share your private key publicly**
   - Only add it to GitHub Secrets (encrypted)
   - Never commit it to git

2. **Oracle key format:**
   - Usually starts with `-----BEGIN RSA PRIVATE KEY-----`
   - Or `-----BEGIN OPENSSH PRIVATE KEY-----`
   - Include the BEGIN and END lines

3. **Key permissions:**
   - On your local machine: `chmod 600 keyfile.pem`
   - GitHub Secrets handles permissions automatically

---

## Troubleshooting

### "Permission denied (publickey)"

**If using Oracle's key:**
```bash
# Make sure you're using the correct key file
ssh -i /path/to/oracle-key.pem ubuntu@145.241.251.29

# Check key permissions
chmod 600 /path/to/oracle-key.pem
```

**If using your own key:**
```bash
# Make sure public key is on server
ssh ubuntu@145.241.251.29
# Check: cat ~/.ssh/authorized_keys
```

### "No such file or directory"

- Make sure you have the key file
- Check the file path is correct
- Oracle keys are usually in Downloads folder

---

## Summary

**You need the private key that can SSH into your server:**

- ✅ **Oracle's private key** (if Oracle generated it) - `.pem` or `.key` file
- ✅ **Your own private key** (if you uploaded your public key) - `~/.ssh/id_rsa`

**For GitHub Actions:**
- Copy the **entire private key content**
- Add as `SSH_PRIVATE_KEY` secret
- Include BEGIN and END lines

---

## Quick Decision Tree

```
Can you SSH without specifying a key file?
├─ YES → Use your own key (~/.ssh/id_rsa)
└─ NO → Use Oracle's key (the .pem/.key file you downloaded)
```
