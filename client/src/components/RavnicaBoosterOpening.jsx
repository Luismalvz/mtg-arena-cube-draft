import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { sound } from '../utils/audio';
import { Sparkles, ArrowRight } from 'lucide-react';
import './RavnicaBoosterOpening.css';

export function RavnicaBoosterOpening({
  round = 1,
  totalPacks = 3,
  onFinishOpening
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const envelopeRef = useRef(null);

  const toggleEnvelope = useCallback(() => {
    if (!isOpen) {
      sound.playPackRip();
      setIsOpen(true);
      setTimeout(() => {
        setRevealed(true);
        sound.playFanfare();
      }, 700);
    }
  }, [isOpen]);

  const previewEnvelope = useCallback(() => {
    if (!isOpen) {
      setIsShaking(true);
      window.setTimeout(() => setIsShaking(false), 480);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && !isOpen) {
        event.preventDefault();
        toggleEnvelope();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleEnvelope]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/92 backdrop-blur-xl font-manrope select-none overflow-y-auto">
      <div className="w-full max-w-xl flex flex-col items-center text-center my-auto py-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-space font-bold uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Sobre {round} de {totalPacks} · Ravnica Remastered</span>
        </div>

        <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide mb-1 drop-shadow-md">
          {isOpen ? '¡SOBRE ABIERTO!' : 'ABRE TU SOBRE'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 font-manrope">
          {isOpen
            ? 'Tus 15 cartas de Ravnica están listas para ser exploradas en tu mano.'
            : 'Haz clic en el sobre sellado para rasgar el empaque y revelar tus cartas.'}
        </p>

        <div className="stage-container">
          <div className="ambient-glow" aria-hidden="true" />
          <button
            ref={envelopeRef}
            className={`envelope ${isOpen ? 'is-open' : ''} ${isShaking ? 'is-shaking' : ''}`}
            type="button"
            onClick={toggleEnvelope}
            onMouseEnter={previewEnvelope}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Sobre Abierto' : 'Abrir el sobre'}
          >
            <span className="envelope-shadow" aria-hidden="true" />
            <span className="envelope-back" aria-hidden="true" />

            <span className="booster" aria-hidden="true">
              <img src="/collector-booster.png" alt="Ravnica Remastered Collector Booster" />
            </span>

            <span className="envelope-pocket" aria-hidden="true" />
            <span className="envelope-flap" aria-hidden="true" />
            <span className="seal" aria-hidden="true">
              <span>✦</span>
            </span>
            <span className="spark spark-one" aria-hidden="true">✦</span>
            <span className="spark spark-two" aria-hidden="true">✧</span>
            <span className="spark spark-three" aria-hidden="true">✦</span>
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          {revealed ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onFinishOpening}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-space font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(251,191,36,0.5)] flex items-center gap-2 cursor-pointer"
            >
              <span>DESCUBRIR MI MANO Y DRAFTEAR</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <p className="text-xs font-space text-slate-400 animate-pulse">
              Haz clic en el sello o el sobre para abrirlo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}