const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT || 3000;

// Attach HTTP server so Socket.IO can share the same port as Express
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ─── WebRTC Signaling Namespace ───────────────────────────────────────────────
// Each appointment becomes a 2-person signaling room.
// Flow: doctor joins → parent joins → offer → answer → ICE exchange → P2P call
// ─────────────────────────────────────────────────────────────────────────────
const roomParticipants = new Map(); // roomId → Set of socket IDs

io.on('connection', (socket) => {
  console.log(`[WebRTC] Socket connected: ${socket.id}`);

  // ── Join a named room by appointmentId ──────────────────────────────────────
  socket.on('join-room', ({ roomId, userRole }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userRole = userRole;

    if (!roomParticipants.has(roomId)) roomParticipants.set(roomId, new Set());
    roomParticipants.get(roomId).add(socket.id);

    const peers = [...roomParticipants.get(roomId)].filter(id => id !== socket.id);
    console.log(`[WebRTC] ${userRole} joined room ${roomId}. Peers in room: ${peers.length}`);

    // Tell the newly joined peer about everyone already in the room
    socket.emit('room-peers', { peers });

    // Tell existing peers that someone new has arrived
    socket.to(roomId).emit('peer-joined', { socketId: socket.id, userRole });
  });

  // ── WebRTC Offer (Caller → Callee) ─────────────────────────────────────────
  socket.on('offer', ({ target, offer }) => {
    io.to(target).emit('offer', { from: socket.id, offer });
  });

  // ── WebRTC Answer (Callee → Caller) ────────────────────────────────────────
  socket.on('answer', ({ target, answer }) => {
    io.to(target).emit('answer', { from: socket.id, answer });
  });

  // ── ICE Candidate relay ─────────────────────────────────────────────────────
  socket.on('ice-candidate', ({ target, candidate }) => {
    io.to(target).emit('ice-candidate', { from: socket.id, candidate });
  });

  // ── Leave / End Call ────────────────────────────────────────────────────────
  socket.on('leave-room', ({ roomId }) => {
    cleanupSocket(socket, roomId);
    socket.to(roomId).emit('peer-left', { socketId: socket.id });
  });

  // ── Handle abrupt disconnects ───────────────────────────────────────────────
  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      cleanupSocket(socket, roomId);
      socket.to(roomId).emit('peer-left', { socketId: socket.id });
    }
    console.log(`[WebRTC] Socket disconnected: ${socket.id}`);
  });
});

function cleanupSocket(socket, roomId) {
  const participants = roomParticipants.get(roomId);
  if (participants) {
    participants.delete(socket.id);
    if (participants.size === 0) roomParticipants.delete(roomId);
  }
}

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode.`);
  console.log(`📡 Socket.IO signaling server active on port ${PORT}`);
});
