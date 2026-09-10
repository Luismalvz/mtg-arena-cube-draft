const cubeCards = require('./cubeData.js');

class DraftManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId, hostName, hostSocketId, options = {}) {
    const defaultOptions = {
      packSize: 10,
      packCount: 3,
      arenaSize: 6,
      botCount: 3, // Defaults to 3 bots so solo user can draft immediately with 4 players total!
      timerSeconds: 45
    };

    const room = {
      id: roomId,
      hostId: hostSocketId,
      status: 'lobby', // 'lobby' | 'drafting' | 'complete'
      options: { ...defaultOptions, ...options },
      players: [],
      arena: [],
      currentRound: 1,
      currentPickNumber: 1,
      activityLog: [],
      isSwappingLock: false,
      timer: null,
      timeRemaining: 45
    };

    const host = {
      socketId: hostSocketId,
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      name: hostName || 'Host Drafter',
      isHost: true,
      isBot: false,
      ready: false,
      selectedPickId: null,
      activePack: [],
      unopenedPacks: [],
      draftPicks: []
    };

    room.players.push(host);
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId, playerName, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.status !== 'lobby') return { error: 'Draft already in progress' };

    const existing = room.players.find(p => p.socketId === socketId);
    if (existing) {
      existing.name = playerName;
      return { room, player: existing };
    }

    const player = {
      socketId,
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      name: playerName || `Drafter ${room.players.length + 1}`,
      isHost: false,
      isBot: false,
      ready: false,
      selectedPickId: null,
      activePack: [],
      unopenedPacks: [],
      draftPicks: []
    };

    room.players.push(player);
    return { room, player };
  }

  removePlayer(socketId) {
    for (const [roomId, room] of this.rooms.entries()) {
      const pIdx = room.players.findIndex(p => p.socketId === socketId);
      if (pIdx !== -1) {
        const removed = room.players[pIdx];
        if (room.status === 'lobby') {
          room.players.splice(pIdx, 1);
          if (room.players.length === 0) {
            this.rooms.delete(roomId);
            return { roomId, deleted: true };
          }
          if (removed.isHost && room.players.length > 0) {
            room.players[0].isHost = true;
            room.hostId = room.players[0].socketId;
          }
          return { roomId, room, removed };
        } else {
          // If in game, turn player into a bot
          removed.isBot = true;
          removed.socketId = null;
          return { roomId, room, botConverted: removed };
        }
      }
    }
    return null;
  }

  updateSettings(roomId, socketId, newOptions) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.hostId !== socketId) return { error: 'Only host can change settings' };
    if (room.status !== 'lobby') return { error: 'Cannot change settings during draft' };

    room.options = { ...room.options, ...newOptions };
    return { room };
  }

  startDraft(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.hostId !== socketId) return { error: 'Only host can start draft' };
    if (room.status !== 'lobby') return { error: 'Draft already started' };

    // Add bots if requested
    const humanCount = room.players.filter(p => !p.isBot).length;
    const botsNeeded = Math.max(0, room.options.botCount || 0);

    // Clean out any leftover bots from previous config
    room.players = room.players.filter(p => !p.isBot);
    const botNames = ['Jace Bot', 'Chandra Bot', 'Liliana Bot', 'Garruk Bot', 'Teferi Bot', 'Nicol Bot', 'Karn Bot'];
    for (let i = 0; i < botsNeeded; i++) {
      room.players.push({
        socketId: null,
        id: 'bot_' + (i + 1),
        name: botNames[i % botNames.length] + ` #${i + 1}`,
        isHost: false,
        isBot: true,
        ready: false,
        selectedPickId: null,
        activePack: [],
        unopenedPacks: [],
        draftPicks: []
      });
    }

    const totalDrafters = room.players.length;
    const cardsNeeded = (totalDrafters * room.options.packCount * room.options.packSize) + room.options.arenaSize;

    // Create a rich shuffled pool with duplicates if needed for draft size
    let pool = [];
    while (pool.length < cardsNeeded) {
      const copy = [...cubeCards].sort(() => Math.random() - 0.5);
      pool = pool.concat(copy);
    }
    pool = pool.sort(() => Math.random() - 0.5);

    // Helper to generate a card with instanceId
    let instCounter = 0;
    const makeInstance = (card) => ({
      ...card,
      instanceId: `${card.id || 'c'}_inst_${Date.now()}_${++instCounter}`
    });

    // Populate Central Arena
    room.arena = [];
    for (let i = 0; i < room.options.arenaSize; i++) {
      room.arena.push(makeInstance(pool.pop()));
    }

    // Populate packs for each player
    for (const player of room.players) {
      player.activePack = [];
      player.unopenedPacks = [];
      player.draftPicks = [];
      player.ready = false;
      player.selectedPickId = null;

      for (let p = 0; p < room.options.packCount; p++) {
        const pack = [];
        for (let c = 0; c < room.options.packSize; c++) {
          pack.push(makeInstance(pool.pop()));
        }
        if (p === 0) {
          player.activePack = pack;
        } else {
          player.unopenedPacks.push(pack);
        }
      }
    }

    room.status = 'drafting';
    room.currentRound = 1;
    room.currentPickNumber = 1;
    room.timeRemaining = room.options.timerSeconds;
    room.activityLog = [
      {
        id: 'log_' + Date.now(),
        type: 'system',
        text: `Draft started! Round 1 (Pack 1) begins with ${room.arena.length} cards in the Arena.`
      }
    ];

    // Trigger initial bot picks in background
    this.processBotPicks(room);

    return { room };
  }

  swapWithArena(roomId, socketId, cardFromPackInstanceId, cardFromArenaInstanceId) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.status !== 'drafting') return { error: 'Draft is not active' };

    // Concurrency check
    if (room.isSwappingLock) {
      return { error: 'Arena is currently busy processing another swap, please retry' };
    }

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return { error: 'Player not found' };
    if (player.ready) return { error: 'Cannot swap cards while your pick is locked. Unlock pick first.' };

    room.isSwappingLock = true;
    try {
      const packCardIndex = player.activePack.findIndex(c => c.instanceId === cardFromPackInstanceId);
      if (packCardIndex === -1) {
        return { error: 'Card not found in your current pack' };
      }

      const arenaCardIndex = room.arena.findIndex(c => c.instanceId === cardFromArenaInstanceId);
      if (arenaCardIndex === -1) {
        return { error: 'This card was already claimed by another player in the Arena!' };
      }

      // Execute Atomic Swap
      const cardFromPack = player.activePack[packCardIndex];
      const cardFromArena = room.arena[arenaCardIndex];

      player.activePack[packCardIndex] = cardFromArena;
      room.arena[arenaCardIndex] = cardFromPack;

      // Log event
      const logEntry = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        type: 'swap',
        playerName: player.name,
        cardGiven: cardFromPack.name,
        cardTaken: cardFromArena.name,
        text: `${player.name} swapped [${cardFromPack.name}] for [${cardFromArena.name}] in the Arena!`
      };
      room.activityLog.unshift(logEntry);
      if (room.activityLog.length > 30) room.activityLog.pop();

      return {
        success: true,
        player,
        arena: room.arena,
        logEntry
      };
    } finally {
      room.isSwappingLock = false;
    }
  }

  selectPick(roomId, socketId, cardInstanceId) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.status !== 'drafting') return { error: 'Draft is not active' };

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return { error: 'Player not found' };

    const card = player.activePack.find(c => c.instanceId === cardInstanceId);
    if (!card) return { error: 'Selected card is not in current pack' };

    player.selectedPickId = cardInstanceId;
    return { success: true, player };
  }

  lockPick(roomId, socketId, cardInstanceId) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.status !== 'drafting') return { error: 'Draft is not active' };

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return { error: 'Player not found' };

    const targetId = cardInstanceId || player.selectedPickId;
    const card = player.activePack.find(c => c.instanceId === targetId);
    if (!card) return { error: 'No valid card chosen to lock pick' };

    player.selectedPickId = targetId;
    player.ready = true;

    // Check if all players (humans and bots) are ready
    const allReady = room.players.every(p => p.ready);
    let rotationResult = null;

    if (allReady) {
      rotationResult = this.completePickStep(room);
    }

    return { success: true, player, allReady, rotationResult };
  }

  unlockPick(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.status !== 'drafting') return { error: 'Draft is not active' };

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return { error: 'Player not found' };

    player.ready = false;
    return { success: true, player };
  }

  processBotPicks(room) {
    for (const player of room.players) {
      if (player.isBot && !player.ready && player.activePack.length > 0) {
        // AI heuristic: 
        // 10% chance to swap with arena if arena card has higher rarity or power
        if (Math.random() < 0.15 && room.arena.length > 0 && !room.isSwappingLock) {
          const packCard = player.activePack[Math.floor(Math.random() * player.activePack.length)];
          const arenaCard = room.arena[Math.floor(Math.random() * room.arena.length)];
          // Swap
          const pIdx = player.activePack.indexOf(packCard);
          const aIdx = room.arena.indexOf(arenaCard);
          if (pIdx !== -1 && aIdx !== -1) {
            player.activePack[pIdx] = arenaCard;
            room.arena[aIdx] = packCard;
            room.activityLog.unshift({
              id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
              type: 'swap',
              playerName: player.name,
              cardGiven: packCard.name,
              cardTaken: arenaCard.name,
              text: `${player.name} swapped [${packCard.name}] for [${arenaCard.name}] in the Arena!`
            });
          }
        }

        // Pick highest CMC or random card
        const sorted = [...player.activePack].sort((a, b) => (b.cmc || 0) - (a.cmc || 0));
        player.selectedPickId = sorted[0].instanceId;
        player.ready = true;
      }
    }
  }

  completePickStep(room) {
    // 1. Move selected cards to draftPicks
    for (const player of room.players) {
      const pickIdx = player.activePack.findIndex(c => c.instanceId === player.selectedPickId);
      if (pickIdx !== -1) {
        const picked = player.activePack.splice(pickIdx, 1)[0];
        player.draftPicks.push(picked);
      } else if (player.activePack.length > 0) {
        // Fallback pick
        const picked = player.activePack.pop();
        player.draftPicks.push(picked);
      }
      player.ready = false;
      player.selectedPickId = null;
    }

    // Check if current packs are now empty
    const packEmpty = room.players[0].activePack.length === 0;

    if (packEmpty) {
      // Advance to next pack round or complete draft
      if (room.currentRound < room.options.packCount) {
        room.currentRound += 1;
        room.currentPickNumber = 1;

        for (const player of room.players) {
          player.activePack = player.unopenedPacks.shift() || [];
        }

        room.activityLog.unshift({
          id: 'log_' + Date.now(),
          type: 'round',
          text: `Pack ${room.currentRound - 1} completed! Round ${room.currentRound} (Pack ${room.currentRound}) begins!`
        });

        this.processBotPicks(room);
        return { type: 'round_advanced', round: room.currentRound };
      } else {
        // Draft Complete!
        room.status = 'complete';
        room.activityLog.unshift({
          id: 'log_' + Date.now(),
          type: 'complete',
          text: `Draft complete! All 3 packs have been drafted.`
        });
        return { type: 'draft_complete' };
      }
    } else {
      // Rotate active packs between players
      // Round 1 and 3 pass left (clockwise), Round 2 passes right (counter-clockwise)
      const passDirection = (room.currentRound % 2 === 1) ? 'left' : 'right';
      const n = room.players.length;
      const packs = room.players.map(p => p.activePack);

      for (let i = 0; i < n; i++) {
        if (passDirection === 'left') {
          // P[i] receives pack from P[(i - 1 + n) % n]
          room.players[i].activePack = packs[(i - 1 + n) % n];
        } else {
          // P[i] receives pack from P[(i + 1) % n]
          room.players[i].activePack = packs[(i + 1) % n];
        }
      }

      room.currentPickNumber += 1;
      this.processBotPicks(room);
      return { type: 'turn_advanced', pickNumber: room.currentPickNumber };
    }
  }

  generateTTSExport(draftPicks) {
    // Generates Plaintext format for Tabletop Simulator card importers
    // e.g.:
    // 1 Lightning Bolt
    // 1 Counterspell
    const counts = {};
    for (const card of draftPicks) {
      const name = card.name || 'Unknown Card';
      counts[name] = (counts[name] || 0) + 1;
    }

    const lines = Object.entries(counts).map(([name, count]) => `${count} ${name}`);
    return lines.join('\n');
  }

  getClientRoomState(room, clientSocketId) {
    const player = room.players.find(p => p.socketId === clientSocketId);
    return {
      id: room.id,
      status: room.status,
      options: room.options,
      currentRound: room.currentRound,
      currentPickNumber: room.currentPickNumber,
      arena: room.arena,
      activityLog: room.activityLog,
      isHost: player ? player.isHost : false,
      playerList: room.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isBot: p.isBot,
        ready: p.ready,
        picksCount: p.draftPicks.length,
        packCount: p.activePack.length
      })),
      me: player ? {
        id: player.id,
        name: player.name,
        isHost: player.isHost,
        ready: player.ready,
        selectedPickId: player.selectedPickId,
        activePack: player.activePack,
        draftPicks: player.draftPicks
      } : null
    };
  }
}

module.exports = new DraftManager();
