import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Sparkles, ArrowLeftRight, ShieldAlert, Zap, Layers } from 'lucide-react';

export function GetawayPlaza({
  plazaCards = [],
  swapOfferCard = null,
  selectedTargetId = null,
  onSelectTargetCard,
  onInspectCard,
  currentResolvingPlayerId = null,
  resolutionQueue = [],
  players = [],
  disabled = false
}) {
  const isSwapMode = !!swapOfferCard;

  // Map resolving player info
  const resolvingPlayer = players.find(p => p.id === currentResolvingPlayerId);

  return (
    <section className="w-full relative rounded-3xl p-4 sm:p-5 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 border border-amber-500/30 shadow-2xl shadow-amber-950/20 overflow-hidden">
      {/* Mystical Ethereal Platform Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/4 w-1/2 h-20 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                Getaway Plaza
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                5 Cartas Públicas
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cualquier jugador puede intercambiar 1 carta de su sobre por 1 de la Plaza.
            </p>
          </div>
        </div>

        {/* Dynamic Context Banner */}
        {isSwapMode ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/50 text-cyan-200 text-xs font-bold animate-pulse"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ofreciendo [{swapOfferCard.name}]: Elige tu objetivo abajo</span>
          </motion.div>
        ) : resolvingPlayer ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Resolviendo prioridad: {resolvingPlayer.name} (#{resolvingPlayer.seatIndex + 1})</span>
          </div>
        ) : (
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Mercado Central Activo</span>
          </div>
        )}
      </div>

      {/* 5 Cards Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 justify-items-center py-1">
        {plazaCards.map((card, idx) => {
          const isTarget = selectedTargetId === card.instanceId;

          return (
            <div key={card.instanceId || idx} className="relative group">
              <Card
                card={card}
                location="arena"
                size="sm"
                isSwapTarget={isTarget}
                disabled={disabled}
                onClick={() => {
                  if (onSelectTargetCard) onSelectTargetCard(card);
                }}
                onInspect={onInspectCard}
              />

              {/* Action B target helper indicator */}
              {isSwapMode && (
                <div
                  onClick={() => onSelectTargetCard && onSelectTargetCard(card)}
                  className={`absolute -bottom-2 inset-x-2 py-1 rounded-lg text-center text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all shadow-md ${
                    isTarget
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                      : 'bg-slate-900/90 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950'
                  }`}
                >
                  {isTarget ? '✓ Seleccionada' : 'Intercambiar'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
