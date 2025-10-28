# Streaming Chat Implementation Documentation

## Overview
This document describes the implementation of the streaming chat functionality for the IT Support Portal, integrating with the `https://worker.chargercloud.io/api/chat` API endpoint.

## Architecture

### Custom Hook: `useStreamingChat`
**Location:** `src/hooks/useStreamingChat.js`

The custom React hook manages all streaming chat functionality:

**Features:**
- Server-Sent Events (SSE) stream processing
- Progressive text rendering
- Session management with unique session IDs
- Stream cancellation support
- Error handling and timeout management
- Source citation extraction

**API:**
```javascript
const {
  messages,        // Array of message objects
  sendMessage,     // Function to send a message
  isStreaming,     // Boolean indicating if currently streaming
  cancelStreaming, // Function to cancel ongoing stream
  clearMessages,   // Function to clear all messages
  error           // Current error message (if any)
} = useStreamingChat();
```

**Message Structure:**
```javascript
{
  id: string,           // Unique message identifier
  role: 'user' | 'assistant',
  content: string,      // Message text content
  sources: [{           // Source citations (assistant only)
    filename: string,
    score: number       // Relevance score (0-1)
  }],
  timestamp: string,    // ISO timestamp
  isComplete: boolean,  // Whether streaming is complete
  isError: boolean      // Whether message is an error
}
```

## API Integration

### Endpoint
`POST https://worker.chargercloud.io`

### Request Format
```json
{
  "query": "user's question"
}
```

### Response Format (JSON)
The API returns a complete JSON response:

```json
{
  "object": "vector_store.search_results.page",
  "search_query": "unable to login to okta",
  "response": "To resolve the issue...",
  "data": [
    {
      "file_id": "...",
      "filename": "Okta Reset Password.pdf",
      "score": 0.64755243,
      "attributes": {...},
      "content": [...]
    }
  ],
  "has_more": false,
  "next_page": null
}
```

**Response Fields:**
- `response`: The AI-generated answer text
- `data`: Array of source documents with relevance scores
- `search_query`: The processed query
- `object`: Response type identifier

## Key Features Implemented

### 1. Simulated Streaming Text Rendering
- Text appears word-by-word for better UX (simulated from complete response)
- Smooth, non-flickering display with 30ms delay per word
- Auto-scroll to keep latest content visible
- Can be cancelled mid-stream with stop button

### 2. Stream Management
- **Timeout:** 30-second timeout for streams
- **Cancellation:** User can stop streaming mid-response
- **Cleanup:** Proper resource cleanup on unmount/cancel

### 3. Source Citations
- Displays source documents below AI responses
- Shows filename and relevance score
- Formatted as percentage (e.g., "85% match")

### 4. Error Handling
- Network errors (connection lost, timeout)
- API errors (500, 404, etc.)
- Malformed data chunks
- User-friendly error messages
- Escalation message for unsupported queries

### 5. User Experience
- **Welcome Screen:** Example queries as clickable buttons
- **Typing Indicator:** Animated dots while waiting for first chunk
- **Streaming Indicator:** "AI is responding..." during streaming
- **Stop Button:** Red button to cancel streaming
- **Input States:** Disabled during streaming with appropriate placeholders

## Component Updates

### App.js Changes
1. **Removed:** Old axios-based chat implementation
2. **Added:** Integration with `useStreamingChat` hook
3. **Updated:** Message rendering to support streaming states
4. **Added:** Example query buttons on welcome screen
5. **Added:** Source citations display
6. **Added:** Stop button during streaming
7. **Updated:** Input placeholders and disabled states

## Styling Updates

### New CSS Classes
- `.example-queries` - Container for example query buttons
- `.example-query-btn` - Individual example query button
- `.streaming-indicator` - Pulsing "AI is responding..." text
- `.message-sources` - Container for source citations
- `.source-item` - Individual source citation
- `.stop-button` - Red stop button for canceling streams
- `.error-message` - Error message styling
- `.message.error` - Error state for messages

### Animations
- **Slide-in:** Messages slide in with fade (0.3s)
- **Pulse:** Streaming indicator pulses (1.5s cycle)
- **Hover effects:** Buttons lift on hover

## Configuration Constants

```javascript
API_URL: 'https://worker.chargercloud.io'
STREAM_TIMEOUT: 30000 // 30 seconds
WORD_DELAY: 30 // milliseconds between words for streaming effect
```

## Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Testing

### Manual Testing Checklist
- [x] Send message and receive streaming response
- [x] Click example queries
- [x] Cancel stream mid-response
- [x] Handle network errors gracefully
- [x] Display source citations
- [x] Auto-scroll during streaming
- [x] Responsive design on mobile

### Test Queries
1. "How do I reset my Okta password?"
2. "VPN connection issues"
3. "How to setup email on my phone?"

## Known Limitations
1. **No persistence:** Messages are not saved to localStorage (can be added if needed)
2. **No retry logic:** Failed requests require manual retry
3. **No markdown rendering:** Basic text only (bold formatting supported)
4. **No code highlighting:** Code blocks displayed as plain text

## Future Enhancements (Nice to Have)
- [ ] Message persistence in localStorage
- [ ] Retry logic for failed requests
- [ ] Full markdown rendering
- [ ] Code syntax highlighting
- [ ] Copy individual messages
- [ ] Export conversation
- [ ] Thumbs up/down feedback
- [ ] Suggested follow-up questions

## Troubleshooting

### Issue: Stream not starting
- Check network connection
- Verify API endpoint is accessible
- Check browser console for errors

### Issue: Text not appearing
- Verify SSE format matches expected structure
- Check for CORS issues
- Inspect network tab for response format

### Issue: Sources not displaying
- Verify API returns sources in expected format
- Check `parsed.sources` array structure
- Ensure `isComplete` is set to true

## Support
For issues or questions, contact: support@chargerlogistics.com

## Version History
- **v1.0.0** (2025-10-28): Initial streaming chat implementation
  - Server-Sent Events integration
  - Progressive text rendering
  - Source citations
  - Stream cancellation
  - Error handling

