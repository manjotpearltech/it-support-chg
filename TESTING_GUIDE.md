# Testing Guide - Mock Mode & UI

## Quick Start

### 1. Start the Application
```bash
npm run dev
```

Wait for both servers to start:
- Backend: `🚀 Server running on port 5001`
- Frontend: `You can now view it-support-webapp-react in the browser`

### 2. Open in Browser
```
http://localhost:3000
```

## Testing the UI

### Desktop Testing (1920px - 1024px)
1. Open the app in full screen
2. Verify:
   - Header is centered and properly aligned
   - Chat messages display in a centered column
   - Input bar aligns with header
   - Quick action cards display in 3-column grid
   - All spacing is consistent

### Tablet Testing (768px - 481px)
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPad" or set width to 768px
4. Verify:
   - Header is still centered
   - Quick action cards display in 2-column grid
   - Input bar is properly sized
   - Padding is reduced appropriately
   - Text is readable without zooming

### Mobile Testing (480px - 320px)
1. Set viewport to 375px (iPhone)
2. Verify:
   - Header is compact but readable
   - Quick action cards display in 1 column
   - Input bar is touch-friendly (40px+ height)
   - Send button is easily tappable
   - No horizontal scrolling
   - Text is readable without zooming
   - Input hints are hidden to save space

### Responsive Breakpoints to Test
- 1920px (Desktop)
- 1440px (Desktop)
- 1024px (Tablet landscape)
- 768px (Tablet)
- 600px (Tablet portrait)
- 480px (Mobile landscape)
- 375px (Mobile - iPhone)
- 320px (Mobile - Small phone)

## Testing the Chat Functionality

### Test 1: Welcome Screen
1. Open the app
2. Verify:
   - Welcome message displays
   - Quick action cards are visible
   - Header shows "Charger Logistics IT Support"
   - Subtitle shows "⚡ Fast, AI-powered assistance"

### Test 2: Password Reset Question
1. Click "Password Reset" quick action OR
2. Type: "How do I reset my password?"
3. Verify:
   - Message appears in chat
   - Loading indicator shows
   - Response appears after ~1 second
   - Response contains password reset instructions
   - Citation appears below response

### Test 3: VPN Setup Question
1. Type: "Help me set up VPN"
2. Verify:
   - Response contains VPN setup instructions
   - Mentions "Cisco AnyConnect"
   - Provides server address
   - Citation is displayed

### Test 4: Email Troubleshooting
1. Type: "I'm having email issues"
2. Verify:
   - Response contains troubleshooting steps
   - Mentions Outlook
   - Provides clear instructions
   - Citation is displayed

### Test 5: Printer Configuration
1. Type: "How do I add a printer?"
2. Verify:
   - Response contains printer setup steps
   - Mentions network printer setup
   - Provides clear instructions
   - Citation is displayed

### Test 6: Software Request
1. Type: "I need new software"
2. Verify:
   - Response explains software request process
   - Mentions IT Portal
   - Provides timeline (2-3 business days)
   - Citation is displayed

### Test 7: Default Response
1. Type: "Hello" or any other question
2. Verify:
   - Default IT support greeting appears
   - Lists available topics
   - Citation is displayed

## Testing Chat Features

### Test 8: Multiple Messages
1. Send 3-4 messages in sequence
2. Verify:
   - All messages appear in order
   - User messages are on the right (black)
   - Assistant messages are on the left (white)
   - Conversation history is maintained
   - Messages scroll smoothly

### Test 9: Long Messages
1. Type a very long message (200+ characters)
2. Verify:
   - Message wraps properly
   - No horizontal scrolling
   - Text is readable
   - Input expands to show full message

### Test 10: New Chat Button
1. Send a message
2. Verify "New Chat" button appears in header
3. Click "New Chat"
4. Verify:
   - Chat history is cleared
   - Welcome screen reappears
   - Quick actions are visible again

### Test 11: Loading States
1. Send a message
2. Verify:
   - Loading indicator appears
   - Send button is disabled
   - Input is disabled
   - Typing indicator shows

