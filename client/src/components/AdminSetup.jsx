import React, { useState } from 'react';
import { ArrowRight, LogIn, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../utils/audio';
import { TOKEN_AVATARS } from '../utils/tokenAvatars';

export function AdminSetup({ onCreateRoom, onJoinRoom, initialRoomId = '', isConnected = true }) {
  const [mode, setMode] = useState(initialRoomId ? 'join' : 'create');
  const [adminName, setAdminName] = useState('');
  const [joinPlayerName, setJoinPlayerName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState(initialRoomId);
  const [playerCount, setPlayerCount] = useState(8);
  const [packCount, setPackCount] = useState(3);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [avatar, setAvatar] = useState('046');

  const maxPossiblePacks = Math.max(3, Math.floor(360 / (playerCount * 15)));
  const chooseAvatar = (id) => { setAvatar(id); sound.playHover(); };
  const create = (event) => {
    event.preventDefault(); sound.playSelect();
    onCreateRoom({ playerName: adminName.trim() || 'Admin Drafter', avatar, options: { playerCount, packCount, timerSeconds, avatar } });
  };
  const join = (event) => {
    event.preventDefault(); if (!roomIdInput.trim()) return; sound.playSelect();
    onJoinRoom({ roomId: roomIdInput.trim().toUpperCase(), playerName: joinPlayerName.trim() || 'Drafter', avatar });
  };

  return (
    <div className="min-h-[100dvh] w-full px-4 py-5 sm:px-7 sm:py-7 flex flex-col">
      <header className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-[#d8b770]/35 text-[#e7cb8e] text-sm">G</span>
          <span className="text-sm font-semibold tracking-[-.03em]">Getaway Draft</span>
        </div>
        <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-[#83d9d2] shadow-[0_0_12px_#83d9d2]' : 'bg-[#ff766d]'}`} aria-label={isConnected ? 'Conectado' : 'Sin conexión'} />
      </header>

      <div className="m-auto w-full max-w-[1020px] grid gap-8 lg:grid-cols-[.88fr_1.12fr] lg:items-center">
        <div className="max-w-md">
          <p className="mb-5 text-[12px] font-semibold uppercase tracking-[.22em] text-[#d8b770]">Ravnica cube</p>
          <h1 className="text-[clamp(2.8rem,6vw,5.8rem)] font-medium leading-[.86] tracking-[-.075em] text-[#f1f3ed]">Una mesa.<br/>Toda la ciudad.</h1>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#0d110f]/78 p-3 shadow-[0_50px_120px_rgba(0,0,0,.48)] backdrop-blur-2xl sm:p-4">
          <div className="mb-3 grid grid-cols-2 rounded-2xl bg-black/25 p-1" role="tablist">
            {[['create', Plus, 'Crear'], ['join', LogIn, 'Entrar']].map(([value, Icon, label]) => (
              <button key={value} role="tab" aria-selected={mode === value} onClick={() => setMode(value)} className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition ${mode === value ? 'bg-white text-[#0a0c0b]' : 'text-[#9ba49d] hover:text-white'}`}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .2 }} onSubmit={mode === 'create' ? create : join} className="grid gap-3">
              {mode === 'join' && (
                <input autoFocus aria-label="Código de sala" className="h-14 rounded-2xl border border-white/10 bg-white/[.035] px-5 text-center text-lg font-semibold tracking-[.14em] uppercase outline-none transition focus:border-[#d8b770]/60" placeholder="CÓDIGO DE SALA" value={roomIdInput} onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())} maxLength={16} />
              )}
              <input aria-label="Nombre" className="h-14 rounded-2xl border border-white/10 bg-white/[.035] px-5 text-base outline-none transition placeholder:text-[#677069] focus:border-[#d8b770]/60" placeholder="Tu nombre" value={mode === 'create' ? adminName : joinPlayerName} onChange={(e) => mode === 'create' ? setAdminName(e.target.value) : setJoinPlayerName(e.target.value)} maxLength={24} />

              <div className="avatar-picker scrollbar-hide" aria-label="Avatar">
                {TOKEN_AVATARS.map((option) => <button key={option.id} type="button" className={`avatar-choice ${avatar === option.id ? 'selected' : ''}`} onClick={() => chooseAvatar(option.id)} aria-label={`Avatar ${option.id}`} aria-pressed={avatar === option.id}><img src={option.src} alt="" /></button>)}
              </div>

              {mode === 'create' && (
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-[#9ba49d]"><span>Jugadores</span><strong className="text-white">{playerCount}</strong></div>
                    <div className="grid grid-cols-7 gap-1">{[2,3,4,5,6,7,8].map(n => <button type="button" key={n} onClick={() => { setPlayerCount(n); setPackCount(current => Math.min(current, Math.max(3, Math.floor(360 / (n * 15))))); }} className={`h-8 rounded-lg text-xs ${playerCount === n ? 'bg-[#d8b770] text-[#12100b]' : 'bg-white/[.045] text-[#9ba49d] hover:text-white'}`}>{n}</button>)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-[#9ba49d]"><span>Sobres</span><strong className="text-white">{packCount}</strong></div>
                    <div className="grid grid-cols-3 gap-1">{Array.from({ length: Math.min(3, maxPossiblePacks - 2) }, (_, i) => i + 3).map(n => <button type="button" key={n} onClick={() => setPackCount(n)} className={`h-8 rounded-lg text-xs ${packCount === n ? 'bg-[#d8b770] text-[#12100b]' : 'bg-white/[.045] text-[#9ba49d] hover:text-white'}`}>{n}</button>)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-[#9ba49d]"><span>Tiempo</span><strong className="text-white">{timerSeconds ? `${timerSeconds}s` : '∞'}</strong></div>
                    <div className="grid grid-cols-4 gap-1">{[30,45,60,0].map(n => <button type="button" key={n} onClick={() => setTimerSeconds(n)} className={`h-8 rounded-lg text-xs ${timerSeconds === n ? 'bg-[#d8b770] text-[#12100b]' : 'bg-white/[.045] text-[#9ba49d] hover:text-white'}`}>{n || '∞'}</button>)}</div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={!isConnected || (mode === 'join' && !roomIdInput.trim())} className="group flex h-14 items-center justify-between rounded-2xl bg-[#f1f3ed] px-5 text-sm font-semibold text-[#090b0a] transition hover:bg-[#d8b770] disabled:cursor-not-allowed disabled:opacity-35">
                <span>{mode === 'create' ? 'Crear sala' : 'Entrar a la mesa'}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
