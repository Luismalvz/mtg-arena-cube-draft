import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sound } from '../utils/audio';
import { 
  Flame, 
  Users, 
  Layers, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  LogIn,
  Sliders
} from 'lucide-react';

export function AdminSetup({
  onCreateRoom,
  onJoinRoom,
  initialRoomId = '',
  isConnected = true
}) {
  const [mode, setMode] = useState(initialRoomId ? 'join' : 'create'); // 'create' | 'join'
  const [adminName, setAdminName] = useState('');
  const [joinPlayerName, setJoinPlayerName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState(initialRoomId);
  const [playerCount, setPlayerCount] = useState(4);
  const [packCount, setPackCount] = useState(3);
  const [timerSeconds, setTimerSeconds] = useState(45);

  // Dynamic Pack calculation: floor(360 / (numPlayers * 15))
  const cardsPerPack = 15;
  const cubeTotal = 360;
  const cardsNeededPerRound = playerCount * cardsPerPack;
  const maxPossiblePacks = Math.max(3, Math.floor(cubeTotal / cardsNeededPerRound));
  const minPacks = 3;

  // Auto-clamp packCount when playerCount changes
  useEffect(() => {
    if (packCount > maxPossiblePacks) {
      setPackCount(maxPossiblePacks);
    }
  }, [maxPossiblePacks, packCount]);

  const totalCardsInDraft = playerCount * packCount * cardsPerPack;
  const cardsRemainingForPlaza = cubeTotal - totalCardsInDraft;

  const handleCreate = (e) => {
    e.preventDefault();
    sound.playSelect();
    const cleanName = adminName.trim() || 'Admin Drafter';
    onCreateRoom({
      playerName: cleanName,
      options: {
        playerCount,
        packCount,
        timerSeconds
      }
    });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomIdInput.trim()) return;
    sound.playSelect();
    const cleanName = joinPlayerName.trim() || 'Drafter';
    onJoinRoom({
      roomId: roomIdInput.trim().toUpperCase(),
      playerName: cleanName
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-auto py-6">
      {/* Brand Header */}
      <div className="text-center mb-8 space-y-2">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Getaway Draft Edition</span>
        </motion.div>
        
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
          MTG CUBE DRAFT
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
          Draft tradicional de 15 cartas con mecánica exclusiva de intercambio dinámico en el <span className="text-amber-400 font-semibold">Getaway Plaza</span>.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 mb-6 shadow-xl">
        <button
          type="button"
          onClick={() => {
            sound.playHover();
            setMode('create');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            mode === 'create'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Crear Nueva Sala (Admin)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playHover();
            setMode('join');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            mode === 'join'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Unirse con Código</span>
        </button>
      </div>

      {/* Main Card Container */}
      <motion.div 
        layout
        className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow ambient decoration */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {mode === 'create' ? (
          /* CREATE / ADMIN CONFIGURATION FORM */
          <form onSubmit={handleCreate} className="space-y-6 relative z-10">
            {/* Display Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Nombre del Anfitrión (Admin)</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Luis the Planeswalker"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                maxLength={24}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium"
              />
            </div>

            {/* Player Count Selector (2 - 8) */}
            <div className="space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cantidad de Jugadores</span>
                </label>
                <span className="text-base font-black text-amber-400 font-mono">
                  {playerCount} Jugadores
                </span>
              </div>
              
              <input
                type="range"
                min={2}
                max={8}
                step={1}
                value={playerCount}
                onChange={(e) => {
                  sound.playHover();
                  setPlayerCount(parseInt(e.target.value));
                }}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] font-mono text-slate-500 px-1">
                <span>2 (1v1)</span>
                <span>4 (Pod)</span>
                <span>6</span>
                <span>8 (Mesa Completa)</span>
              </div>
            </div>

            {/* Dynamic Packs per Player Selector */}
            <div className="space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sobres por Jugador (15 cartas c/u)</span>
                </label>
                <span className="text-base font-black text-amber-400 font-mono">
                  {packCount} Sobres
                </span>
              </div>

              <input
                type="range"
                min={minPacks}
                max={maxPossiblePacks}
                step={1}
                value={packCount}
                onChange={(e) => {
                  sound.playHover();
                  setPackCount(parseInt(e.target.value));
                }}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              {/* Dynamic Math Explanation */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span className="text-slate-400">Límites para {playerCount} jugadores:</span>
                  <span className="font-mono text-amber-300">Min: {minPacks} | Max: {maxPossiblePacks} sobres</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Fórmula Cube 360: <code className="text-amber-200/90 font-mono bg-slate-950 px-1.5 py-0.5 rounded">floor(360 / ({playerCount} × 15)) = {maxPossiblePacks}</code>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-800/80 pt-1.5">
                  <span>Cartas en draft: {totalCardsInDraft}</span>
                  <span>Restantes para Getaway Plaza / Reserva: {cardsRemainingForPlaza}</span>
                </div>
              </div>
            </div>

            {/* Turn Timer Selector */}
            <div className="space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Tiempo por Turno / Pick</span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '30s', val: 30, desc: 'Rápido' },
                  { label: '45s', val: 45, desc: 'Estándar' },
                  { label: '60s', val: 60, desc: 'Relajado' },
                  { label: '∞', val: 0, desc: 'Sin Límite' }
                ].map((t) => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => {
                      sound.playSelect();
                      setTimerSeconds(t.val);
                    }}
                    className={`py-2 px-2 rounded-xl text-center border transition-all ${
                      timerSeconds === t.val
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-black">{t.label}</div>
                    <div className="text-[10px] text-slate-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Create CTA Button */}
            <button
              type="submit"
              disabled={!isConnected}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Crear Sala & Abrir Lobby</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* JOIN ROOM FORM */
          <form onSubmit={handleJoin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Código de Sala</span>
              </label>
              <input
                type="text"
                placeholder="Ej. A1B2C"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                maxLength={10}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-amber-300 font-mono text-center tracking-widest text-lg uppercase placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Tu Nombre de Jugador</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Chandra Fan"
                value={joinPlayerName}
                onChange={(e) => setJoinPlayerName(e.target.value)}
                maxLength={24}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={!isConnected || !roomIdInput.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Entrar al Lobby</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
