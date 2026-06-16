const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/services', require('./routes/services'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/users', require('./routes/users'));

// Socket.io for real-time chat
const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('user_connected', (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('send_message', (data) => {
    const receiverSocket = onlineUsers.get(data.receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('receive_message', data);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((val, key) => {
      if (val === socket.id) onlineUsers.delete(key);
    });
  });
});

const PORT = process.env.PORT || 5000;
const PRIMARY_MONGO_URI = process.env.MONGO_URI;
const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/smit_marketplace';

const connectDb = async () => {
  try {
    await mongoose.connect(PRIMARY_MONGO_URI || LOCAL_MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Primary MongoDB connection failed:', err.message);
    if (PRIMARY_MONGO_URI) {
      console.log('Falling back to local MongoDB...');
      await mongoose.connect(LOCAL_MONGO_URI);
      console.log('Local MongoDB connected');
    } else {
      throw err;
    }
  }
};

connectDb()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => console.error(err));
