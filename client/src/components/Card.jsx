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
  const [imageError, setImageError] = useState(false);

  // Proportional 5:7 MTG Card aspect ratios
  const dimensions = {
    sm: 'w-[110px] h-[154px] sm:w-[122px] sm:h-[171px]',
    md: 'w-[136px] h-[190px] sm:w-[150px] sm:h-[210px]',
    lg: 'w-[220px] h-[308px] sm:w-[250px] sm:h-[350px]'
  }[size] || 'w-[136px] h-[190px] sm:w-[150px] sm:h-[210px]';

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

  const hasImage = !imageError && Boolean(card.image_url);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onInspect) onInspect(card);
      }}
      className={`relative select-none transition-all duration-200 cursor-pointer rounded-[7px] ${dimensions} ${
        isSelected
          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.7)] z-30 -translate-y-2'
          : isSwapSource
          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.7)] z-30 -translate-y-2'
          : isSwapTarget
          ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_16px_rgba(52,211,153,0.7)] z-20 animate-pulse'
          : 'shadow-md shadow-black/80 hover:shadow-xl hover:shadow-black'
      } ${disabled ? 'opacity-50 cursor-not-allowed filter grayscale-[20%]' : ''}`}
    >
      {/* MTG Card Body with authentic rounded corners */}
      <div className="w-full h-full rounded-[7px] overflow-hidden bg-[#0d1017] border border-black/40 flex flex-col justify-between relative group">
        
        {hasImage ? (
          <img
            src={card.image_url}
            alt={card.name}
            loading="eager"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover select-none pointer-events-none rounded-[7px] block"
          />
        ) : (
          /* Minimalist MTG Fallback Frame if image fails */
          <div className="w-full h-full p-2 flex flex-col justify-between bg-gradient-to-b from-stone-900 via-slate-950 to-stone-950 text-slate-100 border border-amber-900/40 rounded-[7px]">
            <div>
              <div className="flex items-center justify-between gap-1 border-b border-white/10 pb-1 mb-1">
                <span className="font-bold text-[11px] truncate leading-tight text-amber-200 font-cinzel">
                  {card.name}
                </span>
                <ManaCost manaCost={card.mana_cost} size="xs" />
              </div>
              <div className="text-[9px] text-slate-400 italic mb-1.5 border-b border-white/5 pb-0.5">
                {card.type_line}
              </div>
              <p className="text-[9px] text-slate-300 leading-snug line-clamp-5">
                {card.oracle_text || ''}
              </p>
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-white/10">
              <span className="capitalize font-mono text-[8px] text-slate-500">{card.rarity || 'cube'}</span>
              {card.power !== null && card.toughness !== null && (
                <span className="font-bold font-mono px-1 py-0.5 bg-slate-800 text-amber-300 rounded text-[9px]">
                  {card.power}/{card.toughness}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Status Pills (Minimalist Archidekt Style) */}
        {(isSelected || isSwapSource || isSwapTarget) && (
          <div className="absolute top-1 right-1 pointer-events-none z-10 flex items-center gap-1">
            {isSelected && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-space font-bold uppercase bg-amber-400 text-slate-950 shadow-sm flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" />
                Pick
              </span>
            )}
            {isSwapSource && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-space font-bold uppercase bg-cyan-400 text-slate-950 shadow-sm flex items-center gap-0.5">
                <ArrowLeftRight className="w-2.5 h-2.5" />
                Swap
              </span>
            )}
            {isSwapTarget && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-space font-bold uppercase bg-emerald-400 text-slate-950 shadow-sm flex items-center gap-0.5">
                Objetivo
              </span>
            )}
          </div>
        )}

        {/* Clean Hover Inspect Button */}
        {onInspect && (
          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInspect(card);
              }}
              className="pointer-events-auto p-1 rounded bg-black/75 hover:bg-amber-400 hover:text-black text-slate-200 border border-white/20 transition-all cursor-pointer shadow-md"
              title="Inspeccionar carta (o clic secundario)"
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
