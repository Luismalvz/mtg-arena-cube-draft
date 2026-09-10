const gameManager = require('./gameManager.js');

function testFixerDistribution() {
  console.log('=== TEST: Fixer Distribution in Packs ===');
  
  // Test 1: 2 players, 3 packs = 6 packs total -> Exactly 5 fixers per pack!
  const r2 = gameManager.createRoom('FIX2', 'P1', 's1', { playerCount: 2, packCount: 3 });
  gameManager.startDraft('FIX2', 's1');
  
  let allPacks2 = [];
  r2.players.forEach(p => {
    allPacks2.push(p.activePack, ...p.unopenedPacks);
  });
  console.log(`2 Players: Total packs: ${allPacks2.length}`);
  allPacks2.forEach((pack, idx) => {
    const fixersInPack = pack.filter(c => c.isFixer).length;
    console.log(`  Pack #${idx + 1}: ${pack.length} cards, ${fixersInPack} fixers`);
    if (fixersInPack !== 5) throw new Error(`Pack ${idx+1} should have 5 fixers, got ${fixersInPack}`);
    if (pack.length !== 15) throw new Error(`Pack ${idx+1} should have 15 cards, got ${pack.length}`);
  });

  // Test 2: 4 players, 3 packs = 12 packs total -> 30 / 12 = 2 base, 6 remainder
  const r4 = gameManager.createRoom('FIX4', 'P1', 's1', { playerCount: 4, packCount: 3 });
  gameManager.startDraft('FIX4', 's1');
  let allPacks4 = [];
  r4.players.forEach(p => {
    allPacks4.push(p.activePack, ...p.unopenedPacks);
  });
  console.log(`4 Players: Total packs: ${allPacks4.length}`);
  let totalFixersInPacks4 = 0;
  allPacks4.forEach((pack, idx) => {
    const fixersInPack = pack.filter(c => c.isFixer).length;
    totalFixersInPacks4 += fixersInPack;
    if (fixersInPack < 2) throw new Error(`Pack ${idx+1} should have at least 2 fixers, got ${fixersInPack}`);
    if (pack.length !== 15) throw new Error(`Pack ${idx+1} should have 15 cards, got ${pack.length}`);
  });
  console.log(`  All packs have >= 2 fixers. Total fixers in packs: ${totalFixersInPacks4} / 30`);

  // Test 3: 8 players, 3 packs = 24 packs total -> 30 / 24 = 1 base, 6 remainder
  const r8 = gameManager.createRoom('FIX8', 'P1', 's1', { playerCount: 8, packCount: 3 });
  gameManager.startDraft('FIX8', 's1');
  let allPacks8 = [];
  r8.players.forEach(p => {
    allPacks8.push(p.activePack, ...p.unopenedPacks);
  });
  console.log(`8 Players: Total packs: ${allPacks8.length}`);
  allPacks8.forEach((pack, idx) => {
    const fixersInPack = pack.filter(c => c.isFixer).length;
    if (fixersInPack < 1) throw new Error(`Pack ${idx+1} should have at least 1 fixer, got ${fixersInPack}`);
    if (pack.length !== 15) throw new Error(`Pack ${idx+1} should have 15 cards, got ${pack.length}`);
  });
  console.log(`  All 24 packs have >= 1 fixer. 15 cards each.`);

  console.log('✅ Fixer distribution tests PASSED perfectly!');
}

testFixerDistribution();
