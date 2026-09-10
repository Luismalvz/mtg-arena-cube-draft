import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { sound } from '../utils/audio';
import { Sparkles, ArrowLeftRight, Shield, Zap, Layers, ShieldAlert } from 'lucide-react';

const GUILD_COLOR_THEMES = {
  Azorius: { border: 'border-sky-400/60', text: 'text-sky-300', bg: 'bg-sky-950/40', badge: 'bg-sky-500/20 text-sky-200' },
  Dimir: { border: 'border-indigo-400/60', text: 'text-indigo-300', bg: 'bg-indigo-950/40', badge: 'bg-indigo-500/20 text-indigo-200' },
  Rakdos: { border: 'border-rose-500/60', text: 'text-rose-300', bg: 'bg-rose-950/40', badge: 'bg-rose-500/20 text-rose-200' },
  Gruul: { border: 'border-amber-600/60', text: 'text-amber-400', bg: 'bg-amber-950/40', badge: 'bg-amber-600/20 text-amber-200' },
  Selesnya: { border: 'border-emerald-400/60', text: 'text-emerald-300', bg: 'bg-emerald-950/40', badge: 'bg-emerald-500/20 text-emerald-200' },
  Orzhov: { border: 'border-zinc-300/60', text: 'text-zinc-200', bg: 'bg-zinc-900/50', badge: 'bg-zinc-400/20 text-zinc-100' },
  Izzet: { border: 'border-cyan-400/60', text: 'text-cyan-300', bg: 'bg-cyan-950/40', badge: 'bg-cyan-500/20 text-cyan-200' },
  Golgari: { border: 'border-lime-500/60', text: 'text-lime-300', bg: 'bg-lime-950/40', badge: 'bg-lime-500/20 text-lime-200' },
  Boros: { border: 'border-orange-500/60', text: 'text-orange-300', bg: 'bg-orange-950/40', badge: 'bg-orange-500/20 text-orange-200' },
  Simic: { border: 'border-teal-400/60', text: 'text-teal-300', bg: 'bg-teal-950/40', badge: 'bg-teal-500/20 text-teal-200' },
  Colorless: { border: 'border-slate-500/60', text: 'text-slate-300', bg: 'bg-slate-900/50', badge: 'bg-slate-700/40 text-slate-200' }
};

