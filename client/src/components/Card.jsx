import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ManaCost } from '../utils/manaSymbols';
import { sound } from '../utils/audio';
import { Eye, ArrowLeftRight, Check, Sparkles } from 'lucide-react';

export function Card({
  card,
  isSelected = false,
  isSwapTarget = false,
  isSwapSource = false,
  disabled = false,
  onClick,
  onInspect,
  location = 'pack', // 'pack' | 'arena' | 'pick'
  size = 'md' // 'sm' | 'md' | 'lg'
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const dimensions = {
    sm: 'w-28 h-40 md:w-32 md:h-44 text-xs',
    md: 'w-36 h-52 md:w-44 md:h-64 text-sm',
    lg: 'w-52 h-72 md:w-64 md:h-90 text-base'
  }[size] || 'w-36 h-52 md:w-44 md:h-64 text-sm';

  const handleClick = (e) => {
    if (disabled) return;
    sound.playSelect();
    if (onClick) onClick(card);
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      sound.playHover();
    }
  };

  const isArena = location === 'arena';

  return (
    <motion.div
      layoutId={card.instanceId ? `card_${card.instanceId}` : undefined}
      layout
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      whileHover={disabled ? {} : { scale: 1.08, y: -10, zIndex: 40 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onInspect) onInspect(card);
      }}
      className={`relative group cursor-pointer select-none rounded-xl overflow-hidden transition-shadow duration-300 ${dimensions} ${
        isSelected
          ? 'ring-4 ring-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.8)] -translate-y-2'
          : isSwapSource
          ? 'ring-4 ring-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.8)] -translate-y-2'
          : isSwapTarget
          ? 'ring-4 ring-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.8)] animate-pulse'
          : isArena
          ? 'hover:ring-2 hover:ring-amber-400/80 shadow-lg shadow-amber-950/20'
          : 'hover:ring-2 hover:ring-indigo-400/80 shadow-lg shadow-black/50'
      } ${disabled ? 'opacity-60 cursor-not-allowed filter grayscale-[30%]' : ''}`}
    >
      {/* Background Foil / Border Gradient */}
      <div
        className={`absolute inset-0 rounded-xl p-[2px] ${
          isArena
            ? 'bg-gradient-to-b from-amber-400 via-orange-600 to-amber-900'
            : isSelected
            ? 'bg-gradient-to-b from-amber-300 to-yellow-600'
            : isSwapSource
            ? 'bg-gradient-to-b from-cyan-300 to-blue-600'
            : 'bg-gradient-to-b from-slate-600 via-slate-800 to-slate-900'
        }`}
      >
        <div className="w-full h-full bg-slate-950 rounded-[10px] overflow-hidden relative flex flex-col justify-between">
          {/* Card Image */}
          {!imageError && card.image_url ? (
            <img
              src={card.image_url}
              alt={card.name}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover rounded-[10px] transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          ) : null}

          {/* Styled Fallback / Overlay if Image Loading or Failed */}
          {(!imageLoaded || imageError) && (
            <div className="absolute inset-0 p-2.5 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-950 to-stone-900 text-slate-100">
              <div>
                <div className="flex items-center justify-between gap-1 border-b border-slate-700/60 pb-1 mb-1.5">
                  <span className="font-bold text-xs truncate leading-tight text-amber-200">
                    {card.name}
                  </span>
                  <ManaCost manaCost={card.mana_cost} size="xs" />
                </div>
                <div className="text-[10px] text-slate-400 italic mb-2 border-b border-slate-800 pb-0.5">
                  {card.type_line}
                </div>
                <p className="text-[10px] text-slate-300 leading-snug line-clamp-4">
                  {card.oracle_text || 'No text'}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <span className="capitalize font-mono text-[9px]">{card.rarity || 'cube'}</span>
                {card.power !== null && card.toughness !== null && (
                  <span className="font-bold font-mono px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded">
                    {card.power}/{card.toughness}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Top Quick Status Badges */}
          <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none z-10">
            {isArena && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-500/90 text-slate-950 shadow-md backdrop-blur-xs flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                Arena
              </span>
            )}

            {isSelected && (
              <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-400 text-slate-950 shadow-md flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" />
                Selected
              </span>
            )}

            {isSwapSource && (
              <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-400 text-slate-950 shadow-md flex items-center gap-0.5">
                <ArrowLeftRight className="w-2.5 h-2.5" />
                Swapping
              </span>
            )}

            {isSwapTarget && (
              <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-400 text-slate-950 shadow-md flex items-center gap-0.5 animate-bounce">
                Target
              </span>
            )}
          </div>

          {/* Hover Action Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2 pointer-events-none">
            {onInspect && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInspect(card);
                }}
                className="pointer-events-auto p-1.5 rounded-full bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-600 transition-colors shadow-lg"
                title="Inspect Card Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bottom Card Title Banner on Hover for clear reading */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-1.5 pt-4 text-left pointer-events-none opacity-90 group-hover:opacity-100">
            <div className="text-[11px] font-semibold text-slate-200 truncate drop-shadow-md">
              {card.name}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
