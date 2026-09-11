import React from 'react';
import { Card } from './Card';
import { sound } from '../utils/audio';

const SLOT_IDS = ['azorius','dimir','rakdos','gruul','selesnya','orzhov','izzet','golgari','boros','simic'];

export function GetawayPlaza({ plazaCards = [], plazaSlots = [], selectedTargetId = null, onSelectTargetCard, onHoverStart, onHoverEnd, disabled = false }) {
  const fallback = (id, name, guild, cards) => ({ id, name, guild, cards });
  const left = plazaSlots.find(s => s.id === 'colossus_left') || fallback('colossus_left','Colossus I','Colorless',plazaCards.filter(c => c.name === 'Gate Colossus').slice(0,1));
  const right = plazaSlots.find(s => s.id === 'colossus_right') || fallback('colossus_right','Colossus II','Colorless',plazaCards.filter(c => c.name === 'Gate Colossus').slice(1,2));
  const guilds = SLOT_IDS.map(id => plazaSlots.find(s => s.id === id) || fallback(id,id,id,plazaCards.filter(c => c.slotId === id)));

  const pile = (slot, flank = false) => {
    const cards = slot.cards || [];
    return <div key={slot.id} className="relative flex min-w-0 flex-col items-center">
      <div className={`relative flex flex-col items-center ${cards.length ? '' : 'opacity-35'}`}>
        {cards.length ? cards.map((card, index) => <div key={card.instanceId} className="relative transition-transform duration-200 hover:z-50 hover:-translate-y-2" style={{ marginTop: index ? 'calc(-1 * var(--plaza-card-height) + clamp(18px,3.2vh,28px))' : 0, zIndex: selectedTargetId === card.instanceId ? 50 : 10 + index }}>
          <Card card={card} size={flank ? 'golem' : 'plaza'} isSwapTarget={selectedTargetId === card.instanceId} disabled={disabled} onClick={() => { sound.playSelect(); onSelectTargetCard?.(card); }} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
        </div>) : <div className="grid plaza-card place-items-center rounded-[7px] border border-dashed border-white/14 bg-black/20"><img src={flank ? '/guilds/azorius.png' : `/guilds/${slot.id}.png`} alt="" className="h-8 w-8 rounded-full object-cover opacity-45 grayscale" onError={e => { e.currentTarget.style.display = 'none'; }} /></div>}
      </div>
      <div className="mt-1.5 flex h-6 items-center gap-1.5 rounded-full border border-white/10 bg-black/45 px-2 backdrop-blur-md">
        {!flank && <img src={`/guilds/${slot.id}.png`} alt="" className="h-4 w-4 rounded-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />}
        <span className="max-w-[64px] truncate text-[9px] font-semibold uppercase tracking-[.1em] text-white/60">{flank ? slot.name.replace('Gate ','') : slot.id}</span>
        <span className="text-[9px] tabular-nums text-[#e5c681]">{cards.length}</span>
      </div>
    </div>;
  };

  return (
    <section className="plaza-surface relative flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-2 py-2 sm:px-4">
      <div className="absolute inset-0 pointer-events-none">
        <img src="/gateway-plaza-bg.jpg" alt="" className="h-full w-full scale-105 object-cover opacity-28 saturate-[.6]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,8,.88),rgba(7,9,8,.62)_45%,rgba(7,9,8,.91))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(216,183,112,.08),transparent_52%)]" />
      </div>
      <div className="relative z-10 mb-1 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[.23em] text-white/42"><span className="h-px w-10 bg-gradient-to-r from-transparent to-white/18" />Getaway Plaza<span className="h-px w-10 bg-gradient-to-l from-transparent to-white/18" /></div>
      <div className="plaza-table relative z-10">
        <div className="plaza-flank flex justify-center">{pile(left,true)}</div>
        <div className="plaza-guilds grid grid-cols-5 gap-x-1.5 gap-y-1.5 sm:gap-x-3">
          {guilds.map(slot => pile(slot))}
        </div>
        <div className="plaza-flank flex justify-center">{pile(right,true)}</div>
      </div>
    </section>
  );
}
