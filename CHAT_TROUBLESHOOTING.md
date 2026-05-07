# Chat Troubleshooting Guide

## Step 1: Check Console Logs

Open the app and try to send a message. Check the console for these logs:

```
=== INIT CHAT START ===
User email: ...
Seller email: ...
Participants: ...
Create Chat Result: ...
Chat ID: ...
Loading messages for chat: ...
```

## Step 2: Verify Firebase Rules

Go to Firebase Console → Firestore Database → Rules

Make sure you have:
```javascript
match /Chats/{chatId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update: if request.auth != null;
  
  match /messages/{messageId} {
    allow read: if request.auth != null;
    allow create: if request.auth != null;
  }
}
```

## Step 3: Check Firestore Data

1. Go to Firebase Console
2. Click Firestore Database
3. Look for "Chats" collection
4. Check if chat document was created
5. Check if messages subcollection exists

## Step 4: Test Manually

1. Open product detail
2. Click "Chat with Seller" button
3. Type a message
4. Click send
5. Check console logs
6. Check Firestore in Firebase Console

## Common Issues:

### Issue 1: No logs appearing
**Solution:** Make sure you're looking at the correct console (Metro bundler terminal)

### Issue 2: "Permission denied"
**Solution:** Update Firestore rules as shown above

### Issue 3: Chat ID is null
**Solution:** Check that both user emails are valid

### Issue 4: Messages not showing
**Solution:** Check Firestore console to see if messages are being saved

## Quick Test:

Run this in your terminal while app is running:
```bash
# Watch Metro bundler logs
npx expo start
```

Then interact with the app and watch for logs starting with "===" 

## If Still Not Working:

1. Clear app data
2. Restart Metro bundler: `npx expo start -c`
3. Check Firebase Console for any errors
4. Verify .env file has correct Firebase credentials
