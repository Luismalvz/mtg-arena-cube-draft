import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../utils/audio';
import {
  Users,
  Layers,
  Clock,
  Shuffle,
  Crown,
  User,
  Bot,
  Check,
  Share2,
  Sparkles,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';
import { PlayerTokenCard } from './PlayerTokenCard';
import { TOKEN_AVATARS } from '../utils/tokenAvatars';

export function PlayerLobby({
  roomState,
  onStartDraft,
  onRandomizeSeating,
  onJoinRoomAsPlayer,
  isHost,
  myId
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [avatar, setAvatar] = useState('046');

  if (!roomState) return null;

  const { id: roomId, config, players = [] } = roomState;
  const currentCount = players.length;
  const targetCount = config?.playerCount || 8;
  const botsNeeded = Math.max(0, targetCount - currentCount);

  // Check if current client has already joined as a player
  const hasTakenSeat = !!roomState.me;

  // Invite URL
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : `https://arcane.draft/join/${roomId}`;

  const handleCopyInvite = async () => {
    sound.playSelect();
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {}
  };

  const handleShuffle = () => {
    if (!isHost || isShuffling) return;
    setIsShuffling(true);
    sound.playShuffle();
    if (onRandomizeSeating) {
      onRandomizeSeating();
    }
    setTimeout(() => {
      setIsShuffling(false);
    }, 500);
  };

  const handleStart = () => {
    sound.playFanfare();
    onStartDraft();
  };

  const handleJoinSubmit = (e) => {
    e?.preventDefault();
    if (!nameInput.trim()) return;
    sound.playSelect();
    if (onJoinRoomAsPlayer) {
      onJoinRoomAsPlayer({ playerName: nameInput.trim(), avatar });
    }
  };

  // Build full array of seats (occupied + vacant)
  const totalSeats = [];
  for (let i = 0; i < targetCount; i++) {
    if (i < players.length) {
      totalSeats.push({
        type: 'player',
        data: players[i],
        seatIndex: i
      });
    } else {
      totalSeats.push({
        type: 'vacant',
        seatIndex: i
      });
    }
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center py-6 px-4 sm:px-8 font-sans text-slate-200">
      
      {/* Seamless Full-width Container */}
      <div className="relative w-full max-w-screen-2xl flex flex-col gap-6 my-auto">
        
        {/* Ambient Gold Bloom Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1.5 relative z-10">
          <div className="flex items-center gap-1.5 text-amber-400 font-sans text-[10px] sm:text-xs uppercase tracking-widest font-semibold">
            <span className="material-symbols-outlined text-[16px]">groups</span>
            <span>Sala de Espera</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl text-amber-400 tracking-wider uppercase font-bold drop-shadow-md">
            Cube Lobby
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Los asientos en la mesa determinan el orden estricto de prioridad para los intercambios en el Getaway Plaza.
          </p>
        </div>

        {/* ================= SECTION 1: INVITATION LINK & CONFIG SUMMARY ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
          
          {/* Enlace de Invitación */}
          <div className="bg-slate-900/80 backdrop-blur-sm p-3.5 rounded-xl flex flex-col justify-between gap-2 border border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Enlace de Invitación
              </span>
              <span className="font-sans text-[11px] text-amber-400 uppercase font-bold tracking-wider">
                Sala: {roomId}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-lg border border-white/5">
              <span className="font-sans text-xs text-slate-400 truncate pl-2 flex-1 select-all font-mono">
                {inviteUrl}
              </span>

              <button
                type="button"
                onClick={handleCopyInvite}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-500 text-amber-950 font-sans text-xs uppercase rounded-md font-bold transition-all flex items-center gap-1 shadow-sm shrink-0 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedLink ? 'done' : 'content_copy'}
                </span>
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Configuración del Drafteo */}
          <div className="bg-slate-900/80 backdrop-blur-sm p-3.5 rounded-xl flex flex-col justify-between gap-2 border border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Configuración de la Sesión
              </span>
              <span className="material-symbols-outlined text-amber-400 text-[18px]">tune</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              <div className="bg-slate-900/40 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Capacidad:</span>
                <span className="font-bold text-amber-400">{targetCount} Jugadores</span>
              </div>

              <div className="bg-slate-900/40 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Sobres:</span>
                <span className="font-bold text-amber-400">{config?.packCount || 3} × 15</span>
              </div>

              <div className="bg-slate-900/40 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Picks Totales:</span>
                <span className="font-bold text-amber-400">{(config?.packCount || 3) * 15} cartas</span>
              </div>

              <div className="bg-slate-900/40 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Tiempo Turno:</span>
                <span className="font-bold text-amber-400">
                  {config?.timerSeconds ? `${config.timerSeconds}s` : 'Sin Límite'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* If user hasn't joined the room yet, prompt to take a seat */}
        {!hasTakenSeat && (
          <form onSubmit={handleJoinSubmit} className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-amber-500/40 shadow-lg relative z-10 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full space-y-1">
              <label className="font-sans text-xs text-amber-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Ingresa tu nombre para tomar un asiento en la mesa:</span>
              </label>
              <input
                type="text"
                placeholder="Tu nombre de Drafter"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={24}
                className="w-full px-3.5 py-2 bg-slate-950/50 border border-slate-800/60 rounded-lg text-slate-200 placeholder-[#d2c5b1]/40 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
              />
              <div className="avatar-picker compact" aria-label="Elige tu avatar">
                {TOKEN_AVATARS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`avatar-choice ${avatar === option.id ? 'selected' : ''}`}
                    onClick={() => setAvatar(option.id)}
                    aria-label={`Avatar ${option.id}`}
                    aria-pressed={avatar === option.id}
                  >
                    <img src={option.src} alt="" />
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-500 text-amber-950 font-sans text-xs uppercase rounded-lg font-bold transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-40"
            >
              Tomar Asiento
            </button>
          </form>
        )}

        {/* ================= SECTION 2: ASIENTOS DE LA MESA (SEATING ORDER & PRIORITY) ================= */}
        <div className="flex flex-col gap-2.5 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs text-slate-200 uppercase tracking-wider font-semibold">
                Asientos de la Mesa & Orden de Prioridad ({currentCount}/{targetCount})
              </span>
            </div>

            {/* Randomize Seating Button (Host Only) */}
            {isHost && (
              <button
                type="button"
                onClick={handleShuffle}
                disabled={isShuffling}
                className={`px-3.5 py-1.5 bg-slate-900/80 backdrop-blur-sm hover:bg-slate-800 border border-amber-500/40 hover:border-amber-500 text-amber-400 font-sans text-xs uppercase rounded-lg font-bold transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer active:scale-95 ${
                  isShuffling ? 'opacity-60 pointer-events-none' : ''
                }`}
                title="Randomizar aleatoriamente los asientos de los jugadores"
              >
                <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
                <span>Randomizar Orden</span>
              </button>
            )}
          </div>

          {/* Grid of Seats as MTG Token Cards */}
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-5 w-full">
            <AnimatePresence>
              {totalSeats.map((seat, idx) => (
                <PlayerTokenCard
                  key={seat.type === 'player' ? seat.data.id : `seat_empty_${idx}`}
                  seat={seat}
                  seatIndex={idx}
                  myId={myId}
                  isHost={isHost}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="flex items-center justify-between text-[11px] font-sans text-slate-400 px-1 pt-0.5">
            <span>
              {botsNeeded > 0
                ? `Faltan ${botsNeeded} jugadores para completar los ${targetCount} asientos.`
                : 'Mesa completa con todos los participantes listos.'}
            </span>
            <span className="text-amber-400 text-right font-medium">
              Giro de cartas: Horario (Sobre 1)
            </span>
          </div>
        </div>

        {/* ================= SECTION 3: BOTTOM ACTIONS (START DRAFT / WAITING HOST) ================= */}
        <div className="pt-2 flex flex-col gap-2 relative z-10 border-t border-slate-800/60">
          {isHost ? (
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleStart}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-300 text-amber-950 font-sans text-sm uppercase rounded-xl font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
              >
                <span>INICIAR DRAFT CON ESTE ORDEN DE PRIORIDAD</span>
                <span className="material-symbols-outlined text-[20px]">east</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-center font-sans text-[10px] sm:text-[11px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[15px]">smart_toy</span>
                <span>
                  {botsNeeded > 0
                    ? `Los ${botsNeeded} asientos vacíos se completarán automáticamente con IAs`
                    : 'Todos los asientos están ocupados por jugadores'}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full py-3.5 px-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800/60 text-center flex items-center justify-center gap-2 text-xs font-sans text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span>
                Esperando a que el anfitrión inicie la partida con el orden de prioridad definido...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="w-full max-w-3xl mt-6 px-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 font-sans text-[10px] sm:text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="uppercase">Getaway Draft Engine v2.4</span>
          <span>•</span>
          <span>Synchronized via WebSocket</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="uppercase">Magic: The Gathering ™ WotC</span>
          <span>•</span>
          <span className="text-amber-400 hover:underline cursor-pointer">Cube 360</span>
        </div>
      </footer>
    </div>
  );
}
