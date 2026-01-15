# Plan Limits Setup Guide

## Overview

The plan limits system controls:
- **Number of storefronts** a user can create (currently 1 for all plans)
- **Number of pages** per storefront (varies by plan)

## Default Plans

All users start with the **Free** plan which includes:
- **1 storefront** maximum
- **8 pages** per storefront (standard pages: homepage, products, cart, etc.)

## How It Works

### 1. Plan Storage in Firebase

Plans are stored in two collections:

**`subscription_plans`** - Plan definitions:
```typescript
{
  planId: 'free',
  planName: 'Free',
  maxStorefronts: 1,
  maxPagesPerStorefront: 8,
  features: ['basic_support']
}
```

**`user_plans`** - User's current plan and usage:
```typescript
{
  userId: 'user123',
  planId: 'free',
  planName: 'Free',
  limits: {
    maxStorefronts: 1,
    maxPagesPerStorefront: 8
  },
  currentUsage: {
    storefronts: 0,
    pages: {
      'mystore': 8  // storefrontId -> page count
    }
  }
}
```

### 2. Validation Flow

**Storefront Creation:**
1. User completes wizard
2. System checks `canCreateStorefront(userId)`
3. If limit exceeded → Show error notification
4. If allowed → Create storefront and increment count

**Page Creation:**
1. User creates new page
2. System checks `canCreatePage(userId, storefrontId)`
3. If limit exceeded → Return 403 error with message
4. If allowed → Create page and increment count

### 3. Automatic Plan Assignment

When a user first creates a storefront:
- System automatically assigns **Free** plan
- Initializes usage tracking
- Sets limits based on plan

## API Endpoints

### Check User Limits
```
GET /api/user/limits?userId=user123&storefrontId=mystore
```

Response:
```json
{
  "plan": {
    "planId": "free",
    "planName": "Free",
    "limits": {
      "maxStorefronts": 1,
      "maxPagesPerStorefront": 8
    }
  },
  "usage": {
    "storefronts": {
      "current": 0,
      "max": 1
    },
    "pages": {
      "mystore": {
        "current": 8,
        "max": 8
      }
    }
  },
  "canCreateStorefront": true,
  "storefrontLimit": {
    "current": 0,
    "max": 1
  },
  "canCreatePage": {
    "allowed": false,
    "current": 8,
    "max": 8,
    "message": "You have reached your plan limit of 8 pages per storefront."
  }
}
```

### Create Page (with limit check)
```
POST /api/storefront/mystore/pages
{
  "pageType": "testimonial",
  "route": "/testimonials",
  "userId": "user123",
  ...
}
```

If limit exceeded:
```json
{
  "error": "Page limit exceeded",
  "message": "You have reached your plan limit of 8 pages per storefront.",
  "limit": {
    "current": 8,
    "max": 8
  }
}
```

## Initialization

### Initialize Default Plans

Run this once to set up default plans in Firebase:

```typescript
import { initializeDefaultPlans } from '@/services/planLimits';

// Call this on app startup or manually
await initializeDefaultPlans();
```

Or create an API route:

```typescript
// app/api/admin/init-plans/route.ts
import { initializeDefaultPlans } from '@/services/planLimits';

export async function POST() {
  await initializeDefaultPlans();
  return Response.json({ success: true });
}
```

## Current Limits

| Plan | Max Storefronts | Max Pages/Storefront |
|------|----------------|---------------------|
| Free | 1 | 8 |
| Starter | 1 | 15 |
| Professional | 3 | 50 |
| Enterprise | 10 | 100 |

**Note:** Currently all users get **Free** plan by default (1 storefront, 8 pages).

## Updating Limits

### Change Plan Limits

Edit `services/planLimits.ts`:

```typescript
export const DEFAULT_PLANS: PlanLimits[] = [
  {
    planId: 'free',
    planName: 'Free',
    maxStorefronts: 1,  // Change this
    maxPagesPerStorefront: 8,  // Change this
    // ...
  },
];
```

Then re-initialize plans (existing users keep their current plan).

### Upgrade User Plan

```typescript
import { updateUserPlan } from '@/services/planLimits';

await updateUserPlan('user123', 'professional');
```

## Usage Tracking

### When Storefront is Created
- `incrementStorefrontCount(userId)` is called
- Usage count increases

### When Page is Created
- `incrementPageCount(userId, storefrontId)` is called
- Page count for that storefront increases

### When Storefront/Page is Deleted
- `decrementStorefrontCount(userId)` or `decrementPageCount(userId, storefrontId)` is called
- Usage count decreases

## Notifications

### Storefront Limit Exceeded
Shown in wizard completion handler:
```
"You have reached your plan limit of 1 storefront. Please upgrade your plan to create more storefronts."
```

### Page Limit Exceeded
Shown when creating page:
```
"You have reached your plan limit of 8 pages per storefront. Please upgrade your plan to create more pages."
```

## Testing

### Test Storefront Limit
1. Create one storefront (should succeed)
2. Try to create another (should fail with notification)

### Test Page Limit
1. Create 8 pages (should succeed)
2. Try to create 9th page (should fail with error)

## Future Enhancements

- [ ] Plan upgrade UI in dashboard
- [ ] Usage display in dashboard
- [ ] Billing integration
- [ ] Plan expiration handling
- [ ] Trial periods
- [ ] Usage analytics
