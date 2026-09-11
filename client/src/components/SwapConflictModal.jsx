import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Check, Layers3 } from 'lucide-react';
import { Card } from './Card';
import { sound } from '../utils/audio';

export function SwapConflictModal({
  conflictData = null,
  activePack = [],
  onResolveConflict,
  onHoverStart,
  onHoverEnd
}) {
  const [tab, setTab] = useState('plaza');
  const [chosenPlazaCard, setChosenPlazaCard] = useState(null);
  const [chosenHandCard, setChosenHandCard] = useState(null);

  React.useEffect(() => {
    setTab('plaza');
    setChosenPlazaCard(null);
    setChosenHandCard(null);
  }, [conflictData]);

  if (!conflictData) return null;

  const plazaCards = conflictData.plaza || [];
  const selectedCard = tab === 'plaza' ? chosenPlazaCard : chosenHandCard;
  const cards = tab === 'plaza' ? plazaCards : activePack;

  const selectTab = (nextTab) => {
    sound.playHover();
    setTab(nextTab);
  };

  const selectCard = (card) => {
    sound.playSelect();
    if (tab === 'plaza') setChosenPlazaCard(card);
    else setChosenHandCard(card);
  };

  const handleConfirm = () => {
    if (!selectedCard) return;

    if (tab === 'plaza') {
      sound.playSwap();
      onResolveConflict({
        choiceType: 'plaza_card',
        newTargetPlazaId: selectedCard.instanceId
      });
      return;
    }

    sound.playPick();
    onResolveConflict({
      choiceType: 'hand_card',
      pickCardId: selectedCard.instanceId
    });
  };

  return (
    <motion.div
      className="swap-conflict-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="presentation"
    >
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="swap-conflict-title"
        aria-describedby="swap-conflict-description"
        className="swap-conflict-panel"
      >
        <header className="swap-conflict-header">
          <div className="swap-conflict-mark" aria-hidden="true">
            <ArrowLeftRight />
          </div>
          <div className="min-w-0">
            <h2 id="swap-conflict-title">La Plaza cambió</h2>
            <p id="swap-conflict-description">
              Esa carta fue tomada antes. Elige tu siguiente movimiento.
            </p>
          </div>
        </header>

        <div className="swap-conflict-tabs" aria-label="Siguiente movimiento">
          <button
            type="button"
            onClick={() => selectTab('plaza')}
            aria-pressed={tab === 'plaza'}
          >
            <ArrowLeftRight aria-hidden="true" />
            Otra de la Plaza
          </button>
          <button
            type="button"
            onClick={() => selectTab('hand')}
            aria-pressed={tab === 'hand'}
          >
            <Layers3 aria-hidden="true" />
            Tomar del sobre
          </button>
        </div>

        <div className="swap-conflict-cards scrollbar-thin">
          <div className="swap-conflict-grid">
            {cards.map((card) => {
              const selected = selectedCard?.instanceId === card.instanceId;
              return (
                <button
                  type="button"
                  key={card.instanceId}
                  className="swap-conflict-card"
                  onClick={() => selectCard(card)}
                  onMouseEnter={(event) => onHoverStart?.(card, event)}
                  onMouseLeave={(event) => onHoverEnd?.(card, event)}
                  aria-label={`${selected ? 'Seleccionada' : 'Seleccionar'} ${card.name}`}
                  aria-pressed={selected}
                >
                  <Card card={card} size="sm" isSelected={selected} disabled />
                  <span>{card.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="swap-conflict-footer">
          <div className="swap-conflict-selection" aria-live="polite">
            {selectedCard ? selectedCard.name : 'Elige una carta'}
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedCard}
            className="swap-conflict-confirm"
          >
            <Check aria-hidden="true" />
            Confirmar
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
}
