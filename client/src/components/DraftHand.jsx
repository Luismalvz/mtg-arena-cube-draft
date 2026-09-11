import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { sound } from '../utils/audio';
import {
  Sparkles,
  ArrowLeftRight,
  Check,
  RotateCcw,
  Layers,
  Lock,
  ArrowUpRight,
  Hand
} from 'lucide-react';

export function DraftHand({
  activePack = [],
  isReady = false,
  pendingDecision = null,
  selectedPlazaCard = null,
  onConfirmPick,
  onConfirmSwap,
  onCancelDecision,
  onHoverStart,
  onHoverEnd
}) {
  const [actionMode, setActionMode] = useState('pick'); // 'pick' | 'swap'
  const [selectedPickCard, setSelectedPickCard] = useState(null);
  const [selectedOfferCard, setSelectedOfferCard] = useState(null);

  // Sync state if player already has pendingDecision
  useEffect(() => {
    if (pendingDecision) {
      if (pendingDecision.type === 'pick') {
        setActionMode('pick');
        const c = activePack.find((card) => card.instanceId === pendingDecision.cardInstanceId);
        if (c) setSelectedPickCard(c);
      } else if (pendingDecision.type === 'swap') {
        setActionMode('swap');
        const c = activePack.find((card) => card.instanceId === pendingDecision.offerCardInstanceId);
        if (c) setSelectedOfferCard(c);
      }
    }
  }, [pendingDecision, activePack]);

  // Clean selections when pack changes
  useEffect(() => {
    if (!isReady && !pendingDecision) {
      setSelectedPickCard(null);
      setSelectedOfferCard(null);
    }
  }, [activePack.length, isReady, pendingDecision]);

  const handleCardClick = (card) => {
    if (isReady) return;

    if (actionMode === 'pick') {
      sound.playSelect();
      setSelectedPickCard(card);
    } else {
      sound.playSelect();
      setSelectedOfferCard(card);
    }
  };

  const handleSwitchMode = (mode) => {
    if (isReady) return;
    sound.playHover();
    setActionMode(mode);
  };

  const handleConfirmAction = () => {
    if (actionMode === 'pick' && selectedPickCard) {
      sound.playPick();
      onConfirmPick(selectedPickCard.instanceId);
    } else if (actionMode === 'swap' && selectedOfferCard && selectedPlazaCard) {
      sound.playSwap();
      onConfirmSwap(selectedOfferCard.instanceId, selectedPlazaCard.instanceId);
    }
  };

  const totalCards = activePack.length;
  const midIndex = (totalCards - 1) / 2;

  return (
    <section className="hand-surface w-full bg-transparent p-3 sm:p-4 space-y-3 font-sans relative overflow-visible">
      
      {/* Hand Header & Mode Switcher (Archidekt Style) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 relative z-20">
        {/* Action A vs Action B Selector Buttons */}
        {!isReady && (
          <div className="flex glass-panel p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto font-sans text-xs">
            <button
              onClick={() => handleSwitchMode('pick')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                actionMode === 'pick'
                  ? 'bg-amber-500 text-amber-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Acción A: Pick</span>
            </button>

            <button
              onClick={() => handleSwitchMode('swap')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                actionMode === 'swap'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Acción B: Swap Plaza</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= ARCHIDEKT PLAYTESTER STYLE HAND FAN ================= */}
      <div className="w-full relative h-[285px] sm:h-[330px] md:h-[360px] flex items-end justify-center overflow-visible py-2 select-none">
        
        {/* Subtle felt table shadow */}
        <div className="absolute bottom-0 w-3/4 h-20 bg-black/50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative w-full max-w-6xl h-full flex items-end justify-center overflow-visible">
          {activePack.map((card, index) => {
            const isSelectedForPick =
              actionMode === 'pick' && selectedPickCard?.instanceId === card.instanceId;
            const isSelectedForSwapOffer =
              actionMode === 'swap' && selectedOfferCard?.instanceId === card.instanceId;
            const isSelected = isSelectedForPick || isSelectedForSwapOffer;

            // Geometry calculations for Archidekt Natural Hand Fan Arc
            const offset = index - midIndex; // e.g. -7 to +7
            const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
            const spacing = Math.min(82, Math.max(22, (viewportWidth - 180) / Math.max(1, totalCards)));
            const xOffset = offset * spacing;
            const angle = offset * Math.min(2.4, 26 / Math.max(1, totalCards));
            const arcY = Math.pow(offset, 2) * 0.45; // Gentle natural baseline curve

            return (
              <motion.div
                key={card.instanceId}
                layout
                animate={{
                  x: xOffset,
                  y: isSelected ? -45 : arcY,
                  rotate: isSelected ? 0 : angle,
                  scale: isSelected ? 1.15 : 1,
                  zIndex: isSelected ? 60 : 10 + index
                }}
                whileHover={
                  isReady
                    ? {}
                    : {
                        y: -65,
                        rotate: 0,
                        scale: 1.2,
                        zIndex: 100,
                        transition: { type: 'spring', stiffness: 450, damping: 25 }
                      }
                }
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                onClick={() => handleCardClick(card)}
                className="absolute left-1/2 -translate-x-1/2 bottom-2 cursor-pointer origin-bottom"
                style={{
                  transformOrigin: '50% 100%'
                }}
              >
                <Card
                  card={card}
                  location="pack"
                  size="sm"
                  isSelected={isSelectedForPick}
                  isSwapSource={isSelectedForSwapOffer}
                  disabled={isReady}
                  onHoverStart={onHoverStart}
                  onHoverEnd={onHoverEnd}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Confirmation & Status Action Bar */}
      <div className="pt-2 border-t border-slate-800/60 relative z-20">
        {isReady ? (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs font-sans">
                <div className="font-bold">Decisión Confirmada & Bloqueada</div>
                <div className="text-[11px] text-emerald-300/80 font-sans">
                  {actionMode === 'pick'
                    ? `Seleccionaste: [${selectedPickCard?.name || pendingDecision?.cardName || 'Carta'}]`
                    : `Intercambio solicitado: [${selectedOfferCard?.name || pendingDecision?.offerName}] ➜ [${selectedPlazaCard?.name || pendingDecision?.targetName}]`}
                </div>
              </div>
            </div>

            <button
              onClick={onCancelDecision}
              className="px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm hover:bg-slate-800 border border-slate-800/60 text-slate-300 text-xs font-sans font-semibold flex items-center gap-1.5 transition-all self-end sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cambiar Selección</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/60">
            {/* Left summary of chosen action */}
            <div className="text-xs font-sans space-y-0.5 text-center sm:text-left">
              {actionMode === 'pick' ? (
                <div>
                  <span className="text-slate-400">Modo Pick Normal: </span>
                  {selectedPickCard ? (
                    <span className="text-amber-400 font-bold font-mono">
                      [{selectedPickCard.name}]
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Elige 1 carta de tu mano arriba</span>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-400">Ofreces:</span>
                    <span className="font-bold text-cyan-300 font-mono">
                      {selectedOfferCard ? `[${selectedOfferCard.name}]` : '(Elige de tu mano)'}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400">Tomas del Plaza:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {selectedPlazaCard ? `[${selectedPlazaCard.name}]` : '(Elige de la Plaza arriba)'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm CTA Button */}
            <button
              onClick={handleConfirmAction}
              disabled={
                actionMode === 'pick'
                  ? !selectedPickCard
                  : !selectedOfferCard || !selectedPlazaCard
              }
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                actionMode === 'pick'
                  ? 'bg-amber-500 hover:bg-amber-300 text-amber-950 shadow-[0_0_15px_rgba(255,213,128,0.3)]'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {actionMode === 'pick' ? 'Confirmar Pick' : 'Confirmar Intercambio Plaza'}
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
