import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import {
  X,
  Layers,
  Copy,
  Check,
  Download,
  BarChart2,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { sound } from '../utils/audio';

export function DraftPicksDrawer({
  isOpen = false,
  onClose,
  draftPicks = [],
  onHoverStart,
  onHoverEnd
}) {
  const [groupBy, setGroupBy] = useState('cmc'); // 'cmc' | 'color' | 'type'
  const [copied, setCopied] = useState(false);

  // Generate TTS plaintext decklist
  const generateTTSDecklist = () => {
    const counts = {};
    for (const card of draftPicks) {
      const name = card.name || 'Unknown Card';
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => `${count} ${name}`)
      .join('\n');
  };

  const handleCopyTTS = async () => {
    sound.playSelect();
    const text = generateTTSDecklist();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadTTS = () => {
    sound.playSelect();
    const text = generateTTSDecklist();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cube_draft_tts_decklist_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mana Curve Histogram calculation (CMC 0 to 6+)
  const manaCurve = [0, 1, 2, 3, 4, 5, 6].map(cmc => {
    if (cmc === 6) {
      return draftPicks.filter(c => (c.cmc || 0) >= 6).length;
    }
    return draftPicks.filter(c => Math.floor(c.cmc || 0) === cmc).length;
  });
  const maxCurveCount = Math.max(...manaCurve, 1);

  // Color breakdown
  const colorCounts = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
  for (const c of draftPicks) {
    if (!c.colors || c.colors.length === 0) {
      colorCounts.C += 1;
    } else {
      for (const col of c.colors) {
        if (colorCounts[col] !== undefined) colorCounts[col] += 1;
      }
    }
  }

  // Grouped cards
  const getGroupedCards = () => {
    if (groupBy === 'cmc') {
      const groups = {};
      draftPicks.forEach(c => {
        const key = `CMC ${Math.min(c.cmc || 0, 7)}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(c);
      });
      return groups;
    }
    if (groupBy === 'color') {
      const groups = {
        Blanco: [],
        Azul: [],
        Negro: [],
        Rojo: [],
        Verde: [],
        Multicolor: [],
        Incoloro: []
      };
      draftPicks.forEach(c => {
        if (!c.colors || c.colors.length === 0) groups.Incoloro.push(c);
        else if (c.colors.length > 1) groups.Multicolor.push(c);
        else {
          const map = { W: 'Blanco', U: 'Azul', B: 'Negro', R: 'Rojo', G: 'Verde' };
          const name = map[c.colors[0]] || 'Incoloro';
          groups[name].push(c);
        }
      });
      return groups;
    }
    // By Type
    const groups = {};
    draftPicks.forEach(c => {
      const type = (c.type_line || 'Other').split('—')[0].trim();
      if (!groups[type]) groups[type] = [];
      groups[type].push(c);
    });
    return groups;
  };

  const groupedCards = getGroupedCards();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Drawer Content */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-slate-950 border-l border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Tus Picks de Draft
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono">
                      {draftPicks.length} cartas
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Tu mazo en construcción y exportador para Tabletop Simulator
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TTS Export Bar */}
            <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-amber-200">
                  Exportar a Tabletop Simulator (TTS):
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTTS}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Lista TTS'}</span>
                </button>

                <button
                  onClick={handleDownloadTTS}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                  title="Descargar archivo .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar .txt</span>
                </button>
              </div>
            </div>

            {/* Mana Curve & Color Stats */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mana Curve Chart */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                    Curva de Maná
                  </span>
                  <span className="font-mono text-[10px]">CMC</span>
                </div>
                <div className="flex items-end gap-1.5 h-16 pt-2">
                  {manaCurve.map((count, cmc) => {
                    const heightPercent = (count / maxCurveCount) * 100;
                    return (
                      <div key={cmc} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div className="text-[10px] text-slate-400 font-mono leading-none">
                          {count > 0 ? count : ''}
                        </div>
                        <div
                          style={{ height: `${Math.max(heightPercent, 8)}%` }}
                          className={`w-full rounded-t transition-all ${
                            count > 0 ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-slate-800'
                          }`}
                        />
                        <div className="text-[10px] text-slate-500 font-bold">
                          {cmc === 6 ? '6+' : cmc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Color Counts */}
              <div>
                <div className="text-xs font-medium text-slate-300 mb-2">
                  Distribución de Colores
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: 'W', label: 'Blanco', bg: 'bg-amber-100 text-amber-950' },
                    { key: 'U', label: 'Azul', bg: 'bg-blue-600 text-white' },
                    { key: 'B', label: 'Negro', bg: 'bg-stone-900 text-stone-200' },
                    { key: 'R', label: 'Rojo', bg: 'bg-red-600 text-white' },
                    { key: 'G', label: 'Verde', bg: 'bg-emerald-600 text-white' },
                    { key: 'C', label: 'Incoloro', bg: 'bg-slate-700 text-slate-200' }
                  ].map(c => (
                    <div
                      key={c.key}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className={`w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] font-bold ${c.bg}`}>
                        {c.key}
                      </span>
                      <span className="font-mono font-bold text-slate-300">
                        {colorCounts[c.key] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grouping Selector */}
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Agrupar cartas por:</span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {[
                  { id: 'cmc', label: 'Coste (CMC)' },
                  { id: 'color', label: 'Color' },
                  { id: 'type', label: 'Tipo' }
                ].map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGroupBy(g.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      groupBy === g.id
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drafted Cards List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {draftPicks.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500">
                  <Layers className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">Aún no has seleccionado ninguna carta</p>
                </div>
              ) : (
                Object.entries(groupedCards).map(([groupTitle, cards]) => {
                  if (!cards || cards.length === 0) return null;
                  return (
                    <div key={groupTitle} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-800/80 pb-1">
                        <span>{groupTitle}</span>
                        <span className="text-slate-500 font-mono">({cards.length})</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {cards.map((card) => (
                          <div key={card.instanceId || card.id} className="flex flex-col items-center">
                            <Card
                              card={card}
                              location="pick"
                              size="sm"
                              onHoverStart={onHoverStart}
                              onHoverEnd={onHoverEnd}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
