# 💬 Real-Time Chat Messenger App

A modern, real-time chat application built with React, Node.js, Express, and Socket.IO. Features include real-time messaging, user presence indicators, typing indicators, and a WhatsApp-inspired UI.

## ✨ Features

- **Real-time messaging** - Messages appear instantly across all connected clients
- **User presence** - See who's online with live user list
- **Typing indicators** - Know when someone is typing
- **Message timestamps** - All messages show when they were sent
- **WhatsApp-inspired UI** - Clean, modern interface with Material-UI
- **Responsive design** - Works on desktop and mobile devices
- **Auto-scroll** - Automatically scrolls to new messages
- **System notifications** - See when users join/leave the chat

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Setup

1. **Install backend dependencies:**
   ```bash
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Start the application:**
   
   **Option 1: Start both servers with one command (recommended)**
   ```bash
   # Start backend server
   npm start
   
   # In a new terminal, start frontend
   cd client
   npm start
   ```
   
   **Option 2: Development mode with auto-restart**
   ```bash
   # Start backend in dev mode
   npm run dev
   
   # In a new terminal, start frontend
   cd client
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional event-based communication
- **UUID** - Unique identifier generation
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Material-UI (MUI)** - React component library
- **Socket.IO Client** - Real-time communication client
- **Emotion** - CSS-in-JS styling

## 📱 How to Use

1. **Join the Chat:**
   - Enter your username when prompted
   - Click "Join Chat" to enter the chat room

2. **Send Messages:**
   - Type your message in the input field at the bottom
   - Press Enter or click the send button
   - Messages appear in real-time for all users

3. **See Who's Online:**
   - Check the left sidebar to see all online users
   - Green indicators show active users

4. **Typing Indicators:**
   - Start typing to show others you're composing a message
   - See when others are typing

## 🏗 Project Structure

```
realtime-chat-app/
├── server.js              # Express server with Socket.IO
├── package.json           # Backend dependencies
├── client/                # React frontend
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styling
│   │   ├── index.js      # React entry point
│   │   └── index.css     # Global styles
│   └── package.json      # Frontend dependencies
└── README.md             # This file
```

## 🔧 Configuration

### Backend Configuration
The server runs on port 5000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8000 npm start
```

### Frontend Configuration
The React app connects to the backend at `http://localhost:5000`. If you change the backend port, update the socket connection in `client/src/App.js`:

```javascript
const socket = io('http://localhost:YOUR_PORT');
```

## 🌟 Features in Detail

### Real-time Messaging
- Messages are instantly broadcast to all connected clients
- No page refresh needed
- Messages persist for the session (last 100 messages kept in memory)

### User Management
- Unique user identification with socket IDs
- Avatar generation based on username
- Real-time user list updates
- Join/leave notifications

### UI/UX Features
- Message bubbles with different colors for sent/received messages
- Timestamps on all messages
- Auto-scroll to latest messages
- Responsive design for mobile and desktop
- WhatsApp-inspired color scheme and layout

### Typing Indicators
- Shows when users are actively typing
- Automatically clears after 1 second of inactivity
- Displays multiple users typing simultaneously

## 🚀 Deployment

### Production Build
1. Build the React app:
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. Start the production server:
   ```bash
   npm start
   ```

The server will serve the built React app from the `client/build` directory.

### Environment Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Future Enhancements

- [ ] User authentication and persistent accounts
- [ ] Private messaging between users
- [ ] Message history persistence with database
- [ ] File and image sharing
- [ ] Emoji support and reactions
- [ ] Chat rooms/channels
- [ ] Push notifications
- [ ] Voice messages
- [ ] Video calling integration

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change the port in package.json or use `PORT=3001 npm start`

2. **Connection issues:**
   - Make sure both frontend and backend are running
   - Check that the Socket.IO connection URL matches your backend port

3. **Messages not appearing:**
   - Check browser console for errors
   - Ensure Socket.IO is properly connected

### Support
If you encounter any issues, please check the browser console for error messages and ensure all dependencies are properly installed.

---

Built with ❤️ using React, Node.js, and Socket.IO