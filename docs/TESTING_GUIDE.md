# Testing Guide - Complete User Journey

This guide walks you through testing the entire application flow from sign up to creating a storefront.

## Prerequisites

Before testing, ensure you have:

1. ✅ **Environment variables set up** - See [API Keys Setup](./API_KEYS_SETUP.md)
2. ✅ **Firebase configured** - See [Firebase Setup](./FIREBASE_SETUP.md)
3. ✅ **Development server running** - `npm run dev` or `yarn dev`

## Test Flow Overview

```
1. Sign Up (Email/Password or Google)
   ↓
2. Email Verification
   ↓
3. Login
   ↓
4. Dashboard Access
   ↓
5. Create Storefront (Wizard)
   ↓
6. AI Page Generation
   ↓
7. View Generated Pages
   ↓
8. Edit Pages (GrapesJS)
   ↓
9. Test Subdomain Access
```

---

## Part 1: Sign Up Testing

### Test 1.1: Email/Password Sign Up

1. **Navigate to Sign Up Page**
   - Go to: `http://localhost:3000/signup`
   - Or click "Sign Up" from homepage

2. **Fill in Sign Up Form**
   - **Step 1 - Account Type**: Select "Email/Password"
   - **Step 2 - Personal Info**:
     - First Name: `John`
     - Last Name: `Doe`
     - Email: `test@example.com`
     - Phone: `+1234567890`
   - **Step 3 - Business Info**:
     - Business Name: `Test Store`
     - Business Type: `Retail`
     - TIN: `123456789`
     - Website: `https://teststore.com`
     - Business Registration Number: `REG123`
   - **Step 4 - Products**:
     - Product/Service: `Electronics`
     - Product Description: `We sell electronic devices`
   - **Step 5 - Address**:
     - Address Line 1: `123 Main St`
     - City: `New York`
     - Postcode: `10001`
   - **Step 6 - Review**:
     - Check "Terms & Conditions"
     - Check "Certify Correct Data"
     - Click "Submit"

3. **Expected Result**
   - ✅ Success notification: "Account created successfully! Please verify your email."
   - ✅ Redirect to verification page: `/verify?email=test@example.com`

### Test 1.2: Google Sign Up

1. **Navigate to Sign Up Page**
   - Go to: `http://localhost:3000/signup`

2. **Click "Sign Up with Google"**
   - Click the Google sign-in button
   - A Google popup should appear

3. **Select Google Account**
   - Choose your Google account
   - Grant permissions if prompted

4. **Expected Result**
   - ✅ Google popup closes
   - ✅ Success notification: "Google authentication successful"
   - ✅ Form pre-filled with Google account info (email, name)
   - ✅ Automatically moves to Step 2 (Personal Info)

5. **Complete Remaining Steps**
   - Fill in business information (Steps 3-6)
   - Submit the form

6. **Expected Result**
   - ✅ Success notification
   - ✅ Redirect to verification page

### Test 1.3: Verify Google Sign Up Works

**Check Points:**
- ✅ Google popup appears when clicking "Sign Up with Google"
- ✅ No errors in browser console
- ✅ Form data is pre-filled correctly (email, firstname, lastname)
- ✅ Firebase authentication succeeds (check Firebase console)
- ✅ Backend API call succeeds (check network tab)
- ✅ User is redirected to verification page

**How Google Sign Up Works:**
1. User clicks "Sign Up with Google"
2. Firebase `signInWithPopup` opens Google authentication
3. User selects Google account
4. Firebase returns user with ID token
5. ID token is sent to backend: `POST /auth/google/signup`
6. Backend creates user account
7. User redirected to verification page

