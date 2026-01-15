# Firestore Security Rules

 ## Current Collections Used

The application uses the following Firestore collections:

1. **storefront_sites** - Stores generated storefront data
2. **storefront_wizards** - Stores wizard form data (temporary)
3. **user_plans** - Stores user plan assignments and usage tracking
4. **page_settings** - Stores page configuration and settings
5. **subscription_plans** - Stores default plan definitions

## Recommended Security Rules

### Development Rules (Permissive - for testing)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Storefront data
    match /storefront_sites/{document=**} {
      allow read, write: if true;
    }
    
    // Wizard form data
    match /storefront_wizards/{document=**} {
      allow read, write: if true;
    }
    
    // User plans and limits
    match /user_plans/{document=**} {
      allow read, write: if true;
    }
    
    // Page settings
    match /page_settings/{document=**} {
      allow read, write: if true;
    }
    
    // Subscription plans (default plans)
    match /subscription_plans/{document=**} {
      allow read: if true;
      allow write: if false; // Only server/admin can write
    }
  }
}
```

### Production Rules (Secure - recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Storefront sites - users can only access their own storefronts
    match /storefront_sites/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Wizard form data - users can only access their own wizard data
    match /storefront_wizards/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // User plans - users can only access their own plan
    match /user_plans/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Page settings - users can only access settings for their own storefronts
    match /page_settings/{documentId} {
      allow read, write: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Subscription plans - read-only for all authenticated users
    match /subscription_plans/{planId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only server/admin can write
    }
  }
}
```

## Current Issue

Your current rules only cover:
- ✅ `storefront_wizards`
- ✅ `storefront_sites`
- ❌ `user_plans` - **MISSING**
- ❌ `page_settings` - **MISSING**
- ❌ `subscription_plans` - **MISSING**

## Quick Fix

Add these rules to your existing rules file:

```javascript
match /user_plans/{document=**} {
  allow read, write: if true;
}
match /page_settings/{document=**} {
  allow read, write: if true;
}
match /subscription_plans/{document=**} {
  allow read: if true;
  allow write: if false;
}
```

## How to Update Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Paste the updated rules
5. Click **Publish**

## Testing Rules

After updating rules, test by:
1. Opening the editor
2. Creating a storefront
3. Checking browser console for permission errors

If you still see permission errors, check:
- User authentication status
- Document structure matches rules
- Collection names match exactly
