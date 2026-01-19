# WhatsApp Marketing - User Testing Guide

## Welcome!

This guide will help you test the WhatsApp Marketing feature step-by-step. Follow along to ensure everything works correctly.

## Getting Started

### What You'll Need
- Access to the dashboard
- A valid business account
- (Optional) WhatsApp Business API credentials for full testing

### Where to Find It
Navigate to **Dashboard → WhatsApp** in the sidebar menu, or go directly to `/dashboard/whatsapp`.

---

## Step 1: Connect Your WhatsApp Number

### Purpose
Connect your WhatsApp Business API number to enable WhatsApp Commerce.

### How to Test

1. **Go to WhatsApp Overview**
   - Click "WhatsApp" in the sidebar
   - You'll see the overview dashboard

2. **Click "Connect Number"**
   - Click the blue "Connect Number" button
   - You'll be taken to the connection page

3. **Fill in the Form**
   - **Phone Number ID**: Enter your Phone Number ID from Meta Business Manager
   - **WABA ID**: Enter your WhatsApp Business Account ID
   - **Display Phone Number**: Enter the phone number customers will see (include country code, e.g., +1234567890)
   - **Verify Token**: Enter your webhook verification token

4. **Submit**
   - Click "Connect Number"
   - Wait for the success message
   - You'll be redirected back to the overview

### What to Check
- ✅ Form validates required fields
- ✅ Success message appears
- ✅ Connected number shows on overview page
- ✅ Status indicator shows "Connected"

### Troubleshooting
- **"Business ID is required"**: Make sure you're logged in with a business account
- **Connection fails**: Verify your credentials are correct
- **No success message**: Check browser console for errors

---

## Step 2: Configure Settings

### Purpose
Set up how WhatsApp Commerce behaves for your business.

### How to Test

1. **Go to Settings**
   - From WhatsApp overview, click "Settings" button
   - Or navigate to `/dashboard/whatsapp/settings`

2. **Configure Options**
   - **Multi-Store Routing**: Toggle ON if you have multiple stores
   - **Default Store ID**: Enter store ID (only if multi-store routing is enabled)
   - **Allow Pickup Orders**: Toggle ON/OFF
   - **Allow Delivery Orders**: Toggle ON/OFF
   - **Payment Link Required**: Toggle ON if you want payment before delivery

3. **Save**
   - Click "Save Settings"
   - Wait for success message

### What to Check
- ✅ Toggles work smoothly
- ✅ Default Store ID field appears when multi-store routing is enabled
- ✅ Settings save successfully
- ✅ Settings persist after page refresh

### Troubleshooting
- **Settings won't save**: Check if you have a connected number first
- **Invalid Store ID**: Make sure the store ID exists in your system

---

## Step 3: Add Marketing Subscribers

### Purpose
Build your subscriber list for marketing campaigns.

### How to Test

1. **Go to Marketing**
   - From WhatsApp overview, click "Create Campaign" or go to Marketing
   - Or navigate to `/dashboard/whatsapp/marketing`

2. **View Statistics**
   - Check the stats cards at the top:
     - Total Subscribers
     - Opted In
     - Opted Out

3. **Add a Subscriber**
   - Click "Add Subscriber" button
   - Fill in:
     - **Phone**: Enter phone number with country code (e.g., +1234567890)
     - **Name**: Enter name (optional)
   - Click "Add Subscriber"

4. **Search Subscribers**
   - Use the search box to find subscribers
   - Try searching by phone or name

5. **Change Status**
   - Find a subscriber
   - Click "Opt Out" or "Opt In" button
   - Status should change immediately

### What to Check
- ✅ Subscriber appears in list after adding
- ✅ Statistics update correctly
- ✅ Search works for phone and name
- ✅ Status changes work
- ✅ Success messages appear

### Troubleshooting
- **Subscriber not appearing**: Refresh the page
- **Search not working**: Clear search and try again
- **Status won't change**: Check browser console for errors

---

## Step 4: Create a Marketing Campaign

### Purpose
Create and send marketing messages to your subscribers.

### How to Test

1. **Go to Campaigns**
   - From WhatsApp overview, click "Create Campaign"
   - Or navigate to `/dashboard/whatsapp/campaigns`

2. **Create a Campaign**
   - Click "Create Campaign" button
   - Fill in the form:
     - **Campaign Name**: Give it a name (e.g., "Summer Sale 2024")
     - **Message Template**: Write your message
       - Tip: Use `{name}` to personalize (e.g., "Hi {name}! Check out our sale!")
     - **Offer Link**: (Optional) Add a link to your store or offer
     - **Schedule Time**: (Optional) Set a future date/time, or leave empty to run immediately
   - Click "Create Campaign"

3. **View Campaign**
   - Campaign appears in the list
   - Status shows as "draft"

4. **Run Campaign**
   - Find your campaign
   - Click "Run Now" button
   - Wait for execution

5. **Check Results**
   - After running, view the results:
     - Sent: How many messages were sent
     - Delivered: How many were delivered
     - Failed: How many failed
     - Opt Out: How many opted out