**Common Issues:**
- ❌ **Popup blocked**: Check browser popup settings
- ❌ **Firebase error**: Verify Firebase config in `.env.local`
  - Check `NEXT_PUBLIC_FIREBASE_API_KEY` is set
  - Check `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is correct
- ❌ **API error**: Check backend API is running and accessible
  - Verify `API_BASE_URL` in `constants/api.ts`
  - Check endpoint: `/auth/google/signup`
- ❌ **"redirect_uri_mismatch"**: Add your domain to Firebase authorized domains

---

## Part 2: Email Verification Testing

1. **Check Email**
   - Open the email sent to your registered email address
   - Look for verification email from your backend

2. **Click Verification Link**
   - Or manually enter verification code if using OTP

3. **Expected Result**
   - ✅ Success notification: "Email verified successfully"
   - ✅ Redirect to dashboard: `/dashboard`
   - ✅ Or redirect to homepage with `continueWizard=true` if wizard was in progress

---

## Part 3: Login Testing

### Test 3.1: Email/Password Login

1. **Navigate to Login Page**
   - Go to: `http://localhost:3000/signin`
   - Or click "Log in" from homepage

2. **Enter Credentials**
   - Email: `test@example.com`
   - Password: `YourPassword123`

3. **Click "Sign In"**
   - Or press Enter

4. **Expected Result**
   - ✅ Success notification
   - ✅ Redirect to dashboard: `/dashboard`
   - ✅ User data loaded in dashboard

### Test 3.2: Google Login

1. **Navigate to Login Page**
   - Go to: `http://localhost:3000/signin`

2. **Click "Sign in with Google"**
   - Click the Google sign-in button
   - A Google popup should appear

3. **Select Google Account**
   - Choose the same Google account used for signup
   - Grant permissions if prompted

4. **Expected Result**
   - ✅ Google popup closes
   - ✅ Success notification: "Login successful"
   - ✅ Redirect to dashboard: `/dashboard`
   - ✅ User data loaded

### Test 3.3: Verify Google Login Works

**Check Points:**
- ✅ Google popup appears when clicking "Sign in with Google"
- ✅ No errors in browser console
- ✅ Firebase authentication succeeds (check Firebase console)
- ✅ Backend API receives ID token (check network tab)
- ✅ User is authenticated and redirected to dashboard
- ✅ User data is available in dashboard
- ✅ User avatar shows correctly

**How Google Login Works:**
1. User clicks "Sign in with Google"
2. Firebase `signInWithPopup` opens Google authentication
3. User selects Google account (must be same as signup)
4. Firebase returns user with ID token
5. ID token is sent to backend: `POST /auth/google/signin`
6. Backend validates token and returns user data + access token
7. User data stored in AuthContext
8. User redirected to dashboard

**Testing Steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Sign in with Google"
4. Complete Google authentication
5. Check network request to `/auth/google/signin`:
   - ✅ Request sent with `idToken`
   - ✅ Response contains `token`, `refreshToken`, `user`
6. Check Application tab → Local Storage:
   - ✅ `auth_token` is stored
   - ✅ `refresh_token` is stored
7. Verify redirect to dashboard

**Common Issues:**
- ❌ **"redirect_uri_mismatch"**: 
  - Go to Firebase Console → Authentication → Settings → Authorized domains
  - Add `localhost` and your production domain
- ❌ **Token expired**: Try signing in again (tokens expire after 1 hour)
- ❌ **API error**: 
  - Check backend API is running: `https://shorp-epos-backend.onrender.com/api/v1`
  - Verify endpoint exists: `/auth/google/signin`
  - Check backend logs for errors
- ❌ **User not found**: User must sign up first before logging in
- ❌ **Firebase config error**: 
  - Verify all Firebase env variables in `.env.local`
  - Check `NEXT_PUBLIC_FIREBASE_API_KEY` is complete (39 characters)

---

## Part 4: Dashboard Testing

1. **Access Dashboard**
   - After login, you should be redirected to `/dashboard`
   - Or navigate manually: `http://localhost:3000/dashboard`

2. **Verify Dashboard Elements**
   - ✅ Header with logo and user avatar
   - ✅ Welcome message with user's name
   - ✅ Stats cards (visits, views, products, orders)
   - ✅ "Create Storefront" banner (if no storefront exists)

3. **Check User Avatar**
   - ✅ Avatar shows user's initials
   - ✅ Clicking avatar shows dropdown:
     - "Profile Settings"
     - "Logout"

---

## Part 5: Create Storefront (Wizard)

### Test 5.1: Open Wizard

