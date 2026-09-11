const test = require('node:test');
const assert = require('node:assert/strict');
const cubeCards = require('./ravnicaCube.json');
const { buildBoosterPacks } = require('./packBuilder.js');

function seededRandom(seed = 123456789) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

test('the cube contains the expected thirty mana fixers', () => {
  const fixers = cubeCards.filter(card => card.isFixer);
  assert.equal(fixers.length, 30);
  assert.equal(fixers.filter(card => /Signet$/.test(card.name)).length, 10);
  assert.equal(fixers.filter(card => /Guildgate$/.test(card.name)).length, 20);
});

test('every pack receives a guaranteed fixer and always contains fifteen unique cards', () => {
  for (const totalPacks of [6, 12, 24]) {
    const packs = buildBoosterPacks({
      fixerCards: cubeCards.filter(card => card.isFixer),
      generalCards: cubeCards.filter(card => !card.isFixer),
      totalPacks,
      random: seededRandom(totalPacks)
    });
    assert.equal(packs.length, totalPacks);
    assert.ok(packs.every(pack => pack.length === 15));
    assert.ok(packs.every(pack => pack.some(card => card.isFixer)));
    const dealtIds = packs.flat().map(card => card.id);
    assert.equal(new Set(dealtIds).size, dealtIds.length);
  }
});

test('unused fixers return to the random fill pool', () => {
  const fixers = Array.from({ length: 4 }, (_, index) => ({ id: `fixer-${index}`, isFixer: true }));
  const generalCards = Array.from({ length: 2 }, (_, index) => ({ id: `card-${index}`, isFixer: false }));
  const packs = buildBoosterPacks({ fixerCards: fixers, generalCards, totalPacks: 2, packSize: 3, random: seededRandom(7) });
  assert.equal(packs.flat().filter(card => card.isFixer).length, 4);
  assert.equal(packs.flat().length, 6);
});
