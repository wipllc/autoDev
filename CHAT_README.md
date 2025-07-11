# Real-Time Chat Room with Cloudflare Durable Objects

A modern, mobile-friendly chat room application built with Cloudflare Workers, Durable Objects, React Router, and Tailwind CSS.

## Features

- 🚀 **Real-time messaging** - Instant message delivery using WebSockets
- 📱 **Mobile-friendly** - Responsive design that works on all devices
- ⚡ **Serverless** - Powered by Cloudflare Workers for global performance
- 🔄 **Persistent storage** - Messages stored in Durable Objects
- 🏠 **Multiple rooms** - Support for different chat rooms (currently using "general")
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS

## Architecture

### Backend (Cloudflare Workers + Durable Objects)

- **`workers/app.ts`** - Main worker with ChatRoom Durable Object class and routing logic
- **`wrangler.jsonc`** - Configuration for Cloudflare Workers and Durable Objects

### Frontend (React Router + Tailwind CSS)

- **`app/routes/home.tsx`** - Welcome page with link to chat room
- **`app/routes/chat.tsx`** - Main chat interface with real-time messaging
- **`app/routes.ts`** - Route configuration

## How It Works

1. **User Joins**: Users enter a username and connect to the chat room
2. **WebSocket Connection**: Browser establishes WebSocket connection to `/chat` endpoint
3. **Durable Object**: Request is routed to ChatRoom Durable Object instance
4. **Message History**: New users receive the last 50 messages
5. **Real-time Updates**: All connected users receive new messages instantly
6. **Persistent Storage**: Messages are stored in Durable Object storage

## Usage

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Deployment

```bash
# Build and deploy to Cloudflare
npm run deploy
```

### Accessing the Chat

1. Open the application in your browser
2. Click "Join Chat Room" on the home page
3. Enter your username
4. Start chatting!

## Technical Details

### WebSocket Communication

The chat uses WebSockets for real-time communication with the following message types:

- `history` - Sent to new users with recent messages
- `new_message` - Broadcast when a user sends a message
- `user_joined` - Notification when a user joins (future enhancement)

### Message Format

```typescript
interface ChatMessage {
  id: string;        // Unique message ID
  username: string;  // Sender's username
  message: string;   // Message content
  timestamp: number; // Unix timestamp
}
```

### Room Support

The application supports multiple chat rooms via URL parameters:
- Default room: `general`
- Custom room: Add `?room=roomname` to WebSocket URL

### Storage

- Messages are stored in Durable Object storage
- Last 1000 messages are kept per room
- New users see the last 50 messages

## Mobile Optimization

- Responsive design works on all screen sizes
- Touch-friendly interface
- Optimized message input for mobile keyboards
- Smooth scrolling to new messages
- Compact UI elements for small screens

## Security Considerations

- Input validation on message content (max 1000 characters)
- Username validation (max 50 characters)
- WebSocket connection limits handled by Cloudflare
- No authentication implemented (add as needed)

## Future Enhancements

- User authentication
- Message reactions/emojis
- File sharing
- Private messaging
- User presence indicators
- Message search
- Chat room creation/management
- Message encryption