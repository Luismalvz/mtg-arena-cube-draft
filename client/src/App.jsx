import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { ArenaMarket } from './components/ArenaMarket';
import { PackHand } from './components/PackHand';
import { DraftPicksDrawer } from './components/DraftPicksDrawer';
import { CardDetailModal } from './components/CardDetailModal';
import { Lobby } from './components/Lobby';
import { sound } from './utils/audio';
import {
  Layers,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Trophy,
  Download
} from 'lucide-react';

const SOCKET_SERVER_URL = window.location.port === '5173'
  ? 'http://localhost:3001'
  : undefined;

export default function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [swapSourceCard, setSwapSourceCard] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inspectedCard, setInspectedCard] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedTTS, setCopiedTTS] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('Connected to draft server:', s.id);
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('Disconnected from draft server');
      setIsConnected(false);
    });

    s.on('room_state_update', (newState) => {
      setRoomState(newState);
    });

    s.on('arena_swapped', ({ logEntry, arena }) => {
      sound.playSwap();
      showToast(logEntry?.text || '¡Intercambio en la Arena realizado!');
    });

    s.on('swap_error', ({ message }) => {
      sound.playSelect();
      showToast(message, 'error');
      setSwapSourceCard(null);
    });

    s.on('error_notification', ({ message }) => {
      showToast(message, 'error');
    });

    s.on('round_advanced', ({ round }) => {
      sound.playFanfare();
      showToast(`¡Comienza la Ronda ${round}! Nuevo sobre abierto.`, 'info');
      setSwapSourceCard(null);
    });

    s.on('pick_step_completed', ({ pickNumber }) => {
      sound.playHover();
      setSwapSourceCard(null);
    });

    s.on('draft_completed', () => {
      sound.playFanfare();
      showToast('¡Draft completado con éxito! Exporta tu mazo para TTS.', 'info');
      setIsDrawerOpen(true);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const showToast = (message, type = 'normal') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(prev => (prev?.id ? null : prev));
    }, 4500);
  };

  // Lobby actions
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

  // Card interaction
  const handlePackCardClick = (card) => {
    if (!socket || !roomState?.id) return;

    if (swapSourceCard) {
      if (swapSourceCard.instanceId === card.instanceId) {
        // Deselect swap source
        setSwapSourceCard(null);
      } else {
        // Select new swap source
        setSwapSourceCard(card);
      }
      return;
    }

    // Otherwise, select tentative draft pick
    socket.emit('select_pick', {
      roomId: roomState.id,
      cardInstanceId: card.instanceId
    });
  };

  const handleInitiateSwap = (card) => {
    sound.playSelect();
    setSwapSourceCard(card);
    showToast(`Seleccionado [${card.name}] de tu sobre. Haz clic en una carta de la Arena para cambiarla.`, 'info');
  };

  const handleCancelSwap = () => {
    setSwapSourceCard(null);
  };

  const handleArenaCardClick = (arenaCard) => {
    if (!swapSourceCard) {
      showToast('Para cambiar, primero selecciona una carta de tu sobre abajo o haz clic en "Swap"', 'info');
      return;
    }

    if (!socket || !roomState?.id) return;

    // Send atomic swap request
    socket.emit('swap_with_arena', {
      roomId: roomState.id,
      cardFromPackInstanceId: swapSourceCard.instanceId,
      cardFromArenaInstanceId: arenaCard.instanceId
    });

    setSwapSourceCard(null);
  };

  const handleLockPick = (cardInstanceId) => {
    if (!socket || !roomState?.id) return;
    socket.emit('lock_pick', {
      roomId: roomState.id,
      cardInstanceId
    });
    setSwapSourceCard(null);
  };

  const handleUnlockPick = () => {
    if (!socket || !roomState?.id) return;
    socket.emit('unlock_pick', { roomId: roomState.id });
  };

  const handleInspectCard = (card) => {
    sound.playHover();
    setInspectedCard(card);
  };

  const handleResetDraft = () => {
    window.location.reload();
  };

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

  const isDrafting = roomState?.status === 'drafting';
  const isComplete = roomState?.status === 'complete';
  const isLobby = !roomState || roomState.status === 'lobby';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-black text-base md:text-lg tracking-wider bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            <span>MTG ARENA CUBE</span>
          </div>

          {roomState?.id && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs">
              <span className="text-slate-400">Sala:</span>
              <span className="font-mono font-bold text-amber-400">{roomState.id}</span>
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

          {/* Drafted Picks Drawer Trigger */}
          {roomState?.me && (
            <button
              onClick={() => {
                sound.playSelect();
                setIsDrawerOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Tus Picks</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold">
                {roomState.me.draftPicks?.length || 0}
              </span>
            </button>
          )}

          {isComplete && (
            <button
              onClick={handleResetDraft}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
              title="Nueva Partida"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-4 md:gap-6">
        {/* Lobby View */}
        {isLobby && (
          <Lobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartDraft={handleStartDraft}
            roomState={roomState}
            isConnected={isConnected}
            isHost={roomState?.isHost || false}
          />
        )}

        {/* Active Drafting View (Split Screen) */}
        {isDrafting && (
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Top Area: "El Centro de la Arena" (Shared Market) */}
            <ArenaMarket
              arenaCards={roomState.arena || []}
              swapSourceCard={swapSourceCard}
              onArenaCardClick={handleArenaCardClick}
              onInspectCard={handleInspectCard}
              recentActivity={roomState.activityLog || []}
              disabled={roomState.me?.ready || false}
            />

            {/* Middle Area & Bottom Area: "Tu Sobre Actual" */}
            <PackHand
              activePack={roomState.me?.activePack || []}
              selectedPickId={roomState.me?.selectedPickId || null}
              isReady={roomState.me?.ready || false}
              swapSourceCard={swapSourceCard}
              currentRound={roomState.currentRound || 1}
              currentPickNumber={roomState.currentPickNumber || 1}
              totalPacks={roomState.options?.packCount || 3}
              playerList={roomState.playerList || []}
              myId={roomState.me?.id || null}
              onCardClick={handlePackCardClick}
              onInitiateSwap={handleInitiateSwap}
              onCancelSwap={handleCancelSwap}
              onLockPick={handleLockPick}
              onUnlockPick={handleUnlockPick}
              onInspectCard={handleInspectCard}
            />
          </div>
        )}

        {/* Draft Complete View */}
        {isComplete && (
          <div className="max-w-4xl mx-auto w-full py-8 space-y-6">
            <div className="text-center space-y-2 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 p-8 rounded-3xl border border-amber-500/40 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>
              <h2 className="text-3xl font-black text-white">¡DRAFT COMPLETADO!</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Has seleccionado un total de {roomState.me?.draftPicks?.length || 0} cartas de tu Cube.
              </p>

              {/* TTS Quick Copy */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleCopyTTSGlobal}
                  className={`px-6 py-3 rounded-xl font-black text-sm tracking-wide transition-all shadow-xl flex items-center gap-2 ${
                    copiedTTS
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/30 hover:scale-105'
                  }`}
                >
                  {copiedTTS ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  <span>{copiedTTS ? '¡Copiado a Portapapeles!' : 'Copiar Decklist para Tabletop Simulator'}</span>
                </button>

                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-bold flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Ver Mazo y Estadísticas</span>
                </button>
              </div>
            </div>

            {/* Plaintext Preview Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-400 border-b border-slate-800 pb-2">
                <span>Formato Tabletop Simulator (TTS):</span>
                <span>{roomState.me?.draftPicks?.length || 0} cartas</span>
              </div>
              <pre className="font-mono text-xs text-amber-200/90 bg-slate-950 p-4 rounded-xl max-h-60 overflow-y-auto border border-slate-800/80 leading-relaxed select-all">
                {generateTTSDecklist(roomState.me?.draftPicks || [])}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Draft Picks Drawer */}
      <DraftPicksDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        draftPicks={roomState?.me?.draftPicks || []}
        onInspectCard={handleInspectCard}
      />

      {/* Card Detail Modal */}
      <CardDetailModal
        card={inspectedCard}
        onClose={() => setInspectedCard(null)}
      />

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