export function GetawayPlaza({
  plazaCards = [],
  plazaSlots = [],
  swapOfferCard = null,
  selectedTargetId = null,
  onSelectTargetCard,
  onInspectCard,
  currentResolvingPlayerId = null,
  players = [],
  disabled = false
}) {
  const isSwapMode = !!swapOfferCard;
  const resolvingPlayer = players.find((p) => p.id === currentResolvingPlayerId);

  // Group slots: Colossus Left, 10 Guilds, Colossus Right
  const leftColossusSlot = plazaSlots.find((s) => s.id === 'colossus_left') || {
    id: 'colossus_left',
    name: 'Gate Colossus',
    guild: 'Colorless',
    cards: plazaCards.filter((c) => c.name === 'Gate Colossus').slice(0, 1),
    topCard: plazaCards.find((c) => c.name === 'Gate Colossus')
  };

  const rightColossusSlot = plazaSlots.find((s) => s.id === 'colossus_right') || {
    id: 'colossus_right',
    name: 'Gate Colossus',
    guild: 'Colorless',
    cards: plazaCards.filter((c) => c.name === 'Gate Colossus').slice(1, 2),
    topCard: plazaCards.filter((c) => c.name === 'Gate Colossus')[1] || null
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
    // Fallback search
    const matching = plazaCards.filter((c) => c.slotId === id || c.name.toLowerCase().includes(id));
    return {
      id,
      name: id.toUpperCase(),
      guild: id.charAt(0).toUpperCase() + id.slice(1),
      cards: matching,
      topCard: matching[matching.length - 1] || null
    };
  });

  const row1Slots = guildSlots.slice(0, 5);
  const row2Slots = guildSlots.slice(5, 10);

  const renderSlotPile = (slot, isFlank = false) => {
    const cards = slot.cards || [];
    const count = cards.length;
    const topCard = slot.topCard || cards[cards.length - 1] || null;
    const isTarget = topCard && selectedTargetId === topCard.instanceId;
    const theme = GUILD_COLOR_THEMES[slot.guild] || GUILD_COLOR_THEMES.Colorless;

    if (!topCard) {
      return (
        <div
          key={slot.id}
          className={`relative rounded-xl border border-dashed border-slate-700 bg-slate-950/40 flex flex-col items-center justify-center p-2 min-h-[140px] sm:min-h-[180px] opacity-50`}
        >
          <span className="font-space text-[10px] text-slate-500 uppercase">{slot.name}</span>
          <span className="font-space text-[9px] text-slate-600">Pila Vacía</span>
        </div>
      );
    }

    return (
      <div key={slot.id} className="relative flex flex-col items-center">
        {/* 3D Stack Layer Simulation */}
        <div className="relative group cursor-pointer select-none">
          {/* Layer 3 (Deepest) */}
          {count >= 3 && (
            <div className="absolute inset-0 translate-x-2 -translate-y-2 rounded-xl bg-slate-900 border border-slate-700/60 shadow-md pointer-events-none" />
          )}

          {/* Layer 2 (Middle) */}
          {count >= 2 && (
            <div className="absolute inset-0 translate-x-1 -translate-y-1 rounded-xl bg-slate-900 border border-slate-700/80 shadow-md pointer-events-none" />
          )}

          {/* Top Active Card */}
          <div className="relative z-10">
            <Card
              card={topCard}
              location="arena"
              size="sm"
              isSwapTarget={isTarget}
              disabled={disabled}
              onClick={() => {
                if (onSelectTargetCard && topCard) {
                  onSelectTargetCard(topCard);
                }
              }}
              onInspect={onInspectCard}
            />
          </div>

          {/* Stack Count Pill Badge (Top Right) */}
          <div className="absolute -top-2.5 -right-2.5 z-20 px-2 py-0.5 rounded-full bg-slate-900 border border-amber-400/80 text-amber-300 font-cinzel font-bold text-[10px] shadow-lg flex items-center gap-0.5">
            <Layers className="w-2.5 h-2.5 text-amber-400" />
            <span>{count}</span>
          </div>

          {/* Target Highlight Overlay when in Swap Mode */}
          {isSwapMode && (
            <div
              onClick={() => onSelectTargetCard && onSelectTargetCard(topCard)}
              className={`absolute -bottom-2 inset-x-1 py-0.5 rounded-md text-center text-[9px] font-space font-black uppercase tracking-wider transition-all z-20 cursor-pointer shadow-md ${
                isTarget
                  ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-300 shadow-[0_0_12px_#34d399]'
                  : 'bg-slate-900/95 text-cyan-300 border border-cyan-400/60 hover:bg-cyan-400 hover:text-slate-950'
              }`}
            >
              {isTarget ? '✓ Seleccionada' : 'Elegir'}
            </div>
          )}
        </div>

        {/* Guild Crest Label */}
        <div className="mt-2 text-center">
          <span className={`font-space font-bold text-[10px] sm:text-[11px] uppercase tracking-wider ${theme.text}`}>
            {slot.name}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full relative rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-[#181b24] via-[#141720] to-[#10131c] border border-[#272a33] shadow-2xl overflow-hidden font-manrope">
      
      {/* Mystical Ethereal Platform Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-24 bg-gradient-to-b from-[#ffd580]/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2.5 border-b border-[#272a33]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#e5b85a] flex items-center justify-center text-[#402d00] shadow-md shadow-amber-500/20 font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel font-bold text-sm sm:text-base uppercase tracking-wider text-[#ffd580]">
                Getaway Plaza (32 Cartas)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-space font-bold bg-[#ffd580]/15 text-[#ffd580] border border-[#ffd580]/30">
                10 Gremios × 3 Cartas + 2 Colosos
              </span>
            </div>
            <p className="text-[11px] text-[#d2c5b1]/80 font-manrope">
              Intercambia 1 carta de tu sobre por la carta superior de cualquier pila de gremio o coloso.
            </p>
          </div>
        </div>

        {/* Dynamic Context Banner */}
        {isSwapMode ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/50 text-cyan-200 text-xs font-space font-bold animate-pulse"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ofreciendo [{swapOfferCard.name}]: Elige tu objetivo en la Plaza</span>
          </motion.div>
        ) : resolvingPlayer ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ffd580]/15 border border-[#ffd580]/40 text-[#ffd580] text-xs font-space font-bold">
            <Zap className="w-3.5 h-3.5 text-[#ffd580] animate-bounce" />
            <span>Resolviendo prioridad: {resolvingPlayer.name} (#{resolvingPlayer.seatIndex + 1})</span>
          </div>
        ) : (
          <div className="text-[11px] font-space text-[#d2c5b1]/60 flex items-center gap-1.5 self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span>Mercado Central Activo</span>
          </div>
        )}
      </div>

      {/* Main Board Layout: [Flank Left: Colossus 1] | [Center: 2 Rows of 5 Guild Piles] | [Flank Right: Colossus 2] */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 py-2">
        
        {/* Flank Left: Colossus 1 */}
        <div className="w-full lg:w-36 flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1c1f29]/80 border border-[#272a33] shadow-lg shrink-0">
          <div className="flex items-center gap-1 text-[10px] font-space uppercase font-bold text-slate-400 mb-2">
            <Shield className="w-3 h-3 text-[#ffd580]" />
            <span>Flanco Izquierdo</span>
          </div>
          {renderSlotPile(leftColossusSlot, true)}
        </div>

        {/* Center: 10 Guild Piles in 2 Rows of 5 */}
        <div className="flex-1 w-full flex flex-col gap-4 bg-[#10131c]/60 p-3 sm:p-4 rounded-2xl border border-white/5 shadow-inner">
          
          {/* Fila 1: Azorius, Dimir, Rakdos, Gruul, Selesnya */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 justify-items-center">
            {row1Slots.map((slot) => renderSlotPile(slot))}
          </div>

          {/* Subtle divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#272a33] to-transparent my-0.5" />

          {/* Fila 2: Orzhov, Izzet, Golgari, Boros, Simic */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 justify-items-center">
            {row2Slots.map((slot) => renderSlotPile(slot))}
          </div>
        </div>

        {/* Flank Right: Colossus 2 */}
        <div className="w-full lg:w-36 flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1c1f29]/80 border border-[#272a33] shadow-lg shrink-0">
          <div className="flex items-center gap-1 text-[10px] font-space uppercase font-bold text-slate-400 mb-2">
            <Shield className="w-3 h-3 text-[#ffd580]" />
            <span>Flanco Derecho</span>
          </div>
          {renderSlotPile(rightColossusSlot, true)}
        </div>
      </div>
    </section>
  );
}
