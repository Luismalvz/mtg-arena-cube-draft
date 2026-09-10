import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { sound } from '../utils/audio';
import {
  Sparkles,
  ArrowLeftRight,
  Check,
  RotateCcw,
  Layers,
  HelpCircle,
  Lock,
  ArrowUpRight
} from 'lucide-react';

export function DraftHand({
  activePack = [],
  isReady = false,
  pendingDecision = null,
  selectedPlazaCard = null,
  onConfirmPick,
  onConfirmSwap,
  onCancelDecision,
  onInspectCard,
  onClearPlazaTarget
}) {
  const [actionMode, setActionMode] = useState('pick'); // 'pick' | 'swap'
  const [selectedPickCard, setSelectedPickCard] = useState(null);
  const [selectedOfferCard, setSelectedOfferCard] = useState(null);

  // Sync state if player already has pendingDecision
  useEffect(() => {
    if (pendingDecision) {
      if (pendingDecision.type === 'pick') {
        setActionMode('pick');
        const c = activePack.find(card => card.instanceId === pendingDecision.cardInstanceId);
        if (c) setSelectedPickCard(c);
      } else if (pendingDecision.type === 'swap') {
        setActionMode('swap');
        const c = activePack.find(card => card.instanceId === pendingDecision.offerCardInstanceId);
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

  return (
    <section className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
      {/* Hand Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                Tu Sobre Actual
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                {activePack.length} Cartas Restantes
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isReady
                ? 'Elección confirmada. Esperando a los demás jugadores...'
                : 'Elige tu acción para este turno:'}
            </p>
          </div>
        </div>

        {/* Action A vs Action B Selector */}
        {!isReady && (
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto">
            <button
              onClick={() => handleSwitchMode('pick')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                actionMode === 'pick'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Acción A: Pick Normal</span>
            </button>

            <button
              onClick={() => handleSwitchMode('swap')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                actionMode === 'swap'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Acción B: Getaway Swap</span>
            </button>
          </div>
        )}
      </div>

      {/* Cards Grid in Pack */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 justify-items-center py-2 min-h-[220px]">
        {activePack.map((card) => {
          const isSelectedForPick = actionMode === 'pick' && selectedPickCard?.instanceId === card.instanceId;
          const isSelectedForSwapOffer = actionMode === 'swap' && selectedOfferCard?.instanceId === card.instanceId;

          return (
            <Card
              key={card.instanceId}
              card={card}
              location="pack"
              size="sm"
              isSelected={isSelectedForPick}
              isSwapSource={isSelectedForSwapOffer}
              disabled={isReady}
              onClick={() => handleCardClick(card)}
              onInspect={onInspectCard}
            />
          );
        })}
      </div>

      {/* Confirmation & Status Action Bar */}
      <div className="pt-2 border-t border-slate-800/80">
        {isReady ? (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold">Decisión Confirmada & Bloqueada</div>
                <div className="text-[11px] text-emerald-300/80">
                  {actionMode === 'pick'
                    ? `Seleccionaste: [${selectedPickCard?.name || pendingDecision?.cardName || 'Carta'}]`
                    : `Intercambio solicitado: [${selectedOfferCard?.name || pendingDecision?.offerName}] ➜ [${selectedPlazaCard?.name || pendingDecision?.targetName}]`}
                </div>
              </div>
            </div>

            <button
              onClick={onCancelDecision}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all self-end sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cambiar Selección</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            {/* Left summary of chosen action */}
            <div className="text-xs space-y-0.5 text-center sm:text-left">
              {actionMode === 'pick' ? (
                <div>
                  <span className="text-slate-400">Modo Pick Normal: </span>
                  {selectedPickCard ? (
                    <span className="text-amber-300 font-bold font-mono">
                      [{selectedPickCard.name}]
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">Haz clic en 1 carta de tu sobre arriba</span>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-400">Ofreces:</span>
                    <span className="font-bold text-cyan-300 font-mono">
                      {selectedOfferCard ? `[${selectedOfferCard.name}]` : '(Elige 1 de tu sobre)'}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-400">Tomas del Plaza:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {selectedPlazaCard ? `[${selectedPlazaCard.name}]` : '(Elige 1 del Plaza arriba)'}
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
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                actionMode === 'pick'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/20 hover:brightness-110'
                  : 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-cyan-500/20 hover:brightness-110'
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
