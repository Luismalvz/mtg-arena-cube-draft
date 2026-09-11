import { useEffect, useState } from 'react';
import { Card } from './Card';
import basicLands from '../basicLands.json';
import { buildDeck, deckText, normalizeQuantity } from '../utils/deck';

export function DeckBuilder({ picks, storageKey, onHoverStart, onHoverEnd }) {
  const [selection, setSelection] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(saved?.ids) && saved?.quantities && typeof saved.quantities === 'object') return saved;
    } catch { /* A new deck can still be built when storage is unavailable. */ }
    return { ids: [], quantities: {} };
  });
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('pool');
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(selection)); } catch { /* Storage is optional. */ }
  }, [selection, storageKey]);
  const deck = buildDeck(picks, selection.ids, selection.quantities, basicLands);
  const text = deckText(deck);
  const valid = deck.count >= 40;
  const toggle = card => setSelection(previous => ({ ...previous, ids: previous.ids.includes(card.instanceId) ? previous.ids.filter(id => id !== card.instanceId) : [...previous.ids, card.instanceId] }));
  const quantity = (id, value) => setSelection(previous => ({ ...previous, quantities: { ...previous.quantities, [id]: normalizeQuantity(value) } }));
  const copy = async () => {
    if (!valid) return;
    try { await navigator.clipboard.writeText(text); setMessage('Mazo y sideboard copiados.'); }
    catch { setMessage('No se pudo copiar. Puedes descargar el archivo o copiar la vista previa.'); }
  };
  const download = () => {
    if (!valid) return;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'getaway-deck-sideboard.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Mazo y sideboard exportados.');
  };
  const visible = tab === 'main' ? deck.main : deck.sideboard;
  return <div className="deck-builder">
    <header className="deck-toolbar">
      <div><p className="text-amber-300 text-xs uppercase tracking-widest">Draft completado</p><h1 className="text-3xl font-bold">Construye tu mazo</h1><p className="text-slate-400 text-sm mt-2">Elige al menos 40 cartas. Las cartas del draft que no agregues quedan en el sideboard.</p></div>
      <div className="flex flex-wrap gap-3 items-center"><strong className={valid ? 'text-emerald-300' : 'text-amber-300'} aria-live="polite">{deck.count} / 40 cartas</strong><button disabled={!valid} onClick={copy}>Copiar mazo + sideboard</button><button disabled={!valid} onClick={download}>Descargar .txt</button></div>
    </header>
    <p className="text-sm text-slate-400" aria-live="polite">{valid ? 'Mazo listo para exportar.' : `Faltan ${40 - deck.count} cartas para completar el mazo.`} {message}</p>
    <section className="deck-panel">
      <nav className="flex flex-wrap gap-2 mb-5" aria-label="Cartas del draft">
        <button aria-pressed={tab === 'pool'} onClick={() => setTab('pool')}>Sideboard · {deck.sideboard.length}</button>
        <button aria-pressed={tab === 'main'} onClick={() => setTab('main')}>Mazo · {deck.main.length} del draft + {deck.count - deck.main.length} básicas</button>
      </nav>
      <p className="text-sm text-slate-400 mb-5">{tab === 'main' ? 'Selecciona una carta para devolverla al sideboard.' : 'Selecciona una carta para agregarla al mazo.'}</p>
      <div className="deck-card-grid">{visible.map(card => <button className="deck-card-button" key={card.instanceId} onClick={() => toggle(card)} aria-label={`${tab === 'main' ? 'Quitar del mazo' : 'Agregar al mazo'}: ${card.name}`}><Card card={card} size="sm" onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} /><span>{card.name}</span></button>)}</div>
      {!visible.length && <p className="text-slate-500 py-6">{tab === 'main' ? 'Agrega cartas desde el sideboard para empezar.' : 'Todas tus cartas del draft están en el mazo.'}</p>}
    </section>
    <section className="deck-panel"><h2 className="text-xl font-semibold">Tierras básicas · ilimitadas</h2><p className="text-slate-400 text-sm mt-2 mb-6">Elige la ilustración y la cantidad. Puedes añadir tantas copias de cada variante como necesites.</p>
      {['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'].map(name => <div key={name} className="mb-7"><h3 className="text-amber-200 mb-3">{{Plains:'Llanuras', Island:'Islas', Swamp:'Pantanos', Mountain:'Montañas', Forest:'Bosques'}[name]}</h3><div className="lands-grid">{basicLands.filter(card => card.name === name).map(card => <div key={card.id} className="land-option"><Card card={card} size="sm" onHoverStart={onHoverStart} onHoverEnd={onHoverEnd}/><div className="text-xs text-slate-400 my-2">{card.set.toUpperCase()} · {card.collector_number}</div><div className="land-counter"><button aria-label={`Quitar ${name} ${card.id}`} disabled={!normalizeQuantity(selection.quantities[card.id])} onClick={() => quantity(card.id, normalizeQuantity(selection.quantities[card.id]) - 1)}>−</button><input aria-label={`Cantidad de ${name} ${card.id}`} type="number" min="0" step="1" value={normalizeQuantity(selection.quantities[card.id])} onChange={event => quantity(card.id, event.target.value)}/><button aria-label={`Agregar ${name} ${card.id}`} onClick={() => quantity(card.id, normalizeQuantity(selection.quantities[card.id]) + 1)}>+</button></div></div>)}</div></div>)}
    </section>
    <details className="deck-panel"><summary className="cursor-pointer">Vista previa de exportación · mazo y sideboard</summary><pre className="mt-4 text-sm text-slate-300 whitespace-pre-wrap select-all">{text}</pre></details>
  </div>;
}