### What to Check
- ✅ Campaign creates successfully
- ✅ Campaign appears in list
- ✅ Status updates correctly
- ✅ Results show after running
- ✅ Schedule time displays (if set)

### Troubleshooting
- **Campaign won't create**: Check all required fields are filled
- **Campaign won't run**: Make sure you have subscribers
- **No results**: Check if backend processed the campaign

---

## Step 5: View Customer Conversations

### Purpose
Monitor and manage customer conversations and orders.

### How to Test

1. **Go to Conversations**
   - From WhatsApp overview, click "View Conversations"
   - Or navigate to `/dashboard/whatsapp/conversations`

2. **Browse Sessions**
   - See list of active conversations on the left
   - Each shows:
     - Customer phone number
     - Store name
     - Current step
     - Last updated time
     - Payment status

3. **Search Conversations**
   - Use search box to find specific conversations
   - Search by phone, store, or step

4. **View Details**
   - Click on a conversation
   - View details panel on the right:
     - Customer information
     - Current step in flow
     - Store assignment
     - Payment status
     - Cart items (if any)
     - Sale ID and receipt link (if available)

### What to Check
- ✅ Conversations list loads
- ✅ Search works correctly
- ✅ Details panel shows all information
- ✅ Cart items display correctly
- ✅ Links work (receipt, store link)

### Troubleshooting
- **No conversations**: Make sure you have active sessions
- **Details not loading**: Click the conversation again
- **Search not working**: Clear and try different terms

---

## Step 6: Complete Flow Test

### Purpose
Test the complete flow from campaign to conversation.

### How to Test

1. **Setup**
   - Connect a WhatsApp number (Step 1)
   - Add subscribers (Step 3)
   - Configure settings (Step 2)

2. **Create and Run Campaign**
   - Create a campaign (Step 4)
   - Run the campaign

3. **Check Conversations**
   - Go to Conversations (Step 5)
   - Look for new sessions from campaign
   - View session details

4. **Verify Flow**
   - Check that subscribers received messages
   - Verify conversations are tracked
   - Confirm order flow works (if applicable)

### What to Check
- ✅ End-to-end flow works
- ✅ Data flows correctly between features
- ✅ No errors in the process

---

## Quick Reference

### Navigation Paths
- **Overview**: `/dashboard/whatsapp`
- **Connect**: `/dashboard/whatsapp/connect`
- **Settings**: `/dashboard/whatsapp/settings`
- **Marketing**: `/dashboard/whatsapp/marketing`
- **Campaigns**: `/dashboard/whatsapp/campaigns`
- **Conversations**: `/dashboard/whatsapp/conversations`

### Keyboard Shortcuts
- `Esc`: Close modals
- `Enter`: Submit forms (when focused)
- `Tab`: Navigate between fields

### Status Indicators

**Connection Status:**
- 🟢 Green checkmark = Connected
- ⚪ Gray circle = Not Connected

**Campaign Status:**
- Draft = Ready to run
- Scheduled = Will run at set time
- Running = Currently executing
- Completed = Finished
- Failed = Error occurred

**Payment Status:**
- 🟢 Completed = Payment successful
- 🟡 Pending = Awaiting payment
- 🔴 Failed = Payment failed

---

## Common Questions

### Q: Do I need WhatsApp Business API to test?
**A:** For full testing, yes. But you can test the UI without it - just note that API calls will fail.

### Q: How do I get WhatsApp Business API credentials?
**A:** 
1. Create a Meta Business account
2. Set up WhatsApp Business Account (WABA)
3. Get credentials from Meta Business Manager

### Q: Can I test without real subscribers?
**A:** Yes! You can add test subscribers and create campaigns. The campaigns just won't send real messages without API setup.

### Q: What if something doesn't work?
**A:** 
1. Check browser console for errors (F12)
2. Check network tab for failed requests
3. Try refreshing the page
4. Clear browser cache
5. Contact support with details

### Q: How do I know if my campaign worked?
**A:** Check the campaign results section - it shows sent, delivered, failed, and opt-out counts.

---

## Testing Checklist

Use this checklist to ensure you've tested everything:

### Setup
- [ ] Connected WhatsApp number
- [ ] Configured settings
- [ ] Added at least 3 test subscribers

### Campaigns
- [ ] Created a campaign
- [ ] Created a scheduled campaign
- [ ] Ran a campaign
- [ ] Viewed campaign results

### Conversations
- [ ] Viewed conversations list
- [ ] Searched conversations
- [ ] Viewed session details
- [ ] Checked cart items

### Settings
- [ ] Updated all settings
- [ ] Verified settings persist

### Overall
- [ ] Tested on mobile device
- [ ] Tested on desktop
- [ ] No errors in console
- [ ] All features work as expected

---

## Feedback

After testing, please provide feedback on:
1. **Ease of Use**: Was it easy to understand and use?
2. **Features**: Are all features working correctly?
3. **Issues**: Any bugs or problems encountered?
4. **Suggestions**: What could be improved?

Thank you for testing! Your feedback helps us improve the feature.
