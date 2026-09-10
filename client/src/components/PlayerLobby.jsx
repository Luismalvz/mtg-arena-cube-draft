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
      onJoinRoomAsPlayer(nameInput.trim());
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
    <div className="w-full flex flex-col justify-center items-center py-6 px-3 sm:px-4 font-manrope text-slate-200">
      
      {/* Main Glass/Obsidian Card */}
      <div className="relative w-full max-w-3xl bg-[#181b24] rounded-2xl p-5 sm:p-7 md:p-8 shadow-2xl flex flex-col gap-5 border border-[#272a33]/80 overflow-hidden my-auto">
        
        {/* Ambient Gold Bloom Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#ffd580]/5 blur-[100px] pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col items-center text-center gap-1 relative z-10">
          <div className="flex items-center gap-1.5 text-[#ffd580] font-space text-[10px] sm:text-xs uppercase tracking-widest font-semibold">
            <span className="material-symbols-outlined text-[16px]">groups</span>
            <span>Sala de Espera</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl text-[#ffd580] tracking-wider uppercase font-bold drop-shadow-[0_2px_10px_rgba(255,213,128,0.2)]">
            Cube Lobby
          </h1>

          <p className="text-xs sm:text-sm text-[#d2c5b1] font-manrope">
            Los asientos en la mesa determinan el orden estricto de prioridad para los intercambios en el Getaway Plaza.
          </p>
        </div>

        {/* ================= SECTION 1: INVITATION LINK & CONFIG SUMMARY ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
          
          {/* Enlace de Invitación */}
          <div className="bg-[#1c1f29] p-3.5 rounded-xl flex flex-col justify-between gap-2 border border-[#272a33]/60">
            <div className="flex items-center justify-between">
              <span className="font-space text-[11px] text-[#d2c5b1] uppercase tracking-wider font-semibold">
                Enlace de Invitación
              </span>
              <span className="font-space text-[11px] text-[#ffd580] uppercase font-bold tracking-wider">
                Sala: {roomId}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#0b0e17] p-1.5 rounded-lg border border-white/5">
              <span className="font-space text-xs text-[#d2c5b1] truncate pl-2 flex-1 select-all font-mono">
                {inviteUrl}
              </span>

              <button
                type="button"
                onClick={handleCopyInvite}
                className="px-3 py-1.5 bg-[#e5b85a] hover:bg-[#ffd580] text-[#402d00] font-space text-xs uppercase rounded-md font-bold transition-all flex items-center gap-1 shadow-sm shrink-0 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedLink ? 'done' : 'content_copy'}
                </span>
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Configuración del Drafteo */}
          <div className="bg-[#1c1f29] p-3.5 rounded-xl flex flex-col justify-between gap-2 border border-[#272a33]/60">
            <div className="flex items-center justify-between">
              <span className="font-space text-[11px] text-[#d2c5b1] uppercase tracking-wider font-semibold">
                Configuración de la Sesión
              </span>
              <span className="material-symbols-outlined text-[#ffd580] text-[18px]">tune</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-space">
              <div className="bg-[#10131c] px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                <span className="text-[#d2c5b1]/70">Capacidad:</span>
                <span className="font-bold text-[#ffd580]">{targetCount} Jugadores</span>
              </div>

              <div className="bg-[#10131c] px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                <span className="text-[#d2c5b1]/70">Sobres:</span>
                <span className="font-bold text-[#ffd580]">{config?.packCount || 3} × 15</span>
              </div>

              <div className="bg-[#10131c] px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                <span className="text-[#d2c5b1]/70">Picks Totales:</span>
                <span className="font-bold text-[#ffd580]">{(config?.packCount || 3) * 15} cartas</span>
              </div>

              <div className="bg-[#10131c] px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                <span className="text-[#d2c5b1]/70">Tiempo Turno:</span>
                <span className="font-bold text-[#ffd580]">
                  {config?.timerSeconds ? `${config.timerSeconds}s` : 'Sin Límite'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* If user hasn't joined the room yet, prompt to take a seat */}
        {!hasTakenSeat && (
          <form onSubmit={handleJoinSubmit} className="bg-[#1c1f29] p-4 rounded-xl border border-[#ffd580]/40 shadow-lg relative z-10 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full space-y-1">
              <label className="font-space text-xs text-[#ffd580] uppercase tracking-wider font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Ingresa tu nombre para tomar un asiento en la mesa:</span>
              </label>
              <input
                type="text"
                placeholder="Tu nombre de Drafter"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={24}
                className="w-full px-3.5 py-2 bg-[#0b0e17] border border-[#272a33] rounded-lg text-[#e0e2ef] placeholder-[#d2c5b1]/40 text-xs sm:text-sm focus:outline-none focus:border-[#ffd580] focus:ring-1 focus:ring-[#ffd580] transition-all font-manrope"
              />
            </div>
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#e5b85a] hover:bg-[#ffd580] text-[#402d00] font-space text-xs uppercase rounded-lg font-bold transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-40"
            >
              Tomar Asiento
            </button>
          </form>
        )}

        {/* ================= SECTION 2: ASIENTOS DE LA MESA (SEATING ORDER & PRIORITY) ================= */}
        <div className="flex flex-col gap-2.5 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#272a33] pb-2">
            <div className="flex items-center gap-2">
              <span className="font-space text-xs text-[#e0e2ef] uppercase tracking-wider font-semibold">
                Asientos de la Mesa & Orden de Prioridad ({currentCount}/{targetCount})
              </span>
            </div>

            {/* Randomize Seating Button (Host Only) */}
            {isHost && (
              <button
                type="button"
                onClick={handleShuffle}
                disabled={isShuffling}
                className={`px-3.5 py-1.5 bg-[#1c1f29] hover:bg-[#272a33] border border-[#ffd580]/40 hover:border-[#ffd580] text-[#ffd580] font-space text-xs uppercase rounded-lg font-bold transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer active:scale-95 ${
                  isShuffling ? 'opacity-60 pointer-events-none' : ''
                }`}
                title="Randomizar aleatoriamente los asientos de los jugadores"
              >
                <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
                <span>Randomizar Orden</span>
              </button>
            )}
          </div>

          {/* Grid of Seats */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            <AnimatePresence>
              {totalSeats.map((seat, idx) => {
                const isOccupied = seat.type === 'player';
                const player = seat.data;
                const isMe = isOccupied && player.id === myId;
                const isPlayerHost = isOccupied && player.isAdmin;

                return (
                  <motion.div
                    key={isOccupied ? player.id : `seat_empty_${idx}`}
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`p-3 rounded-xl border flex flex-col justify-between min-h-[96px] transition-all relative overflow-hidden ${
                      isOccupied
                        ? isMe
                          ? 'bg-[#1c1f29] border-[#ffd580] shadow-[0_0_15px_rgba(255,213,128,0.15)] ring-1 ring-[#ffd580]/50'
                          : 'bg-[#1c1f29] border-[#272a33]'
                        : 'bg-[#10131c]/70 border-dashed border-[#272a33] opacity-60'
                    }`}
                  >
                    {/* Top Seat Header: Seat Number + Status Ring */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-cinzel text-xs font-bold text-[#ffd580]">
                          #{idx + 1}
                        </span>
                        <span className="font-space text-[10px] uppercase tracking-wider text-[#d2c5b1]/60">
                          Asiento
                        </span>
                      </div>

                      {isOccupied ? (
                        <div className="flex items-center gap-1">
                          {isPlayerHost && (
                            <span title="Anfitrión de la sala">
                              <Crown className="w-3.5 h-3.5 text-[#ffd580]" />
                            </span>
                          )}
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                        </div>
                      ) : (
                        <span className="font-space text-[9px] uppercase tracking-wider text-[#d2c5b1]/40">
                          Vacío
                        </span>
                      )}
                    </div>

                    {/* Middle Player Identity */}
                    <div className="my-1 flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isOccupied
                            ? isMe
                              ? 'bg-[#ffd580] text-[#402d00]'
                              : 'bg-[#272a33] text-[#ffd580]'
                            : 'bg-[#181b24] text-[#d2c5b1]/30 border border-white/5'
                        }`}
                      >
                        {isOccupied ? (
                          isPlayerHost ? <Crown className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />
                        ) : (
                          <Bot className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-space font-bold text-xs truncate text-[#e0e2ef]">
                          {isOccupied ? player.name : 'Slot Disponible'}
                        </div>
                        <div className="text-[10px] text-[#d2c5b1]/60 truncate font-manrope">
                          {isOccupied
                            ? isMe ? 'Tú (En mesa)' : (isPlayerHost ? 'Anfitrión' : 'Drafter')
                            : 'Se rellenará con IA'}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Priority Tag */}
                    <div className="flex items-center justify-between text-[9px] font-space border-t border-white/5 pt-1.5 text-[#d2c5b1]/50 uppercase">
                      <span>Prioridad #{idx + 1}</span>
                      {idx === 0 && (
                        <span className="text-[#ffd580] font-bold">1er Turno</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          <div className="flex items-center justify-between text-[11px] font-space text-[#d2c5b1]/70 px-1 pt-0.5">
            <span>
              {botsNeeded > 0
                ? `Faltan ${botsNeeded} jugadores para completar los ${targetCount} asientos.`
                : 'Mesa completa con todos los participantes listos.'}
            </span>
            <span className="text-[#ffd580] text-right font-medium">
              Giro de cartas: Horario (Sobre 1)
            </span>
          </div>
        </div>

        {/* ================= SECTION 3: BOTTOM ACTIONS (START DRAFT / WAITING HOST) ================= */}
        <div className="pt-2 flex flex-col gap-2 relative z-10 border-t border-[#272a33]">
          {isHost ? (
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleStart}
                className="w-full py-3.5 bg-[#ffd580] hover:bg-[#ffdea2] text-[#402d00] font-space text-sm uppercase rounded-xl font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,213,128,0.4)] active:scale-[0.99] cursor-pointer"
              >
                <span>INICIAR DRAFT CON ESTE ORDEN DE PRIORIDAD</span>
                <span className="material-symbols-outlined text-[20px]">east</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[#d2c5b1]/80 text-center font-space text-[10px] sm:text-[11px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[15px]">smart_toy</span>
                <span>
                  {botsNeeded > 0
                    ? `Los ${botsNeeded} asientos vacíos se completarán automáticamente con IAs`
                    : 'Todos los asientos están ocupados por jugadores'}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full py-3.5 px-4 bg-[#1c1f29] rounded-xl border border-[#272a33] text-center flex items-center justify-center gap-2 text-xs font-space text-[#d2c5b1]">
              <span className="w-2 h-2 rounded-full bg-[#ffd580] animate-ping shrink-0" />
              <span>
                Esperando a que el anfitrión inicie la partida con el orden de prioridad definido...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="w-full max-w-3xl mt-6 px-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[#d2c5b1]/60 font-space text-[10px] sm:text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="uppercase">Getaway Draft Engine v2.4</span>
          <span>•</span>
          <span>Synchronized via WebSocket</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="uppercase">Magic: The Gathering ™ WotC</span>
          <span>•</span>
          <span className="text-[#ffd580] hover:underline cursor-pointer">Cube 360</span>
        </div>
      </footer>
    </div>
  );
}
