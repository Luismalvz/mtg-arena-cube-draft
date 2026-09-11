import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AdminSetup } from './components/AdminSetup';
import { PlayerLobby } from './components/PlayerLobby';
import { GetawayPlaza } from './components/GetawayPlaza';
import { TurnTimeline } from './components/TurnTimeline';
import { DraftHand } from './components/DraftHand';
import { SwapConflictModal } from './components/SwapConflictModal';
import { SwapAnimationOverlay } from './components/SwapAnimationOverlay';
import { DraftPicksDrawer } from './components/DraftPicksDrawer';
import { RavnicaBoosterOpening } from './components/RavnicaBoosterOpening';
import { DeckBuilder } from './components/DeckBuilder';
import { AltCardZoom } from './components/AltCardZoom';
import { MagicBackground } from './components/MagicBackground';
import { sound } from './utils/audio';
import { Layers, AlertCircle } from 'lucide-react';

const SOCKET_SERVER_URL = window.location.port === '5173'
  ? 'http://localhost:3001'
  : undefined;

export default function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [timerRemaining, setTimerRemaining] = useState(45);
  const [selectedPlazaCard, setSelectedPlazaCard] = useState(null);
  const [conflictData, setConflictData] = useState(null);
  const [activeSwapAnimation, setActiveSwapAnimation] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [openedRounds, setOpenedRounds] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [initialRoomId, setInitialRoomId] = useState('');

  // Global Left Alt Detection for Card Zoom (Zero Focus Loss & Auto Hardware Sync)
  const isAltPressedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Alt' || e.code === 'AltLeft' || e.code === 'AltRight') {
        // Prevent Windows browser from activating menu bar / stealing window focus!
        e.preventDefault();
        isAltPressedRef.current = true;
        setIsAltPressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Alt' || e.code === 'AltLeft' || e.code === 'AltRight') {
        e.preventDefault();
        isAltPressedRef.current = false;
        setIsAltPressed(false);
      }
    };

    // Hardware sync: whenever cursor moves or hovers, synchronize isAltPressed directly with e.altKey
    const handlePointerSync = (e) => {
      if (e.altKey && !isAltPressedRef.current) {
        isAltPressedRef.current = true;
        setIsAltPressed(true);
      } else if (!e.altKey && isAltPressedRef.current) {
        isAltPressedRef.current = false;
        setIsAltPressed(false);
      }
    };

    const handleBlur = () => {
      isAltPressedRef.current = false;
      setIsAltPressed(false);
    };

    // Use capture phase (true) to intercept Alt before browser system menu traps it
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('pointermove', handlePointerSync, true);
    window.addEventListener('mousemove', handlePointerSync, true);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('pointermove', handlePointerSync, true);
      window.removeEventListener('mousemove', handlePointerSync, true);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const handleCardHoverStart = useCallback((card, e) => {
    setHoveredCard(card);
    if (e?.altKey) {
      isAltPressedRef.current = true;
      setIsAltPressed(true);
    }
  }, []);

  const handleCardHoverEnd = useCallback(() => {
    setHoveredCard(null);
  }, []);

  // Read URL query parameter for room code (e.g. ?room=ABCD)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setInitialRoomId(roomParam.toUpperCase().trim());
      }
    }
  }, []);

  // Initialize Socket connection
  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('[Getaway Draft] Conectado al servidor:', s.id);
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('[Getaway Draft] Desconectado del servidor');
      setIsConnected(false);
    });

    s.on('room_state_update', (newState) => {
      setRoomState(newState);
      if (newState?.config?.timerSeconds !== undefined && newState.status === 'decision_phase') {
        // Sync timer initial value if not already ticked
      }
    });

    s.on('timer_tick', ({ timerRemaining: tr }) => {
      setTimerRemaining(tr);
    });

    s.on('swap_animation_event', (event) => {
      sound.playSwap();
      setActiveSwapAnimation(event);
      setTimeout(() => {
        setActiveSwapAnimation(null);
      }, 2000);
    });

    s.on('swap_conflict_prompt', (data) => {
      sound.playSelect();
      setConflictData(data);
    });

    s.on('pick_step_advanced', ({ pickNumber }) => {
      sound.playHover();
      setSelectedPlazaCard(null);
      setConflictData(null);
    });

    s.on('round_advanced', ({ round }) => {
      sound.playFanfare();
      setSelectedPlazaCard(null);
      setConflictData(null);
      showToast(`¡Comienza la Ronda ${round}! Nuevo sobre de 15 cartas disponible.`, 'info');
    });

    s.on('draft_completed', () => {
      sound.playFanfare();
      showToast('¡Draft completado! Revisa tu mazo y expórtalo para Tabletop Simulator.', 'info');
      setIsDrawerOpen(false);
    });

    s.on('seating_randomized', () => {
      sound.playShuffle();
      showToast('¡Asientos y orden de prioridad reorganizados!', 'info');
    });

    s.on('room_not_found', ({ roomId }) => {
      sound.playSelect();
      showToast(`La sala [${roomId}] no fue encontrada o ha expirado.`, 'error');
      setInitialRoomId('');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('room');
        window.history.replaceState({}, '', url.toString());
      }
    });

    s.on('error_notification', ({ message }) => {
      sound.playSelect();
      showToast(message, 'error');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Fetch room state directly if URL contains ?room=XYZ
  useEffect(() => {
    if (socket && isConnected && initialRoomId && (!roomState || roomState.id !== initialRoomId)) {
      socket.emit('get_room_state', { roomId: initialRoomId });
    }
  }, [socket, isConnected, initialRoomId, roomState?.id]);

  // Synchronize URL bar with current Room ID
  useEffect(() => {
    if (roomState?.id && typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('room') !== roomState.id) {
        currentUrl.searchParams.set('room', roomState.id);
        window.history.replaceState({}, '', currentUrl.toString());
      }
    }
  }, [roomState?.id]);

  const showToast = (message, type = 'normal') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.id ? null : prev));
    }, 4500);
  };

  // Socket Actions
  const handleCreateRoom = ({ playerName, avatar, options }) => {
    if (!socket) return;
    socket.emit('create_room', { playerName, avatar, options });
  };

  const handleJoinRoom = ({ roomId, playerName, avatar }) => {
    if (!socket) return;
    socket.emit('join_room', { roomId, playerName, avatar });
  };

  const handleStartDraft = () => {
    if (!socket || !roomState?.id) return;
    socket.emit('start_draft', { roomId: roomState.id });
  };

  const handleRandomizeSeating = () => {
    if (!socket || !roomState?.id) return;
    socket.emit('randomize_seating', { roomId: roomState.id });
  };

  const handleJoinRoomAsPlayer = ({ playerName, avatar }) => {
    if (!socket || !roomState?.id) return;
    socket.emit('join_room', { roomId: roomState.id, playerName, avatar });
  };

  const handleOpenPack = () => {
    if (!socket || !roomState?.id) return;
    socket.emit('open_pack', { roomId: roomState.id });
  };

  // Action A: Standard Pick
  const handleConfirmPick = (cardInstanceId) => {
    if (!socket || !roomState?.id) return;
    socket.emit('submit_decision', {
      roomId: roomState.id,
      decision: {
        type: 'pick',
        cardInstanceId
      }
    });
    setSelectedPlazaCard(null);
  };

  // Action B: Priority Getaway Swap
  const handleConfirmSwap = (offerCardInstanceId, targetPlazaInstanceId) => {
    if (!socket || !roomState?.id) return;
    socket.emit('submit_decision', {
      roomId: roomState.id,
      decision: {
        type: 'swap',
        offerCardInstanceId,
        targetPlazaInstanceId
      }
    });
  };

  const handleCancelDecision = () => {
    if (!roomState?.me) return;
    // Allow player to re-select if decision phase is still open
    setSelectedPlazaCard(null);
    showToast('Selección desmarcada. Elige nuevamente.', 'info');
  };

  // Resolve conflict prompt
  const handleResolveConflict = (resolution) => {
    if (!socket || !roomState?.id) return;
    socket.emit('resolve_swap_conflict', {
      roomId: roomState.id,
      resolution
    });
    setConflictData(null);
  };


  // State derivation
  const isLobby = !roomState || roomState.status === 'lobby';
  const isDecisionOrResolution =
    roomState?.status === 'decision_phase' ||
    roomState?.status === 'resolution_phase' ||
    roomState?.status === 'pack_opening';
  const isComplete = roomState?.status === 'complete';

  return (
    <div className="min-h-screen text-[#f1f3ed] flex flex-col font-sans relative">
      {/* Main Content Area */}
      <MagicBackground />

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-none mx-auto p-0 flex flex-col gap-0 draft-stage ${isDecisionOrResolution ? 'draft-shell' : ''}`}>
        
        {/* VIEW 1: Admin Setup & Join Screen */}
        {isLobby && !roomState?.id && (
          <AdminSetup
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            initialRoomId={initialRoomId}
            isConnected={isConnected}
          />
        )}

        {/* VIEW 2: Player Lobby (Waiting Room) */}
        {isLobby && roomState?.id && (
          <PlayerLobby
            roomState={roomState}
            onStartDraft={handleStartDraft}
            onRandomizeSeating={handleRandomizeSeating}
            onJoinRoomAsPlayer={handleJoinRoomAsPlayer}
            isHost={roomState.isAdmin}
            myId={roomState.me?.id}
          />
        )}

        {/* VIEW 3: Active Drafting View (Decision & Resolution Phases) */}
        {isDecisionOrResolution && (
          <div className="draft-board flex-1 flex flex-col overflow-hidden h-[100dvh]">
            {/* ZONE 2 (Mid-Board): Turn Timeline & Priority Indicators */}
            <TurnTimeline
              currentRound={roomState.currentRound || 1}
              currentPickNumber={roomState.currentPickNumber || 1}
              totalPacks={roomState.config?.packCount || 3}
              passDirection={roomState.passDirection || 'clockwise'}
              timerRemaining={timerRemaining}
              maxTimerSeconds={roomState.config?.timerSeconds ?? 45}
              players={roomState.players || []}
              myId={roomState.me?.id}
              currentResolvingPlayerId={roomState.currentResolvingPlayerId}
              status={roomState.status}
            />

            {/* ZONE 1 (Top Center): Getaway Plaza */}
            <GetawayPlaza
              plazaCards={roomState.getawayPlaza || []}
              plazaSlots={roomState.plazaSlots || []}
              swapOfferCard={
                roomState.me?.pendingDecision?.type === 'swap'
                  ? roomState.me?.activePack?.find(
                      (c) => c.instanceId === roomState.me.pendingDecision.offerCardInstanceId
                    )
                  : null
              }
              selectedTargetId={selectedPlazaCard?.instanceId || roomState.me?.pendingDecision?.targetPlazaInstanceId}
              onSelectTargetCard={(card) => {
                sound.playSelect();
                setSelectedPlazaCard(card);
              }}
              onHoverStart={handleCardHoverStart}
              onHoverEnd={handleCardHoverEnd}
              currentResolvingPlayerId={roomState.currentResolvingPlayerId}
              resolutionQueue={roomState.resolutionQueue || []}
              players={roomState.players || []}
              disabled={roomState.me?.isReady || false}
            />

            {/* ZONE 3 (Bottom Area): "Tu Sobre Actual" Hand Tray */}
            <DraftHand
              activePack={roomState.me?.activePack || []}
              isReady={roomState.me?.isReady || false}
              pendingDecision={roomState.me?.pendingDecision}
              selectedPlazaCard={selectedPlazaCard}
              onConfirmPick={handleConfirmPick}
              onConfirmSwap={handleConfirmSwap}
              onCancelDecision={handleCancelDecision}
              onHoverStart={handleCardHoverStart}
              onHoverEnd={handleCardHoverEnd}
              onClearPlazaTarget={() => setSelectedPlazaCard(null)}
            />
          </div>
        )}

        {isComplete && roomState.me && (
          <DeckBuilder key={`${roomState.id}:${roomState.me.id}`} storageKey={`getaway-deck:${roomState.id}:${roomState.me.id}`} picks={roomState.me.draftPicks || []} onHoverStart={handleCardHoverStart} onHoverEnd={handleCardHoverEnd} />
        )}
      </main>

      {/* ZONE 4: Collapsed Right-Edge Slide-Over "Tus Picks" Tab Trigger */}
      {roomState?.me && !isComplete && (
        <div className="fixed right-3 top-1/2 -translate-y-1/2 z-40">
          <button
            onClick={() => {
              sound.playSelect();
              setIsDrawerOpen(true);
            }}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-[#0b0e0c]/85 text-[#e5c681] shadow-[0_10px_35px_rgba(0,0,0,.45)] backdrop-blur-xl transition hover:border-[#d8b770]/60 cursor-pointer"
            title="Abrir Tus Picks"
          >
            <Layers className="w-4 h-4" />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#f1f3ed] px-1 text-[9px] font-bold text-[#090b0a]">{roomState.me.draftPicks?.length || 0}</span>
          </button>
        </div>
      )}

      {/* Draft Picks Drawer */}
      <DraftPicksDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        draftPicks={roomState?.me?.draftPicks || []}
        onHoverStart={handleCardHoverStart}
        onHoverEnd={handleCardHoverEnd}
      />

      {/* Priority Swap Animated Announcement Banner */}
      <SwapAnimationOverlay event={activeSwapAnimation} />

      {/* Priority Swap Conflict Modal */}
      <SwapConflictModal
        conflictData={conflictData}
        activePack={roomState?.me?.activePack || []}
        onResolveConflict={handleResolveConflict}
        onHoverStart={handleCardHoverStart}
        onHoverEnd={handleCardHoverEnd}
      />

      {/* Left-Alt Card Quick Zoom Preview */}
      <AltCardZoom
        card={hoveredCard}
        isVisible={isAltPressed && !!hoveredCard}
      />

      {/* Ravnica Collector Booster Pack Opening Animation */}
      {isDecisionOrResolution &&
        roomState?.currentRound &&
        !openedRounds[roomState.currentRound] &&
        (roomState.currentPickNumber === 1 || roomState.currentPickNumber === undefined) && (
          <RavnicaBoosterOpening
            round={roomState.currentRound}
            totalPacks={roomState.config?.packCount || 3}
            cards={roomState.me?.activePack || []}
            onFinishOpening={() => {
              handleOpenPack();
              setOpenedRounds((prev) => ({
                ...prev,
                [roomState.currentRound]: true
              }));
            }}
          />
        )}

      {/* Toast Notification Ticker */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-fade-in pointer-events-none">
          <div
            className={`px-4 py-3 rounded-full border shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === 'error'
                ? 'bg-[#2a1212]/92 border-[#ff766d]/40 text-[#ffc5c0]'
                : 'bg-[#0b0e0c]/92 border-white/12 text-[#d9ded9] shadow-black/80'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
