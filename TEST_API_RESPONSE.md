# Test Your Current API Response

To help me update the worker correctly, please test your current API and share the response structure.

## Quick Test

Open your browser console on `localhost:3000` and run:

```javascript
fetch('https://worker.chargercloud.io/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'How do I reset my password?',
    max_num_results: 3,
    stream: false
  })
})
.then(r => r.json())
.then(data => {
  console.log('Full Response:', JSON.stringify(data, null, 2));
  console.log('Data array:', data.data);
})
```

## What I Need to Know

Please share the output, specifically:

1. **Does `data.data` exist?** (array of source documents)
2. **What fields does each item have?** (filename, score, metadata, etc.)
3. **Where is the PDF filename stored?** (e.g., `item.filename`, `item.metadata.source`, etc.)

## Example Expected Response

I'm expecting something like this:

```json
{
  "response": "To reset your password...",
  "data": [
    {
      "filename": "Okta Reset Password.pdf",  // ← Need to know this field name
      "score": 0.95,
      "text": "excerpt from the document...",
      "metadata": {
        "source": "Okta Reset Password.pdf"  // ← Or maybe here?
      }
    }
  ]
}
```

Once you share this, I'll update the worker with the exact field mapping!

