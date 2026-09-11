import { tokensForCards } from './ravnicaTokens.js';

export function buildDeck(picks, selectedIds, quantities, basicLands) {
  const selected = new Set(selectedIds);
  const main = picks.filter(card => selected.has(card.instanceId));
  const sideboard = picks.filter(card => !selected.has(card.instanceId));
  const lands = basicLands.map(card => ({ ...card, quantity: normalizeQuantity(quantities[card.id]) })).filter(card => card.quantity > 0);
  const tokens = tokensForCards(main);
  return { main, sideboard, lands, tokens, count: main.length + lands.reduce((sum, card) => sum + card.quantity, 0) };
}

export function normalizeQuantity(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

export function deckText({ main, sideboard, lands, tokens = [] }) {
  function lines(cards) {
    const counts = new Map();
    for (const card of cards) {
      // Set name needs to be UPPERCASE for Tabletop Simulator / MTG Arena import format
      const name = card.set && card.collector_number 
        ? `${card.name} (${card.set.toUpperCase()}) ${card.collector_number}` 
        : card.name;
      counts.set(name, (counts.get(name) || 0) + (card.quantity ?? 1));
    }
    return [...counts].map(([name, count]) => `${count} ${name}`).join('\n');
  }
  
  // Tabletop Simulator ignores lines starting with //
  const tokenSection = tokens.length ? `\n\n// Tokens\n${lines(tokens)}` : '';
  return `// Deck\n${lines([...main, ...lands])}\n\n// Sideboard\n${lines(sideboard)}${tokenSection}\n`;
}
