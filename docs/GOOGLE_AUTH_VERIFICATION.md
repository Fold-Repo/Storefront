# Google Authentication Verification Guide

This guide helps you verify that Google Sign In and Sign Up are working correctly.

## Quick Verification Checklist

### ✅ Pre-Flight Checks

Before testing, verify:

1. **Firebase Configuration**
   ```bash
   # Check .env.local has:
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=storefront-64d56.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=storefront-64d56
   ```

2. **Firebase Console Settings**
   - Go to: https://console.firebase.google.com/
   - Select project: `storefront-64d56`
   - Go to: Authentication → Sign-in method
   - Verify Google provider is **Enabled**
   - Check authorized domains include:
     - `localhost`
     - Your production domain (if deployed)

3. **Backend API**
   - Verify backend is running: `https://shorp-epos-backend.onrender.com/api/v1`
   - Check endpoints exist:
     - `POST /auth/google/signin`
     - `POST /auth/google/signup`

---

## Testing Google Sign Up

### Step 1: Open Sign Up Page

1. Navigate to: `http://localhost:3000/signup`
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Go to **Network** tab

### Step 2: Click "Sign Up with Google"

1. Click the "Sign Up with Google" button
2. **Expected**: Google popup window appears

### Step 3: Verify Popup

**If popup doesn't appear:**
- ❌ Check browser popup blocker
- ❌ Check console for errors
- ❌ Verify Firebase config

**If popup appears:**
- ✅ Select your Google account
- ✅ Grant permissions if prompted
- ✅ Popup should close automatically

### Step 4: Check Console Logs

After Google authentication, check console:

**Expected logs:**
```
✅ No Firebase errors
✅ "Google authentication successful" (if implemented)
```

**Error logs to watch for:**
```
❌ FirebaseError: auth/unauthorized-domain
   → Add domain to Firebase authorized domains

❌ FirebaseError: auth/popup-blocked
   → Allow popups in browser settings

❌ FirebaseError: auth/popup-closed-by-user
   → User closed popup (not an error)
```

### Step 5: Check Network Requests

In Network tab, look for:

1. **Firebase Auth Request**
   - URL: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp`
   - Status: `200 OK`
   - ✅ This means Firebase authentication succeeded

2. **Backend API Request**
   - URL: `https://shorp-epos-backend.onrender.com/api/v1/auth/google/signup`
   - Method: `POST`
   - Request payload: `{ "idToken": "..." }`
   - Status: `200 OK` or `201 Created`
   - ✅ This means backend accepted the token

### Step 6: Verify Form Pre-fill

After Google authentication:
- ✅ Email field should be pre-filled
- ✅ First Name should be pre-filled
- ✅ Last Name should be pre-filled
- ✅ Form should move to Step 2

### Step 7: Complete Sign Up

1. Fill in remaining business information
2. Submit the form
3. **Expected**: Redirect to verification page

---

## Testing Google Login

### Step 1: Open Login Page

1. Navigate to: `http://localhost:3000/signin`
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Go to **Network** tab

### Step 2: Click "Sign in with Google"

1. Click the "Sign in with Google" button
2. **Expected**: Google popup window appears

### Step 3: Verify Authentication

1. Select the same Google account used for signup
2. Popup should close automatically
3. **Expected**: Success notification appears

### Step 4: Check Network Requests

In Network tab, look for:

1. **Firebase Auth Request**
   - URL: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp`
   - Status: `200 OK`
   - ✅ Firebase authentication succeeded

2. **Backend API Request**
   - URL: `https://shorp-epos-backend.onrender.com/api/v1/auth/google/signin`
   - Method: `POST`
   - Request payload: `{ "idToken": "..." }`
   - Response should contain:
     ```json
     {
       "token": "access_token_here",
       "refreshToken": "refresh_token_here",
       "user": { ... }
     }
     ```
   - Status: `200 OK`
   - ✅ Backend authentication succeeded

### Step 5: Verify Storage

Check Application tab → Local Storage:

- ✅ `auth_token` is stored
- ✅ `refresh_token` is stored
- ✅ User data is in AuthContext

### Step 6: Verify Redirect

- ✅ Should redirect to `/dashboard`
- ✅ Dashboard should load with user data
- ✅ User avatar should show

---

## Common Issues & Solutions

### Issue 1: Popup Doesn't Appear

**Symptoms:**
- Clicking "Sign Up/In with Google" does nothing
- No popup window appears

**Solutions:**
1. **Check Popup Blocker**
   - Browser settings → Privacy → Popups
   - Allow popups for `localhost:3000`

2. **Check Console Errors**
   - Open DevTools → Console
   - Look for Firebase errors
   - Common: `auth/unauthorized-domain`

