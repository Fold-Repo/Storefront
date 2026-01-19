# Firestore Security Rules

 ## Current Collections Used

The application uses the following Firestore collections:

1. **user_storefronts** - Stores generated storefront data (multi-site support, uses subdomain as document ID)
2. **storefront_sites** - Legacy collection for backward compatibility (stores first storefront by userId)
3. **storefront_wizards** - Stores wizard form data (temporary)
4. **user_plans** - Stores user plan assignments and usage tracking
5. **page_settings** - Stores page configuration and settings
6. **subscription_plans** - Stores default plan definitions

## Recommended Security Rules

### Development Rules (Permissive - for testing)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Multi-site storefront data (NEW - uses subdomain as document ID)
    match /user_storefronts/{document=**} {
      allow read, write: if true;
    }
    
    // Legacy storefront data (backward compatibility)
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
    
    // Multi-site storefront data - users can only access their own storefronts
    match /user_storefronts/{subdomain} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow write: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
    
    // Legacy storefront sites - users can only access their own storefronts
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
- ❌ `user_storefronts` - **MISSING** (This is causing the permission denied error!)
- ✅ `storefront_wizards`
- ✅ `storefront_sites`
- ❌ `user_plans` - **MISSING**
- ❌ `page_settings` - **MISSING**
- ❌ `subscription_plans` - **MISSING**

## Quick Fix

**IMPORTANT**: The `user_storefronts` collection is missing from your rules. This is causing the permission denied error you're seeing.

Add these rules to your existing rules file:

```javascript
// Add this FIRST - it's the new collection being used
match /user_storefronts/{document=**} {
  allow read, write: if true;
}

// Add these as well
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
