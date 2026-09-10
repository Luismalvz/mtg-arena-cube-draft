import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { Flame, ArrowLeftRight, Sparkles, AlertCircle } from 'lucide-react';

export function ArenaMarket({
  arenaCards = [],
  swapSourceCard = null,
  onArenaCardClick,
  onInspectCard,
  disabled = false,
  recentActivity = []
}) {
  const latestSwap = recentActivity.find(log => log.type === 'swap');

  return (
    <section className="relative w-full rounded-2xl bg-gradient-to-b from-amber-950/30 via-slate-900/60 to-slate-950 border border-amber-500/40 p-3 md:p-5 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Background Arena Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-transparent blur-2xl pointer-events-none" />

      {/* Arena Header & Information Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/30">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-black tracking-wider uppercase bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                El Centro de la Arena
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Pool Público
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {swapSourceCard ? (
                <span className="text-cyan-300 font-medium animate-pulse flex items-center gap-1">
                  <ArrowLeftRight className="w-3.5 h-3.5 inline" />
                  Intercambiando [{swapSourceCard.name}]: Selecciona una carta de la Arena para realizar el swap
                </span>
              ) : (
                'Haz clic en una carta de tu sobre abajo y luego en una de aquí para intercambiarla'
              )}
            </p>
          </div>
        </div>

        {/* Latest Activity Ticker */}
        {latestSwap && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-amber-500/20 text-xs text-amber-200/90 shadow-inner">
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-xs">{latestSwap.text}</span>
          </div>
        )}
      </div>

      {/* Arena Cards Grid / Row */}
      <div className="relative z-10 min-h-[180px] md:min-h-[260px] flex items-center justify-center">
        {arenaCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-slate-500">
            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">La Arena está vacía en este momento</p>
          </div>
        ) : (
          <motion.div
            layout
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 md:gap-6 py-2"
          >
            <AnimatePresence mode="popLayout">
              {arenaCards.map((card) => {
                const isTarget = !!swapSourceCard;
                return (
                  <motion.div
                    key={card.instanceId || card.id}
                    layoutId={`card_${card.instanceId}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="relative"
                  >
                    <Card
                      card={card}
                      location="arena"
                      size="md"
                      isSwapTarget={isTarget}
                      disabled={disabled}
                      onClick={() => onArenaCardClick(card)}
                      onInspect={onInspectCard}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Swap Hint Callout Bar */}
      {swapSourceCard && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="relative z-10 mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-900 border border-cyan-500/50 flex items-center justify-between text-xs text-cyan-200 shadow-lg"
        >
          <div className="flex items-center gap-2 font-medium">
            <ArrowLeftRight className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>
              Listo para el swap con <strong>{swapSourceCard.name}</strong>. Haz clic en cualquiera de las cartas de arriba.
            </span>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono tracking-wider uppercase">
            [Acción Atómica]
          </span>
        </motion.div>
      )}
    </section>
  );
}
