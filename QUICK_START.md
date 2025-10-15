# 🚀 Quick Start Guide

## Start in 3 Steps

### Step 1: Start the Servers
```bash
npm run dev
```

### Step 2: Wait for Both to Start
Look for these messages:
```
✅ Backend: 🚀 Server running on port 5001
✅ Frontend: You can now view it-support-webapp-react in the browser
```

### Step 3: Open in Browser
```
http://localhost:3000
```

## 🎯 What You'll See

### Welcome Screen
- Header: "Charger Logistics IT Support"
- Subtitle: "⚡ Fast, AI-powered assistance"
- 6 Quick action cards
- Popular topics buttons

### Try These Questions
1. **"How do I reset my password?"**
   - Get password reset instructions
   - See mock response with citation

2. **"Help me set up VPN"**
   - Get VPN setup guide
   - Learn about Cisco AnyConnect

3. **"I'm having email issues"**
   - Get email troubleshooting steps
   - See Outlook tips

4. **"How do I add a printer?"**
   - Get printer setup instructions
   - Learn network printer setup

5. **"I need new software"**
   - Get software request process
   - Learn about IT Portal

6. **Any other question**
   - Get default IT support greeting
   - See list of available topics

## 📱 Test Responsive Design

### Desktop (1920px)
- Full 3-column layout
- Maximum spacing
- All elements visible

### Tablet (768px)
- 2-column layout
- Reduced padding
- Optimized spacing

### Mobile (375px)
- 1-column layout
- Touch-friendly buttons
- Optimized for small screens

### How to Test
1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select different devices
4. Verify layout adapts

## ✨ Features to Try

### Chat Features
- ✅ Send messages
- ✅ See loading indicator
- ✅ Get mock responses
- ✅ View citations
- ✅ See conversation history
- ✅ Click "New Chat" to reset

### UI Features
- ✅ Smooth animations
- ✅ Hover effects on buttons
- ✅ Responsive layout
- ✅ Touch-friendly buttons
- ✅ Proper text sizing
- ✅ Good color contrast

### Mobile Features
- ✅ Responsive grid (3 → 2 → 1 column)
- ✅ Touch-friendly buttons (32-40px)
- ✅ Readable text without zoom
- ✅ No horizontal scrolling
- ✅ Proper spacing on mobile

## 🔍 Check Server Status

### Health Check
```bash
curl http://localhost:5001/api/health
```

Response:
```json
{
  "status": "ok",
  "mode": "mock",
  "services": {
    "search": true,
    "openai": true
  }
}
```

### Test Chat API
```bash
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I reset my password?"}'
```

## 🛑 Stop the Servers

Press `Ctrl+C` in the terminal where `npm run dev` is running.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill port 3000
lsof -ti:3000 | xargs kill -9

# Kill port 5001
lsof -ti:5001 | xargs kill -9

# Restart
npm run dev
```

### App Not Loading
1. Check if both servers started
2. Clear browser cache (Ctrl+Shift+Delete)
3. Reload page (Ctrl+R)
4. Check browser console for errors

### Backend Not Responding
1. Check health: `curl http://localhost:5001/api/health`
2. Check terminal for error messages
3. Restart: `npm run dev`

## 📚 Documentation

For more details, see:
- `SETUP_COMPLETE.md` - Complete setup guide
- `UI_IMPROVEMENTS.md` - UI changes explained
- `MOCK_MODE_SETUP.md` - Mock mode details
- `TESTING_GUIDE.md` - Complete testing checklist
- `CHANGES_SUMMARY.md` - All changes documented

## 🎨 UI Improvements

### Alignment
- Header and input perfectly aligned
- Both use `max-width: 900px`
- Centered layout

### Responsive
- Desktop: Full layout
- Tablet: 2-column grid
- Mobile: 1-column layout

### Polish
- Smooth animations (0.2-0.3s)
- Better shadows and depth
- Improved typography
- Enhanced hover states

## 🎭 Mock Mode

### What It Does
- Provides realistic IT support responses
- No Azure credentials needed
- Simulates 800-1200ms response delay
- Includes mock citations

### Response Types
1. Password reset
2. VPN setup
3. Email troubleshooting
4. Printer configuration
5. Software requests
6. Default greeting

### How It Works
- Automatically detects if Azure credentials exist
- If no credentials → Mock mode
- If credentials exist → Production mode
- Seamless switching

## ✅ Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] Backend shows "🎭 MOCK_MODE"
- [ ] Frontend shows "Compiled successfully!"
- [ ] App opens at http://localhost:3000
- [ ] Welcome screen displays
- [ ] Quick actions are visible
- [ ] Can send a message
- [ ] Get a mock response
- [ ] Response appears within 1-2 seconds
- [ ] Citation displays
- [ ] "New Chat" button appears
- [ ] Can click "New Chat" to reset

## 🚀 Next Steps

### After Testing
1. Review the UI improvements
2. Test on different screen sizes
3. Try all the mock responses
4. Check responsive design

### Before Committing
1. Verify all features work
2. Check for any visual issues
3. Test on mobile device if possible
4. Review the documentation

### Commit & Push
```bash
git add -A
git commit -m "Add UI improvements and mock mode"
git push origin main
```

### Production Setup
When ready for real Azure services:
1. Create `.env` file with credentials
2. Restart: `npm run dev`
3. Server switches to production mode

## 💡 Tips

### Testing Different Screen Sizes
1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select device or set custom width
4. Refresh page to see responsive design

### Testing on Mobile
1. Get your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On mobile, visit: `http://YOUR_IP:3000`
3. Test touch interactions

### Viewing Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Send a message
4. See POST request to `/api/chat`
5. View response in Response tab

## 🎉 You're Ready!

Everything is set up and ready to test. Start with:

```bash
npm run dev
```

Then visit: **http://localhost:3000**

Enjoy! 🚀

