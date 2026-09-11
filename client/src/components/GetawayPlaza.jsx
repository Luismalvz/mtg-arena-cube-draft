import React from 'react';
import { Card } from './Card';
import { sound } from '../utils/audio';
import { Shield } from 'lucide-react';

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
          className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-white/10 bg-black/20 min-w-[130px] min-h-[190px] opacity-40 select-none transition-all hover:opacity-60"
        >
          {isFlank ? (
            <span className="font-sans text-[10px] text-slate-500 uppercase tracking-wider">{slot.name}</span>
          ) : (
            <img src={`/guilds/${slot.id}.png`} alt={slot.name} className="w-12 h-12 object-cover rounded-full opacity-50 mb-2 shadow-inner grayscale contrast-125" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
          )}
          <span className="font-sans text-[10px] text-slate-500 uppercase tracking-wider hidden" style={{ display: 'none' }}>{slot.name}</span>
          <span className="font-sans text-[9px] text-slate-600">Vacío</span>
        </div>
      );
    }

    return (
      <div key={slot.id} className="relative flex flex-col items-center">
        {/* Cascade Container: all cards visible as distinct entities */}
        <div className="relative flex flex-col items-center select-none pt-1">
          {cards.map((c, cardIdx) => {
            const isTarget = selectedTargetId === c.instanceId;

            return (
              <div
                key={c.instanceId}
                style={{
                  marginTop: cardIdx === 0 ? 0 : 'calc(-1 * var(--plaza-card-height) + 30px)',
                  zIndex: isTarget ? 50 : 10 + cardIdx
                }}
                className="relative transition-all duration-200 hover:z-50 hover:-translate-y-3"
              >
                <Card
                  card={c}
                  size={isFlank ? "golem" : "plaza"}
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

        {/* Guild Emblem & Stack Count Pill beneath the pile */}
        <div className="plaza-label mt-2.5 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-xs shadow-md">
          {isFlank ? (
            <span className={`font-space font-bold text-[10px] uppercase tracking-wider ${theme.text}`}>
              {slot.name}
            </span>
          ) : (
            <div className="relative">
              <img src={`/guilds/${slot.id}.png`} alt={slot.name} className="w-6 h-6 object-cover rounded-full shadow-[0_0_8px_rgba(255,255,255,0.15)] ring-1 ring-white/10" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <span className={`font-space font-bold text-[10px] uppercase tracking-wider ${theme.text} hidden`} style={{ display: 'none' }}>{slot.name}</span>
            </div>
          )}
          <span className="font-mono text-[10px] font-bold text-amber-300/90 bg-slate-950 px-1.5 py-0.5 rounded border border-white/5 shadow-inner">
            {isFlank ? count : `${count}/3`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="plaza-surface w-full flex-1 flex flex-col justify-center relative p-2 sm:p-4 bg-transparent border-b border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.65)] font-sans overflow-visible">
      
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

      {/* Main Tabletop POV Layout: Flank Left | Center 10 Guild Piles | Flank Right */}
      <div className="plaza-table relative z-10">
        
        {/* Left Flank: Gate Colossus 1 */}
        <div className="plaza-flank flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-[10px] font-sans uppercase font-bold text-slate-400 mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Flanco Izquierdo</span>
          </div>
          {renderSlotPile(leftColossusSlot, true)}
        </div>

        {/* Center: 10 Guild Piles in 2 Rows of 5 (Cascaded Stacks) */}
        <div className="plaza-guilds w-full flex flex-col gap-2">
          
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
        <div className="plaza-flank flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-[10px] font-sans uppercase font-bold text-slate-400 mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Flanco Derecho</span>
          </div>
          {renderSlotPile(rightColossusSlot, true)}
        </div>
      </div>
    </section>
  );
}