3. **Verify Firebase Config**
   ```bash
   # Check .env.local
   cat .env.local | grep FIREBASE
   ```

### Issue 2: "redirect_uri_mismatch" Error

**Symptoms:**
- Google popup shows error
- Error message: "redirect_uri_mismatch"

**Solutions:**
1. **Add Domain to Firebase**
   - Go to: Firebase Console → Authentication → Settings
   - Scroll to "Authorized domains"
   - Click "Add domain"
   - Add: `localhost`
   - Add your production domain if deployed

2. **Verify Auth Domain**
   - Check `.env.local`: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - Should match Firebase project domain

### Issue 3: Backend API Error

**Symptoms:**
- Google authentication succeeds
- But backend API call fails
- Error in network tab

**Solutions:**
1. **Check Backend Status**
   ```bash
   curl https://shorp-epos-backend.onrender.com/api/v1/auth/google/signin
   ```
   - Should return 405 (Method Not Allowed) or similar
   - Not 503 (Service Unavailable)

2. **Verify Endpoint**
   - Check `constants/api.ts`:
     ```typescript
     GOOGLE_SIGNIN: '/auth/google/signin',
     GOOGLE_SIGNUP: '/auth/google/signup',
     ```

3. **Check Request Format**
   - Network tab → Request payload
   - Should be: `{ "idToken": "firebase_id_token" }`
   - Not: `{ "email": "...", "provider": "google" }`

### Issue 4: User Not Found (Login)

**Symptoms:**
- Google login succeeds
- But backend returns "User not found"

**Solutions:**
1. **User Must Sign Up First**
   - Google login only works if user signed up with Google
   - Try signing up first, then logging in

2. **Check Backend Database**
   - Verify user exists in backend database
   - Check if user was created during signup

### Issue 5: Token Expired

**Symptoms:**
- Google authentication works
- But backend rejects token

**Solutions:**
1. **Tokens Expire After 1 Hour**
   - Try signing in again
   - Firebase will refresh the token automatically

2. **Force Token Refresh**
   ```typescript
   // In code, this is already handled:
   const idToken = await firebaseUser.getIdToken(true); // Force refresh
   ```

---

## Debugging Steps

### Step 1: Check Firebase Connection

```javascript
// In browser console:
import { auth } from '@/lib/firebaseConfig';
console.log('Auth:', auth);
console.log('Current user:', auth.currentUser);
```

### Step 2: Test Firebase Google Auth Directly

```javascript
// In browser console:
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';

const provider = new GoogleAuthProvider();
signInWithPopup(auth, provider)
  .then((result) => {
    console.log('Success:', result.user);
    return result.user.getIdToken();
  })
  .then((token) => {
    console.log('ID Token:', token);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
```

### Step 3: Test Backend API

```bash
# Get ID token from Firebase (use browser console)
# Then test backend:
curl -X POST https://shorp-epos-backend.onrender.com/api/v1/auth/google/signin \
  -H "Content-Type: application/json" \
  -d '{"idToken": "YOUR_FIREBASE_ID_TOKEN"}'
```

---

## Expected Behavior Summary

### Google Sign Up Flow

```
User clicks "Sign Up with Google"
    ↓
Firebase popup appears
    ↓
User selects Google account
    ↓
Firebase returns user + ID token
    ↓
Form pre-fills with Google data
    ↓
User completes remaining steps
    ↓
ID token sent to backend: POST /auth/google/signup
    ↓
Backend creates user account
    ↓
Redirect to verification page
```

### Google Login Flow

```
User clicks "Sign in with Google"
    ↓
Firebase popup appears
    ↓
User selects Google account
    ↓
Firebase returns user + ID token
    ↓
ID token sent to backend: POST /auth/google/signin
    ↓
Backend validates token
    ↓
Backend returns access token + user data
    ↓
User data stored in AuthContext
    ↓
Redirect to dashboard
```

---

## Verification Checklist

### Sign Up
- [ ] Google popup appears
- [ ] No console errors
- [ ] Form pre-fills correctly
- [ ] Backend API call succeeds
- [ ] User redirected to verification

### Login
- [ ] Google popup appears
- [ ] No console errors
- [ ] Backend API call succeeds
- [ ] Tokens stored in localStorage
- [ ] User redirected to dashboard
- [ ] User data available in dashboard

---

## Need Help?

If Google authentication still doesn't work:

1. Check [Firebase Setup Guide](./FIREBASE_SETUP.md)
2. Verify all environment variables
3. Check browser console for detailed errors
4. Verify backend API is accessible
5. Test with a different Google account
