import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { sound } from '../utils/audio';
import { AlertTriangle, Sparkles, Check, ArrowRight, Layers } from 'lucide-react';

export function SwapConflictModal({
  conflictData = null, // { message, plaza }
  activePack = [],
  onResolveConflict,
  onHoverStart,
  onHoverEnd
}) {
  const [tab, setTab] = useState('plaza'); // 'plaza' | 'hand'
  const [chosenPlazaCard, setChosenPlazaCard] = useState(null);
  const [chosenHandCard, setChosenHandCard] = useState(null);

  React.useEffect(() => {
    setTab('plaza');
    setChosenPlazaCard(null);
    setChosenHandCard(null);
  }, [conflictData]);

  if (!conflictData) return null;

  const handleSelectPlaza = (card) => {
    sound.playSelect();
    setChosenPlazaCard(card);
  };

  const handleSelectHand = (card) => {
    sound.playSelect();
    setChosenHandCard(card);
  };

  const handleConfirm = () => {
    if (tab === 'plaza' && chosenPlazaCard) {
      sound.playSwap();
      onResolveConflict({
        choiceType: 'plaza_card',
        newTargetPlazaId: chosenPlazaCard.instanceId
      });
    } else if (tab === 'hand' && chosenHandCard) {
      sound.playPick();
      onResolveConflict({
        choiceType: 'hand_card',
        pickCardId: chosenHandCard.instanceId
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        role="dialog" aria-modal="true" aria-label="Conflicto de prioridad"
        className="conflict-dialog w-full max-w-6xl bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl shadow-rose-950/40 space-y-5"
      >
        {/* Modal Header */}
        <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>¡CONFLICTO DE PRIORIDAD EN EL PLAZA!</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {conflictData.message || 'La carta que seleccionaste ya fue reclamada por un jugador con prioridad de mesa superior.'}
            </p>
          </div>
        </div>

        {/* Choice Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTab('plaza')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'plaza'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Opción 1: Elegir otra carta del Plaza actual</span>
          </button>

          <button
            onClick={() => setTab('hand')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'hand'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Opción 2: Realizar un pick normal de mi sobre</span>
          </button>
        </div>

        {/* Cards Selection View */}
        <div className="conflict-cards min-h-0 p-2 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          {tab === 'plaza' ? (
            <div>
              <div className="text-xs text-slate-400 mb-2 font-medium">
                Cartas disponibles actualmente en el Getaway Plaza:
              </div>
              <div className="conflict-grid">
                {(conflictData.plaza || []).map((card) => (
                  <Card
                    key={card.instanceId}
                    card={card}
                    location="arena"
                    size="sm"
                    isSelected={chosenPlazaCard?.instanceId === card.instanceId}
                    onClick={() => handleSelectPlaza(card)}
                    onHoverStart={onHoverStart}
                    onHoverEnd={onHoverEnd}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs text-slate-400 mb-2 font-medium">
                Selecciona una carta de tu sobre para tomar directamente:
              </div>
              <div className="conflict-grid">
                {activePack.map((card) => (
                  <Card
                    key={card.instanceId}
                    card={card}
                    location="pack"
                    size="sm"
                    isSelected={chosenHandCard?.instanceId === card.instanceId}
                    onClick={() => handleSelectHand(card)}
                    onHoverStart={onHoverStart}
                    onHoverEnd={onHoverEnd}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Confirm */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400 font-mono">
            {tab === 'plaza'
              ? chosenPlazaCard ? `Seleccionada: [${chosenPlazaCard.name}]` : 'Selecciona una carta del Plaza'
              : chosenHandCard ? `Seleccionada: [${chosenHandCard.name}]` : 'Selecciona una carta de tu sobre'}
          </div>

          <button
            onClick={handleConfirm}
            disabled={tab === 'plaza' ? !chosenPlazaCard : !chosenHandCard}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Resolver Prioridad</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
