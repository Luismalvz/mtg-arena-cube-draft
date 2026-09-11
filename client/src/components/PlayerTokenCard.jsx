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
      className={`relative w-full max-w-[280px] mx-auto select-none transition-all duration-200 group ${
        isMe
          ? 'ring-1 ring-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.35)] rounded-[12px]'
          : 'shadow-[0_15px_35px_rgba(0,0,0,0.6)] rounded-[12px]'
      }`}
    >
      {/* Borderless Full-Art Token Card Body */}
      <div
        className={`w-full aspect-[5/7.2] rounded-[12px] flex flex-col justify-between overflow-hidden relative transition-transform duration-300 group-hover:scale-[1.02] ${
          isOccupied
            ? 'bg-[#06080d]'
            : 'bg-[#0d0f17]/40 opacity-70'
        }`}
      >
        {/* Full Card Art */}
        <div className="absolute inset-0 z-0">
          {isOccupied && avatarSrc ? (
            <img
              src={avatarSrc}
              alt={player.name}
              className="w-full h-full object-cover object-center scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0e111a]/80 to-[#08090f]/80 text-slate-500">
              <Bot className="w-10 h-10 mb-2 opacity-20 text-amber-400/30 animate-pulse" />
            </div>
          )}
        </div>

        {/* Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none z-0" />
        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none z-0" />

        {/* 1. TOP HEADER BANNER (Floating Capsule) */}
        <div className="relative z-10 w-full p-2.5">
          <div className="w-full bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-2.5 py-1 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {isPlayerHost && (
                <Crown className="w-4 h-4 text-amber-400 shrink-0 drop-shadow" />
              )}
              <span className="font-cinzel text-sm font-black text-[#ffd580] uppercase tracking-wider truncate drop-shadow-md">
                {isOccupied ? player.name : `Asiento #${seatIndex + 1}`}
              </span>
            </div>

            {isOccupied ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0 ml-1" />
            ) : (
              <span className="text-[9px] font-mono uppercase text-slate-400 shrink-0 ml-1">
                Libre
              </span>
            )}
          </div>
          {isMe && (
            <div className="absolute top-1 -right-1 px-2 py-0.5 rounded-l-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-lg">
              TÚ
            </div>
          )}
        </div>

        {/* 2. BOTTOM TEXT BOX (Floating Dark Glass) */}
        <div className="relative z-10 w-full p-2.5 pt-0">
          <div className="w-full bg-black/70 backdrop-blur-md border border-white/10 text-slate-300 p-2 rounded-lg flex flex-col justify-between min-h-[56px] shadow-xl relative overflow-visible">
            
            {/* Type Line Ribbon */}
            <div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200/80 truncate">
                {isOccupied
                  ? isPlayerHost
                    ? 'Token — Anfitrión'
                    : 'Token — Drafter'
                  : 'Token — IA (Pendiente)'}
              </span>
            </div>

            <div className="flex-1">
              <div className="font-bold text-white flex items-center gap-1.5 mb-0.5 text-xs">
                <span>Prioridad #{seatIndex + 1}</span>
                {seatIndex === 0 && (
                  <span className="text-amber-400 text-[9px] uppercase tracking-wider font-black bg-amber-400/10 px-1 rounded">
                    1er Pick
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[10px] line-clamp-2 font-manrope leading-tight">
                {isOccupied
                  ? seatIndex === 0
                    ? 'Vigilancia. Tiene la máxima prioridad de intercambio en el Gateway Plaza.'
                    : 'Listo para draftear y resolver prioridades en Gateway Plaza.'
                  : 'Espacio disponible. Se completará con IA al iniciar.'}
              </p>
            </div>

            {/* POWER / TOUGHNESS BADGE (Floating Bottom-Right) */}
            <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-amber-500/50 rounded-lg px-2 py-1 shadow-2xl flex items-center justify-center font-cinzel font-black text-sm text-amber-400 z-20 backdrop-blur-sm">
              #{seatIndex + 1}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
