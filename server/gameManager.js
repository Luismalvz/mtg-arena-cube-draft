const cubeCards = require('./ravnicaCube.json');
const plazaCards = require('./plazaCards.json');

const PLAZA_SLOT_DEFS = [
  { id: 'colossus_left', name: 'Gate Colossus', guild: 'Colorless', type: 'flank', colors: [] },
  { id: 'azorius', name: 'Senado Azorius', guild: 'Azorius', type: 'guild', colors: ['W', 'U'] },
  { id: 'dimir', name: 'Casa Dimir', guild: 'Dimir', type: 'guild', colors: ['U', 'B'] },
  { id: 'rakdos', name: 'Culto de Rakdos', guild: 'Rakdos', type: 'guild', colors: ['B', 'R'] },
  { id: 'gruul', name: 'Clanes Gruul', guild: 'Gruul', type: 'guild', colors: ['R', 'G'] },
  { id: 'selesnya', name: 'Cónclave Selesnya', guild: 'Selesnya', type: 'guild', colors: ['G', 'W'] },
  { id: 'orzhov', name: 'Sindicato Orzhov', guild: 'Orzhov', type: 'guild', colors: ['W', 'B'] },
  { id: 'izzet', name: 'Liga Izzet', guild: 'Izzet', type: 'guild', colors: ['U', 'R'] },
  { id: 'golgari', name: 'Enjambre Golgari', guild: 'Golgari', type: 'guild', colors: ['B', 'G'] },
  { id: 'boros', name: 'Legión Boros', guild: 'Boros', type: 'guild', colors: ['R', 'W'] },
  { id: 'simic', name: 'Combinado Simic', guild: 'Simic', type: 'guild', colors: ['G', 'U'] },
  { id: 'colossus_right', name: 'Gate Colossus', guild: 'Colorless', type: 'flank', colors: [] }
];

class GameManager {
  constructor() {
    this.rooms = new Map();
  }

  // Calculate dynamic pack bounds based on 360-card cube and player count
  getPackLimits(playerCount) {
    const minPacks = 3;
    const maxPacks = Math.max(3, Math.floor(360 / (playerCount * 15)));
    return { minPacks, maxPacks };
  }

  createRoom(roomId, adminName, adminSocketId, options = {}) {
    const playerCount = Math.min(8, Math.max(2, options.playerCount || 4));
    const limits = this.getPackLimits(playerCount);
    const packCount = Math.min(limits.maxPacks, Math.max(limits.minPacks, options.packCount || 3));

    const room = {
      id: roomId,
      adminId: adminSocketId,
      status: 'lobby', // 'lobby' | 'pack_opening' | 'decision_phase' | 'resolution_phase' | 'complete'
      config: {
        playerCount: playerCount,
        packCount: packCount,
        minPacks: limits.minPacks,
        maxPacks: limits.maxPacks,
        timerSeconds: options.timerSeconds !== undefined ? options.timerSeconds : 45, // 0 = infinite
        plazaSize: 32
      },
      players: [],
      seatingOrder: [], // Player IDs in seated order
      getawayPlaza: [],
      plazaSlots: [],
      cubePool: [],
      currentRound: 1, // Pack number
      currentPickNumber: 1,
      passDirection: 'clockwise',
      resolutionQueue: [], // Array of player IDs resolving swaps in priority order
      currentResolvingPlayerId: null,
      activityLog: [],
      timerRemaining: options.timerSeconds || 45,
      timerInterval: null
    };

    const admin = {
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      socketId: adminSocketId,
      name: adminName || 'Admin Drafter',
      isAdmin: true,
      isBot: false,
      seatIndex: 0,
      activePack: [],
      unopenedPacks: [],
      draftPicks: [],
      pendingDecision: null, // { type: 'pick'|'swap', cardInstanceId, offerCardInstanceId, targetPlazaInstanceId }
      isReady: false,
      packOpened: false
    };

    room.players.push(admin);
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId, playerName, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Sala no encontrada' };
    if (room.status !== 'lobby') return { error: 'El draft ya ha comenzado' };

    const existing = room.players.find(p => p.socketId === socketId);
    if (existing) {
      existing.name = playerName;
      return { room, player: existing };
    }

    if (room.players.length >= room.config.playerCount) {
      return { error: `La sala está llena (máximo ${room.config.playerCount} jugadores)` };
    }

    const player = {
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      socketId,
      name: playerName || `Jugador ${room.players.length + 1}`,
      isAdmin: false,
      isBot: false,
      seatIndex: room.players.length,
      activePack: [],
      unopenedPacks: [],
      draftPicks: [],
      pendingDecision: null,
      isReady: false,
      packOpened: false
    };

    room.players.push(player);
    return { room, player };
  }

