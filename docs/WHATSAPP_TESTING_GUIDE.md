# 🧪 How to Test WhatsApp Commerce - Simple Guide

## 📋 What You Need Before Starting

1. **A running app** - Make sure your Next.js app is running (`npm run dev`)
2. **A user account** - You need to be logged in
3. **A business ID** - Your account must have a `business_id` set up
4. **Backend API** - The backend must be running and accessible

---

## 🎯 Step 1: Open the WhatsApp Dashboard

### What to do:
1. Open your browser
2. Go to: `http://localhost:3000/dashboard/whatsapp`
3. You should see the WhatsApp Commerce page

### ✅ What you should see:
- A page that says "WhatsApp Commerce" at the top
- A big card that says "Not Connected" (if you haven't connected a number yet)
- Some boxes showing numbers (probably all zeros)
- Buttons at the bottom

### ❌ If it doesn't work:
- Check if you're logged in
- Check if the page shows an error message
- Make sure your backend is running

---

## 🔌 Step 2: Connect a WhatsApp Number

### What to do:
1. Click the button that says **"Connect Number"**
2. You'll see a form with boxes to fill in
3. Fill in these boxes:
   - **WABA ID**: A 15-digit number (like: `123456789012345`)
   - **Phone Number ID**: Another 15-digit number (like: `987654321098765`)
   - **Display Phone**: Your phone number with + (like: `+447700900123`)
   - **Access Token**: A long code that starts with `EAAG...`
   - **Verify Token**: (Optional) Any word you want

4. Click **"Connect WhatsApp Number"** button

### ✅ What should happen:
- The page should show a success message (green popup)
- You should be taken back to the main WhatsApp page
- The "Not Connected" card should now say "Connected" with a green checkmark
- Your phone number should be displayed

### ❌ If it doesn't work:
- Check if all the boxes are filled correctly
- Make sure the WABA ID and Phone Number ID are exactly 15 digits
- Make sure the phone number starts with `+`
- Make sure the access token starts with `EAAG`
- Check the browser console for error messages

---

## ⚙️ Step 3: Change Settings

### What to do:
1. Click the **"Settings"** button (or go to `/dashboard/whatsapp/settings`)
2. You'll see a page with toggle switches (like light switches)
3. Try clicking the switches:
   - **Multi-Store Routing** - Turn it on/off
   - **Allow Store Pickup** - Turn it on/off
   - **Allow Delivery** - Turn it on/off
   - **Payment Required for Delivery** - Turn it on/off (only shows if Delivery is on)
   - **Auto Welcome Message** - Turn it on/off

4. If you turn on "Auto Welcome Message", a text box will appear
5. Type a welcome message (like: "Welcome! Type 'menu' to see our products.")
6. Click **"Save Settings"** button

### ✅ What should happen:
- A green success message should appear
- The settings should stay the way you set them
- If you refresh the page, your settings should still be there

### ❌ If it doesn't work:
- Make sure you clicked "Save Settings"
- Check if there's an error message
- Try refreshing the page to see if settings saved

---

## 💬 Step 4: View Conversations

### What to do:
1. Click the **"View Conversations"** button (or go to `/dashboard/whatsapp/conversations`)
2. You'll see a table with a list of conversations

### What you can do:
- **Search**: Type a phone number in the search box to find specific conversations
- **Filter by Step**: Use the dropdown to see only conversations at a certain step
- **Filter by Payment**: Use the dropdown to see only paid/unpaid conversations
- **Click a row**: Click on any conversation to see more details

### ✅ What you should see:
- A table with columns: Customer, Step, Store, Items, Total, Payment, Updated
- If there are no conversations, you'll see "No conversations found"
- Each row shows information about one conversation

### ❌ If it doesn't work:
- Check if you have any conversations in your database
- Try refreshing the page
- Check the browser console for errors

---

## 🔍 Step 5: View Conversation Details

### What to do:
1. In the conversations table, click on any row
2. A drawer (side panel) should open from the right

### ✅ What you should see:
- Customer's phone number
- Current step (like "REVIEW_CART")
- Payment status
- List of items in their cart
- Total price
- If there's a sale, a link to view it
- If there's a payment link, a link to open it
- Delivery address (if they chose delivery)
- When the conversation was created and updated

### ❌ If it doesn't work:
- Make sure you clicked on a row
- Try clicking a different conversation
- Check if the drawer opens but is empty (might be a data issue)

---

## 📊 Step 6: Check the Overview Dashboard

### What to do:
1. Go back to the main WhatsApp page (`/dashboard/whatsapp`)
2. Look at all the boxes and numbers

### ✅ What you should see:
- **Connection Status**: Should show "Connected" with your phone number
- **Active Sessions**: Number of active conversations
- **Sessions Today**: How many conversations started today
- **Sales Today**: How many sales were made today
- **Revenue Today**: How much money was made today
- **Recent Conversations**: A list of the last 10 conversations

### ❌ If it doesn't work:
- Numbers might be zero if you don't have any data yet
- If you see "Not Connected", go back to Step 2
- If numbers don't update, wait 30 seconds (it auto-refreshes)

---

## 🐛 Common Problems and How to Fix Them

### Problem 1: "Please set up your business first"
**What it means**: Your account doesn't have a `business_id`
**How to fix**: Make sure you're logged in with a proper business account

### Problem 2: "Failed to load WhatsApp overview"
**What it means**: The backend API is not responding
**How to fix**: 
- Check if your backend is running
- Check if the API URL is correct in your `.env.local` file
- Check the browser console for error messages

### Problem 3: "Failed to connect WhatsApp number"
**What it means**: The form data is wrong or the backend rejected it
**How to fix**:
- Double-check all the numbers are correct
- Make sure WABA ID and Phone Number ID are exactly 15 digits
- Make sure the access token starts with "EAAG"
- Check the backend logs for more details

### Problem 4: Settings don't save
**What it means**: The API call failed
**How to fix**:
- Check the browser console for errors
- Make sure you're connected to the internet
- Try refreshing and saving again

### Problem 5: No conversations showing
**What it means**: Either there are no conversations, or the API is not returning data
**How to fix**:
- Check if you have conversations in your database
- Try the filters to see if they're hidden
- Check the browser console for API errors

---

## 🧪 Testing Checklist

Use this checklist to make sure everything works:

### Basic Navigation
- [ ] Can I open `/dashboard/whatsapp`?
- [ ] Can I see the overview page?
- [ ] Can I click "Connect Number"?
- [ ] Can I click "Settings"?
- [ ] Can I click "View Conversations"?

### Connect Number
- [ ] Can I fill in the form?
- [ ] Does the form show errors if I enter wrong data?
- [ ] Can I successfully connect a number?
- [ ] Does the status change to "Connected" after connecting?
- [ ] Can I see my connected number listed?

### Settings
- [ ] Can I see all the toggle switches?
- [ ] Can I turn switches on and off?
- [ ] Do new fields appear when I turn on certain switches?
- [ ] Can I save settings?
- [ ] Do settings stay saved after refreshing?

### Conversations
- [ ] Can I see the conversations table?
- [ ] Can I search for conversations?
- [ ] Can I filter by step?
- [ ] Can I filter by payment status?
- [ ] Can I click on a conversation to see details?
- [ ] Does the detail drawer open?
- [ ] Can I see all the information in the drawer?

### Overview Dashboard
- [ ] Do the stats cards show numbers?
- [ ] Does the connection status show correctly?
- [ ] Can I see recent conversations?
- [ ] Do the numbers update automatically (wait 30 seconds)?

---

## 🎓 Tips for Testing

1. **Start with a clean slate**: If you're testing for the first time, start from the beginning
2. **Test one thing at a time**: Don't try to test everything at once
3. **Check the browser console**: Press F12 to see error messages
4. **Check the network tab**: See if API calls are being made and if they succeed
5. **Use real data**: If possible, use real WhatsApp Business credentials for testing
6. **Test on different browsers**: Try Chrome, Firefox, Safari
7. **Test on mobile**: Make sure it works on your phone too

---

## 📞 Need Help?

If something doesn't work:

1. **Check the browser console** (Press F12 → Console tab)
2. **Check the Network tab** (Press F12 → Network tab) to see API calls
3. **Check the backend logs** to see if requests are reaching the server
4. **Check your `.env.local`** file to make sure API URLs are correct
5. **Read the error messages** - they usually tell you what's wrong

---

## 🎉 You're Done!

If you've tested everything on the checklist and it all works, congratulations! Your WhatsApp Commerce dashboard is working correctly! 🎊