1. **From Dashboard**
   - Click "Create Storefront Now" button (if no storefront exists)
   - Or click "Create Storefront" in Website Editor section

2. **From Homepage**
   - Click "Create Your Storefront" button
   - Wizard modal opens

### Test 5.2: Complete Wizard Steps

**Step 1: Business Information**
- Business Niche: `Fashion & Apparel`
- Company Name: `My Fashion Store`
- Description: `We sell trendy fashion items`

**Step 2: Subdomain**
- Subdomain: `myfashionstore`
- Verify it's available

**Step 3: Generate Design Recommendations (Optional)**
- Click "Generate Design Recommendations"
- Wait for AI analysis
- Review suggested theme

**Step 4: Theme Selection**
- Primary Color: Choose blue or use AI suggestion
- Font Family: `Inter`
- Design Feel: `Modern`

**Step 5: Logo (Optional)**
- Upload a logo image (optional)
- Or skip this step

**Step 6: Review & Generate**
- Review all information
- Click "Create Storefront"

### Test 5.3: Storefront Generation

**Expected Flow:**
1. ✅ Loading state: "Generating your storefront pages..."
2. ✅ AI generates 8 pages (homepage, products, cart, etc.)
3. ✅ Pages saved to Firebase
4. ✅ Success notification: "Storefront created successfully!"
5. ✅ Redirect to dashboard

**Check Points:**
- ✅ No errors during generation
- ✅ All 8 pages are generated
- ✅ Pages saved to Firebase successfully
- ✅ Storefront appears in dashboard

**Common Issues:**
- ❌ **AI API error**: Check `ANTHROPIC_API_KEY` in `.env.local`
- ❌ **Firebase error**: Check Firebase permissions and config
- ❌ **Timeout**: Generation may take 1-2 minutes

---

## Part 6: View Generated Pages

1. **From Dashboard**
   - Navigate to "Pages Management" section
   - You should see 8 pages listed:
     - Homepage
     - Categories
     - Products
     - Product Detail
     - Cart
     - Checkout
     - Account
     - Search

2. **Click on a Page**
   - Click "Edit" button on any page
   - Should open GrapesJS editor

---

## Part 7: Edit Pages (GrapesJS)

1. **Open Editor**
   - Click "Edit Website" from dashboard
   - Or navigate to: `http://localhost:3000/editor?page=homepage`

2. **Verify Editor Loads**
   - ✅ GrapesJS editor interface appears
   - ✅ Page HTML is loaded
   - ✅ Left panel shows page list
   - ✅ Right panel shows components/blocks

3. **Test Editing**
   - Drag and drop components
   - Edit text content
   - Change styles
   - Click "Save" button

4. **Expected Result**
   - ✅ Changes saved to Firebase
   - ✅ Success notification
   - ✅ Changes persist on reload

---

## Part 8: Test Subdomain Access

### Test 8.1: Local Testing

1. **Edit Hosts File** (for local testing)
   - Mac/Linux: `/etc/hosts`
   - Windows: `C:\Windows\System32\drivers\etc\hosts`
   - Add: `127.0.0.1 myfashionstore.localhost`

2. **Access Subdomain**
   - Go to: `http://myfashionstore.localhost:3000`
   - Should load the storefront homepage

3. **Expected Result**
   - ✅ Storefront loads correctly
   - ✅ Navigation works
   - ✅ Pages are accessible
   - ✅ Dynamic data loads (if configured)

### Test 8.2: Production Testing

1. **Configure DNS** (if using Cloudflare)
   - Ensure wildcard DNS is set up
   - See [Subdomain Setup Guide](./SUBDOMAIN_SETUP_GUIDE.md)

2. **Access Subdomain**
   - Go to: `https://myfashionstore.dfoldlab.co.uk`
   - Should load the storefront

---

## Part 9: Test Plan Limits

### Test 9.1: Storefront Limit

1. **Try Creating Second Storefront**
   - Complete wizard again
   - Try to create another storefront

2. **Expected Result**
   - ❌ Error notification: "You have reached your plan limit of 1 storefront. Please upgrade your plan to create more storefronts."
   - ❌ Storefront creation is blocked