  updateConfig(roomId, socketId, newConfig) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Sala no encontrada' };
    if (room.adminId !== socketId) return { error: 'Solo el anfitrión puede cambiar la configuración' };
    if (room.status !== 'lobby') return { error: 'No se puede modificar durante el draft' };

    if (newConfig.playerCount) {
      room.config.playerCount = Math.min(8, Math.max(2, newConfig.playerCount));
      const limits = this.getPackLimits(room.config.playerCount);
      room.config.minPacks = limits.minPacks;
      room.config.maxPacks = limits.maxPacks;
      if (room.config.packCount > limits.maxPacks) room.config.packCount = limits.maxPacks;
      if (room.config.packCount < limits.minPacks) room.config.packCount = limits.minPacks;
    }

    if (newConfig.packCount) {
      room.config.packCount = Math.min(room.config.maxPacks, Math.max(room.config.minPacks, newConfig.packCount));
    }

    if (newConfig.timerSeconds !== undefined) {
      room.config.timerSeconds = newConfig.timerSeconds;
      room.timerRemaining = newConfig.timerSeconds;
    }

    return { room };
  }

  randomizeSeating(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Sala no encontrada' };
    if (room.adminId !== socketId) return { error: 'Solo el anfitrión puede reorganizar los asientos' };
    if (room.status !== 'lobby') return { error: 'El draft ya ha comenzado' };

    room.players = room.players.sort(() => Math.random() - 0.5);
    room.players.forEach((p, idx) => {
      p.seatIndex = idx;
    });
    room.seatingOrder = room.players.map(p => p.id);

    return { room };
  }

  startDraft(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Sala no encontrada' };
    if (room.adminId !== socketId) return { error: 'Solo el anfitrión puede iniciar el draft' };
    if (room.status !== 'lobby') return { error: 'El draft ya ha comenzado' };

    // Fill remaining spots with AI bots if player count not reached
    const humanCount = room.players.filter(p => !p.isBot).length;
    const botsNeeded = Math.max(0, room.config.playerCount - humanCount);

    const botNames = ['Jace AI', 'Chandra AI', 'Liliana AI', 'Garruk AI', 'Teferi AI', 'Nicol AI', 'Karn AI'];
    for (let i = 0; i < botsNeeded; i++) {
      room.players.push({
        id: 'bot_' + (i + 1) + '_' + Math.random().toString(36).substring(2, 6),
        socketId: null,
        name: botNames[i % botNames.length],
        isAdmin: false,
        isBot: true,
        seatIndex: room.players.length,
        activePack: [],
        unopenedPacks: [],
        draftPicks: [],
        pendingDecision: null,
        isReady: false,
        packOpened: true
      });
    }

    // 1. Finalize player seating / priority turn order
    room.players.forEach((p, idx) => {
      p.seatIndex = idx;
    });
    room.seatingOrder = room.players.map(p => p.id);

    // 2. Prepare card instances with unique instanceId
    let instId = 0;
    const makeInstance = (c) => ({
      ...c,
      instanceId: `inst_${c.id || 'card'}_${Date.now()}_${++instId}`
    });

    // 3. Separate Fixers (10 Signets + 20 Guildgates = 30 total) from General cards
    const fixerCards = cubeCards.filter(c => c.isFixer).map(makeInstance);
    const generalCards = cubeCards.filter(c => !c.isFixer).map(makeInstance);

    const shuffledFixers = [...fixerCards].sort(() => Math.random() - 0.5);
    const shuffledGeneral = [...generalCards].sort(() => Math.random() - 0.5);

    // 4. Calculate total booster packs needed in this draft
    const totalPacksNeeded = room.players.length * room.config.packCount;
    const baseFixersPerPack = Math.floor(shuffledFixers.length / totalPacksNeeded);

    // Initialize all pack slots
    const packs = Array.from({ length: totalPacksNeeded }, () => []);

    // Evenly distribute guaranteed fixers into each pack
    for (let i = 0; i < totalPacksNeeded; i++) {
      for (let f = 0; f < baseFixersPerPack; f++) {
        if (shuffledFixers.length > 0) {
          packs[i].push(shuffledFixers.pop());
        }
      }
    }

    // Remainder fixers that could not be divided evenly go back into the general pool to be randomly distributed
    if (shuffledFixers.length > 0) {
      shuffledGeneral.push(...shuffledFixers);
      shuffledGeneral.sort(() => Math.random() - 0.5);
    }

    // 5. Initialize Getaway Plaza with 12 slots: 10 guild piles (3 cards each) + 2 Gate Colossus flanks (1 card each)
    const slotMap = new Map();
    PLAZA_SLOT_DEFS.forEach(def => {
      slotMap.set(def.id, {
        ...def,
        cards: []
      });
    });

    let colossusCount = 0;
    for (const rawCard of plazaCards) {
      const card = makeInstance(rawCard);
      if (card.name === 'Gate Colossus') {
        const slotId = colossusCount === 0 ? 'colossus_left' : 'colossus_right';
        card.slotId = slotId;
        slotMap.get(slotId).cards.push(card);
        colossusCount++;
      } else {
        for (const def of PLAZA_SLOT_DEFS) {
          if (def.type === 'guild') {
            const matchesGuild = card.name.toLowerCase().includes(def.guild.toLowerCase()) ||
              (def.guild === 'Rakdos' && card.name.includes('Rix Maadi')) ||
              (def.guild === 'Gruul' && card.name.includes('Skarrg')) ||
              (def.guild === 'Selesnya' && card.name.includes('Vitu-Ghazi')) ||
              (def.guild === 'Golgari' && card.name.includes('Svogthos')) ||
              (def.guild === 'Simic' && card.name.includes('Novijen'));
            if (matchesGuild) {
              card.slotId = def.id;
              slotMap.get(def.id).cards.push(card);
              break;
            }
          }
        }
      }
    }

    // Shuffle within each guild pile so top card is varied
    for (const slot of slotMap.values()) {
      slot.cards.sort(() => Math.random() - 0.5);
    }

    room.plazaSlots = Array.from(slotMap.values());
    room.getawayPlaza = room.plazaSlots.flatMap(s => s.cards);

    // 6. Complete each pack up to 15 cards with the shuffled general pool
    for (let i = 0; i < totalPacksNeeded; i++) {
      while (packs[i].length < 15 && shuffledGeneral.length > 0) {
        packs[i].push(shuffledGeneral.pop());
      }
      // Shuffle each pack so fixers are mixed randomly among the other cards
      packs[i].sort(() => Math.random() - 0.5);
    }

    // 7. Deal packs to each player
    for (let pIdx = 0; pIdx < room.players.length; pIdx++) {
      const player = room.players[pIdx];
      player.draftPicks = [];
      player.activePack = [];
      player.unopenedPacks = [];
      player.pendingDecision = null;
      player.isReady = false;
      player.packOpened = true;

      for (let p = 0; p < room.config.packCount; p++) {
        const pack = packs[pIdx * room.config.packCount + p];
        if (p === 0) {
          player.activePack = pack;
        } else {
          player.unopenedPacks.push(pack);
        }
      }
    }

    room.currentRound = 1; // Pack 1
    room.currentPickNumber = 1;
    room.passDirection = 'clockwise';
    room.status = 'decision_phase';
    room.timerRemaining = room.config.timerSeconds;
    this.processBotDecisions(room);

    room.activityLog = [
      {
        id: 'log_' + Date.now(),
        type: 'system',
        text: `¡Draft iniciado con ${room.players.length} jugadores! Orden de mesa: ${room.players.map(p => p.name).join(' ➜ ')}.`
      }
    ];

    return { room };
  }

  openPack(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Sala no encontrada' };

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return { error: 'Jugador no encontrado' };

    player.packOpened = true;

    // If all human players have opened their pack, start decision phase
    const allOpened = room.players.every(p => p.packOpened);
    if (allOpened && room.status === 'pack_opening') {
      room.status = 'decision_phase';
      room.timerRemaining = room.config.timerSeconds;
      this.processBotDecisions(room);
    }

    return { room, player, allOpened };
  }
  submitDecision(roomId, socketId, decision) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Sala no encontrada' };
    if (room.status !== 'decision_phase') return { error: 'No es la fase de decisión' };

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return { error: 'Jugador no encontrado' };

    if (decision.type === 'pick') {
      const card = player.activePack.find(c => c.instanceId === decision.cardInstanceId);
      if (!card) return { error: 'La carta seleccionada no está en tu sobre' };
      player.pendingDecision = {
        type: 'pick',
        cardInstanceId: decision.cardInstanceId,
        cardName: card.name
      };
    } else if (decision.type === 'swap') {
      const offerCard = player.activePack.find(c => c.instanceId === decision.offerCardInstanceId);
      if (!offerCard) return { error: 'La carta que ofreces no está en tu sobre' };

      const targetCard = room.getawayPlaza.find(c => c.instanceId === decision.targetPlazaInstanceId);
      if (!targetCard) return { error: 'La carta objetivo no está en el Getaway Plaza' };

      player.pendingDecision = {
        type: 'swap',
        offerCardInstanceId: decision.offerCardInstanceId,
        targetPlazaInstanceId: decision.targetPlazaInstanceId,
        offerName: offerCard.name,
        targetName: targetCard.name
      };
    } else {
      return { error: 'Tipo de decisión no válido' };
    }

    player.isReady = true;

    // Check if all players are ready
    const allReady = room.players.every(p => p.isReady);

    return { success: true, room, player, allReady };
  }

  processBotDecisions(room) {
    for (const player of room.players) {
      if (player.isBot && !player.isReady && player.activePack.length > 0) {
        // AI heuristic: 20% chance to request swap if plaza has rare/mythic or high CMC
        const shouldSwap = Math.random() < 0.25 && room.getawayPlaza.length > 0;
        if (shouldSwap) {
          const offer = player.activePack[Math.floor(Math.random() * player.activePack.length)];
          const target = room.getawayPlaza[Math.floor(Math.random() * room.getawayPlaza.length)];
          player.pendingDecision = {
            type: 'swap',
            offerCardInstanceId: offer.instanceId,
            targetPlazaInstanceId: target.instanceId,
            offerName: offer.name,
            targetName: target.name
          };
        } else {
          // Standard pick
          const sorted = [...player.activePack].sort((a, b) => (b.cmc || 0) - (a.cmc || 0));
          const pick = sorted[0];
          player.pendingDecision = {
            type: 'pick',
            cardInstanceId: pick.instanceId,
            cardName: pick.name
          };
        }
        player.isReady = true;
      }
    }
  }

  startResolutionPhase(room) {
    room.status = 'resolution_phase';

    // 1. Resolve all Standard Picks (Action A) immediately
    for (const player of room.players) {
      if (player.pendingDecision?.type === 'pick') {
        const pickIdx = player.activePack.findIndex(c => c.instanceId === player.pendingDecision.cardInstanceId);
        if (pickIdx !== -1) {
          const pickedCard = player.activePack.splice(pickIdx, 1)[0];
          player.draftPicks.push(pickedCard);
          room.activityLog.unshift({
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
            type: 'pick',
            playerName: player.name,
            cardName: pickedCard.name,
            text: `${player.name} seleccionó una carta de su sobre.`
          });
        }
      }
    }

    // 2. Filter players who requested Action B (Swap) and sort by seating priority order
    const swapPlayers = room.players
      .filter(p => p.pendingDecision?.type === 'swap')
      .sort((a, b) => a.seatIndex - b.seatIndex);

    room.resolutionQueue = swapPlayers.map(p => p.id);

    if (room.resolutionQueue.length === 0) {
      // No swaps to resolve: proceed directly to pack rotation
      return this.completePickRotation(room);
    } else {
      // Step into first swap
      return this.stepResolutionQueue(room);
    }
  }

  stepResolutionQueue(room) {
    if (room.resolutionQueue.length === 0) {
      room.currentResolvingPlayerId = null;
      return this.completePickRotation(room);
    }

    const playerId = room.resolutionQueue[0];
    const player = room.players.find(p => p.id === playerId);
    room.currentResolvingPlayerId = playerId;

    if (!player || !player.pendingDecision) {
      room.resolutionQueue.shift();
      return this.stepResolutionQueue(room);
    }

    // Check if target card is still in Getaway Plaza (via slots or flat pool)
    let targetSlot = null;
    let targetCardIdx = -1;
    let plazaCard = null;

    if (room.plazaSlots && room.plazaSlots.length > 0) {
      for (const slot of room.plazaSlots) {
        const idx = slot.cards.findIndex(c => c.instanceId === player.pendingDecision.targetPlazaInstanceId);
        if (idx !== -1) {
          targetSlot = slot;
          targetCardIdx = idx;
          plazaCard = slot.cards[idx];
          break;
        }
      }
    }

    if (!plazaCard) {
      const plazaIdx = room.getawayPlaza.findIndex(c => c.instanceId === player.pendingDecision.targetPlazaInstanceId);
      if (plazaIdx !== -1) {
        plazaCard = room.getawayPlaza[plazaIdx];
      }
    }

    if (plazaCard) {
      // Card is available! Execute swap
      let offerIdx = player.activePack.findIndex(c => c.instanceId === player.pendingDecision.offerCardInstanceId);
      if (offerIdx === -1 && player.activePack.length > 0) offerIdx = 0;
      if (offerIdx !== -1) {
        const offerCard = player.activePack.splice(offerIdx, 1)[0];
        
        if (targetSlot) {
          targetSlot.cards.splice(targetCardIdx, 1);
          offerCard.slotId = targetSlot.id;
          targetSlot.cards.push(offerCard);
          room.getawayPlaza = room.plazaSlots.flatMap(s => s.cards);
        } else {
          const pIdx = room.getawayPlaza.findIndex(c => c.instanceId === plazaCard.instanceId);
          if (pIdx !== -1) room.getawayPlaza.splice(pIdx, 1);
          room.getawayPlaza.push(offerCard);
        }

        player.draftPicks.push(plazaCard);

        const swapLog = {
          id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          type: 'swap',
          playerName: player.name,
          offered: offerCard.name,
          acquired: plazaCard.name,
          text: `[Prioridad] ${player.name} depositó [${offerCard.name}] e intercambió por [${plazaCard.name}] del Getaway Plaza!`
        };
        room.activityLog.unshift(swapLog);

        room.resolutionQueue.shift();

        return {
          type: 'swap_resolved',
          player,
          offerCard,
          plazaCard,
          swapLog,
          hasMoreInQueue: room.resolutionQueue.length > 0
        };
      }
    }

    // Conflict detected: Target card was already taken by a higher-priority player!
    if (player.isBot) {
      // Bot auto-resolves conflict: pick another plaza card if available, else pick first hand card
      if (room.getawayPlaza.length > 0) {
        const altTarget = room.getawayPlaza[0];
        player.pendingDecision.targetPlazaInstanceId = altTarget.instanceId;
        return this.stepResolutionQueue(room);
      } else {
        const fallback = player.activePack.pop();
        if (fallback) player.draftPicks.push(fallback);
        room.resolutionQueue.shift();
        return this.stepResolutionQueue(room);
      }
    }

    // Human player conflict: Emit prompt for choice
    return {
      type: 'swap_conflict',
      playerId: player.id,
      socketId: player.socketId,
      message: 'Carta ya no disponible en el Plaza: Elige otra carta del Plaza o realiza un pick normal de tu sobre'
    };
  }

  resolveSwapConflict(roomId, socketId, resolution) {
    const room = this.rooms.get(roomId);
    if (!room) return { error: 'Sala no encontrada' };

    const player = room.players.find(p => p.socketId === socketId);
    if (!player || player.id !== room.currentResolvingPlayerId) {
      return { error: 'No es tu turno de resolución de prioridad' };
    }

    if (resolution.choiceType === 'plaza_card') {
      // Choose new plaza card
      let targetSlot = null;
      let targetCardIdx = -1;
      let plazaCard = null;

      if (room.plazaSlots && room.plazaSlots.length > 0) {
        for (const slot of room.plazaSlots) {
          const idx = slot.cards.findIndex(c => c.instanceId === resolution.newTargetPlazaId);
          if (idx !== -1) {
            targetSlot = slot;
            targetCardIdx = idx;
            plazaCard = slot.cards[idx];
            break;
          }
        }
      }

      if (!plazaCard) {
        const plazaIdx = room.getawayPlaza.findIndex(c => c.instanceId === resolution.newTargetPlazaId);
        if (plazaIdx !== -1) plazaCard = room.getawayPlaza[plazaIdx];
      }

      if (!plazaCard) return { error: 'Esa carta ya no está en la Plaza' };

      const offerId = resolution.offerCardId || player.pendingDecision?.offerCardInstanceId;
      let offerIdx = player.activePack.findIndex(c => c.instanceId === offerId);
      if (offerIdx === -1 && player.activePack.length > 0) offerIdx = 0;
      if (offerIdx === -1) return { error: 'No tienes cartas disponibles para ofrecer en tu sobre' };

      const offerCard = player.activePack.splice(offerIdx, 1)[0];

      if (targetSlot) {
        targetSlot.cards.splice(targetCardIdx, 1);
        offerCard.slotId = targetSlot.id;
        targetSlot.cards.push(offerCard);
        room.getawayPlaza = room.plazaSlots.flatMap(s => s.cards);
      } else {
        const pIdx = room.getawayPlaza.findIndex(c => c.instanceId === plazaCard.instanceId);
        if (pIdx !== -1) room.getawayPlaza.splice(pIdx, 1);
        room.getawayPlaza.push(offerCard);
      }

      player.draftPicks.push(plazaCard);

      room.activityLog.unshift({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        type: 'swap',
        playerName: player.name,
        text: `[Prioridad Resuelta] ${player.name} eligió alternativamente [${plazaCard.name}] del Getaway Plaza.`
      });
    } else {
      // Fallback to normal pick from hand
      const pickId = resolution.pickCardId || player.activePack[0]?.instanceId;
      const pickIdx = player.activePack.findIndex(c => c.instanceId === pickId);
      if (pickIdx !== -1) {
        const picked = player.activePack.splice(pickIdx, 1)[0];
        player.draftPicks.push(picked);
        room.activityLog.unshift({
          id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          type: 'pick',
          playerName: player.name,
          text: `[Prioridad Resuelta] ${player.name} optó por un pick normal de [${picked.name}].`
        });
      }
    }

    room.resolutionQueue.shift();
    return this.stepResolutionQueue(room);
  }
  completePickRotation(room) {
    room.currentResolvingPlayerId = null;
    room.resolutionQueue = [];

    // Reset player readiness
    for (const player of room.players) {
      player.isReady = false;
      player.pendingDecision = null;
    }

    // Check if active pack has completed all 15 picks
    const packEmpty = room.players[0].activePack.length === 0;

    if (packEmpty) {
      if (room.currentRound < room.config.packCount) {
        // Advance to next pack round
        room.currentRound += 1;
        room.currentPickNumber = 1;
        room.passDirection = (room.currentRound % 2 === 1) ? 'clockwise' : 'counterclockwise';

        for (const player of room.players) {
          player.activePack = player.unopenedPacks.shift() || [];
          player.packOpened = true;
        }

        room.status = 'decision_phase';
        room.timerRemaining = room.config.timerSeconds;
        this.processBotDecisions(room);

        room.activityLog.unshift({
          id: 'log_' + Date.now(),
          type: 'round',
          text: `¡Sobre completado! Comienza el Sobre ${room.currentRound} de ${room.config.packCount}.`
        });

        return { type: 'round_advanced', round: room.currentRound };
      } else {
        // Draft Complete!
        room.status = 'complete';
        room.activityLog.unshift({
          id: 'log_' + Date.now(),
          type: 'complete',
          text: `¡DRAFT FINALIZADO! Todos los sobres han sido drafteados.`
        });
        return { type: 'draft_complete' };
      }
    } else {
      // Rotate active packs between players
      const passDirection = (room.currentRound % 2 === 1) ? 'clockwise' : 'counterclockwise';
      const n = room.players.length;
      const packs = room.players.map(p => p.activePack);

      for (let i = 0; i < n; i++) {
        if (passDirection === 'clockwise') {
          // P[i] receives pack from P[(i - 1 + n) % n]
          room.players[i].activePack = packs[(i - 1 + n) % n];
        } else {
          // P[i] receives pack from P[(i + 1) % n]
          room.players[i].activePack = packs[(i + 1) % n];
        }
      }

      room.currentPickNumber += 1;
      room.status = 'decision_phase';
      room.timerRemaining = room.config.timerSeconds;

      this.processBotDecisions(room);

      return { type: 'pick_step_completed', pickNumber: room.currentPickNumber };
    }
  }

  generateTTSExport(draftPicks) {
    const counts = {};
    for (const card of draftPicks || []) {
      const name = card.name || 'Unknown Card';
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => `${count} ${name}`)
      .join('\n');
  }

  getClientState(room, clientSocketId) {
    const me = room.players.find(p => p.socketId === clientSocketId);

    return {
      id: room.id,
      status: room.status,
      config: room.config,
      currentRound: room.currentRound,
      currentPickNumber: room.currentPickNumber,
      passDirection: room.passDirection,
      getawayPlaza: room.getawayPlaza,
      plazaSlots: (room.plazaSlots || []).map(slot => ({
        id: slot.id,
        name: slot.name,
        guild: slot.guild,
        type: slot.type,
        colors: slot.colors || [],
        cardCount: slot.cards.length,
        topCard: slot.cards[slot.cards.length - 1] || null,
        cards: slot.cards
      })),
      resolutionQueue: room.resolutionQueue,
      currentResolvingPlayerId: room.currentResolvingPlayerId,
      activityLog: room.activityLog,
      isAdmin: me ? me.isAdmin : false,
      seatingOrder: room.seatingOrder,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        isAdmin: p.isAdmin,
        isBot: p.isBot,
        seatIndex: p.seatIndex,
        isReady: p.isReady,
        packOpened: p.packOpened,
        pendingActionType: p.pendingDecision?.type || null,
        draftPicksCount: p.draftPicks.length,
        packCountRemaining: p.activePack.length
      })),
      me: me ? {
        id: me.id,
        name: me.name,
        isAdmin: me.isAdmin,
        seatIndex: me.seatIndex,
        isReady: me.isReady,
        packOpened: me.packOpened,
        pendingDecision: me.pendingDecision,
        activePack: me.activePack,
        draftPicks: me.draftPicks
      } : null
    };
  }
}

module.exports = new GameManager();
