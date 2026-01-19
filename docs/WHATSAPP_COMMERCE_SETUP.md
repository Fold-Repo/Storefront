# WhatsApp Commerce Dashboard - Frontend Setup Guide

This guide explains how to set up and use the WhatsApp Commerce dashboard in the Next.js storefront/admin app.

## Overview

The WhatsApp Commerce feature allows merchants to:
- Connect WhatsApp Business API numbers
- Manage customer conversations and sessions
- Configure multi-store routing and delivery options
- Manage marketing subscribers
- Create and run marketing campaigns

## Architecture

### Frontend Structure

```
app/dashboard/whatsapp/
├── page.tsx                    # Overview dashboard
├── connect/
│   └── page.tsx                # Connect WhatsApp number
├── settings/
│   └── page.tsx                # Configure settings
├── marketing/
│   └── page.tsx                # Manage subscribers
├── campaigns/
│   └── page.tsx                # Create/manage campaigns
└── conversations/
    └── page.tsx                # View customer sessions
```

### API Layer

- **Service**: `services/whatsapp.ts` - Typed API client for all WhatsApp endpoints
- **Hooks**: `hooks/useWhatsApp.ts` - React hooks for data fetching and mutations
- **Endpoints**: Defined in `constants/api.ts` under `ENDPOINT.WHATSAPP`

### Authentication

The frontend uses the existing `apiClient` from `lib/apiClient.ts`, which automatically:
- Adds Bearer token from cookies/localStorage
- Handles token refresh on 401 errors
- Redirects to sign-in when authentication fails

## Setup

### 1. Environment Variables

Ensure your backend API URL is configured:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api/v1
```

### 2. Backend Requirements

The frontend expects the following backend endpoints:

#### WhatsApp Numbers
- `POST /api/v1/whatsapp/business/:business_id/numbers/connect` - Connect a number
- `GET /api/v1/whatsapp/business/:business_id/numbers` - List connected numbers

#### Settings
- `GET /api/v1/whatsapp/business/:business_id/settings` - Get settings
- `PUT /api/v1/whatsapp/business/:business_id/settings` - Update settings

#### Sessions
- `GET /api/v1/whatsapp/business/:business_id/sessions` - List sessions
- `GET /api/v1/whatsapp/business/:business_id/sessions/:session_id` - Get session details

#### Marketing
- `GET /api/v1/whatsapp/marketing/business/:business_id/subscribers` - List subscribers
- `POST /api/v1/whatsapp/marketing/business/:business_id/subscribers` - Add subscriber
- `PATCH /api/v1/whatsapp/marketing/business/:business_id/subscribers/:phone` - Update subscriber status

#### Campaigns
- `GET /api/v1/whatsapp/marketing/business/:business_id/campaigns` - List campaigns
- `POST /api/v1/whatsapp/marketing/business/:business_id/campaigns` - Create campaign
- `GET /api/v1/whatsapp/marketing/business/:business_id/campaigns/:campaign_id` - Get campaign
- `POST /api/v1/whatsapp/marketing/business/:business_id/campaigns/:campaign_id/run` - Run campaign

### 3. User Requirements

Users must have:
- A valid `business_id` in their user profile
- Authenticated session (token in cookies/localStorage)

## Usage

### Connecting a WhatsApp Number

1. Navigate to **Dashboard > WhatsApp > Connect Number**
2. Fill in the form with:
   - **Phone Number ID**: From Meta Business Manager
   - **WABA ID**: WhatsApp Business Account ID
   - **Display Phone Number**: Customer-facing number (with country code)
   - **Verify Token**: Webhook verification token
3. Click **Connect Number**

### Configuring Settings

1. Navigate to **Dashboard > WhatsApp > Settings**
2. Toggle features:
   - **Multi-Store Routing**: Enable automatic store routing
   - **Default Store ID**: Store to use when routing fails
   - **Pickup Allowed**: Allow pickup orders
   - **Delivery Allowed**: Allow delivery orders
   - **Payment Link Required**: Require payment before delivery
3. Click **Save Settings**

### Managing Subscribers

1. Navigate to **Dashboard > WhatsApp > Marketing**
2. View subscriber list with search/filter
3. **Add Subscriber**: Click "Add Subscriber" button
4. **Opt In/Out**: Click the status button next to any subscriber

### Creating Campaigns

1. Navigate to **Dashboard > WhatsApp > Campaigns**
2. Click **Create Campaign**
3. Fill in:
   - **Campaign Name**: Internal name
   - **Message Template**: Message text (use `{name}` for personalization)
   - **Offer Link** (optional): URL to include
   - **Schedule Time** (optional): When to send
4. Click **Create Campaign**
5. Click **Run Now** to send immediately (or wait for scheduled time)

### Viewing Conversations

1. Navigate to **Dashboard > WhatsApp > Conversations**
2. Browse active sessions in the left panel
3. Click a session to view details:
   - Customer phone
   - Current step in flow
   - Store assignment
   - Payment status
   - Cart items
   - Sale ID and receipt link

## React Hooks

### useWhatsAppNumbers

```typescript
const { numbers, loading, error, refetch, connectNumber } = useWhatsAppNumbers(businessId);
```

### useWhatsAppSettings

```typescript
const { settings, loading, error, refetch, updateSettings } = useWhatsAppSettings(businessId);
```

### useWhatsAppSessions

```typescript
const { sessions, loading, error, refetch, getSession } = useWhatsAppSessions(businessId);
```

### useMarketingSubscribers

```typescript
const { subscribers, loading, error, refetch, createSubscriber, updateSubscriberStatus } = useMarketingSubscribers(businessId);
```

### useCampaigns

```typescript
const { campaigns, loading, error, refetch, createCampaign, runCampaign } = useCampaigns(businessId);
```

## Error Handling

All hooks include built-in error handling:
- Errors are automatically shown via toast notifications
- Loading states are managed automatically
- Failed requests can be retried using `refetch()`

## Security

- **No secrets in browser**: All API tokens remain server-side
- **Authentication**: All requests include Bearer token via `apiClient`
- **Authorization**: Backend should validate `business_id` ownership

## Troubleshooting

### "Business ID is required" error
- Ensure user has a `business_id` in their profile
- Check that user is properly authenticated

### API errors (401, 403)
- Check that user token is valid
- Verify user has access to the business
- Check backend logs for authorization issues

### No data loading
- Verify backend endpoints are implemented
- Check browser network tab for API errors
- Ensure `NEXT_PUBLIC_API_URL` is correct

## Next Steps

1. **Backend Integration**: Ensure all API endpoints are implemented in your backend
2. **Webhook Setup**: Configure WhatsApp webhooks to receive messages
3. **Testing**: Test the full flow from number connection to campaign execution
4. **Monitoring**: Add logging and monitoring for production use

## Related Documentation

- Backend API documentation (see backend repo)
- WhatsApp Business API documentation: https://developers.facebook.com/docs/whatsapp
- Meta Business Manager: https://business.facebook.com