### Test 9.2: Page Limit

1. **Create Custom Page**
   - Go to dashboard
   - Try to create a 9th page (testimonial, about, etc.)

2. **Expected Result** (if at limit)
   - ❌ Error: "You have reached your plan limit of 8 pages per storefront."
   - ❌ Page creation is blocked

---

## Part 10: Test Dynamic Pages

### Test 10.1: Create Testimonials Page

1. **Create Page Setting**
   ```bash
   POST /api/storefront/myfashionstore/pages
   {
     "pageType": "testimonial",
     "route": "/testimonials",
     "contentType": "dynamic",
     "dataSource": {
       "type": "firebase",
       "collection": "testimonials_myfashionstore"
     },
     "settings": {
       "enabled": true,
       "showInMenu": true
     },
     "userId": "your_user_id"
   }
   ```

2. **Add Testimonials to Firebase**
   - Create collection: `testimonials_myfashionstore`
   - Add testimonial documents

3. **Access Page**
   - Go to: `http://myfashionstore.localhost:3000/testimonials`
   - Should load testimonials page with data

---

## Troubleshooting

### Google Sign In/Sign Up Issues

**Problem: Popup doesn't appear**
- ✅ Check browser popup blocker settings
- ✅ Verify Firebase config in `.env.local`
- ✅ Check browser console for errors

**Problem: "redirect_uri_mismatch" error**
- ✅ Add your domain to Firebase authorized domains
- ✅ Check Firebase project settings
- ✅ Verify `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` in `.env.local`

**Problem: Authentication succeeds but API fails**
- ✅ Check backend API is running
- ✅ Verify API accepts Firebase ID tokens
- ✅ Check network tab for API errors

### Storefront Generation Issues

**Problem: AI generation fails**
- ✅ Check `ANTHROPIC_API_KEY` is set
- ✅ Verify API key is valid
- ✅ Check API quota/credits

**Problem: Pages not saving to Firebase**
- ✅ Check Firebase permissions
- ✅ Verify Firestore security rules
- ✅ Check browser console for errors

### Subdomain Issues

**Problem: Subdomain not routing**
- ✅ Check middleware is working
- ✅ Verify `NEXT_PUBLIC_MAIN_DOMAIN` in `.env.local`
- ✅ Check DNS configuration

---

## Test Checklist

### Authentication
- [ ] Email/Password sign up works
- [ ] Google sign up works
- [ ] Email verification works
- [ ] Email/Password login works
- [ ] Google login works
- [ ] Logout works

### Storefront Creation
- [ ] Wizard opens correctly
- [ ] All wizard steps work
- [ ] AI design recommendations generate
- [ ] Storefront creation succeeds
- [ ] All 8 pages are generated
- [ ] Pages saved to Firebase

### Dashboard
- [ ] Dashboard loads after login
- [ ] User avatar shows correctly
- [ ] Storefront data displays
- [ ] Pages list shows correctly

### Editor
- [ ] GrapesJS editor loads
- [ ] Pages can be edited
- [ ] Changes save successfully
- [ ] Page switching works

### Limits
- [ ] Storefront limit enforced (1 max)
- [ ] Page limit enforced (8 max)
- [ ] Error messages show correctly

### Subdomain
- [ ] Subdomain routing works
- [ ] Pages load correctly
- [ ] Dynamic data loads

---

## Quick Test Commands

```bash
# Start dev server
npm run dev

# Check environment variables
cat .env.local

# Test API endpoints
curl http://localhost:3000/api/user/limits?userId=test123

# Check Firebase connection
# (Check browser console when loading dashboard)
```

---

## Next Steps After Testing

1. **Report Issues**: Document any bugs or issues found
2. **Verify Data**: Check Firebase collections have correct data
3. **Test Edge Cases**: Test with invalid inputs, network errors, etc.
4. **Performance**: Check page load times, generation speed
5. **Security**: Verify authentication tokens are handled securely

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check network tab for failed requests
3. Review relevant documentation in `docs/` folder
4. Verify all environment variables are set correctly
