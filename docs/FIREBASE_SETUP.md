# Firebase Setup Instructions

## Getting Your Complete Firebase API Key

The API key in the code was incomplete. Follow these steps to get your complete Firebase configuration:

### Step 1: Go to Firebase Console
1. Visit https://console.firebase.google.com/
2. Select your project: **storefront-64d56**

### Step 2: Get Your Web App Configuration
1. Click on the gear icon (⚙️) next to "Project Overview"
2. Select **Project Settings**
3. Scroll down to **Your apps** section
4. Find your **Web app** (or create one if it doesn't exist)
5. Click on the **</>** icon to view the configuration

### Step 3: Copy the Complete API Key
The API key should be much longer than what was in the code. It typically looks like:
```
AIzaSyDp_EH2NNsSWJ... (39 characters total)
```

### Step 4: Create .env.local File
Create a `.env.local` file in the root of your project with the following:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_complete_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=storefront-64d56.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=storefront-64d56
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=storefront-64d56.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=695330621735
NEXT_PUBLIC_FIREBASE_APP_ID=1:695330621735:web:6dbc73154a74c7ae1c8102
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-Z851FP9YGC

# API Configuration
NEXT_PUBLIC_API_URL=your_api_url_here
```

### Step 5: Enable Google Authentication (Detailed Steps)

#### 5.1: Navigate to Authentication
1. In the Firebase Console (https://console.firebase.google.com/), make sure you're in your **storefront-64d56** project
2. Look at the left sidebar menu
3. Click on **Authentication** (it has a key icon 🔑)
4. If you see a **Get Started** button, click it to initialize Authentication for your project

#### 5.2: Access Sign-in Methods
1. Once in the Authentication section, you'll see several tabs at the top:
   - **Users** tab (shows registered users)
   - **Sign-in method** tab (where you configure providers)
   - **Templates** tab (for email templates)
   - **Settings** tab (general settings)
2. Click on the **Sign-in method** tab

#### 5.3: Enable Google Provider
1. In the Sign-in method page, you'll see a list of sign-in providers:
   - Email/Password
   - Phone
   - Google
   - Facebook
   - Twitter
   - GitHub
   - etc.
2. Find **Google** in the list (it should be near the top)
3. Click on the **Google** row/button
4. A popup/modal will appear with Google sign-in configuration

#### 5.4: Configure Google Sign-in
1. In the Google configuration modal, you'll see:
   - **Enable** toggle at the top - **Turn this ON** (toggle it to the right/enabled position)
   - **Project support email** - This should auto-populate with your Firebase project email
   - **Project public-facing name** - This can be your project name (e.g., "Storefront")
2. **Enable the toggle** to turn on Google sign-in
3. The **Project support email** should already be set (usually your Firebase account email)
4. You can optionally set a **Project public-facing name** (this is what users see when signing in with Google)
5. Click **Save** at the bottom of the modal

#### 5.5: Verify Google is Enabled
1. After saving, you should be back at the Sign-in method page
2. The **Google** provider should now show as **Enabled** (you'll see a green checkmark or "Enabled" status)
3. The status should change from "Disabled" to "Enabled"

#### 5.6: Configure Authorized Domains (Optional but Recommended)
1. Still in the **Sign-in method** tab, scroll down to find **Authorized domains** section
2. You should see domains like:
   - `localhost` (for local development)
   - `your-project.firebaseapp.com`
   - `your-project.web.app`
3. If you're deploying to a custom domain, click **Add domain** and add:
   - Your production domain (e.g., `yourdomain.com`)
   - Your staging domain if applicable
4. Click **Done** after adding domains

#### 5.7: Test Configuration
1. Your Google Authentication is now enabled!
2. You can test it by:
   - Running your app locally (`npm run dev`)
   - Clicking the "Sign up with Google" or "Sign in with Google" button
   - You should see a Google sign-in popup

#### Troubleshooting Google Authentication:
- **If Google provider doesn't appear**: Make sure you're in the correct Firebase project
- **If you get "redirect_uri_mismatch" error**: Check that your authorized domains include your current domain
- **If sign-in popup doesn't appear**: Check browser console for errors, ensure popups aren't blocked
- **If you see "API key not valid"**: Make sure you've set the complete API key in `.env.local` (see Step 4)

### Step 6: Restart Your Dev Server
After creating `.env.local`, restart your Next.js dev server:
```bash
npm run dev
# or
yarn dev
```

## Troubleshooting

If you still get API key errors:
- Make sure the API key is complete (39 characters)
- Verify the key is copied correctly (no extra spaces)
- Check that `.env.local` is in the project root
- Restart the dev server after creating/updating `.env.local`
- Verify the API key restrictions in Google Cloud Console allow your domain
