import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { sound } from '../utils/audio';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
  Bot,
  Zap,
  ArrowLeftRight,
  Crown,
  Layers
} from 'lucide-react';

export function TurnTimeline({
  currentRound = 1,
  currentPickNumber = 1,
  totalPacks = 3,
  passDirection = 'clockwise',
  timerRemaining = 45,
  maxTimerSeconds = 45,
  players = [],
  myId = null,
  currentResolvingPlayerId = null,
  status = 'decision_phase'
}) {
  const isInfiniteTimer = !maxTimerSeconds || maxTimerSeconds <= 0;
  const isUrgent = !isInfiniteTimer && timerRemaining <= 10 && timerRemaining > 0;
  const isCounterClockwise = passDirection === 'counterclockwise';

  // Sound tick on urgent countdown
  useEffect(() => {
    if (isUrgent) {
      sound.playTimerTick();
    }
  }, [timerRemaining, isUrgent]);

  const timerPercentage = isInfiniteTimer
    ? 100
    : Math.max(0, Math.min(100, (timerRemaining / maxTimerSeconds) * 100));

  return (
    <section className="timeline-surface w-full glass-panel rounded-none border-x-0 px-4 py-2.5 sm:px-6 space-y-2">
      {/* Top row: Pack/Pick info, Pass Direction, Countdown Timer */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        
        {/* Pack & Pick Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 font-bold text-xs">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Sobre {currentRound}/{totalPacks}</span>
          </div>

          <div className="px-3 py-1 bg-slate-800/90 border border-slate-700/80 rounded-xl text-slate-200 font-mono text-xs font-bold">
            Pick {currentPickNumber}/15
          </div>
        </div>

        {/* Passing Direction Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
          <span className="text-slate-400">Pasan a:</span>
          <div className="flex items-center gap-1 font-bold text-amber-400">
            {isCounterClockwise ? (
              <>
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Derecha (Anti-horario)</span>
              </>
            ) : (
              <>
                <span>Izquierda (Horario)</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              </>
            )}
          </div>
        </div>

        {/* Timer Badge */}
        {!isInfiniteTimer ? (
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-xl border font-mono font-bold text-xs transition-colors ${
              isUrgent
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-amber-300'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-400' : 'text-amber-400'}`} />
            <span>{timerRemaining}s</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Sin Límite</span>
          </div>
        )}
      </div>

      {/* Timer Progress Bar */}
      {!isInfiniteTimer && (
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <motion.div
            className={`h-full transition-all duration-300 ${
              isUrgent
                ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      )}

      {/* Seating Drafter Avatars & Readiness Tracker */}
      <div className="pt-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {players.map((player) => {
          const isMe = player.id === myId;
          const isResolving = player.id === currentResolvingPlayerId;
          const isReady = player.isReady;
          const isSwap = player.pendingActionType === 'swap';

          return (
            <div
              key={player.id}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 text-xs shrink-0 ${
                isResolving
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                  : isReady
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : isMe
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
              }`}
            >
              {/* Seat Priority Badge */}
              <span className="w-5 h-5 rounded-md bg-slate-800 font-mono font-bold text-[10px] flex items-center justify-center text-slate-300">
                #{player.seatIndex + 1}
              </span>

              {/* Player Name */}
              <div className="flex items-center gap-1">
                {player.isBot && <Bot className="w-3 h-3 text-cyan-400" />}
                {player.isAdmin && <Crown className="w-3 h-3 text-amber-400" />}
                <span className={`font-semibold max-w-[90px] truncate ${isMe ? 'text-white font-bold' : ''}`}>
                  {player.name}
                </span>
              </div>

              {/* Status Indicator Icon */}
              {isResolving ? (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-cyan-300 font-mono animate-pulse">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  Resolviendo
                </span>
              ) : isReady ? (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                  {isSwap ? (
                    <ArrowLeftRight className="w-3 h-3 text-cyan-400" />
                  ) : (
                    <Check className="w-3 h-3 text-emerald-400" />
                  )}
                  Listo
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500/60 animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
