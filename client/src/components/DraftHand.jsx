import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Check, RotateCcw } from 'lucide-react';
import { Card } from './Card';
import { sound } from '../utils/audio';

export function DraftHand({ activePack = [], isReady = false, pendingDecision = null, selectedPlazaCard = null, onConfirmPick, onConfirmSwap, onCancelDecision, onHoverStart, onHoverEnd }) {
  const [mode, setMode] = useState('pick');
  const [picked, setPicked] = useState(null);
  const [offered, setOffered] = useState(null);
  useEffect(() => {
    if (pendingDecision?.type === 'pick') { setMode('pick'); setPicked(activePack.find(c => c.instanceId === pendingDecision.cardInstanceId) || null); }
    if (pendingDecision?.type === 'swap') { setMode('swap'); setOffered(activePack.find(c => c.instanceId === pendingDecision.offerCardInstanceId) || null); }
  }, [pendingDecision, activePack]);
  useEffect(() => { if (!isReady && !pendingDecision) { setPicked(null); setOffered(null); } }, [activePack.length, isReady, pendingDecision]);
  const select = card => { if (isReady) return; sound.playSelect(); if (mode === 'pick') setPicked(card); else setOffered(card); };
  const confirm = () => { if (mode === 'pick' && picked) { sound.playPick(); onConfirmPick(picked.instanceId); } else if (mode === 'swap' && offered && selectedPlazaCard) { sound.playSwap(); onConfirmSwap(offered.instanceId, selectedPlazaCard.instanceId); } };
  const ready = mode === 'pick' ? !!picked : !!offered && !!selectedPlazaCard;
  const selectedName = mode === 'pick' ? picked?.name : offered && selectedPlazaCard ? `${offered.name} ↔ ${selectedPlazaCard.name}` : offered?.name;
  const mid = (activePack.length - 1) / 2;

  return (
    <section className="hand-surface relative z-20 shrink-0 border-t border-white/10 bg-[#080b09]/94 px-2 pb-2 pt-2 backdrop-blur-2xl sm:px-4">
      <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-3">
        <div className="flex rounded-full border border-white/10 bg-black/25 p-1">
          <button onClick={() => { if (!isReady) { setMode('pick'); sound.playHover(); } }} aria-pressed={mode === 'pick'} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${mode === 'pick' ? 'bg-[#f1f3ed] text-[#090b0a]' : 'text-[#8f9991] hover:text-white'}`}>Elegir</button>
          <button onClick={() => { if (!isReady) { setMode('swap'); sound.playHover(); } }} aria-pressed={mode === 'swap'} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${mode === 'swap' ? 'bg-[#83d9d2] text-[#07100f]' : 'text-[#8f9991] hover:text-white'}`}><ArrowLeftRight className="h-3.5 w-3.5" />Cambiar</button>
        </div>
        <div className="min-w-0 flex-1 truncate text-right text-xs text-[#8f9991]">{selectedName || (mode === 'pick' ? 'Selecciona una carta' : offered ? 'Elige en la Plaza' : 'Selecciona una carta')}</div>
        {isReady ? <button onClick={onCancelDecision} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/12 text-[#aab2ac] hover:text-white" title="Cambiar selección" aria-label="Cambiar selección"><RotateCcw className="h-4 w-4" /></button> : <button onClick={confirm} disabled={!ready} className={`flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-semibold transition disabled:opacity-25 ${mode === 'pick' ? 'bg-[#f1f3ed] text-[#090b0a]' : 'bg-[#83d9d2] text-[#07100f]'}`}><Check className="h-3.5 w-3.5" />Confirmar</button>}
      </div>

      <div className="relative mx-auto h-[clamp(150px,24vh,220px)] max-w-[1560px] select-none overflow-visible">
        <div className="absolute bottom-1 left-1/2 h-10 w-2/3 -translate-x-1/2 rounded-full bg-black/65 blur-xl" />
        {activePack.map((card, index) => {
          const offset = index - mid;
          const selected = (mode === 'pick' ? picked?.instanceId : offered?.instanceId) === card.instanceId;
          const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
          const spacing = Math.min(88, Math.max(20, (width - 112) / Math.max(1, activePack.length)));
          return <motion.div key={card.instanceId} layout animate={{ x: offset * spacing, y: selected ? -30 : Math.pow(offset,2)*.22, rotate: selected ? 0 : offset * Math.min(1.75,21 / Math.max(1,activePack.length)), scale: selected ? 1.06 : .9, zIndex: selected ? 80 : 10 + index }} whileHover={isReady ? {} : { y: -52, rotate: 0, scale: 1.08, zIndex: 100 }} transition={{ type:'spring', stiffness:380, damping:30 }} className="absolute bottom-[-42px] left-1/2 -translate-x-1/2 origin-bottom cursor-pointer" onClick={() => select(card)}>
            <Card card={card} size="hand" isSelected={mode === 'pick' && selected} isSwapSource={mode === 'swap' && selected} disabled={isReady} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
          </motion.div>;
        })}
      </div>
    </section>
  );
}
