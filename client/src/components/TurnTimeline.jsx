import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3 } from 'lucide-react';
import { sound } from '../utils/audio';
import { getAvatarSrc } from '../utils/tokenAvatars';

export function TurnTimeline({ currentRound = 1, currentPickNumber = 1, totalPacks = 3, passDirection = 'clockwise', timerRemaining = 45, maxTimerSeconds = 45, players = [], myId = null, currentResolvingPlayerId = null }) {
  const infinite = !maxTimerSeconds || maxTimerSeconds <= 0;
  const urgent = !infinite && timerRemaining <= 10 && timerRemaining > 0;
  const percentage = infinite ? 100 : Math.max(0, Math.min(100, timerRemaining / maxTimerSeconds * 100));
  useEffect(() => { if (urgent) sound.playTimerTick(); }, [timerRemaining, urgent]);
  return (
    <header className="relative z-20 shrink-0 border-b border-white/10 bg-[#080b09]/88 px-3 py-2 backdrop-blur-2xl sm:px-5">
      <div className="mx-auto flex max-w-[1540px] items-center gap-3">
        <div className="flex shrink-0 items-center gap-2 text-[12px] font-semibold">
          <span className="text-[#e5c681]">{currentRound}/{totalPacks}</span><span className="text-white/25">—</span><span>Pick {currentPickNumber}</span>
          <span className="ml-1 text-[#7f8981]" title={passDirection === 'counterclockwise' ? 'Pasa a la derecha' : 'Pasa a la izquierda'}>{passDirection === 'counterclockwise' ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}</span>
        </div>

        <div className="scrollbar-hide flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto">
          {players.map(player => {
            const me = player.id === myId, resolving = player.id === currentResolvingPlayerId;
            return <div key={player.id} title={player.name} className={`relative h-8 w-8 shrink-0 overflow-hidden rounded-full border transition ${resolving ? 'scale-110 border-[#83d9d2] shadow-[0_0_14px_rgba(131,217,210,.45)]' : me ? 'border-[#d8b770]' : 'border-white/15'} ${player.isReady ? 'opacity-55' : ''}`}>
              <img src={getAvatarSrc(player.avatar)} alt={player.name} className="h-full w-full object-cover" />
              {player.isReady && <span className="absolute inset-0 grid place-items-center bg-black/48"><Check className="h-3.5 w-3.5 text-white" /></span>}
            </div>;
          })}
        </div>

        <div className={`relative flex h-11 w-16 shrink-0 items-center justify-center rounded-xl border text-lg font-medium tabular-nums ${urgent ? 'border-[#ff766d]/60 text-[#ff8b84]' : 'border-white/10 text-white'}`}>
          {infinite ? <Clock3 className="h-4 w-4" /> : timerRemaining}
          {!infinite && <span className="absolute inset-x-1 bottom-1 h-[2px] overflow-hidden rounded-full bg-white/10"><span className={`block h-full origin-left transition-[width] duration-300 ${urgent ? 'bg-[#ff766d]' : 'bg-[#d8b770]'}`} style={{ width: `${percentage}%` }} /></span>}
        </div>
      </div>
    </header>
  );
}
