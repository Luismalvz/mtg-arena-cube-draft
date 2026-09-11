import React, { useState } from 'react';
import { ManaCost } from '../utils/manaSymbols';
import { sound } from '../utils/audio';
import { ArrowLeftRight, Check } from 'lucide-react';

export function Card({
  card,
  isSelected = false,
  isSwapTarget = false,
  isSwapSource = false,
  disabled = false,
  onClick,
  onHoverStart,
  onHoverEnd,
  location: _location = 'pack', // 'pack' | 'arena' | 'pick'
  size = 'md' // 'sm' | 'md' | 'lg'
}) {
  const [imageError, setImageError] = useState(false);

  // Proportional 5:7 MTG Card aspect ratios (Enlarged)
  const dimensions = {
    sm: 'w-[130px] h-[182px] sm:w-[145px] sm:h-[203px] md:w-[155px] md:h-[217px]',
    hand: 'draft-hand-card',
    deck: 'deck-card',
    plaza: 'plaza-card',
    golem: 'golem-card',
    md: 'w-[142px] h-[199px] sm:w-[156px] sm:h-[218px] md:w-[168px] md:h-[235px]',
    lg: 'w-[250px] h-[350px] sm:w-[300px] sm:h-[420px]'
  }[size] || 'w-[142px] h-[199px] sm:w-[156px] sm:h-[218px] md:w-[168px] md:h-[235px]';

  const handleClick = () => {
    if (disabled) return;
    sound.playSelect();
    if (onClick) onClick(card);
  };

  const handleMouseEnter = (e) => {
    if (!disabled) {
      sound.playHover();
    }
    if (onHoverStart) onHoverStart(card, e);
  };

  const handleMouseLeave = (e) => {
    if (onHoverEnd) onHoverEnd(card, e);
  };

  const hasImage = !imageError && Boolean(card.image_url);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none transition-all duration-200 cursor-pointer rounded-[7px] ${dimensions} ${
        isSelected
          ? 'ring-2 ring-[#e5c681] ring-offset-2 ring-offset-[#080b09] shadow-[0_0_24px_rgba(216,183,112,.36)] z-30 -translate-y-2'
          : isSwapSource
          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.7)] z-30 -translate-y-2'
          : isSwapTarget
          ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_18px_rgba(52,211,153,0.7)] z-20 animate-pulse'
          : 'shadow-[0_12px_28px_rgba(0,0,0,.48)] hover:shadow-[0_18px_38px_rgba(0,0,0,.62)]'
      } ${disabled ? 'opacity-50 cursor-not-allowed filter grayscale-[20%]' : ''}`}
    >
      {/* MTG Card Body with authentic rounded corners */}
      <div className="w-full h-full rounded-[7px] overflow-hidden bg-[#111411] border border-black/70 flex flex-col justify-between relative group">
        
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
              <span className="px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase bg-amber-400 text-slate-950 shadow-sm flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" />
                Elegida
              </span>
            )}
            {isSwapSource && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase bg-cyan-400 text-slate-950 shadow-sm flex items-center gap-0.5">
                <ArrowLeftRight className="w-2.5 h-2.5" />
                Swap
              </span>
            )}
            {isSwapTarget && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase bg-emerald-400 text-slate-950 shadow-sm flex items-center gap-0.5">
                Objetivo
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
