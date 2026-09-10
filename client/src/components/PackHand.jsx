import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import {
  Check,
  Unlock,
  ArrowLeftRight,
  Sparkles,
  ArrowUpDown,
  Layers,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Bot
} from 'lucide-react';
import { sound } from '../utils/audio';

export function PackHand({
  activePack = [],
  selectedPickId = null,
  isReady = false,
  swapSourceCard = null,
  currentRound = 1,
  currentPickNumber = 1,
  totalPacks = 3,
  playerList = [],
  myId = null,
  onCardClick,
  onInitiateSwap,
  onCancelSwap,
  onLockPick,
  onUnlockPick,
  onInspectCard
}) {
  const [sortBy, setSortBy] = useState('none'); // 'none' | 'cmc' | 'color' | 'type'

  // Sorting
  const sortedCards = [...activePack].sort((a, b) => {
    if (sortBy === 'cmc') return (a.cmc || 0) - (b.cmc || 0);
    if (sortBy === 'color') {
      const colA = (a.colors || [])[0] || 'Z';
      const colB = (b.colors || [])[0] || 'Z';
      return colA.localeCompare(colB);
    }
    if (sortBy === 'type') {
      return (a.type_line || '').localeCompare(b.type_line || '');
    }
    return 0;
  });

  const selectedCard = activePack.find(c => c.instanceId === selectedPickId);

  const handleLockPick = () => {
    if (!selectedPickId) return;
    sound.playPick();
    onLockPick(selectedPickId);
  };

  const handleUnlockPick = () => {
    sound.playSelect();
    onUnlockPick();
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Middle Bar: Game Status & Pick Confirmation */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 md:p-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* Pack & Pick Info */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 flex items-center gap-2 shadow-inner">
            <Layers className="w-4 h-4 text-indigo-400" />
            <div className="text-xs">
              <span className="font-semibold text-white">Sobre {currentRound}</span> de {totalPacks}
              <span className="mx-1.5 text-slate-500">•</span>
              <span className="text-slate-300">Pick {currentPickNumber}</span>
            </div>
          </div>

          {/* Drafters Status Summary */}
          <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
            {playerList.map((p) => (
              <div
                key={p.id}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition-colors ${
                  p.ready
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                } ${p.id === myId ? 'ring-1 ring-amber-400/50' : ''}`}
                title={`${p.name}: ${p.ready ? 'Listo' : 'Eligiendo...'}`}
              >
                {p.isBot ? (
                  <Bot className="w-3 h-3 text-slate-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                )}
                <span className="truncate max-w-[80px]">{p.id === myId ? 'Tú' : p.name}</span>
                {p.ready && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls: Lock Pick / Swap Mode */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Cancel Swap if in swap mode */}
          {swapSourceCard && (
            <button
              onClick={onCancelSwap}
              className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
            >
              Cancelar Swap
            </button>
          )}

          {/* Quick Swap Trigger from Selected Card */}
          {selectedCard && !isReady && !swapSourceCard && (
            <button
              onClick={() => onInitiateSwap(selectedCard)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-900/30 flex items-center gap-1.5"
              title="Cambiar esta carta con una de la Arena pública"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Swap con Arena</span>
            </button>
          )}

          {/* Pick Confirmation Button */}
          {isReady ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-md">
                <Check className="w-4 h-4 text-emerald-400" />
                Pick Confirmado
              </span>
              <button
                onClick={handleUnlockPick}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white transition-colors"
                title="Cambiar pick (desbloquear)"
              >
                <Unlock className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLockPick}
              disabled={!selectedPickId}
              className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
                selectedPickId
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30 scale-100 hover:scale-102 active:scale-98 animate-pulse'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{selectedPickId ? 'Confirmar Pick' : 'Selecciona una Carta'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tu Sobre Actual (Cards Tray) */}
      <section className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3 md:p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm md:text-base font-bold text-slate-200 flex items-center gap-1.5">
              <span>Tu Sobre Actual</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                ({activePack.length} cartas)
              </span>
            </h3>
          </div>

          {/* Sorting buttons */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ordenar:</span>
            <div className="flex items-center bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
              {['none', 'cmc', 'color', 'type'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSortBy(mode)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors capitalize ${
                    sortBy === mode
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'hover:text-slate-200 text-slate-400'
                  }`}
                >
                  {mode === 'none' ? 'Original' : mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hand Cards Grid / Row with Framer Motion */}
        <div className="min-h-[200px] md:min-h-[270px] overflow-x-auto pb-3 pt-1">
          {activePack.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Clock className="w-8 h-8 mb-2 animate-spin text-slate-600" />
              <p className="text-sm">Esperando el siguiente sobre de cartas...</p>
            </div>
          ) : (
            <motion.div
              layout
              className="flex items-center gap-2.5 sm:gap-4 md:gap-5 px-2 min-w-max justify-center"
            >
              <AnimatePresence mode="popLayout">
                {sortedCards.map((card) => {
                  const isSelected = selectedPickId === card.instanceId;
                  const isSource = swapSourceCard?.instanceId === card.instanceId;

                  return (
                    <motion.div
                      key={card.instanceId || card.id}
                      layoutId={`card_${card.instanceId}`}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className="relative group"
                    >
                      <Card
                        card={card}
                        location="pack"
                        size="md"
                        isSelected={isSelected}
                        isSwapSource={isSource}
                        disabled={isReady}
                        onClick={() => onCardClick(card)}
                        onInspect={onInspectCard}
                      />

                      {/* Floating Quick Action Button on Hover */}
                      {!isReady && (
                        <div className="absolute -bottom-2 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onInitiateSwap(card);
                            }}
                            className="pointer-events-auto px-2.5 py-1 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold shadow-lg shadow-cyan-900/50 flex items-center gap-1 transition-transform hover:scale-105"
                          >
                            <ArrowLeftRight className="w-3 h-3" />
                            Swap
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
