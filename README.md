# IT Support Portal

A modern, AI-powered IT support portal built with React. This internal-only web application provides a clean, minimalist chat interface inspired by modern AI chat platforms like Perplexity AI and Grok AI.

## Features

- **Modern Chat Interface**: Clean, minimalist design with a professional appearance
- **Real-time Messaging**: Send and receive IT support responses instantly
- **AI-Powered Responses**: Integrated with the IT support API endpoint
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Message Timestamps**: Track when messages were sent and received
- **Loading Indicators**: Visual feedback while waiting for responses
- **Error Handling**: Graceful error messages for failed requests
- **Auto-scrolling**: Automatically scrolls to the latest message
- **Auto-resizing Textarea**: Input field grows as you type

## Project Structure

```
it-support-chg/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── App.js              # Main React component with chat logic
│   ├── index.js            # React entry point
│   └── index.css           # Styling (modern dark theme)
├── package.json            # Project dependencies
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode
```bash
npm start
```
The application will open at `http://localhost:3000`

### Production Build
```bash
npm run build
```
Creates an optimized production build in the `build/` directory.

## API Integration

The portal communicates with the IT support API endpoint:

**Endpoint**: `POST https://az.chargercloud.io/api/chat`

**Request Format**:
```json
{
  "message": "Your IT support question here"
}
```

**Response Format**:
```json
{
  "response": "AI-generated response",
  "timestamp": "2025-10-21T19:35:49.077Z"
}
```

## Usage

1. Start the development server with `npm start`
2. Type your IT support question in the input field
3. Press Enter or click the send button (➤)
4. Wait for the AI response
5. Continue the conversation as needed

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift + Enter**: New line in message

## Design Features

### Color Scheme
- **Background**: Dark gradient (0f0f0f to 1a1a1a)
- **Primary Accent**: Purple gradient (667eea to 764ba2)
- **Text**: Light gray (#e0e0e0)
- **Borders**: Subtle white with transparency

### UI Components
- **Header**: Branded title with icon and subtitle
- **Messages Area**: Scrollable chat history with animations
- **Input Area**: Textarea with send button
- **Loading State**: Animated dots indicator
- **Empty State**: Welcoming message when no conversations

### Responsive Breakpoints
- **Desktop**: Full width layout
- **Tablet (≤768px)**: Adjusted padding and font sizes
- **Mobile (≤480px)**: Optimized for small screens

## Technologies Used

- **React 18.2.0**: UI framework
- **Axios 1.6.0**: HTTP client for API requests
- **React Scripts 5.0.1**: Build and development tools
- **CSS3**: Modern styling with gradients and animations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Notes

- This is an internal-only portal
- API requests are made directly from the client
- Ensure proper authentication/authorization is implemented at the API level
- Consider implementing CORS policies on the API endpoint

## Development

### Available Scripts

- `npm start`: Run development server
- `npm build`: Create production build
- `npm test`: Run tests
- `npm eject`: Eject from Create React App (irreversible)

### Code Style

The project follows React best practices:
- Functional components with hooks
- Proper state management with useState
- Effect hooks for side effects
- Ref hooks for DOM manipulation

## Future Enhancements

- User authentication
- Message history persistence
- File upload support
- Conversation export
- Dark/light theme toggle
- Message search functionality
- User preferences/settings
- Analytics and usage tracking

## License

Internal use only.

## Support

For issues or questions about the IT Support Portal, please contact the IT team.

