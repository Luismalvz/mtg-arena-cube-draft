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
    <section className="w-full bg-[#141721] border border-[#252936] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 font-manrope relative overflow-visible">
      
      {/* Hand Header & Mode Switcher (Archidekt Style) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#252936] pb-3 relative z-20">
        <div className="flex items-center gap-3">
          <div className="text-xs sm:text-sm font-space text-slate-300 tracking-wide font-medium">
            Cards in hand: <span className="text-[#ffd580] font-bold font-mono text-sm sm:text-base ml-1">{totalCards}</span>
          </div>
          <span className="hidden sm:inline text-[11px] font-space text-slate-500">
            (Mantén <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono text-[10px]">Alt</kbd> para ampliar)
          </span>
          {isReady && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-space font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Listo / Bloqueado
            </span>
          )}
        </div>

        {/* Action A vs Action B Selector Buttons */}
        {!isReady && (
          <div className="flex bg-[#0d1017] p-1 rounded-xl border border-[#252936] self-stretch sm:self-auto font-space text-xs">
            <button
              onClick={() => handleSwitchMode('pick')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                actionMode === 'pick'
                  ? 'bg-[#e5b85a] text-[#402d00] shadow-[0_0_10px_rgba(229,184,90,0.3)]'
                  : 'text-[#d2c5b1] hover:text-white'
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
                  : 'text-[#d2c5b1] hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Acción B: Swap Plaza</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= ARCHIDEKT PLAYTESTER STYLE HAND FAN ================= */}
      <div className="w-full relative h-[260px] sm:h-[290px] md:h-[310px] flex items-end justify-center overflow-visible py-2 select-none">
        
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
            const spacing = Math.min(64, Math.max(36, 640 / Math.max(1, totalCards)));
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
      <div className="pt-2 border-t border-[#272a33] relative z-20">
        {isReady ? (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs font-space">
                <div className="font-bold">Decisión Confirmada & Bloqueada</div>
                <div className="text-[11px] text-emerald-300/80 font-manrope">
                  {actionMode === 'pick'
                    ? `Seleccionaste: [${selectedPickCard?.name || pendingDecision?.cardName || 'Carta'}]`
                    : `Intercambio solicitado: [${selectedOfferCard?.name || pendingDecision?.offerName}] ➜ [${selectedPlazaCard?.name || pendingDecision?.targetName}]`}
                </div>
              </div>
            </div>

            <button
              onClick={onCancelDecision}
              className="px-3 py-1.5 rounded-lg bg-[#1c1f29] hover:bg-[#272a33] border border-[#272a33] text-slate-300 text-xs font-space font-semibold flex items-center gap-1.5 transition-all self-end sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cambiar Selección</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#10131c] p-3.5 rounded-xl border border-[#272a33]">
            {/* Left summary of chosen action */}
            <div className="text-xs font-space space-y-0.5 text-center sm:text-left">
              {actionMode === 'pick' ? (
                <div>
                  <span className="text-[#d2c5b1]/70">Modo Pick Normal: </span>
                  {selectedPickCard ? (
                    <span className="text-[#ffd580] font-bold font-mono">
                      [{selectedPickCard.name}]
                    </span>
                  ) : (
                    <span className="text-[#d2c5b1]/50 italic">Elige 1 carta de tu mano arriba</span>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[#d2c5b1]/70">Ofreces:</span>
                    <span className="font-bold text-cyan-300 font-mono">
                      {selectedOfferCard ? `[${selectedOfferCard.name}]` : '(Elige de tu mano)'}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#d2c5b1]/50" />
                    <span className="text-[#d2c5b1]/70">Tomas del Plaza:</span>
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
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-space font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                actionMode === 'pick'
                  ? 'bg-[#ffd580] hover:bg-[#ffdea2] text-[#402d00] shadow-[0_0_15px_rgba(255,213,128,0.3)]'
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
