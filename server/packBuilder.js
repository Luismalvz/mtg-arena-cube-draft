function shuffle(cards, random = Math.random) {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function buildBoosterPacks({ fixerCards, generalCards, totalPacks, packSize = 15, random = Math.random }) {
  const fixers = shuffle(fixerCards, random);
  const packs = Array.from({ length: totalPacks }, () => []);

  if (fixers.length < totalPacks) {
    throw new Error(`Not enough mana fixers: ${fixers.length} for ${totalPacks} packs`);
  }

  // Reserve exactly one guaranteed mana fixer for every pack.
  for (const pack of packs) {
    pack.push(fixers.pop());
  }

  // Any fixer left over becomes part of the same random pool as every other card.
  const fillPool = shuffle([...generalCards, ...fixers], random);
  for (const pack of packs) {
    while (pack.length < packSize && fillPool.length > 0) {
      pack.push(fillPool.pop());
    }
    if (pack.length !== packSize) {
      throw new Error(`Not enough cards to complete ${totalPacks} packs of ${packSize}`);
    }
  }

  return packs.map(pack => shuffle(pack, random));
}

module.exports = { buildBoosterPacks };
