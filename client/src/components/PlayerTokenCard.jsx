import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Crown, Plus } from 'lucide-react';
import { getAvatarSrc } from '../utils/tokenAvatars';

export function PlayerTokenCard({ seat, seatIndex = 0, myId }) {
  const occupied = seat.type === 'player';
  const player = seat.data;
  const isMe = occupied && player.id === myId;
  const avatarSrc = occupied ? getAvatarSrc(player.avatar) : null;
  return (
    <motion.div layout initial={{ opacity: 0, scale: .9, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .9 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className={`group relative aspect-[5/7] min-w-0 overflow-hidden rounded-[14px] border bg-[#0b0e0c] shadow-[0_20px_44px_rgba(0,0,0,.35)] ${isMe ? 'border-[#d8b770]/75 ring-2 ring-[#d8b770]/12' : 'border-white/10'} ${occupied ? '' : 'border-dashed opacity-40'}`}>
      {occupied && avatarSrc ? <img src={avatarSrc} alt={player.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" /> : <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,.07),transparent_60%)]"><Plus className="h-5 w-5 text-white/40" /></div>}
      {occupied && <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90" />}
      <div className="absolute left-2 top-2 grid h-7 min-w-7 place-items-center rounded-full border border-white/15 bg-black/55 px-2 text-[11px] font-semibold backdrop-blur-md">{seatIndex + 1}</div>
      {occupied && player.isAdmin && <Crown className="absolute right-2 top-2 h-4 w-4 text-[#e7cb8e] drop-shadow" />}
      <div className="absolute inset-x-0 bottom-0 p-2.5">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-white">{occupied ? player.name : 'Disponible'}</div>
            {occupied && <div className="mt-0.5 flex items-center gap-1 text-[10px] uppercase tracking-[.12em] text-white/55">{player.isBot && <Bot className="h-3 w-3" />}{isMe ? 'Tú' : player.isBot ? 'Bot' : 'Drafter'}</div>}
          </div>
          {occupied && <span className="mb-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#83d9d2] shadow-[0_0_9px_#83d9d2]" />}
        </div>
      </div>
    </motion.div>
  );
}
