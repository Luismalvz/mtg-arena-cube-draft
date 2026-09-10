import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Sparkles, Zap } from 'lucide-react';

export function SwapAnimationOverlay({ event = null }) {
  if (!event) return null;

  return (
    <AnimatePresence>
      <div className="fixed top-20 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
        <motion.div
          initial={{ y: -40, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          className="bg-slate-900/95 border-2 border-cyan-400/80 rounded-2xl p-4 shadow-[0_0_40px_rgba(34,211,238,0.3)] backdrop-blur-xl max-w-lg w-full flex items-center gap-4 pointer-events-auto"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-lg shadow-cyan-500/30">
            <ArrowLeftRight className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40">
                PRIORIDAD #{event.seatIndex + 1}
              </span>
              <span className="text-xs font-black text-white truncate">
                {event.playerName}
              </span>
            </div>

            <div className="text-xs text-slate-200 flex items-center gap-1.5 flex-wrap">
              <span>Depositó</span>
              <span className="font-bold text-amber-300 font-mono">[{event.offerCard?.name}]</span>
              <span>➜ Tomó</span>
              <span className="font-bold text-emerald-300 font-mono">[{event.plazaCard?.name}]</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
