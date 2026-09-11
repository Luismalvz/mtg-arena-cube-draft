import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sound } from '../utils/audio';
import {
  Sliders,
  Layers,
  Clock,
  Copy,
  Check,
  ArrowRight,
  LogIn,
  Lock,
  Hourglass,
  Sparkles
} from 'lucide-react';
import { TOKEN_AVATARS } from '../utils/tokenAvatars';

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
  const [playerCount, setPlayerCount] = useState(8);
  const [packCount, setPackCount] = useState(3);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [avatar, setAvatar] = useState('046');
  const [copiedLink, setCopiedLink] = useState(false);

  // Pre-generate a stylish room code for preview
  const [generatedRoomId] = useState(() => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const randNum = Math.floor(100 + Math.random() * 900);
    return `ARCANE-${randLetters}${randNum}`;
  });

  const activeRoomId = mode === 'join' ? (roomIdInput || 'SALA') : generatedRoomId;

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

  // Pack buttons to offer (min 3, up to maxPossiblePacks, showing up to 4 choices)
  const availablePackChoices = [];
  for (let p = minPacks; p <= Math.min(minPacks + 2, maxPossiblePacks); p++) {
    availablePackChoices.push(p);
  }

  // Invite URL preview
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${activeRoomId}`
    : `https://arcane.draft/join/${activeRoomId}`;

  const handleCopyLink = async () => {
    sound.playSelect();
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {}
  };

  const handleCreate = (e) => {
    e?.preventDefault();
    sound.playSelect();
    const cleanName = adminName.trim() || 'Admin Drafter';
    onCreateRoom({
      roomId: generatedRoomId,
      playerName: cleanName,
      options: {
        playerCount,
        packCount,
        timerSeconds,
        avatar
      }
    });
  };

  const handleJoin = (e) => {
    e?.preventDefault();
    if (!roomIdInput.trim()) return;
    sound.playSelect();
    const cleanName = joinPlayerName.trim() || 'Drafter';
    onJoinRoom({
      roomId: roomIdInput.trim().toUpperCase(),
      playerName: cleanName,
      avatar
    });
  };

  const playerPresets = [
    { count: 2, label: 'Duelo' },
    { count: 3, label: 'Trío' },
    { count: 4, label: 'Minipod' },
    { count: 5, label: 'Pentágono' },
    { count: 6, label: 'Ágil' },
    { count: 7, label: 'Mesa' },
    { count: 8, label: 'Estándar', isRecommended: true }
  ];

  return (
    <div className="w-full flex flex-col justify-center items-center py-6 px-3 sm:px-4 font-sans text-[#ecd8b7]">
      
      {/* Mode Switcher Pills (Top) */}
      <div className="flex bg-[#2a1a0f]/60 backdrop-blur-md p-1 rounded-xl border border-[#4a3219]/60 mb-4 shadow-lg text-xs font-sans">
        <button
          type="button"
          onClick={() => {
            sound.playHover();
            setMode('create');
          }}
          className={`py-1.5 px-4 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            mode === 'create'
              ? 'bg-amber-500 text-amber-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-[#cbb593] hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Crear Nueva Sala</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playHover();
            setMode('join');
          }}
          className={`py-1.5 px-4 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            mode === 'join'
              ? 'bg-amber-500 text-amber-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-[#cbb593] hover:text-white'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Unirse con Código</span>
        </button>
      </div>

      {/* Main Glass/Obsidian Card */}
      <div className="relative w-full max-w-2xl rounded-2xl p-5 sm:p-7 md:p-8 flex flex-col gap-5 overflow-hidden my-auto bg-[#1a0f08]/90 backdrop-blur-xl border border-[#4a3219]/80 shadow-[0_0_50px_rgba(42,26,15,0.7)]">
        
        {/* Subtle Ambient Gold Bloom Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col items-center text-center gap-1 relative z-10">
          

          <h1 className="font-cinzel text-3xl sm:text-4xl text-amber-400 tracking-wider uppercase font-bold drop-shadow-md">
            Cube Setup
          </h1>

          
        </div>

        {mode === 'create' ? (
          /* ================= CREATE ROOM FORM ================= */
          <div className="flex flex-col gap-4 relative z-10">
            
            {/* Host Display Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs text-[#ecd8b7] uppercase tracking-wider font-semibold">
                <span>Nombre del Anfitrión</span>
                
              </label>
              <input
                type="text"
                placeholder="Ej. Luis the Planeswalker"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                maxLength={24}
                className="w-full px-3.5 py-2.5 bg-[#2a1a0f]/90 backdrop-blur-sm border border-[#4a3219]/60 rounded-lg text-[#ecd8b7] placeholder-[#d2c5b1]/40 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
              />
              <div className="avatar-picker" aria-label="Elige tu avatar">
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

            {/* 1. NÚMERO DE JUGADORES */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-sans text-xs text-[#ecd8b7] uppercase tracking-wider font-semibold">
                  Número de Jugadores
                </label>
                <span className="font-sans text-xs text-amber-400 uppercase font-semibold">
                  {playerCount} Jugadores 
                </span>
              </div>

              {/* 7 Player count buttons (2 to 8) */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {playerPresets.map((p) => {
                  const isSelected = playerCount === p.count;
                  return (
                    <button
                      key={p.count}
                      type="button"
                      onClick={() => {
                        sound.playHover();
                        setPlayerCount(p.count);
                      }}
                      className={`py-2 px-1 rounded-lg font-sans text-xs transition-all flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-amber-950 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-[#2a1a0f]/90 backdrop-blur-sm text-[#cbb593] hover:bg-[#3d2616] border border-[#ffd580]/10'
                      }`}
                    >
                      <span className="text-sm font-bold">{p.count}</span>
                      <span className={`text-[9px] sm:text-[10px] ${isSelected ? 'text-amber-950 font-bold' : 'text-[#cbb593]'}`}>
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. TWO COLUMNS: SOBRES POR JUGADOR + LÍMITE DE TIEMPO */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              
              {/* LÍMITE DE TIEMPO */}
              <div className="bg-[#2a1a0f]/90 backdrop-blur-sm p-3.5 rounded-xl flex flex-col gap-1.5 border border-[#4a3219]/60">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-[#ecd8b7] uppercase font-semibold">
                    Límite de Tiempo
                  </span>
                  <span className="material-symbols-outlined text-amber-400 text-[20px]">hourglass_top</span>
                </div>

                <div className="grid grid-cols-4 gap-1 mt-1">
                  {[
                    { val: 30, label: '30s' },
                    { val: 45, label: '45s' },
                    { val: 60, label: '60s' },
                    { val: 0, label: '∞' }
                  ].map((t) => {
                    const isSelected = timerSeconds === t.val;
                    return (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => {
                          sound.playSelect();
                          setTimerSeconds(t.val);
                        }}
                        className={`py-1.5 rounded font-sans text-xs font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-amber-950 shadow-[0_0_8px_rgba(229,184,90,0.3)]'
                            : 'bg-[#3d2616] text-[#cbb593] hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <span className="font-sans text-[10px] text-[#cbb593] mt-0.5">
                  Timer de selección por sobre
                </span>
              </div>
            </div>

            {/* 3. ENLACE DE INVITACIÓN WEB */}
            <div className="bg-[#2a1a0f]/90 backdrop-blur-sm p-3.5 rounded-xl flex flex-col gap-1.5 border border-[#4a3219]/60">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[11px] text-[#cbb593] uppercase tracking-wider font-semibold">
                  Enlace de Invitación Web
                </span>
                <span className="font-sans text-[11px] text-amber-400 uppercase font-bold tracking-wider">
                  Sala: {generatedRoomId}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-[#1a0f08]/80 p-1.5 rounded-lg border border-[#ffd580]/10">
                <span className="font-sans text-xs text-[#cbb593] truncate pl-2 flex-1 select-all font-mono">
                  {inviteUrl}
                </span>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-500 text-amber-950 font-sans text-xs uppercase rounded-md font-bold transition-all flex items-center gap-1 shadow-sm shrink-0 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedLink ? 'done' : 'content_copy'}
                  </span>
                  <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* 4. MAIN CTA BUTTON & FOOTER CAPTION */}
            <div className="pt-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={!isConnected}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-300 text-amber-950 font-sans text-sm uppercase rounded-xl font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>CREAR SALA Y PASAR AL LOBBY</span>
                <span className="material-symbols-outlined text-[20px]">east</span>
              </button>

              
            </div>
          </div>
        ) : (
          /* ================= JOIN WITH CODE FORM ================= */
          <div className="flex flex-col gap-4 relative z-10">
            {/* Room Code */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs text-[#ecd8b7] uppercase tracking-wider font-semibold">
                Código de Sala
              </label>
              <input
                type="text"
                placeholder="Ej. ARCANE-ABC123"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                maxLength={16}
                className="w-full px-3.5 py-3 bg-[#2a1a0f]/90 backdrop-blur-sm border border-[#4a3219]/60 rounded-lg text-amber-400 font-mono text-center tracking-widest text-base sm:text-lg uppercase placeholder-[#d2c5b1]/40 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-bold"
              />
            </div>

            {/* Player Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs text-[#ecd8b7] uppercase tracking-wider font-semibold">
                Tu Nombre de Jugador
              </label>
              <input
                type="text"
                placeholder="Ej. Chandra Fan"
                value={joinPlayerName}
                onChange={(e) => setJoinPlayerName(e.target.value)}
                maxLength={24}
                className="w-full px-3.5 py-2.5 bg-[#2a1a0f]/90 backdrop-blur-sm border border-[#4a3219]/60 rounded-lg text-[#ecd8b7] placeholder-[#d2c5b1]/40 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
              />
              <div className="avatar-picker" aria-label="Elige tu avatar">
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

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleJoin}
                disabled={!isConnected || !roomIdInput.trim()}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-300 text-amber-950 font-sans text-sm uppercase rounded-xl font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>ENTRAR AL LOBBY</span>
                <span className="material-symbols-outlined text-[20px]">east</span>
              </button>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
}
