const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Store connected users and messages
const users = new Map();
const messages = [];
const typingUsers = new Set();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user joining
  socket.on('join', (userData) => {
    const user = {
      id: socket.id,
      username: userData.username,
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.username}&background=random`,
      joinedAt: new Date(),
      isOnline: true
    };
    
    users.set(socket.id, user);
    
    // Send existing messages to new user
    socket.emit('previous_messages', messages);
    
    // Send current online users to new user
    socket.emit('users_list', Array.from(users.values()));
    
    // Broadcast to all clients that a new user joined
    socket.broadcast.emit('user_joined', user);
    socket.broadcast.emit('users_list', Array.from(users.values()));
    
    console.log(`${user.username} joined the chat`);
  });

  // Handle new messages
  socket.on('send_message', (messageData) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: uuidv4(),
      text: messageData.text,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      },
      timestamp: new Date(),
      type: 'text'
    };

    messages.push(message);
    
    // Keep only last 100 messages in memory
    if (messages.length > 100) {
      messages.shift();
    }

    // Broadcast message to all connected clients
    io.emit('new_message', message);
    
    console.log(`Message from ${user.username}: ${message.text}`);
  });

  // Handle typing indicators
  socket.on('typing_start', () => {
    const user = users.get(socket.id);
    if (!user) return;
    
    typingUsers.add(user.username);
    socket.broadcast.emit('user_typing', Array.from(typingUsers));
  });

  socket.on('typing_stop', () => {
    const user = users.get(socket.id);
    if (!user) return;
    
    typingUsers.delete(user.username);
    socket.broadcast.emit('user_typing', Array.from(typingUsers));
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      typingUsers.delete(user.username);
      
      // Broadcast to all clients that user left
      socket.broadcast.emit('user_left', user);
      socket.broadcast.emit('users_list', Array.from(users.values()));
      socket.broadcast.emit('user_typing', Array.from(typingUsers));
      
      console.log(`${user.username} disconnected`);
    }
  });
});

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the chat app`);
});