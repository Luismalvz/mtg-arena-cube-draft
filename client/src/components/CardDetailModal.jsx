import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Shield } from 'lucide-react';
import { ManaCost } from '../utils/manaSymbols';

export function CardDetailModal({ card, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!card) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 max-w-2xl w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row gap-6 p-6"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Card Image */}
          <div className="w-full md:w-1/2 flex justify-center items-center">
            {card.image_url ? (
              <img
                src={card.image_url}
                alt={card.name}
                className="w-64 md:w-full max-h-[420px] object-contain rounded-xl shadow-2xl ring-1 ring-slate-700"
              />
            ) : (
              <div className="w-64 h-88 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                Sin Imagen
              </div>
            )}
          </div>

          {/* Right: Detailed Card Stats */}
          <div className="w-full md:w-1/2 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-xl font-black text-white leading-tight">
                    {card.name}
                  </h3>
                  <ManaCost manaCost={card.mana_cost} size="md" />
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {card.type_line} • CMC {card.cmc || 0}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {card.oracle_text || 'Sin texto de reglas.'}
              </div>

              {card.power !== null && card.toughness !== null && (
                <div className="flex justify-end">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-mono font-bold text-sm shadow-inner">
                    Fuerza / Resistencia: {card.power}/{card.toughness}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 mt-4">
              <span className="capitalize">Rareza: {card.rarity || 'Especial'}</span>
              <a
                href={`https://scryfall.com/search?q=%21%22${encodeURIComponent(card.name)}%22`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <span>Ver en Scryfall</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
