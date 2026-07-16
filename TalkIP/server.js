const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 20 * 1024 * 1024
});

app.use(express.static(path.join(__dirname, 'public')));

// rooms: { roomCode: { socketId: { username, socketId } } }
const rooms = {};
const messageState = {};

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentUsername = null;

  socket.on('join', ({ username, room }) => {
    currentRoom = room;
    currentUsername = username;

    socket.join(room);

    if (!rooms[room]) rooms[room] = {};
    rooms[room][socket.id] = { username, socketId: socket.id };

    const members = Object.values(rooms[room]).map(m => m.username);
    io.to(room).emit('members', members);
    io.to(room).emit('system', `${username} joined the room`);
  });

  socket.on('message', ({ text, type = 'text', imageUrl, timestamp, id }) => {
    if (!currentRoom) return;

    const messageId = id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    messageState[messageId] = {
      room: currentRoom,
      senderId: socket.id,
      readBy: new Set()
    };

    io.to(currentRoom).emit('message', {
      id: messageId,
      username: currentUsername,
      text,
      type,
      imageUrl,
      timestamp: timestamp || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    });
  });

  socket.on('message-read', ({ messageId, room }) => {
    if (!messageId || !currentRoom) return;
    const state = messageState[messageId];
    if (!state || state.room !== room || state.senderId === socket.id) return;

    state.readBy.add(socket.id);
    if (state.senderId) {
      io.to(state.senderId).emit('message-read', {
        messageId,
        username: currentUsername
      });
    }
  });
  socket.on('typing', () => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit('typing', { username: currentUsername });
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      delete rooms[currentRoom][socket.id];
      const members = Object.values(rooms[currentRoom]).map(m => m.username);
      if (members.length === 0) delete rooms[currentRoom];
      else {
        io.to(currentRoom).emit('members', members);
        io.to(currentRoom).emit('system', `${currentUsername} left the room`);
      }
    }
  });

  socket.on('leave', () => {
    if (currentRoom && rooms[currentRoom]) {
      delete rooms[currentRoom][socket.id];
      const members = Object.values(rooms[currentRoom]).map(m => m.username);
      socket.leave(currentRoom);
      if (members.length === 0) delete rooms[currentRoom];
      else {
        io.to(currentRoom).emit('members', members);
        io.to(currentRoom).emit('system', `${currentUsername} left the room`);
      }
      currentRoom = null;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});