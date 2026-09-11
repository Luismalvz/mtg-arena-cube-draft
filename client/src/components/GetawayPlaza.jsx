import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { sound } from '../utils/audio';
import { Sparkles, ArrowLeftRight, Shield, Zap, Layers } from 'lucide-react';

const GUILD_COLOR_THEMES = {
  Azorius: { border: 'border-sky-400/50', text: 'text-sky-300', glow: 'from-sky-500/10' },
  Dimir: { border: 'border-indigo-400/50', text: 'text-indigo-300', glow: 'from-indigo-500/10' },
  Rakdos: { border: 'border-rose-500/50', text: 'text-rose-300', glow: 'from-rose-500/10' },
  Gruul: { border: 'border-amber-600/50', text: 'text-amber-400', glow: 'from-amber-600/10' },
  Selesnya: { border: 'border-emerald-400/50', text: 'text-emerald-300', glow: 'from-emerald-500/10' },
  Orzhov: { border: 'border-zinc-300/50', text: 'text-zinc-200', glow: 'from-zinc-400/10' },
  Izzet: { border: 'border-cyan-400/50', text: 'text-cyan-300', glow: 'from-cyan-500/10' },
  Golgari: { border: 'border-lime-500/50', text: 'text-lime-300', glow: 'from-lime-500/10' },
  Boros: { border: 'border-orange-500/50', text: 'text-orange-300', glow: 'from-orange-500/10' },
  Simic: { border: 'border-teal-400/50', text: 'text-teal-300', glow: 'from-teal-500/10' },
  Colorless: { border: 'border-slate-500/50', text: 'text-slate-300', glow: 'from-slate-500/10' }
};

