import { useEffect, useState } from 'react';
import { Check, Copy, Download, Minus, Plus } from 'lucide-react';
import { Card } from './Card';
import basicLands from '../basicLands.json';
import { buildDeck, deckText, normalizeQuantity } from '../utils/deck';

const LAND_NAMES = { Plains:'Llanuras', Island:'Islas', Swamp:'Pantanos', Mountain:'Montañas', Forest:'Bosques' };

export function DeckBuilder({ picks, storageKey, onHoverStart, onHoverEnd }) {
  const [selection, setSelection] = useState(() => { try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (Array.isArray(saved?.ids) && saved?.quantities) return saved; } catch { /* Local persistence is optional. */ } return { ids: [], quantities: {} }; });
  const [tab, setTab] = useState('pool');
  const [message, setMessage] = useState('');
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(selection)); } catch { /* Local persistence is optional. */ } }, [selection, storageKey]);
  const deck = buildDeck(picks, selection.ids, selection.quantities, basicLands);
  const valid = deck.count >= 40;
  const text = deckText(deck);
  const cards = tab === 'main' ? deck.main : deck.sideboard;
  const toggle = card => setSelection(previous => ({ ...previous, ids: previous.ids.includes(card.instanceId) ? previous.ids.filter(id => id !== card.instanceId) : [...previous.ids, card.instanceId] }));
  const quantity = (id,value) => setSelection(previous => ({ ...previous, quantities: { ...previous.quantities, [id]: normalizeQuantity(value) } }));
  const copy = async () => { if (!valid) return; try { await navigator.clipboard.writeText(text); setMessage('Copiado'); } catch { setMessage('No se pudo copiar'); } };
  const download = () => { if (!valid) return; const url = URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})); const link = document.createElement('a'); link.href=url; link.download='getaway-deck-sideboard.txt'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); setMessage('Descargado'); };

  return <div className="deck-builder">
    <header className="deck-toolbar">
      <div className="flex items-baseline gap-4"><h1 className="text-2xl font-medium tracking-[-.05em] sm:text-3xl">Tu mazo</h1><strong className={`text-sm ${valid ? 'text-[#83d9d2]' : 'text-[#e5c681]'}`}>{deck.count}<span className="text-white/30"> / 40</span></strong></div>
      <div className="flex items-center gap-2"><span aria-live="polite" className="mr-1 text-xs text-[#8f9991]">{message}</span><button aria-label="Copiar mazo" title="Copiar" disabled={!valid} onClick={copy} className="grid h-10 w-10 place-items-center rounded-full border border-white/12 disabled:opacity-25 hover:border-white/30"><Copy className="h-4 w-4" /></button><button aria-label="Descargar mazo" title="Descargar" disabled={!valid} onClick={download} className="grid h-10 w-10 place-items-center rounded-full bg-[#f1f3ed] text-[#090b0a] disabled:opacity-25"><Download className="h-4 w-4" /></button></div>
    </header>

    <div className="deck-workspace">
      <section className="deck-panel">
        <nav className="sticky top-0 z-10 -mx-1 mb-4 flex gap-1 rounded-full bg-[#090c0a]/92 p-1 backdrop-blur-xl" aria-label="Cartas"><button aria-pressed={tab === 'pool'} onClick={() => setTab('pool')} className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold ${tab === 'pool' ? 'bg-[#f1f3ed] text-[#090b0a]' : 'text-[#8f9991]'}`}>Disponibles · {deck.sideboard.length}</button><button aria-pressed={tab === 'main'} onClick={() => setTab('main')} className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold ${tab === 'main' ? 'bg-[#f1f3ed] text-[#090b0a]' : 'text-[#8f9991]'}`}>Mazo · {deck.main.length}</button></nav>
        <div className="deck-card-grid">{cards.map(card => <button className="deck-card-button" key={card.instanceId} onClick={() => toggle(card)} aria-label={`${tab === 'main' ? 'Quitar' : 'Agregar'} ${card.name}`}><Card card={card} size="deck" onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} /><span>{card.name}</span></button>)}</div>
        {!cards.length && <div className="grid h-48 place-items-center text-sm text-white/35"><Check className="h-6 w-6" /></div>}
      </section>

      <aside className="deck-panel">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold">Tierras</h2><span className="text-xs text-[#8f9991]">Ilimitadas</span></div>
        <div className="space-y-5">{Object.keys(LAND_NAMES).map(name => <section key={name}><h3 className="mb-2 text-[11px] uppercase tracking-[.14em] text-[#d8b770]">{LAND_NAMES[name]}</h3><div className="lands-grid">{basicLands.filter(card => card.name === name).map(card => <div key={card.id} className="land-option"><Card card={card} size="deck" onHoverStart={onHoverStart} onHoverEnd={onHoverEnd}/><div className="land-counter"><button aria-label={`Quitar ${LAND_NAMES[name]}`} disabled={!normalizeQuantity(selection.quantities[card.id])} onClick={() => quantity(card.id, normalizeQuantity(selection.quantities[card.id])-1)}><Minus className="mx-auto h-3.5 w-3.5" /></button><input aria-label={`Cantidad ${LAND_NAMES[name]}`} type="number" min="0" value={normalizeQuantity(selection.quantities[card.id])} onChange={e => quantity(card.id,e.target.value)}/><button aria-label={`Agregar ${LAND_NAMES[name]}`} onClick={() => quantity(card.id, normalizeQuantity(selection.quantities[card.id])+1)}><Plus className="mx-auto h-3.5 w-3.5" /></button></div></div>)}</div></section>)}</div>
      </aside>
    </div>
  </div>;
}
