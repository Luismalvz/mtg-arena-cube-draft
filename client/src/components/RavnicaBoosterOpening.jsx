import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../utils/audio';
import { Sparkles, ArrowRight, Scissors } from 'lucide-react';
import { ManaCost } from '../utils/manaSymbols';
import './RavnicaBoosterOpening.css';

const BOOSTER_IMAGE = '/collector-booster.png';

export function RavnicaBoosterOpening({
  round = 1,
  totalPacks = 3,
  cards = [],
  onFinishOpening
}) {
  // 'sealed' | 'ripping' | 'cards_emerging' | 'fanned'
  const [stage, setStage] = useState('sealed');
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [hoveredCardIdx, setHoveredCardIdx] = useState(null);
  const containerRef = useRef(null);

  // Subtle 3D mouse tilt when sealed
  const handleMouseMove = useCallback((e) => {
    if (stage !== 'sealed' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateY = (x / (rect.width / 2)) * 12;
    const rotateX = -(y / (rect.height / 2)) * 12;
    setTilt({ rotateX, rotateY });
  }, [stage]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  // Trigger the realistic booster rip animation
  const handleRipPack = useCallback(() => {
    if (stage !== 'sealed') return;

    sound.playPackRip();
    setStage('ripping');

    // Stage 1 -> 2: Cards emerge from inside the torn foil
    setTimeout(() => {
      sound.playShuffle();
      setStage('cards_emerging');
    }, 450);

    // Stage 2 -> 3: Cards fan out into player's hand view
    setTimeout(() => {
      sound.playFanfare();
      setStage('fanned');
    }, 1100);
  }, [stage]);

  // Fast forward if user clicks during animation
  const handleStageClick = useCallback(() => {
    if (stage === 'sealed') {
      handleRipPack();
    } else if (stage === 'ripping' || stage === 'cards_emerging') {
      sound.playFanfare();
      setStage('fanned');
    }
  }, [stage, handleRipPack]);

  // Keyboard shortcut: Space / Enter to rip or proceed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (stage === 'sealed') {
          handleRipPack();
        } else if (stage === 'ripping' || stage === 'cards_emerging') {
          setStage('fanned');
        } else if (stage === 'fanned' && onFinishOpening) {
          onFinishOpening();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, handleRipPack, onFinishOpening]);

  // Displayed cards: use real activePack cards or 15 placeholders
  const displayCards = cards.length > 0
    ? cards
    : Array.from({ length: 15 }, (_, i) => ({
        instanceId: 'card_' + i,
        name: 'Carta Ravnica #' + (i + 1),
        type_line: 'MTG Ravnica Remastered',
        mana_cost: '{2}{U}{B}'
      }));

  const totalCards = displayCards.length;
  const midIndex = (totalCards - 1) / 2;
  const fanSpacing = Math.min(32, Math.max(18, ((typeof window !== 'undefined' ? window.innerWidth : 1200) - 180) / Math.max(1, totalCards)));

  return (
    <div
      onClick={handleStageClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/94 backdrop-blur-2xl font-sans select-none overflow-y-auto overflow-x-hidden"
    >
      <div className="w-full max-w-5xl flex flex-col items-center text-center my-auto">
        {/* Header Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest mb-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Sobre {round} de {totalPacks} · Ravnica Remastered Collector Booster</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          key={stage}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-wide mb-1 drop-shadow-lg"
        >
          {stage === 'sealed' && '¡TU SOBRE ESTÁ SELLADO!'}
          {stage === 'ripping' && '¡RASGANDO EL ENVOLTORIO!'}
          {stage === 'cards_emerging' && '¡REVELANDO LAS CARTAS!'}
          {stage === 'fanned' && '¡CARTAS DE RAVNICA REVELADAS!'}
        </motion.h1>

        <div className="h-2" aria-hidden="true" />

        {/* Booster Opening 3D Stage */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="booster-stage relative w-full h-[480px] sm:h-[510px] flex items-center justify-center my-2"
        >
          {/* Ambient Lighting */}
          <div className="booster-ambient-glow" />

          {/* 1. PHYSICAL FOIL BOOSTER PACK */}
          <motion.div
            animate={
              stage === 'sealed'
                ? {
                    rotateX: tilt.rotateX,
                    rotateY: tilt.rotateY,
                    y: [0, -6, 0]
                  }
                : stage === 'ripping'
                ? {
                    x: [-3, 3, -2, 2, 0],
                    rotateX: -4,
                    y: 4
                  }
                : {
                    scale: 0.88,
                    y: 60,
                    opacity: stage === 'fanned' ? 0.35 : 0.7,
                    filter: 'grayscale(20%)'
                  }
            }
            transition={
              stage === 'sealed'
                ? { y: { repeat: Infinity, duration: 4, ease: 'easeInOut' } }
                : { duration: 0.4 }
            }
            className="booster-pack-wrapper absolute z-20"
          >
            {/* Top Serrated Foil Crimp (Tears Away) */}
            <motion.div
              animate={
                stage === 'sealed'
                  ? { y: 0, rotateX: 0, opacity: 1 }
                  : {
                      y: -42,
                      rotateX: -95,
                      rotateZ: -8,
                      opacity: 0
                    }
              }
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute top-0 left-0 right-0 h-[58px] z-30 overflow-hidden rounded-t-[6px]"
              style={{
                transformOrigin: 'top center',
                clipPath: 'polygon(0 0, 100% 0, 100% 82%, 92% 98%, 82% 80%, 72% 96%, 62% 82%, 52% 99%, 42% 84%, 32% 97%, 22% 81%, 12% 96%, 0 82%)'
              }}
            >
              {/* Crimp ridges */}
              <div className="booster-crimp-top" />
              {/* Artwork upper slice */}
              <img
                src={BOOSTER_IMAGE}
                alt="Ravnica Remastered Booster"
                className="w-full h-[465px] object-cover object-top select-none pointer-events-none"
              />
              <div className="booster-foil-sheen" />
            </motion.div>

            {/* Tear Perforation Guide Line & Tab (When Sealed) */}
            {stage === 'sealed' && (
              <div className="booster-tear-guide">
                <div className="booster-tear-tab">
                  <Scissors className="w-3 h-3 text-amber-950" />
                  <span>RASGAR AQUÍ</span>
                </div>
              </div>
            )}

            {/* Foil Tear Flash Energy */}
            {stage === 'ripping' && <div className="booster-tear-flash" />}

            {/* Inner Dark Foil Pocket Cavity (Where cards slide from) */}
            <div className="booster-inner-cavity" />

            {/* Bottom Foil Body */}
            <div
              className="absolute inset-0 z-10 rounded-[6px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
              style={{
                clipPath: stage === 'sealed'
                  ? 'none'
                  : 'polygon(0 12%, 12% 21%, 22% 9%, 32% 22%, 42% 10%, 52% 23%, 62% 9%, 72% 21%, 82% 8%, 92% 20%, 100% 12%, 100% 100%, 0 100%)'
              }}
            >
              {/* Full Artwork */}
              <img
                src={BOOSTER_IMAGE}
                alt="Ravnica Remastered Collector Booster"
                className="w-full h-full object-cover select-none pointer-events-none rounded-[6px]"
              />
              {/* Dynamic Rainbow Foil Sheen */}
              <div className="booster-foil-sheen" />
              {/* Bottom Serrated Foil Crimp */}
              <div className="booster-crimp-bottom" />
            </div>
          </motion.div>

          {/* 2. THE 15 CARDS SLIDING OUT & FANNING */}
          <div className="fanned-cards-container absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <AnimatePresence>
              {(stage === 'cards_emerging' || stage === 'fanned') && (
                <div className="relative w-full h-full flex items-center justify-center">
                  {displayCards.map((card, i) => {
                    const offset = i - midIndex;
                    const rotateZ = stage === 'fanned' ? offset * 2.8 : 0;
                    const x = stage === 'fanned' ? offset * fanSpacing : 0;
                    const y = stage === 'fanned' ? Math.abs(offset) * 5 - 40 : 30;
                    const scale = stage === 'fanned' ? 1 : 0.85;

                    return (
                      <motion.div
                        key={card.instanceId || i}
                        initial={{
                          y: 120,
                          scale: 0.7,
                          rotateZ: 0,
                          opacity: 0
                        }}
                        animate={{
                          y: hoveredCardIdx === i ? y - 45 : y,
                          x,
                          rotateZ,
                          scale: hoveredCardIdx === i ? 1.3 : scale,
                          opacity: 1
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 260,
                          damping: 24,
                          delay: stage === 'fanned' ? i * 0.025 : 0
                        }}
                        onMouseEnter={() => setHoveredCardIdx(i)}
                        onMouseLeave={() => setHoveredCardIdx(null)}
                        className="fanned-card absolute pointer-events-auto cursor-pointer"
                        style={{
                          zIndex: hoveredCardIdx === i ? 80 : 30 + i
                        }}
                      >
                        {/* Real Card Frame */}
                        <div className="w-[125px] h-[175px] sm:w-[145px] sm:h-[203px] rounded-[8px] overflow-hidden bg-[#0d1017] border-2 border-black shadow-[0_15px_35px_rgba(0,0,0,0.9)] ring-1 ring-amber-400/40 select-none relative group">
                          {card.image_url ? (
                            <img
                              src={card.image_url}
                              alt={card.name}
                              className="w-full h-full object-cover rounded-[7px] block pointer-events-none"
                            />
                          ) : (
                            /* Fallback MTG Face */
                            <div className="w-full h-full p-2.5 flex flex-col justify-between bg-gradient-to-b from-stone-900 via-slate-950 to-stone-950 text-slate-100 rounded-[7px]">
                              <div>
                                <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                                  <span className="font-bold text-[10px] truncate text-amber-200 font-cinzel">
                                    {card.name}
                                  </span>
                                </div>
                                <div className="text-[9px] text-slate-400 italic mb-1">
                                  {card.type_line || 'MTG Card'}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-white/10 pt-1">
                                <span className="font-mono text-[8px] uppercase">{card.rarity || 'Cube'}</span>
                                {card.mana_cost && <ManaCost manaCost={card.mana_cost} size="xs" />}
                              </div>
                            </div>
                          )}

                          {/* Hover Golden Aura */}
                          <div className="absolute inset-0 rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity ring-2 ring-amber-400 pointer-events-none shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex flex-col items-center gap-2">
          {stage === 'fanned' ? (
            <motion.button
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                if (onFinishOpening) onFinishOpening();
              }}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_35px_rgba(251,191,36,0.6)] flex items-center gap-2.5 cursor-pointer hover:brightness-110 active:scale-95 transition-all"
            >
              <span>CONTINUAR AL DRAFT</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : stage === 'sealed' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRipPack();
              }}
              className="text-xs font-mono text-amber-300/90 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-2 rounded-lg border border-amber-500/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
                <span>Abrir sobre</span>
            </button>
          ) : (
            <span className="text-xs font-mono text-amber-400/80 animate-pulse">
              Abriendo sobre de Ravnica...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
