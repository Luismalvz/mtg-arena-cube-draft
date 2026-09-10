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
import { AltCardZoom } from './components/AltCardZoom';
import { sound } from './utils/audio';
import {
  Flame,
  Layers,
  Sparkles,
  Trophy,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Download,
  Share2
} from 'lucide-react';

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
  const [copiedTTS, setCopiedTTS] = useState(false);
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
      showToast('¡Conflicto de prioridad! La carta seleccionada fue tomada.', 'error');
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
      setIsDrawerOpen(true);
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
  const handleCreateRoom = ({ playerName, options }) => {
    if (!socket) return;
    socket.emit('create_room', { playerName, options });
  };

  const handleJoinRoom = ({ roomId, playerName }) => {
    if (!socket) return;
    socket.emit('join_room', { roomId, playerName });
  };

  const handleStartDraft = () => {
    if (!socket || !roomState?.id) return;
    socket.emit('start_draft', { roomId: roomState.id });
  };

  const handleRandomizeSeating = () => {
    if (!socket || !roomState?.id) return;
    socket.emit('randomize_seating', { roomId: roomState.id });
  };

  const handleJoinRoomAsPlayer = (playerName) => {
    if (!socket || !roomState?.id) return;
    socket.emit('join_room', { roomId: roomState.id, playerName });
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


  // TTS Decklist Generator
  const generateTTSDecklist = (picks) => {
    const counts = {};
    for (const card of picks || []) {
      const name = card.name || 'Unknown Card';
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => `${count} ${name}`)
      .join('\n');
  };

  const handleCopyTTSGlobal = async () => {
    sound.playSelect();
    const text = generateTTSDecklist(roomState?.me?.draftPicks || []);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTTS(true);
      setTimeout(() => setCopiedTTS(false), 2500);
      showToast('¡Lista copiada al portapapeles en formato Tabletop Simulator!', 'info');
    } catch (e) {}
  };

  const handleDownloadTTS = () => {
    sound.playSelect();
    const text = generateTTSDecklist(roomState?.me?.draftPicks || []);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `getaway_draft_tts_decklist_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDraft = () => {
    window.location.href = window.location.pathname;
  };

  // State derivation
  const isLobby = !roomState || roomState.status === 'lobby';
  const isDecisionOrResolution =
    roomState?.status === 'decision_phase' ||
    roomState?.status === 'resolution_phase' ||
    roomState?.status === 'pack_opening';
  const isComplete = roomState?.status === 'complete';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 border-b border-slate-800/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-black text-base md:text-lg tracking-wider bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            <span>GETAWAY DRAFT</span>
          </div>

          {roomState?.id && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs">
              <span className="text-slate-400">Sala:</span>
              <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {roomState.id}
              </span>
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 shadow-xs shadow-emerald-400' : 'bg-rose-500'
              }`}
            />
            <span className="hidden md:inline">{isConnected ? 'Conectado' : 'Conectando...'}</span>
          </div>

          {/* Reset Room / New Game button if complete */}
          {isComplete && (
            <button
              onClick={handleResetDraft}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Nueva Partida"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-5">
        
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
          <div className="flex flex-col gap-4 md:gap-5">
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

            {/* ZONE 2 (Mid-Board): Turn Timeline & Priority Indicators */}
            <TurnTimeline
              currentRound={roomState.currentRound || 1}
              currentPickNumber={roomState.currentPickNumber || 1}
              totalPacks={roomState.config?.packCount || 3}
              passDirection={roomState.passDirection || 'clockwise'}
              timerRemaining={timerRemaining}
              maxTimerSeconds={roomState.config?.timerSeconds || 45}
              players={roomState.players || []}
              myId={roomState.me?.id}
              currentResolvingPlayerId={roomState.currentResolvingPlayerId}
              status={roomState.status}
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

        {/* VIEW 5: Draft Complete Screen */}
        {isComplete && (
          <div className="max-w-4xl mx-auto w-full py-8 space-y-6">
            <div className="text-center space-y-3 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 p-8 rounded-3xl border border-amber-500/40 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-2">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>
              <h2 className="text-3xl font-black text-white">¡DRAFT COMPLETADO!</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Has seleccionado {roomState.me?.draftPicks?.length || 0} cartas de tu Cube 360 con la mecánica Getaway Plaza.
              </p>

              {/* TTS Quick Copy & Export buttons */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleCopyTTSGlobal}
                  className={`px-6 py-3 rounded-xl font-black text-sm tracking-wide transition-all shadow-xl flex items-center gap-2 cursor-pointer ${
                    copiedTTS
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/30 hover:scale-105'
                  }`}
                >
                  {copiedTTS ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  <span>{copiedTTS ? '¡Copiado a Portapapeles!' : 'Copiar Decklist Tabletop Simulator'}</span>
                </button>

                <button
                  onClick={handleDownloadTTS}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar .txt</span>
                </button>

                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Ver Mazo y Curva de Maná</span>
                </button>
              </div>
            </div>

            {/* Plaintext Preview Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-400 border-b border-slate-800 pb-2">
                <span>Formato Tabletop Simulator (TTS):</span>
                <span>{roomState.me?.draftPicks?.length || 0} cartas</span>
              </div>
              <pre className="font-mono text-xs text-amber-200/90 bg-slate-950 p-4 rounded-xl max-h-64 overflow-y-auto border border-slate-800/80 leading-relaxed select-all">
                {generateTTSDecklist(roomState.me?.draftPicks || [])}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* ZONE 4: Collapsed Right-Edge Slide-Over "Tus Picks" Tab Trigger */}
      {roomState?.me && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
          <button
            onClick={() => {
              sound.playSelect();
              setIsDrawerOpen(true);
            }}
            className="px-2.5 py-4 rounded-l-2xl bg-gradient-to-b from-amber-500 to-orange-600 text-slate-950 font-black text-xs shadow-[-5px_0_20px_rgba(251,191,36,0.3)] hover:pr-4 transition-all flex flex-col items-center gap-1.5 cursor-pointer border-y border-l border-amber-300"
            title="Abrir Tus Picks"
          >
            <Layers className="w-4 h-4" />
            <span className="[writing-mode:vertical-rl] tracking-wider uppercase text-[10px]">
              Tus Picks ({roomState.me.draftPicks?.length || 0})
            </span>
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
            className={`px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-950/50'
                : 'bg-slate-900/95 border-amber-500/40 text-amber-200 shadow-black/80'
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
