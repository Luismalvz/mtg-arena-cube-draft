import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDeck, deckText, normalizeQuantity } from './deck.js';
const picks = [{instanceId:'a',name:'Spell'}, {instanceId:'b',name:'Spell'}, {instanceId:'c',name:'Other'}];
const lands = [{id:'gk1-100',name:'Plains',set:'gk1',collector_number:'100'}, {id:'gk2-26',name:'Plains',set:'gk2',collector_number:'26'}];
test('individual draft copies move to the main deck; every other card remains sideboard', () => {
  const deck = buildDeck(picks, ['a'], {}, lands);
  assert.deepEqual(deck.main.map(c=>c.instanceId), ['a']);
  assert.deepEqual(deck.sideboard.map(c=>c.instanceId), ['b','c']);
  assert.equal(deck.count, 1);
});
test('unlimited basics count toward forty and retain separate printings in export', () => {
  const deck = buildDeck(picks, ['a'], {'gk1-100':38, 'gk2-26':1}, lands);
  assert.equal(deck.count,40);
  assert.equal(deckText(deck), 'Deck\n1 Spell\n38 Plains (gk1) 100\n1 Plains (gk2) 26\n\nSideboard\n1 Spell\n1 Other\n');
  assert.equal(buildDeck(picks, [], {'gk1-100':200}, lands).count, 200);
});
test('invalid quantities and stale selection IDs cannot inflate deck count', () => {
  for (const value of [-1,1.5,Infinity,NaN,'abc']) assert.equal(normalizeQuantity(value),0);
  assert.equal(buildDeck(picks,['missing'],{'gk1-100':-5},lands).count,0);
});
