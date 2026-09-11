import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Download, Layers3, X } from 'lucide-react';
import { Card } from './Card';
import { sound } from '../utils/audio';

const COLOR_META = [
  ['W', '#efe5bd'],
  ['U', '#6eb5e8'],
  ['B', '#8f8798'],
  ['R', '#e57b65'],
  ['G', '#69b98b'],
  ['C', '#a5ada7']
];

export function DraftPicksDrawer({
  isOpen = false,
  onClose,
  draftPicks = [],
  onHoverStart,
  onHoverEnd
}) {
  const [groupBy, setGroupBy] = useState('color');
  const [copied, setCopied] = useState(false);

  const generateTTSDecklist = () => {
    const counts = {};
    for (const card of draftPicks) {
      const name = card.name || 'Unknown Card';
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts).map(([name, count]) => `${count} ${name}`).join('\n');
  };

  const handleCopyTTS = async () => {
    sound.playSelect();
    try {
      await navigator.clipboard.writeText(generateTTSDecklist());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error('Failed to copy', error);
    }
  };

  const handleDownloadTTS = () => {
    sound.playSelect();
    const blob = new Blob([generateTTSDecklist()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `cube_draft_tts_decklist_${Date.now()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const manaCurve = [0, 1, 2, 3, 4, 5, 6].map((cmc) => (
    cmc === 6
      ? draftPicks.filter((card) => (card.cmc || 0) >= 6).length
      : draftPicks.filter((card) => Math.floor(card.cmc || 0) === cmc).length
  ));
  const maxCurveCount = Math.max(...manaCurve, 1);

  const colorCounts = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
  for (const card of draftPicks) {
    if (!card.colors?.length) colorCounts.C += 1;
    else card.colors.forEach((color) => { if (color in colorCounts) colorCounts[color] += 1; });
  }

  const groupedCards = {};
  for (const card of draftPicks) {
    let group;
    if (groupBy === 'type') {
      group = (card.type_line || 'Otros').split('—')[0].trim();
    } else if (!card.colors?.length) {
      group = 'Incoloro';
    } else if (card.colors.length > 1) {
      group = 'Multicolor';
    } else {
      group = ({ W: 'Blanco', U: 'Azul', B: 'Negro', R: 'Rojo', G: 'Verde' })[card.colors[0]] || 'Incoloro';
    }
    if (!groupedCards[group]) groupedCards[group] = [];
    groupedCards[group].push(card);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar picks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="picks-backdrop"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 330 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="draft-picks-title"
            className="picks-drawer"
          >
            <header className="picks-header">
              <div className="picks-title-mark" aria-hidden="true"><Layers3 /></div>
              <div className="min-w-0 flex-1">
                <div className="picks-kicker">Draft</div>
                <h2 id="draft-picks-title">Tus picks <span>{draftPicks.length}</span></h2>
              </div>
              <button type="button" onClick={onClose} className="picks-icon-button" aria-label="Cerrar">
                <X />
              </button>
            </header>

            <div className="picks-toolbar">
              <div className="picks-tabs" aria-label="Agrupar cartas">
                <button type="button" aria-pressed={groupBy === 'color'} onClick={() => setGroupBy('color')}>Color</button>
                <button type="button" aria-pressed={groupBy === 'type'} onClick={() => setGroupBy('type')}>Tipo</button>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleCopyTTS} disabled={!draftPicks.length} className="picks-icon-button" aria-label={copied ? 'Lista copiada' : 'Copiar lista TTS'} title={copied ? 'Copiado' : 'Copiar lista'}>
                  {copied ? <Check /> : <Copy />}
                </button>
                <button type="button" onClick={handleDownloadTTS} disabled={!draftPicks.length} className="picks-icon-button" aria-label="Descargar lista TTS" title="Descargar lista">
                  <Download />
                </button>
              </div>
            </div>

            <div className="picks-insights">
              <div className="picks-curve" aria-label="Curva de maná">
                <span className="picks-insight-label">CMC</span>
                {manaCurve.map((count, cmc) => (
                  <div className="picks-curve-column" key={cmc} title={`${cmc === 6 ? '6+' : cmc}: ${count}`}>
                    <i style={{ height: `${Math.max(12, (count / maxCurveCount) * 100)}%` }} data-active={count > 0} />
                    <small>{cmc === 6 ? '6+' : cmc}</small>
                  </div>
                ))}
              </div>
              <div className="picks-colors" aria-label="Distribución de colores">
                {COLOR_META.map(([color, swatch]) => (
                  <span key={color} title={`${color}: ${colorCounts[color]}`}>
                    <i style={{ background: swatch }} />
                    {colorCounts[color]}
                  </span>
                ))}
              </div>
            </div>

            <div className="picks-content scrollbar-thin">
              {!draftPicks.length ? (
                <div className="picks-empty">
                  <Layers3 aria-hidden="true" />
                  <span>Aún no hay picks</span>
                </div>
              ) : Object.entries(groupedCards).map(([groupTitle, cards]) => (
                <section className="picks-group" key={groupTitle}>
                  <h3>{groupTitle}</h3>
                  <div className="picks-card-grid">
                    {cards.map((card) => (
                      <div className="picks-card" key={card.instanceId || card.id}>
                        <Card card={card} location="pick" size="sm" onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
                        <span>{card.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
