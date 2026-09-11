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
  const [avatar, setAvatar] = useState('azorius');
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
  const avatars = [
    { id: 'azorius', label: 'Azorius', src: '/avatar-azorius.png' },
    { id: 'orzhov', label: 'Orzhov', src: '/avatar-orzhov.png' },
    { id: 'izzet', label: 'Izzet', src: '/avatar-izzet.png' },
    { id: 'rakdos', label: 'Rakdos', src: '/avatar-rakdos.png' },
    { id: 'golgari', label: 'Golgari', src: '/avatar-golgari.png' }
  ];

  return (
    <div className="w-full flex flex-col justify-center items-center py-6 px-3 sm:px-4 font-manrope text-slate-200">
      
      {/* Mode Switcher Pills (Top) */}
      <div className="flex bg-[#181b24] p-1 rounded-xl border border-[#272a33] mb-4 shadow-lg text-xs font-space">
        <button
          type="button"
          onClick={() => {
            sound.playHover();
            setMode('create');
          }}
          className={`py-1.5 px-4 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            mode === 'create'
              ? 'bg-[#e5b85a] text-[#402d00] font-bold shadow-[0_0_10px_rgba(229,184,90,0.3)]'
              : 'text-[#d2c5b1] hover:text-white'
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
              ? 'bg-[#e5b85a] text-[#402d00] font-bold shadow-[0_0_10px_rgba(229,184,90,0.3)]'
              : 'text-[#d2c5b1] hover:text-white'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Unirse con Código</span>
        </button>
      </div>

      {/* Main Glass/Obsidian Card */}
      <div className="setup-panel relative w-full max-w-2xl rounded-2xl p-5 sm:p-7 md:p-8 flex flex-col gap-5 overflow-hidden my-auto">
        
        {/* Subtle Ambient Gold Bloom Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#ffd580]/5 blur-[100px] pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col items-center text-center gap-1 relative z-10">
          <div className="flex items-center gap-1 text-[#ffd580] font-space text-[10px] sm:text-xs uppercase tracking-widest font-semibold">
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Inicialización</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl text-[#ffd580] tracking-wider uppercase font-bold drop-shadow-[0_2px_10px_rgba(255,213,128,0.2)]">
            Cube Setup
          </h1>

          <p className="text-xs sm:text-sm text-[#d2c5b1] font-manrope">
            {mode === 'create'
              ? 'Configura los parámetros de la sesión antes de comenzar el draft'
              : 'Ingresa tus datos para unirte a la mesa del draft'}
          </p>
        </div>

        {mode === 'create' ? (
          /* ================= CREATE ROOM FORM ================= */
          <div className="flex flex-col gap-4 relative z-10">
            
            {/* Host Display Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-space text-xs text-[#e0e2ef] uppercase tracking-wider font-semibold flex items-center justify-between">
                <span>Nombre del Anfitrión</span>
                <span className="text-[10px] text-[#ffd580] font-normal uppercase">Drafter Líder</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Luis the Planeswalker"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                maxLength={24}
                className="w-full px-3.5 py-2.5 bg-[#1c1f29] border border-[#272a33] rounded-lg text-[#e0e2ef] placeholder-[#d2c5b1]/40 text-xs sm:text-sm focus:outline-none focus:border-[#ffd580] focus:ring-1 focus:ring-[#ffd580] transition-all font-manrope"
              />
              <div className="avatar-picker" aria-label="Elige tu avatar">
                {avatars.map(option => <button key={option.id} type="button" className={`avatar-choice ${avatar === option.id ? 'selected' : ''}`} onClick={() => setAvatar(option.id)} aria-label={`Avatar ${option.label}`} aria-pressed={avatar === option.id}><img src={option.src} alt="" /><span>{option.label}</span></button>)}
              </div>
            </div>

            {/* 1. NÚMERO DE JUGADORES */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-space text-xs text-[#e0e2ef] uppercase tracking-wider font-semibold">
                  Número de Jugadores
                </label>
                <span className="font-space text-xs text-[#ffd580] uppercase font-semibold">
                  {playerCount} Jugadores {playerCount === 8 ? '(Recomendado)' : ''}
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
                      className={`py-2 px-1 rounded-lg font-space text-xs transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-[#e5b85a] text-[#402d00] font-bold shadow-[0_0_10px_rgba(229,184,90,0.3)]'
                          : 'bg-[#1c1f29] text-[#d2c5b1] hover:bg-[#272a33] border border-white/5'
                      }`}
                    >
                      <span className="text-sm font-bold">{p.count}</span>
                      <span className={`text-[9px] sm:text-[10px] ${isSelected ? 'text-[#402d00] font-bold' : 'text-[#d2c5b1]/70'}`}>
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. TWO COLUMNS: SOBRES POR JUGADOR + LÍMITE DE TIEMPO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              {/* SOBRES POR JUGADOR */}
              <div className="bg-[#1c1f29] p-3.5 rounded-xl flex flex-col gap-1.5 border border-[#272a33]/60">
                <div className="flex items-center justify-between">
                  <span className="font-space text-xs text-[#e0e2ef] uppercase font-semibold">
                    Sobres por Jugador
                  </span>
                  <span className="material-symbols-outlined text-[#7bd0ff] text-[20px]">layers</span>
                </div>

                <div className="flex items-center justify-between mt-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-cinzel text-2xl text-[#ffd580] font-bold">
                      {packCount}
                    </span>
                    <span className="font-space text-xs text-[#d2c5b1]">
                      × 15 cartas
                    </span>
                  </div>

                  {/* Pack Selector Buttons */}
                  <div className="flex items-center gap-1">
                    {availablePackChoices.map((num) => {
                      const isSelected = packCount === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            sound.playSelect();
                            setPackCount(num);
                          }}
                          className={`py-1 px-2.5 rounded font-space text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#e5b85a] text-[#402d00] shadow-sm'
                              : 'bg-[#272a33] text-[#d2c5b1] hover:text-white'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <span className="font-space text-[10px] text-[#d2c5b1]/70 mt-0.5">
                  {packCount * 15} picks totales por participante
                </span>
              </div>

              {/* LÍMITE DE TIEMPO */}
              <div className="bg-[#1c1f29] p-3.5 rounded-xl flex flex-col gap-1.5 border border-[#272a33]/60">
                <div className="flex items-center justify-between">
                  <span className="font-space text-xs text-[#e0e2ef] uppercase font-semibold">
                    Límite de Tiempo
                  </span>
                  <span className="material-symbols-outlined text-[#ffd580] text-[20px]">hourglass_top</span>
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
                        className={`py-1.5 rounded font-space text-xs font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#e5b85a] text-[#402d00] shadow-[0_0_8px_rgba(229,184,90,0.3)]'
                            : 'bg-[#272a33] text-[#d2c5b1] hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <span className="font-space text-[10px] text-[#d2c5b1]/70 mt-0.5">
                  Timer de selección por sobre
                </span>
              </div>
            </div>

            {/* 3. ENLACE DE INVITACIÓN WEB */}
            <div className="bg-[#1c1f29] p-3.5 rounded-xl flex flex-col gap-1.5 border border-[#272a33]/60">
              <div className="flex items-center justify-between">
                <span className="font-space text-[11px] text-[#d2c5b1] uppercase tracking-wider font-semibold">
                  Enlace de Invitación Web
                </span>
                <span className="font-space text-[11px] text-[#ffd580] uppercase font-bold tracking-wider">
                  Sala: {generatedRoomId}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-[#0b0e17] p-1.5 rounded-lg border border-white/5">
                <span className="font-space text-xs text-[#d2c5b1] truncate pl-2 flex-1 select-all font-mono">
                  {inviteUrl}
                </span>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-[#e5b85a] hover:bg-[#ffd580] text-[#402d00] font-space text-xs uppercase rounded-md font-bold transition-all flex items-center gap-1 shadow-sm shrink-0 cursor-pointer active:scale-95"
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
                className="w-full py-3.5 bg-[#ffd580] hover:bg-[#ffdea2] text-[#402d00] font-space text-sm uppercase rounded-xl font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,213,128,0.4)] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>CREAR SALA Y PASAR AL LOBBY</span>
                <span className="material-symbols-outlined text-[20px]">east</span>
              </button>

              <div className="flex items-center justify-center gap-1 text-[#d2c5b1]/80 text-center">
                <span className="material-symbols-outlined text-[15px]">lock_reset</span>
                <span className="font-space text-[10px] sm:text-[11px] uppercase tracking-wider">
                  El código expirará tras 3 horas de inactividad
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ================= JOIN WITH CODE FORM ================= */
          <div className="flex flex-col gap-4 relative z-10">
            {/* Room Code */}
            <div className="flex flex-col gap-1.5">
              <label className="font-space text-xs text-[#e0e2ef] uppercase tracking-wider font-semibold">
                Código de Sala
              </label>
              <input
                type="text"
                placeholder="Ej. ARCANE-ABC123"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                maxLength={16}
                className="w-full px-3.5 py-3 bg-[#1c1f29] border border-[#272a33] rounded-lg text-[#ffd580] font-mono text-center tracking-widest text-base sm:text-lg uppercase placeholder-[#d2c5b1]/40 focus:outline-none focus:border-[#ffd580] focus:ring-1 focus:ring-[#ffd580] transition-all font-bold"
              />
            </div>

            {/* Player Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-space text-xs text-[#e0e2ef] uppercase tracking-wider font-semibold">
                Tu Nombre de Jugador
              </label>
              <input
                type="text"
                placeholder="Ej. Chandra Fan"
                value={joinPlayerName}
                onChange={(e) => setJoinPlayerName(e.target.value)}
                maxLength={24}
                className="w-full px-3.5 py-2.5 bg-[#1c1f29] border border-[#272a33] rounded-lg text-[#e0e2ef] placeholder-[#d2c5b1]/40 text-xs sm:text-sm focus:outline-none focus:border-[#ffd580] focus:ring-1 focus:ring-[#ffd580] transition-all font-manrope"
              />
              <div className="avatar-picker" aria-label="Elige tu avatar">
                {avatars.map(option => <button key={option.id} type="button" className={`avatar-choice ${avatar === option.id ? 'selected' : ''}`} onClick={() => setAvatar(option.id)} aria-label={`Avatar ${option.label}`} aria-pressed={avatar === option.id}><img src={option.src} alt="" /><span>{option.label}</span></button>)}
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleJoin}
                disabled={!isConnected || !roomIdInput.trim()}
                className="w-full py-3.5 bg-[#ffd580] hover:bg-[#ffdea2] text-[#402d00] font-space text-sm uppercase rounded-xl font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,213,128,0.4)] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>ENTRAR AL LOBBY</span>
                <span className="material-symbols-outlined text-[20px]">east</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding matching mockup */}
      <footer className="w-full max-w-2xl mt-6 px-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[#d2c5b1]/60 font-space text-[10px] sm:text-[11px]">
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
