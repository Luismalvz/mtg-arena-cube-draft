import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Copy, Shuffle } from 'lucide-react';
import { sound } from '../utils/audio';
import { PlayerTokenCard } from './PlayerTokenCard';
import { TOKEN_AVATARS } from '../utils/tokenAvatars';
import { useHorizontalWheelScroll } from '../hooks/useHorizontalWheelScroll';

export function PlayerLobby({ roomState, onStartDraft, onRandomizeSeating, onJoinRoomAsPlayer, isHost, myId }) {
  const [copied, setCopied] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('046');
  const avatarPickerRef = useHorizontalWheelScroll();
  if (!roomState) return null;
  const { id: roomId, config, players = [] } = roomState;
  const targetCount = config?.playerCount || 8;
  const botsNeeded = Math.max(0, targetCount - players.length);
  const hasSeat = !!roomState.me;
  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?room=${roomId}` : '';
  const seats = Array.from({ length: targetCount }, (_, index) => players[index] ? { type: 'player', data: players[index], seatIndex: index } : { type: 'vacant', seatIndex: index });

  const copy = async () => { sound.playSelect(); try { await navigator.clipboard.writeText(inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* Optional clipboard. */ } };
  const shuffle = () => { if (!isHost || shuffling) return; setShuffling(true); sound.playShuffle(); onRandomizeSeating?.(); setTimeout(() => setShuffling(false), 550); };
  const join = (event) => { event.preventDefault(); if (!name.trim()) return; sound.playSelect(); onJoinRoomAsPlayer?.({ playerName: name.trim(), avatar }); };
  const start = () => { sound.playFanfare(); onStartDraft(); };

  return (
    <div className="min-h-[100dvh] w-full px-4 py-5 sm:px-7 sm:py-7 flex flex-col overflow-hidden">
      <main className="m-auto w-full max-w-[1380px] py-5">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><button onClick={copy} className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[.2em] text-[#d8b770] transition hover:text-[#f1d99e]">Mesa {roomId}{copied ? <Check className="h-3.5 w-3.5 text-[#83d9d2]" /> : <Copy className="h-3.5 w-3.5" />}</button><h1 className="text-[clamp(2rem,4vw,4rem)] font-medium leading-none tracking-[-.065em]">{players.length} / {targetCount}</h1></div>
          <div className="flex items-center gap-2 text-xs text-[#9ba49d]"><span>{config?.packCount || 3} sobres</span><span className="text-white/20">/</span><span>{config?.timerSeconds ? `${config.timerSeconds}s` : '∞'}</span>{isHost && <button onClick={shuffle} aria-label="Mezclar asientos" title="Mezclar asientos" className="ml-2 grid h-9 w-9 place-items-center rounded-full border border-white/10 hover:border-[#d8b770]/45 hover:text-[#e7cb8e]"><Shuffle className={`h-4 w-4 ${shuffling ? 'animate-spin' : ''}`} /></button>}</div>
        </div>

        {!hasSeat && <form onSubmit={join} className="mb-4 grid gap-3 rounded-2xl border border-[#d8b770]/28 bg-[#0d110f]/85 p-3 sm:grid-cols-[minmax(160px,260px)_1fr_auto] sm:items-center"><input aria-label="Tu nombre" className="h-11 rounded-xl border border-white/10 bg-white/[.04] px-4 outline-none focus:border-[#d8b770]/55" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} /><div ref={avatarPickerRef} className="avatar-picker compact">{TOKEN_AVATARS.map(option => <button key={option.id} type="button" className={`avatar-choice ${avatar === option.id ? 'selected' : ''}`} onClick={() => setAvatar(option.id)} aria-label={`Avatar ${option.id}`} aria-pressed={avatar === option.id}><img src={option.src} alt="" /></button>)}</div><button disabled={!name.trim()} className="h-11 rounded-xl bg-[#f1f3ed] px-5 text-sm font-semibold text-[#090b0a] disabled:opacity-35">Tomar asiento</button></form>}

        <motion.div layout className={`grid gap-2.5 sm:gap-3 ${targetCount <= 4 ? 'grid-cols-2 sm:grid-cols-4 max-w-4xl mx-auto' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8'}`}>
          <AnimatePresence>{seats.map((seat, index) => <PlayerTokenCard key={seat.type === 'player' ? seat.data.id : `vacant-${index}`} seat={seat} seatIndex={index} myId={myId} />)}</AnimatePresence>
        </motion.div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-xs text-[#778079]">{botsNeeded ? `${botsNeeded} bot${botsNeeded === 1 ? '' : 's'} al iniciar` : 'Mesa completa'}</span>
          {isHost ? <button onClick={start} className="group flex h-12 items-center gap-7 rounded-full bg-[#f1f3ed] px-6 text-sm font-semibold text-[#090b0a] transition hover:bg-[#d8b770]">Iniciar draft<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button> : <span className="flex items-center gap-2 text-xs text-[#9ba49d]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d8b770]" />Esperando</span>}
        </div>
      </main>
    </div>
  );
}
