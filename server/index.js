const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const gameManager = require('./gameManager.js');
const cubeCards = require('./cube360.json');

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

// Broadcast tailored state to every connected player in a room
function broadcastRoomState(roomId) {
  const room = gameManager.getRoom(roomId);
  if (!room) return;

  const playerSockets = new Set();
  for (const player of room.players) {
    if (player.socketId) {
      playerSockets.add(player.socketId);
      const clientState = gameManager.getClientState(room, player.socketId);
      io.to(player.socketId).emit('room_state_update', clientState);
    }
  }

  // Also broadcast spectator/guest state to any connected sockets who haven't taken a seat yet
  const spectatorState = gameManager.getClientState(room, null);
  io.to(roomId).except(Array.from(playerSockets)).emit('room_state_update', spectatorState);
}

// Manage turn timer for active decision phase
function startDecisionTimer(roomId) {
  const room = gameManager.getRoom(roomId);
  if (!room) return;

  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }

  if (!room.config.timerSeconds || room.config.timerSeconds <= 0) {
    return; // Infinite timer
  }

  room.timerRemaining = room.config.timerSeconds;

  room.timerInterval = setInterval(() => {
    if (!room || room.status !== 'decision_phase') {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
      return;
    }

    room.timerRemaining -= 1;
    io.to(roomId).emit('timer_tick', { timerRemaining: room.timerRemaining });

    if (room.timerRemaining <= 0) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;

      // Force-pick Action A for anyone who has not confirmed
      for (const player of room.players) {
        if (!player.isReady && player.activePack.length > 0) {
          player.pendingDecision = {
            type: 'pick',
            cardInstanceId: player.activePack[0].instanceId,
            cardName: player.activePack[0].name
          };
          player.isReady = true;
        }
      }

      // Trigger resolution phase
      handleResolutionChain(roomId);
    }
  }, 1000);
}

// Sequentially resolve Priority Swaps in the Getaway Plaza
function handleResolutionChain(roomId) {
  const room = gameManager.getRoom(roomId);
  if (!room) return;

  const res = gameManager.startResolutionPhase(room);
  broadcastRoomState(roomId);

  processNextResolutionStep(roomId, res);
}

function processNextResolutionStep(roomId, stepResult) {
  const room = gameManager.getRoom(roomId);
  if (!room) return;

  if (!stepResult) {
    broadcastRoomState(roomId);
    return;
  }

  if (stepResult.type === 'swap_resolved') {
    // Broadcast animated swap event to all players
    io.to(roomId).emit('swap_animation_event', {
      playerId: stepResult.player.id,
      playerName: stepResult.player.name,
      seatIndex: stepResult.player.seatIndex,
      offerCard: stepResult.offerCard,
      plazaCard: stepResult.plazaCard,
      swapLog: stepResult.swapLog
    });

    broadcastRoomState(roomId);

    // Wait 1.5s for dramatic animation before resolving next priority player
    setTimeout(() => {
      const nextStep = gameManager.stepResolutionQueue(room);
      processNextResolutionStep(roomId, nextStep);
    }, 1500);
  } else if (stepResult.type === 'swap_conflict') {
    // Notify the conflicting player to choose replacement or normal pick
    io.to(stepResult.socketId).emit('swap_conflict_prompt', {
      message: stepResult.message,
      plaza: room.getawayPlaza
    });
    broadcastRoomState(roomId);
  } else if (stepResult.type === 'pick_step_completed') {
    io.to(roomId).emit('pick_step_advanced', { pickNumber: stepResult.pickNumber });
    broadcastRoomState(roomId);
    startDecisionTimer(roomId);
  } else if (stepResult.type === 'round_advanced') {
    io.to(roomId).emit('round_advanced', { round: stepResult.round });
    broadcastRoomState(roomId);
    // startDecisionTimer(roomId); removed for AUD-004, timer starts when packs are opened
  } else if (stepResult.type === 'draft_complete') {
    io.to(roomId).emit('draft_completed');
    broadcastRoomState(roomId);
  }
}

// REST Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    rooms: gameManager.rooms.size,
    cubeCardsCount: cubeCards.length
  });
});

app.get('/api/cube', (req, res) => {
  res.json({
    totalCards: cubeCards.length,
    sample: cubeCards.slice(0, 10)
  });
});

app.get('/api/pack-limits', (req, res) => {
  const players = parseInt(req.query.players) || 4;
  res.json(gameManager.getPackLimits(players));
});

app.post('/api/export-tts', (req, res) => {
  const { picks } = req.body;
  if (!picks || !Array.isArray(picks)) {
    return res.status(400).json({ error: 'Invalid picks list' });
  }
  const textExport = gameManager.generateTTSExport(picks);
  res.json({
    textExport,
    cardCount: picks.length
  });
});

