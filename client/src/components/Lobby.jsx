import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Play,
  Settings,
  Sparkles,
  Bot,
  Flame,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { sound } from '../utils/audio';

export function Lobby({
  onCreateRoom,
  onJoinRoom,
  onStartDraft,
  onUpdateSettings,
  roomState,
  isConnected,
  isHost
}) {
  const [playerName, setPlayerName] = useState('Drafter');
  const [roomCode, setRoomCode] = useState('');
  const [botCount, setBotCount] = useState(3);
  const [packSize, setPackSize] = useState(10);
  const [arenaSize, setArenaSize] = useState(6);

  // If user is not yet in a room
  const isInRoom = !!roomState?.id;

  const handleCreate = (e) => {
    e.preventDefault();
    sound.playSelect();
    onCreateRoom({
      playerName: playerName.trim() || 'Host Drafter',
      options: { botCount, packSize, arenaSize }
    });
  };

  const handleQuickSolo = () => {
    sound.playSelect();
    onCreateRoom({
      playerName: playerName.trim() || 'Solo Drafter',
      options: { botCount: 3, packSize: 10, arenaSize: 6 }
    });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    sound.playSelect();
    onJoinRoom({
      roomId: roomCode.trim().toUpperCase(),
      playerName: playerName.trim() || 'Drafter'
    });
  };

  const handleStart = () => {
    sound.playFanfare();
    onStartDraft();
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[75vh]">
      {/* Title & Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
          <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          MTG Arena Market Cube Draft
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
          CENTRAL ARENA DRAFT
        </h1>
        <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto">
          Draftea sobres de cartas icónicas con la mecánica exclusiva de intercambio instantáneo con el Pool Central de la Arena.
        </p>
      </motion.div>

      {!isInRoom ? (
        /* Create or Join Lobby Forms */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Create Room Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-amber-400 font-bold text-lg">
                <Sparkles className="w-5 h-5" />
                <span>Crear Sala de Draft</span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tu Nombre de Jugador
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Ej. Planeswalker"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span className="flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5 text-slate-400" />
                      Bots en la mesa:
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{botCount} bots</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="7"
                    value={botCount}
                    onChange={(e) => setBotCount(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    (Total de jugadores en la mesa: {1 + botCount})
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Tamaño Sobre
                    </label>
                    <select
                      value={packSize}
                      onChange={(e) => setPackSize(parseInt(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                    >
                      <option value={8}>8 cartas</option>
                      <option value={10}>10 cartas (Recomendado)</option>
                      <option value={15}>15 cartas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Cartas en la Arena
                    </label>
                    <select
                      value={arenaSize}
                      onChange={(e) => setArenaSize(parseInt(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                    >
                      <option value={5}>5 cartas</option>
                      <option value={6}>6 cartas (Óptimo)</option>
                      <option value={7}>7 cartas</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCreate}
                disabled={!isConnected}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Crear Nueva Sala</span>
              </button>

              <button
                onClick={handleQuickSolo}
                disabled={!isConnected}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700"
              >
                ⚡ Partida Rápida (Tú + 3 Bots)
              </button>
            </div>
          </div>

          {/* Join Room Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-indigo-400 font-bold text-lg">
                <Users className="w-5 h-5" />
                <span>Unirse a Sala Existente</span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Código de Sala
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Ej. ARENA1"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-center tracking-widest text-base uppercase focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                  Pide al anfitrión el código de la sala para unirte a su mesa en tiempo real. Todos los jugadores verán el centro de la arena en vivo.
                </div>
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={!isConnected || !roomCode.trim()}
              className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                roomCode.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Entrar a la Sala</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ) : (
        /* Waiting Lobby in Room */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-slate-900/95 border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md"
        >
          {/* Lobby Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Código de Sala:
              </span>
              <div className="text-2xl md:text-3xl font-black font-mono text-amber-400 tracking-wider">
                {roomState.id}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-medium">
                {roomState.options?.packCount || 3} Sobres de {roomState.options?.packSize || 10} cartas
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-medium">
                Arena: {roomState.options?.arenaSize || 6} cartas
              </span>
            </div>
          </div>

          {/* Drafters in Room */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Drafters en la mesa ({roomState.playerList?.length || 0}):</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(roomState.playerList || []).map((p, idx) => (
                <div
                  key={p.id}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {p.isBot ? (
                      <Bot className="w-4 h-4 text-slate-400" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs" />
                    )}
                    <span className="text-sm font-semibold text-slate-200 truncate">
                      {p.name}
                    </span>
                  </div>
                  {p.isHost && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          {isHost ? (
            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base uppercase tracking-wider transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 animate-pulse"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>¡Comenzar Draft!</span>
            </button>
          ) : (
            <div className="w-full py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-center text-sm">
              Esperando a que el anfitrión inicie el draft...
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
