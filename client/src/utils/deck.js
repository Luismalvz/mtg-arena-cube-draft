export function buildDeck(picks, selectedIds, quantities, basicLands) {
  const selected = new Set(selectedIds);
  const main = picks.filter(card => selected.has(card.instanceId));
  const sideboard = picks.filter(card => !selected.has(card.instanceId));
  const lands = basicLands.map(card => ({ ...card, quantity: normalizeQuantity(quantities[card.id]) })).filter(card => card.quantity > 0);
  return { main, sideboard, lands, count: main.length + lands.reduce((sum, card) => sum + card.quantity, 0) };
}
export function normalizeQuantity(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}
export function deckText({ main, sideboard, lands }) {
  function lines(cards) {
    const counts = new Map();
    for (const card of cards) {
      const name = card.set && card.collector_number ? `${card.name} (${card.set}) ${card.collector_number}` : card.name;
      counts.set(name, (counts.get(name) || 0) + (card.quantity ?? 1));
    }
    return [...counts].map(([name, count]) => `${count} ${name}`).join('\n');
  }
  return `Deck\n${lines([...main, ...lands])}\n\nSideboard\n${lines(sideboard)}\n`;
}
