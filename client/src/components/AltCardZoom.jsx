import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManaCost } from '../utils/manaSymbols';

export function AltCardZoom({ card, isVisible }) {
  if (!isVisible || !card) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center p-4"
      >
        {/* Subtle backdrop vignette */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs pointer-events-none" />

        {/* Large Crisp MTG Card Zoom */}
        <div className="relative w-[300px] h-[420px] sm:w-[360px] sm:h-[504px] md:w-[400px] md:h-[560px] rounded-[14px] overflow-hidden bg-[#0d1017] border-2 border-amber-400/80 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(251,191,36,0.35)] select-none">
          {card.image_url ? (
            <img
              src={card.image_url}
              alt={card.name}
              className="w-full h-full object-cover rounded-[12px] block select-none pointer-events-none"
            />
          ) : (
            <div className="w-full h-full p-5 flex flex-col justify-between bg-gradient-to-b from-stone-900 via-slate-950 to-stone-950 text-slate-100 rounded-[12px]">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <span className="font-bold text-lg text-amber-200 font-cinzel">{card.name}</span>
                  <ManaCost manaCost={card.mana_cost} size="sm" />
                </div>
                <div className="text-xs text-slate-400 italic mb-3 border-b border-white/5 pb-1">
                  {card.type_line}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {card.oracle_text || 'No text'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                <span className="capitalize font-mono text-slate-500">{card.rarity || 'cube'}</span>
                {card.power !== null && card.toughness !== null && (
                  <span className="font-bold font-mono px-2 py-0.5 bg-slate-800 text-amber-300 rounded">
                    {card.power}/{card.toughness}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Bottom subtle hotkey indicator */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-space text-amber-300/80 border border-amber-400/30">
            [ALT] Zoom
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}