import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../utils/audio';
import { Flame, Sparkles, Scissors, Users, Check, ArrowDown } from 'lucide-react';

export function BoosterWrapper({
  currentRound = 1,
  totalPacks = 3,
  hasOpened = false,
  players = [],
  onOpenPack
}) {
  const [isRipping, setIsRipping] = useState(false);

  const openedCount = players.filter(p => p.packOpened).length;
  const totalCount = players.length;

  const handleRip = () => {
    if (hasOpened || isRipping) return;
    setIsRipping(true);
    sound.playPackRip();

    setTimeout(() => {
      onOpenPack();
      setIsRipping(false);
    }, 600);
  };

  return (
    <div className="w-full max-w-lg mx-auto py-10 flex flex-col items-center justify-center space-y-6">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ronda {currentRound} de {totalPacks}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          {hasOpened ? '¡SOBRE ABIERTO!' : 'NUEVO SOBRE DE 15 CARTAS'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          {hasOpened
            ? `Esperando que todos los jugadores abran su sobre (${openedCount}/${totalCount} listos)`
            : 'Haz clic o presiona el botón para rasgar el empaque de aluminio y comenzar el draft.'}
        </p>
      </div>

      {/* 3D Pack Container */}
      <div className="relative perspective-1000">
        <motion.div
          animate={
            isRipping
              ? { scale: [1, 1.05, 0.95], rotateY: [0, -5, 5, 0] }
              : { y: [0, -6, 0] }
          }
          transition={
            isRipping
              ? { duration: 0.5 }
              : { repeat: Infinity, duration: 4, ease: 'easeInOut' }
          }
          onClick={handleRip}
          className={`relative w-64 sm:w-72 h-96 sm:h-[420px] rounded-2xl shadow-2xl cursor-pointer select-none overflow-hidden transition-all duration-300 ${
            hasOpened
              ? 'opacity-70 filter saturate-50'
              : 'hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] hover:scale-[1.02]'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Outer Foil Wrapper Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-600 via-amber-800 to-slate-950 p-[3px] rounded-2xl">
            <div className="w-full h-full bg-gradient-to-b from-stone-900 via-slate-950 to-stone-950 rounded-[14px] overflow-hidden relative flex flex-col justify-between p-5 border border-amber-500/30">
              
              {/* Foil Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/10 to-transparent opacity-60 pointer-events-none transform -skew-y-12" />

              {/* Top Crimp / Tear Strip */}
              <div className="relative border-b-2 border-dashed border-amber-400/60 pb-3 flex items-center justify-between text-amber-300">
                <div className="flex items-center gap-1 text-[11px] font-mono tracking-widest font-bold uppercase">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Rasgar Aquí</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200">
                  15 CARDS
                </span>
              </div>

              {/* Center Booster Art & Title */}
              <div className="my-auto text-center space-y-3 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-300/40">
                  <Flame className="w-10 h-10 text-slate-950" />
                </div>

                <div>
                  <div className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                    Magic: The Gathering
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    CUBE 360 • SOBRE #{currentRound}
                  </div>
                </div>
              </div>

              {/* Bottom Crimp */}
              <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>SEALED DRAFT</span>
                <span>AUTHENTIC MTG</span>
              </div>
            </div>
          </div>

          {/* Ripping Tear Slice Overlay */}
          <AnimatePresence>
            {isRipping && (
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 100 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-8 inset-x-0 h-1 bg-amber-300 shadow-[0_0_20px_#fde047] z-30"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Button & Readiness Status */}
      <div className="w-full max-w-xs text-center space-y-3">
        {!hasOpened ? (
          <button
            onClick={handleRip}
            disabled={isRipping}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Scissors className="w-4 h-4" />
            <span>{isRipping ? 'Rasgando...' : 'Rasgar y Abrir Sobre'}</span>
          </button>
        ) : (
          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-emerald-400">
            <Check className="w-4 h-4" />
            <span>Tu sobre está abierto</span>
          </div>
        )}

        {/* Players Readiness Pill List */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {players.map((p, idx) => (
            <span
              key={p.id || idx}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono flex items-center gap-1 ${
                p.packOpened
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${p.packOpened ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{p.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
