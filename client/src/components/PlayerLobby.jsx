import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { sound } from '../utils/audio';
import {
  Users,
  Layers,
  Clock,
  Copy,
  Check,
  Play,
  Bot,
  Crown,
  Share2,
  Shield,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function PlayerLobby({
  roomState,
  onStartDraft,
  onUpdateConfig,
  isHost,
  myId
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!roomState) return null;

  const { id: roomId, config, players = [] } = roomState;
  const currentCount = players.length;
  const targetCount = config?.playerCount || 4;
  const botsNeeded = Math.max(0, targetCount - currentCount);

  // Invite URL
  const inviteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : `?room=${roomId}`;

  const handleCopyInvite = async () => {
    sound.playSelect();
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {}
  };

  const handleStart = () => {
    sound.playFanfare();
    onStartDraft();
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 space-y-6">
      {/* Top Banner with Room Code & Invite Share */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sala de Espera (Lobby)</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <span>SALA:</span>
            <span className="font-mono text-amber-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 shadow-inner">
              {roomId}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Comparte el enlace con tus amigos para que se unan a la mesa.
          </p>
        </div>

        {/* Copy Invite Link Button */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleCopyInvite}
            className={`flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              copiedLink
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400/50 shadow-black/50'
            }`}
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace de Invitación'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Player Seating Roster + Draft Settings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Seating Order & Player List */}
        <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-200">
                Mesa de Jugadores ({currentCount}/{targetCount})
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {targetCount - currentCount > 0 ? `Faltan ${targetCount - currentCount}` : 'Mesa lista'}
            </span>
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((p, index) => {
              const isMe = p.id === myId;
              return (
                <div
                  key={p.id || index}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isMe
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Seat Avatar Number */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-inner ${
                        p.isAdmin
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {p.isAdmin ? <Crown className="w-4 h-4" /> : `#${index + 1}`}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100 truncate">
                          {p.name}
                        </span>
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        {p.isAdmin ? (
                          <span className="text-amber-400 font-semibold">Anfitrión</span>
                        ) : (
                          <span>Drafter</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400 shrink-0" />
                </div>
              );
            })}

            {/* Empty Slots indicating bot backfill or waiting humans */}
            {Array.from({ length: Math.max(0, targetCount - currentCount) }).map((_, i) => (
              <div
                key={`empty_${i}`}
                className="p-3.5 rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 flex items-center justify-between opacity-70"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
                    <Bot className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400">
                      Asiento Vacío
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Se rellenará con IA si inicias ya
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-600 uppercase font-bold">
                  Slot {currentCount + i + 1}
                </span>
              </div>
            ))}
          </div>

          {botsNeeded > 0 && (
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-400">
              <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Al presionar Iniciar, los <strong>{botsNeeded} asientos vacíos</strong> se completarán automáticamente con bots autónomos para que puedas testear o jugar inmediatamente.
              </span>
            </div>
          )}
        </div>

        {/* Right Col: Match Configuration & Start CTA */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Configuración</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800/70">
                <span className="text-slate-400">Capacidad:</span>
                <span className="font-mono font-bold text-white">{targetCount} Jugadores</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800/70">
                <span className="text-slate-400">Sobres por Drafter:</span>
                <span className="font-mono font-bold text-amber-300">{config?.packCount || 3} sobres</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800/70">
                <span className="text-slate-400">Cartas por Sobre:</span>
                <span className="font-mono font-bold text-white">15 cartas</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800/70">
                <span className="text-slate-400">Getaway Plaza:</span>
                <span className="font-mono font-bold text-emerald-400">5 cartas iniciales</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800/70">
                <span className="text-slate-400">Temporizador de Pick:</span>
                <span className="font-mono font-bold text-white">
                  {config?.timerSeconds ? `${config.timerSeconds}s` : 'Sin Límite'}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA based on Role */}
          <div>
            {isHost ? (
              <button
                onClick={handleStart}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{botsNeeded > 0 ? 'Iniciar Draft (+ Bots)' : 'Iniciar Draft'}</span>
              </button>
            ) : (
              <div className="text-center p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-bold text-amber-400">Esperando al Anfitrión</div>
                <div>El creador de la sala iniciará la partida en breve...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
