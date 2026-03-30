const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname, 'public')));

// rooms: { roomCode: { socketId: { username, socketId } } }
const rooms = {};

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

  socket.on('message', ({ text }) => {
    if (!currentRoom) return;
    io.to(currentRoom).emit('message', {
      username: currentUsername,
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    });
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