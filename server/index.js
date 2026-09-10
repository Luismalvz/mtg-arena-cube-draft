const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const draftManager = require('./gameLogic.js');
const cubeCards = require('./cubeData.js');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Broadcast private+public state to all players in a room
function broadcastRoomState(roomId) {
  const room = draftManager.getRoom(roomId);
  if (!room) return;

  for (const player of room.players) {
    if (player.socketId) {
      const clientState = draftManager.getClientRoomState(room, player.socketId);
      io.to(player.socketId).emit('room_state_update', clientState);
    }
  }
}

// REST Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    rooms: draftManager.rooms.size,
    cubeCardsCount: cubeCards.length
  });
});

app.get('/api/cube', (req, res) => {
  res.json({
    totalCards: cubeCards.length,
    sample: cubeCards.slice(0, 10)
  });
});

app.post('/api/export-tts', (req, res) => {
  const { picks } = req.body;
  if (!picks || !Array.isArray(picks)) {
    return res.status(400).json({ error: 'Invalid picks list' });
  }
  const textExport = draftManager.generateTTSExport(picks);
  res.json({
    textExport,
    cardCount: picks.length
  });
});

// Socket.io Handlers
io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // Create room
  socket.on('create_room', ({ roomId, playerName, options }) => {
    const cleanRoomId = (roomId || Math.random().toString(36).substring(2, 7)).toUpperCase();
    const room = draftManager.createRoom(cleanRoomId, playerName, socket.id, options);
    socket.join(cleanRoomId);
    console.log(`[Draft] Room created: ${cleanRoomId} by ${playerName || 'Host'}`);
    broadcastRoomState(cleanRoomId);
  });

  // Join room
  socket.on('join_room', ({ roomId, playerName }) => {
    const cleanRoomId = (roomId || '').toUpperCase().trim();
    const result = draftManager.joinRoom(cleanRoomId, playerName, socket.id);
    if (result.error) {
      return socket.emit('error_notification', { message: result.error });
    }
    socket.join(cleanRoomId);
    console.log(`[Draft] ${playerName} joined room ${cleanRoomId}`);
    broadcastRoomState(cleanRoomId);
  });

  // Update room settings (host only)
  socket.on('update_settings', ({ roomId, options }) => {
    const result = draftManager.updateSettings(roomId, socket.id, options);
    if (result.error) {
      return socket.emit('error_notification', { message: result.error });
    }
    broadcastRoomState(roomId);
  });

  // Start draft
  socket.on('start_draft', ({ roomId }) => {
    const result = draftManager.startDraft(roomId, socket.id);
    if (result.error) {
      return socket.emit('error_notification', { message: result.error });
    }
    console.log(`[Draft] Draft started for room ${roomId}`);
    io.to(roomId).emit('draft_started_announcement');
    broadcastRoomState(roomId);
  });

  // Interactive Arena Swap mechanic
  socket.on('swap_with_arena', ({ roomId, cardFromPackInstanceId, cardFromArenaInstanceId }) => {
    const result = draftManager.swapWithArena(
      roomId,
      socket.id,
      cardFromPackInstanceId,
      cardFromArenaInstanceId
    );

    if (result.error) {
      return socket.emit('swap_error', { message: result.error });
    }

    // Broadcast arena update to room with visual animation cue
    io.to(roomId).emit('arena_swapped', {
      logEntry: result.logEntry,
      arena: result.arena
    });

    // Broadcast full customized states so hand and arena stay 100% in sync
    broadcastRoomState(roomId);
  });

  // Select tentative pick
  socket.on('select_pick', ({ roomId, cardInstanceId }) => {
    const result = draftManager.selectPick(roomId, socket.id, cardInstanceId);
    if (result.error) {
      return socket.emit('error_notification', { message: result.error });
    }
    broadcastRoomState(roomId);
  });

  // Lock in pick
  socket.on('lock_pick', ({ roomId, cardInstanceId }) => {
    const result = draftManager.lockPick(roomId, socket.id, cardInstanceId);
    if (result.error) {
      return socket.emit('error_notification', { message: result.error });
    }

    if (result.allReady && result.rotationResult) {
      const rot = result.rotationResult;
      if (rot.type === 'turn_advanced') {
        io.to(roomId).emit('pick_step_completed', { pickNumber: rot.pickNumber });
      } else if (rot.type === 'round_advanced') {
        io.to(roomId).emit('round_advanced', { round: rot.round });
      } else if (rot.type === 'draft_complete') {
        io.to(roomId).emit('draft_completed');
      }
    }

    broadcastRoomState(roomId);
  });

  // Unlock pick
  socket.on('unlock_pick', ({ roomId }) => {
    const result = draftManager.unlockPick(roomId, socket.id);
    if (result.error) {
      return socket.emit('error_notification', { message: result.error });
    }
    broadcastRoomState(roomId);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    const removedInfo = draftManager.removePlayer(socket.id);
    if (removedInfo && !removedInfo.deleted && removedInfo.roomId) {
      broadcastRoomState(removedInfo.roomId);
    }
  });
});

// Serve static client build if available (production on Render)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// SPA fallback for all GET requests (compatible with Express 4 & 5)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/health') && !req.path.startsWith('/socket.io')) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  next();
});

server.listen(PORT, () => {
  console.log(`MTG Arena Cube Draft Server running on http://localhost:${PORT}`);
});
