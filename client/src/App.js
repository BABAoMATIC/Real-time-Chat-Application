import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Grid,
  Badge,
  Chip,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Socket event listeners
    socket.on('previous_messages', (previousMessages) => {
      setMessages(previousMessages);
    });

    socket.on('new_message', (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    socket.on('users_list', (usersList) => {
      setUsers(usersList);
    });

    socket.on('user_joined', (user) => {
      // Add a system message when user joins
      const systemMessage = {
        id: Date.now(),
        text: `${user.username} joined the chat`,
        type: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('user_left', (user) => {
      // Add a system message when user leaves
      const systemMessage = {
        id: Date.now(),
        text: `${user.username} left the chat`,
        type: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('user_typing', (typingUsersList) => {
      setTypingUsers(typingUsersList);
    });

    return () => {
      socket.off('previous_messages');
      socket.off('new_message');
      socket.off('users_list');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('user_typing');
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('join', { username: username.trim() });
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('send_message', { text: message.trim() });
      setMessage('');
      handleStopTyping();
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start');
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socket.emit('typing_stop');
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isMyMessage = (messageUserId) => {
    return messageUserId === socket.id;
  };

  if (!isJoined) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            💬 Real-Time Chat
          </Typography>
          <Typography variant="body1" gutterBottom align="center" color="text.secondary">
            Enter your username to join the chat
          </Typography>
          <Box component="form" onSubmit={handleJoin} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!username.trim()}
            >
              Join Chat
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', py: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Users sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Online Users ({users.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              {users.map((user) => (
                <ListItem key={user.id}>
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <CircleIcon sx={{ color: 'green', fontSize: 12 }} />
                      }
                    >
                      <Avatar src={user.avatar} alt={user.username}>
                        <PersonIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.username}
                    secondary={user.id === socket.id ? '(You)' : 'Online'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Chat area */}
        <Grid item xs={12} md={9}>
          <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Chat header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                💬 Chat Room
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {users.length} users online
              </Typography>
            </Box>

            {/* Messages area */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {messages.map((msg) => (
                <Box key={msg.id} sx={{ mb: 1 }}>
                  {msg.type === 'system' ? (
                    <Box sx={{ textAlign: 'center', my: 1 }}>
                      <Chip 
                        label={msg.text} 
                        size="small" 
                        variant="outlined" 
                        color="info"
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: isMyMessage(msg.user.id) ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          backgroundColor: isMyMessage(msg.user.id) 
                            ? 'primary.main' 
                            : 'grey.100',
                          color: isMyMessage(msg.user.id) ? 'white' : 'text.primary'
                        }}
                      >
                        {!isMyMessage(msg.user.id) && (
                          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                            {msg.user.username}
                          </Typography>
                        )}
                        <Typography variant="body1">
                          {msg.text}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          display="block" 
                          sx={{ 
                            mt: 0.5, 
                            opacity: 0.7,
                            textAlign: 'right'
                          }}
                        >
                          {formatTime(msg.timestamp)}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Box>
              ))}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <Box sx={{ p: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </Typography>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* Message input */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box component="form" onSubmit={handleSendMessage}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={message}
                  onChange={handleTyping}
                  onBlur={handleStopTyping}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="submit"
                          disabled={!message.trim()}
                          color="primary"
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;