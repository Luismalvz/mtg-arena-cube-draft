import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, User, Bot, Shield, Zap } from 'lucide-react';
import { getAvatarSrc } from '../utils/tokenAvatars';

export function PlayerTokenCard({
  seat,
  seatIndex = 0,
  myId,
  isHost = false
}) {
  const isOccupied = seat.type === 'player';
  const player = seat.data;
  const isMe = isOccupied && player.id === myId;
  const isPlayerHost = isOccupied && player.isAdmin;
  const avatarSrc = isOccupied ? getAvatarSrc(player.avatar) : null;

  return (
    <motion.div
      layout
      initial={{ scale: 0.92, opacity: 0, y: 15 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 24,
        layout: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }
      }}
      className={`relative w-full max-w-[200px] mx-auto select-none transition-all duration-200 ${
        isMe
          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.45)]'
          : 'shadow-[0_10px_25px_rgba(0,0,0,0.8)]'
      }`}
    >
      {/* Authentic MTG Token Card Body */}
      <div
        className={`w-full aspect-[5/7.2] rounded-[10px] p-2 flex flex-col justify-between overflow-hidden border-2 relative ${
          isOccupied
            ? 'bg-[#0d0f17] border-[#222736]'
            : 'bg-[#0d0f17]/70 border-dashed border-[#222736]/70 opacity-70'
        }`}
      >
        {/* Subtle Card Outer Foil Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] to-transparent pointer-events-none" />

        {/* 1. TOP HEADER BANNER (Capsule with Player's Name) */}
        <div className="relative z-10 w-full mb-1">
          <div className="w-full bg-[#0a0c13] border border-[#d4af37]/80 rounded-md px-2 py-0.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {isPlayerHost && (
                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 drop-shadow" />
              )}
              <span className="font-cinzel text-xs font-black text-[#ffd580] uppercase tracking-wider truncate">
                {isOccupied ? player.name : `Slot #${seatIndex + 1}`}
              </span>
            </div>

            {isOccupied ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] shrink-0 ml-1" />
            ) : (
              <span className="text-[9px] font-mono uppercase text-slate-500 shrink-0 ml-1">
                Libre
              </span>
            )}
          </div>
        </div>

        {/* 2. ARTWORK WINDOW (Arched Vaulted Token Frame) */}
        <div className="relative z-10 w-full flex-1 rounded-t-[14px] rounded-b-[4px] overflow-hidden border border-[#d4af37]/40 bg-[#06080d] mb-1">
          {isOccupied && avatarSrc ? (
            <img
              src={avatarSrc}
              alt={player.name}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0e111a] to-[#08090f] text-slate-500">
              <Bot className="w-8 h-8 mb-1 opacity-30 text-amber-400/50 animate-pulse" />
              <span className="text-[10px] font-space text-slate-500 uppercase">
                IA de Mesa
              </span>
            </div>
          )}

          {/* Inner Vignette Shadow */}
          <div className="absolute inset-0 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] pointer-events-none" />

          {isMe && (
            <div className="absolute top-1 right-1 px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
              TÚ
            </div>
          )}
        </div>

        {/* 3. TYPE LINE BANNER (Parchment Ribbon) */}
        <div className="relative z-10 w-full bg-[#eae3d2] border-y border-[#3a3022] text-[#1c1813] font-bold text-[9px] sm:text-[10px] px-2 py-0.5 flex items-center justify-between shadow-xs mb-1 rounded-xs">
          <span className="truncate">
            {isOccupied
              ? isPlayerHost
                ? 'Token Creature — Anfitrión'
                : 'Token Creature — Drafter'
              : 'Token Creature — Bot'}
          </span>
          <Sparkles className="w-3 h-3 text-[#78350f] shrink-0 ml-1" />
        </div>

        {/* 4. TEXT BOX (Parchment Rules & Status) */}
        <div className="relative z-10 w-full bg-[#f6f1e6] border border-[#3b3223] text-[#241e16] p-1.5 rounded-sm flex flex-col justify-between text-[9px] leading-tight min-h-[46px]">
          <div>
            <div className="font-bold text-[#1a140d] flex items-center gap-1 mb-0.5">
              <span>Prioridad #{seatIndex + 1}</span>
              {seatIndex === 0 && (
                <span className="text-amber-800 text-[8px] uppercase tracking-wider font-extrabold">
                  · 1er Pick
                </span>
              )}
            </div>
            <p className="text-[#453a2b] line-clamp-2">
              {isOccupied
                ? seatIndex === 0
                  ? 'Vigilancia. Tiene la máxima prioridad de intercambio en el Gateway Plaza.'
                  : 'Listo para draftear y resolver prioridades en Gateway Plaza.'
                : 'Espacio disponible. Se completará con IA al iniciar.'}
            </p>
          </div>

          {/* 5. POWER / TOUGHNESS BADGE (Bottom-Right Badge) */}
          <div className="absolute -bottom-2 -right-1 bg-[#eae3d2] border-2 border-[#1c1813] rounded-md px-1.5 py-0.5 shadow-md flex items-center justify-center font-cinzel font-black text-[11px] text-[#1c1813] z-20">
            #{seatIndex + 1}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
