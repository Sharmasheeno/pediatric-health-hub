const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const env = require('./config/env');
const app = require('./app');
const { verifyToken } = require('./utils/jwtHelper');
const prisma = new PrismaClient();
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...env.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
];

const PORT = env.PORT || 3000;

// Attach HTTP server so Socket.IO can share the same port as Express
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Signaling carries private call metadata, so only active, authenticated users
// may connect. Appointment ownership is checked again when the room is joined.
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const decoded = token && verifyToken(token);
    if (!decoded?.id) return next(new Error('Authentication required'));

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, isActive: true, deletedAt: true }
    });
    if (!user || !user.isActive || user.deletedAt) return next(new Error('Account is unavailable'));

    socket.data.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    next(new Error('Unable to authenticate signaling connection'));
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
  socket.on('join-room', async ({ roomId, userRole } = {}) => {
    try {
      if (!roomId || userRole !== socket.data.user.role) {
        socket.emit('room-error', { message: 'Your account cannot join this call.' });
        return;
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id: roomId },
        include: { doctor: true, child: { include: { parent: true } }, teleconsultation: true }
      });
      if (!appointment || appointment.deletedAt || !appointment.teleconsultation || appointment.teleconsultation.endedAt) {
        socket.emit('room-error', { message: 'This call is not active.' });
        return;
      }

      const user = socket.data.user;
      const isAppointmentParent = user.role === 'PARENT' && appointment.child.parent.userId === user.id;
      const isAppointmentDoctor = user.role === 'DOCTOR' && appointment.doctor.userId === user.id;
      const isAuthorizedAdmin = user.role === 'ADMIN';
      if (!isAppointmentParent && !isAppointmentDoctor && !isAuthorizedAdmin) {
        socket.emit('room-error', { message: 'You are not a participant in this appointment.' });
        return;
      }

      if (!roomParticipants.has(roomId)) roomParticipants.set(roomId, new Set());
      const participants = roomParticipants.get(roomId);
      if (participants.size >= 2 || [...participants].some(id => io.sockets.sockets.get(id)?.data.user.id === user.id)) {
        socket.emit('room-error', { message: 'This call already has its allowed participants.' });
        return;
      }

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.userRole = userRole;
      participants.add(socket.id);

      const peers = [...participants].filter(id => id !== socket.id);
      console.log(`[WebRTC] ${userRole} joined an authorized appointment room. Peers in room: ${peers.length}`);

      socket.emit('room-peers', { peers });
      socket.to(roomId).emit('peer-joined', { socketId: socket.id, userRole });
    } catch (error) {
      console.error('[WebRTC] Unable to join call room:', error.message);
      socket.emit('room-error', { message: 'Unable to join this call.' });
    }
  });

  // ── WebRTC Offer (Caller → Callee) ─────────────────────────────────────────
  socket.on('offer', ({ target, offer }) => {
    relayToRoomPeer(socket, target, 'offer', { from: socket.id, offer });
  });

  // ── WebRTC Answer (Callee → Caller) ────────────────────────────────────────
  socket.on('answer', ({ target, answer }) => {
    relayToRoomPeer(socket, target, 'answer', { from: socket.id, answer });
  });

  // ── ICE Candidate relay ─────────────────────────────────────────────────────
  socket.on('ice-candidate', ({ target, candidate }) => {
    relayToRoomPeer(socket, target, 'ice-candidate', { from: socket.id, candidate });
  });

  // ── Leave / End Call ────────────────────────────────────────────────────────
  socket.on('leave-room', ({ roomId } = {}) => {
    if (!socket.data.roomId || roomId !== socket.data.roomId) return;
    cleanupSocket(socket, roomId);
    socket.data.roomId = null;
    socket.data.userRole = null;
    socket.leave(roomId);
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

function relayToRoomPeer(socket, target, event, payload) {
  const peer = io.sockets.sockets.get(target);
  if (!socket.data.roomId || !peer || peer.data.roomId !== socket.data.roomId) return;
  peer.emit(event, payload);
}

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