export function GetawayPlaza({
  plazaCards = [],
  plazaSlots = [],
  swapOfferCard = null,
  selectedTargetId = null,
  onSelectTargetCard,
  onHoverStart,
  onHoverEnd,
  currentResolvingPlayerId = null,
  players = [],
  disabled = false
}) {
  const isSwapMode = !!swapOfferCard;
  const resolvingPlayer = players.find((p) => p.id === currentResolvingPlayerId);

  // Group slots: Colossus Left, 10 Guilds, Colossus Right
  const leftColossusSlot = plazaSlots.find((s) => s.id === 'colossus_left') || {
    id: 'colossus_left',
    name: 'Gate Colossus (I)',
    guild: 'Colorless',
    cards: plazaCards.filter((c) => c.name === 'Gate Colossus').slice(0, 1)
  };

  const rightColossusSlot = plazaSlots.find((s) => s.id === 'colossus_right') || {
    id: 'colossus_right',
    name: 'Gate Colossus (II)',
    guild: 'Colorless',
    cards: plazaCards.filter((c) => c.name === 'Gate Colossus').slice(1, 2)
  };

  const guildSlotIds = [
    // Fila 1: 5 Gremios
    'azorius', 'dimir', 'rakdos', 'gruul', 'selesnya',
    // Fila 2: 5 Gremios
    'orzhov', 'izzet', 'golgari', 'boros', 'simic'
  ];

  const guildSlots = guildSlotIds.map((id) => {
    const found = plazaSlots.find((s) => s.id === id);
    if (found) return found;
    const matching = plazaCards.filter((c) => c.slotId === id || c.name.toLowerCase().includes(id));
    return {
      id,
      name: id.toUpperCase(),
      guild: id.charAt(0).toUpperCase() + id.slice(1),
      cards: matching
    };
  });

  const row1Slots = guildSlots.slice(0, 5);
  const row2Slots = guildSlots.slice(5, 10);

  // Render each pile with all cards visibly cascaded
  const renderSlotPile = (slot, isFlank = false) => {
    const cards = slot.cards || [];
    const count = cards.length;
    const theme = GUILD_COLOR_THEMES[slot.guild] || GUILD_COLOR_THEMES.Colorless;

    if (count === 0) {
      return (
        <div
          key={slot.id}
          className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-white/10 bg-black/20 min-w-[130px] min-h-[190px] opacity-40 select-none"
        >
          <span className="font-space text-[10px] text-slate-500 uppercase tracking-wider">{slot.name}</span>
          <span className="font-space text-[9px] text-slate-600">Vacío</span>
        </div>
      );
    }

    return (
      <div key={slot.id} className="relative flex flex-col items-center">
        {/* Cascade Container: all cards visible as distinct entities */}
        <div className="relative flex flex-col items-center select-none pt-1">
          {cards.map((c, cardIdx) => {
            const isTarget = selectedTargetId === c.instanceId;
            const isTop = cardIdx === cards.length - 1;

            return (
              <div
                key={c.instanceId}
                style={{
                  marginTop: cardIdx === 0 ? 0 : '-148px',
                  zIndex: isTarget ? 50 : 10 + cardIdx
                }}
                className="relative transition-all duration-200 hover:z-50 hover:-translate-y-3"
              >
                <Card
                  card={c}
                  size="plaza"
                  isSwapTarget={isTarget}
                  disabled={disabled}
                  onClick={() => {
                    if (onSelectTargetCard) {
                      sound.playSelect();
                      onSelectTargetCard(c);
                    }
                  }}
                  onHoverStart={onHoverStart}
                  onHoverEnd={onHoverEnd}
                />
              </div>
            );
          })}
        </div>

        {/* Guild Name & Stack Count Pill beneath the pile */}
        <div className="plaza-label mt-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-xs shadow-md">
          <span className={`font-space font-bold text-[10px] uppercase tracking-wider ${theme.text}`}>
            {slot.name}
          </span>
          <span className="font-mono text-[9px] font-bold text-amber-300/80 bg-slate-950 px-1.5 py-0.2 rounded border border-white/5">
            {count}/3
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="plaza-surface w-full relative p-3 sm:p-5 bg-[#080a0f] border-b border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.65)] font-manrope overflow-visible">
      
      {/* Gateway Plaza Thematic Art Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/gateway-plaza-bg.jpg"
          alt="Gateway Plaza"
          className="w-full h-full object-cover object-center scale-105 opacity-20 filter grayscale brightness-75 contrast-125"
        />
        {/* Dark Vignette & Fantasy Lighting Overlays to ensure card contrast and legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/92 via-[#0a0a0b]/78 to-[#0a0a0b]/96" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-black/75" />
      </div>

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-amber-200 border border-white/15 font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-manrope font-semibold text-sm sm:text-base uppercase tracking-[0.18em] text-white/90">
                Getaway Plaza <span className="text-white/35 tracking-normal">/ 32 cartas</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Dynamic Context Banner */}
        {isSwapMode ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/50 text-cyan-200 text-xs font-space font-bold animate-pulse"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ofreces [{swapOfferCard.name}]: Elige tu objetivo en la mesa</span>
          </motion.div>
        ) : resolvingPlayer ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#ffd580]/15 border border-[#ffd580]/40 text-[#ffd580] text-xs font-space font-bold">
            <Zap className="w-3.5 h-3.5 text-[#ffd580] animate-bounce" />
            <span>Resolviendo prioridad: {resolvingPlayer.name} (#{resolvingPlayer.seatIndex + 1})</span>
          </div>
        ) : (
          <div className="text-xs font-space text-slate-400 flex items-center gap-2 self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>Mercado Central Activo</span>
          </div>
        )}
      </div>

      {/* Main Tabletop POV Layout: Flank Left | Center 10 Guild Piles | Flank Right */}
      <div className="relative z-10 flex flex-col xl:flex-row items-start justify-center gap-3 sm:gap-5 py-1">
        
        {/* Left Flank: Gate Colossus 1 */}
        <div className="w-full xl:w-auto flex flex-col items-center justify-center p-2 rounded-2xl shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-space uppercase font-bold text-slate-400 mb-2">
            <Shield className="w-3.5 h-3.5 text-[#ffd580]" />
            <span>Flanco Izquierdo</span>
          </div>
          {renderSlotPile(leftColossusSlot, true)}
        </div>

        {/* Center: 10 Guild Piles in 2 Rows of 5 (Cascaded Stacks) */}
        <div className="flex-1 w-full flex flex-col gap-3">
          
          {/* Fila 1: Azorius, Dimir, Rakdos, Gruul, Selesnya */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-2 gap-y-3 sm:gap-x-3 justify-items-center">
            {row1Slots.map((slot) => renderSlotPile(slot))}
          </div>

          {/* Subtle playmat divider line */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />

          {/* Fila 2: Orzhov, Izzet, Golgari, Boros, Simic */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-2 gap-y-3 sm:gap-x-3 justify-items-center">
            {row2Slots.map((slot) => renderSlotPile(slot))}
          </div>
        </div>

        {/* Right Flank: Gate Colossus 2 */}
        <div className="w-full xl:w-auto flex flex-col items-center justify-center p-2 rounded-2xl shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-space uppercase font-bold text-slate-400 mb-2">
            <Shield className="w-3.5 h-3.5 text-[#ffd580]" />
            <span>Flanco Derecho</span>
          </div>
          {renderSlotPile(rightColossusSlot, true)}
        </div>
      </div>
    </section>
  );
}