### Test 12: Animations
1. Send messages
2. Verify:
   - Messages fade in smoothly
   - Hover effects work on buttons
   - Transitions are smooth (0.2-0.3s)
   - No jarring movements

## Testing Responsive Interactions

### Test 13: Mobile Touch Targets
1. Set viewport to 375px
2. Verify button sizes:
   - Send button: 32px (mobile) - easily tappable
   - Quick action cards: Full width - easy to tap
   - Citation buttons: 28px height - easy to tap

### Test 14: Mobile Input
1. Set viewport to 375px
2. Click input field
3. Verify:
   - Keyboard appears (in real mobile)
   - Input expands properly
   - Text is visible
   - Send button is accessible

### Test 15: Mobile Scrolling
1. Set viewport to 375px
2. Send multiple messages
3. Verify:
   - Messages scroll smoothly
   - No layout shift
   - Scrollbar is visible
   - Latest message is visible

## Testing API Endpoints

### Test 16: Health Check
```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "mode": "mock",
  "timestamp": "2025-10-15T...",
  "services": {
    "search": true,
    "openai": true
  }
}
```

### Test 17: Chat Endpoint
```bash
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I reset my password?","conversationHistory":[]}'
```

Expected response:
```json
{
  "response": "To reset your password...",
  "citations": [...],
  "timestamp": "2025-10-15T..."
}
```

## Testing Error Handling

### Test 18: Empty Message
1. Click send without typing
2. Verify:
   - Send button is disabled
   - No message is sent
   - No error appears

### Test 19: Very Long Message
1. Type 1000+ characters
2. Send
3. Verify:
   - Message is sent
   - Response is received
   - No errors occur

## Performance Testing

### Test 20: Response Time
1. Send a message
2. Note the time from send to response
3. Verify: Response appears within 1-2 seconds (mock delay)

### Test 21: Multiple Rapid Messages
1. Send 5 messages quickly
2. Verify:
   - All messages are queued
   - Responses appear in order
   - No messages are lost
   - No errors occur

## Cross-Browser Testing

### Chrome
- [ ] All tests pass
- [ ] Responsive design works
- [ ] Animations are smooth

### Safari
- [ ] All tests pass
- [ ] Responsive design works
- [ ] Animations are smooth

### Firefox
- [ ] All tests pass
- [ ] Responsive design works
- [ ] Animations are smooth

### Edge
- [ ] All tests pass
- [ ] Responsive design works
- [ ] Animations are smooth

## Accessibility Testing

### Test 22: Keyboard Navigation
1. Press Tab to navigate
2. Verify:
   - All buttons are reachable
   - Focus indicators are visible
   - Enter key sends message

### Test 23: Screen Reader
1. Use screen reader (NVDA, JAWS, VoiceOver)
2. Verify:
   - All text is readable
   - Buttons are labeled
   - Messages are announced

## Final Checklist

- [ ] UI looks good on all screen sizes
- [ ] Chat functionality works with mock responses
- [ ] All quick actions work
- [ ] Animations are smooth
- [ ] No console errors
- [ ] No layout shifts
- [ ] Mobile is fully responsive
- [ ] Touch targets are appropriately sized
- [ ] Text is readable without zooming
- [ ] All buttons are accessible
- [ ] API endpoints respond correctly
- [ ] Error handling works
- [ ] Performance is acceptable

## Troubleshooting

### Issue: App not loading
- Check if both servers are running
- Verify ports 3000 and 5001 are available
- Check browser console for errors

### Issue: Chat not working
- Check backend health: `curl http://localhost:5001/api/health`
- Check browser console for network errors
- Verify proxy is configured in package.json

### Issue: Responsive design not working
- Clear browser cache (Ctrl+Shift+Delete)
- Reload page (Ctrl+R)
- Check DevTools viewport settings

### Issue: Animations not smooth
- Check browser performance
- Disable browser extensions
- Try different browser

## Next Steps

After testing:
1. Document any issues found
2. Fix any bugs discovered
3. Commit changes to git
4. Push to GitHub
5. Deploy to Cloudflare Pages
6. Test in production environment