// Socket.io Handlers
io.on('connection', (socket) => {
  console.log(`[Socket] Conectado: ${socket.id}`);

  socket.on('create_room', (payload) => {
    try {
      const { roomId, playerName, avatar, options, playerId } = payload || {};
      let cleanRoomId = (roomId || Math.random().toString(36).substring(2, 7)).toUpperCase();
      
      if (!roomId) {
        while (gameManager.rooms.has(cleanRoomId)) {
          cleanRoomId = Math.random().toString(36).substring(2, 7).toUpperCase();
        }
      } else if (gameManager.rooms.has(cleanRoomId)) {
        return socket.emit('error_notification', { message: 'La sala ya existe' });
      }

      const room = gameManager.createRoom(cleanRoomId, playerName, socket.id, { ...options, avatar, playerId });
      if (room.error) return socket.emit('error_notification', { message: room.error });
      socket.join(cleanRoomId);
      console.log(`[Getaway Draft] Sala creada: ${cleanRoomId} por ${playerName}`);
      broadcastRoomState(cleanRoomId);
    } catch (e) { console.error(e); }
  });

  socket.on('join_room', (payload) => {
    try {
      const { roomId, playerName, avatar, playerId } = payload || {};
      const cleanRoomId = (roomId || '').toUpperCase().trim();
      const result = gameManager.joinRoom(cleanRoomId, playerName, socket.id, avatar, playerId);
      if (result.error) {
        return socket.emit('error_notification', { message: result.error });
      }
      socket.join(cleanRoomId);
      console.log(`[Getaway Draft] ${playerName} unido a sala ${cleanRoomId}`);
      broadcastRoomState(cleanRoomId);
    } catch (e) { console.error(e); }
  });

  socket.on('update_config', (payload) => {
    try {
      const { roomId, config } = payload || {};
      const result = gameManager.updateConfig(roomId, socket.id, config);
      if (result.error) {
        return socket.emit('error_notification', { message: result.error });
      }
      broadcastRoomState(roomId);
    } catch (e) { console.error(e); }
  });

  socket.on('randomize_seating', (payload) => {
    try {
      const { roomId } = payload || {};
      const result = gameManager.randomizeSeating(roomId, socket.id);
      if (result.error) {
        return socket.emit('error_notification', { message: result.error });
      }
      io.to(roomId).emit('seating_randomized');
      broadcastRoomState(roomId);
    } catch (e) { console.error(e); }
  });

  socket.on('get_room_state', (payload) => {
    try {
      const { roomId, playerId } = payload || {};
      const cleanRoomId = (roomId || '').toUpperCase().trim();
      const room = gameManager.getRoom(cleanRoomId);
      if (room) {
        if (playerId) {
          const p = room.players.find(player => player.id === playerId);
          if (p && (p.isBot || p.socketId !== socket.id)) {
            p.socketId = socket.id;
            p.isBot = false;
          }
        }
        socket.join(cleanRoomId);
        const clientState = gameManager.getClientState(room, socket.id);
        socket.emit('room_state_update', clientState);
      } else {
        socket.emit('room_not_found', { roomId: cleanRoomId });
      }
    } catch (e) { console.error(e); }
  });

  socket.on('start_draft', (payload) => {
    try {
      const { roomId } = payload || {};
      const result = gameManager.startDraft(roomId, socket.id);
      if (result.error) {
        return socket.emit('error_notification', { message: result.error });
      }
      console.log(`[Getaway Draft] Draft iniciado en sala ${roomId}`);
      io.to(roomId).emit('draft_started');
      broadcastRoomState(roomId);
      // startDecisionTimer(roomId); // Removed for AUD-004
    } catch (e) { console.error(e); }
  });

  socket.on('open_pack', (payload) => {
    try {
      const { roomId } = payload || {};
      const result = gameManager.openPack(roomId, socket.id);
      if (result.error) {
        return socket.emit('error_notification', { message: result.error });
      }
      broadcastRoomState(roomId);
      if (result.allOpened) {
        io.to(roomId).emit('all_packs_opened');
        startDecisionTimer(roomId);
      }
    } catch (e) { console.error(e); }
  });

  socket.on('submit_decision', (payload) => {
    try {
      const { roomId, decision } = payload || {};
      const result = gameManager.submitDecision(roomId, socket.id, decision);
      if (result.error) {
        return socket.emit('error_notification', { message: result.error });
      }

      broadcastRoomState(roomId);

      if (result.allReady) {
        const room = gameManager.getRoom(roomId);
        if (room && room.timerInterval) {
          clearInterval(room.timerInterval);
          room.timerInterval = null;
        }
        handleResolutionChain(roomId);
      }
    } catch (e) { console.error(e); }
  });
  
  socket.on('cancel_decision', (payload) => {
    try {
      const { roomId } = payload || {};
      const result = gameManager.cancelDecision(roomId, socket.id);
      if (result.error) {
        return socket.emit('error_notification', { message: result.error });
      }
      broadcastRoomState(roomId);
    } catch (e) { console.error(e); }
  });

  socket.on('resolve_swap_conflict', (payload) => {
    try {
      const { roomId, resolution } = payload || {};
      const nextStep = gameManager.resolveSwapConflict(roomId, socket.id, resolution);
      if (nextStep && nextStep.error) {
        return socket.emit('error_notification', { message: nextStep.error });
      }
      processNextResolutionStep(roomId, nextStep);
    } catch (e) { console.error(e); }
  });

  socket.on('disconnect', () => {
    try {
      for (const [roomId, room] of gameManager.rooms.entries()) {
        const p = room.players.find(player => player.socketId === socket.id);
        if (p) {
          if (room.status === 'lobby') {
            room.players = room.players.filter(player => player.socketId !== socket.id);
            if (room.players.length === 0) {
              gameManager.rooms.delete(roomId);
              gameManager.saveState();
            } else if (p.isAdmin) {
              room.players[0].isAdmin = true;
              room.adminId = room.players[0].socketId;
            }
          } else {
            p.isBot = true;
            p.socketId = null;
          }
          broadcastRoomState(roomId);
        }
      }
    } catch (e) { console.error(e); }
  });
});

// Serve static client build if available (production on Render)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// SPA fallback for all GET requests
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/health') && !req.path.startsWith('/socket.io')) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  next();
});

server.listen(PORT, () => {
  console.log(`MTG Getaway Draft Server running on http://localhost:${PORT}`);
});
