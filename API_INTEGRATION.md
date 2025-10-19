# IT Support Chat API - Integration Guide

## API Endpoint
**Base URL:** `https://w.chargercloud.io/api/messages`

**Method:** POST

**Content-Type:** application/json

**CORS:** Enabled - can be called from any website

---

## 1. Chat with AI Assistant

Get AI-powered IT support responses.

**Request:**
```javascript
fetch('https://w.chargercloud.io/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'chat',
    message: 'How do I reset my password?',
    userName: 'John Doe',  // Optional
    userEmail: 'john@chargerlogistics.com'  // Optional
  })
})
```

**Response:**
```json
{
  "success": true,
  "response": "To reset your password, contact the IT helpdesk at helpdesk@chargerlogistics.com or use the self-service portal...",
  "timestamp": "2025-10-18T19:30:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "AI service temporarily unavailable",
  "fallback": "Please create a support ticket..."
}
```

---

## 2. Create Support Ticket

Create a ticket in Zendesk.

**Request:**
```javascript
fetch('https://w.chargercloud.io/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'create_ticket',
    subject: 'VPN Connection Issue',
    description: 'I cannot connect to the VPN. Getting error code 403.',
    userName: 'John Doe',
    userEmail: 'john@chargerlogistics.com'
  })
})
```

**Response:**
```json
{
  "success": true,
  "ticketId": 12345,
  "ticketUrl": "https://chargerlogistics.zendesk.com/tickets/12345",
  "message": "Support ticket created successfully! You'll receive an email confirmation shortly."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to create ticket",
  "message": "Unable to create support ticket. Please email helpdesk@chargerlogistics.com directly."
}
```

---

## 3. Health Check

Check if the API is online.

**Request:**
```javascript
fetch('https://w.chargercloud.io/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'health'
  })
})
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-18T19:30:00.000Z"
}
```

---

## Error Handling

Always check the `success` field in the response:
```javascript
const data = await response.json();

if (data.success) {
  // Handle success
  console.log(data.response);
} else {
  // Handle error
  console.error(data.error);
  // Show fallback message if available
  if (data.fallback) {
    console.log(data.fallback);
  }
}
```

---

## Required Fields

**For chat:**
- `action`: "chat" (required)
- `message`: string (required)
- `userName`: string (optional)
- `userEmail`: string (optional)

**For tickets:**
- `action`: "create_ticket" (required)
- `description`: string (required)
- `subject`: string (optional, defaults to "IT Support Request from Chat")
- `userName`: string (optional, defaults to "Unknown User")
- `userEmail`: string (optional, defaults to "unknown@chargerlogistics.com")

---

## Rate Limits
No rate limits currently enforced.

## Support
For API issues, contact: helpdesk@chargerlogistics.com

