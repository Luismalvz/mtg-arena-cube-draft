const gameManager = require('./gameManager.js');

function runTest() {
  console.log('=== TEST 1: Pack limits formula check ===');
  const limits8 = gameManager.getPackLimits(8);
  console.log('8 Players:', limits8, '(Expected min 3, max 3)');
  if (limits8.minPacks !== 3 || limits8.maxPacks !== 3) throw new Error('Failed limits8');

  const limits4 = gameManager.getPackLimits(4);
  console.log('4 Players:', limits4, '(Expected min 3, max 6)');
  if (limits4.minPacks !== 3 || limits4.maxPacks !== 6) throw new Error('Failed limits4');

  const limits2 = gameManager.getPackLimits(2);
  console.log('2 Players:', limits2, '(Expected min 3, max 12)');
  if (limits2.minPacks !== 3 || limits2.maxPacks !== 12) throw new Error('Failed limits2');

  console.log('=== TEST 2: Room creation & Player Join ===');
  const room = gameManager.createRoom('TEST1', 'Admin Luis', 'sock_admin', {
    playerCount: 4,
    packCount: 3,
    timerSeconds: 45,
    avatar: '112'
  });

  const joinRes = gameManager.joinRoom('TEST1', 'Player 2 (Bob)', 'sock_bob', '197');
  if (joinRes.error) throw new Error(joinRes.error);
  console.log(`Players in lobby: ${room.players.length}/4`);

  const adminState = gameManager.getClientState(room, 'sock_admin');
  const bobState = gameManager.getClientState(room, 'sock_bob');
  const lobbyAvatars = Object.fromEntries(adminState.players.map(player => [player.name, player.avatar]));
  if (lobbyAvatars['Admin Luis'] !== '112' || lobbyAvatars['Player 2 (Bob)'] !== '197') {
    throw new Error('Lobby state did not preserve each player avatar');
  }
  if (adminState.me.avatar !== '112' || bobState.me.avatar !== '197') {
    throw new Error('Personal player state did not preserve the selected avatar');
  }

  console.log('=== TEST 3: Starting draft (Auto-fill with 2 AI Bots) ===');
  const startRes = gameManager.startDraft('TEST1', 'sock_admin');
  if (startRes.error) throw new Error(startRes.error);
  console.log(`Total players after start: ${room.players.length}`);
  console.log(`Seating order:`, room.players.map(p => `#${p.seatIndex + 1} ${p.name} (Bot: ${p.isBot})`));
  console.log(`Getaway Plaza cards: ${room.getawayPlaza.length}`);
  if (room.getawayPlaza.length !== 32) throw new Error('Plaza should have 32 cards');

  console.log('=== TEST 4: Pack Opening Phase ===');
  console.log(`Status before opening: ${room.status}`);
  gameManager.openPack('TEST1', 'sock_admin');
  const openRes2 = gameManager.openPack('TEST1', 'sock_bob');
  console.log(`Status after both humans opened: ${room.status}`);
  if (room.status !== 'decision_phase') throw new Error('Should be in decision_phase');

  console.log('=== TEST 5: Turn 1 Decision Submission ===');
  // Human 1 chooses Action A (Standard Pick)
  const p1 = room.players.find(p => p.socketId === 'sock_admin');
  const p1PickCard = p1.activePack[0];
  console.log(`${p1.name} chooses Action A: Pick [${p1PickCard.name}]`);
  gameManager.submitDecision('TEST1', 'sock_admin', {
    type: 'pick',
    cardInstanceId: p1PickCard.instanceId
  });

  // Human 2 chooses Action B (Getaway Swap)
  const p2 = room.players.find(p => p.socketId === 'sock_bob');
  const p2OfferCard = p2.activePack[0];
  const targetPlazaCard = room.getawayPlaza[0];
  console.log(`${p2.name} chooses Action B: Swap [${p2OfferCard.name}] for [${targetPlazaCard.name}]`);
  
  const submitRes2 = gameManager.submitDecision('TEST1', 'sock_bob', {
    type: 'swap',
    offerCardInstanceId: p2OfferCard.instanceId,
    targetPlazaInstanceId: targetPlazaCard.instanceId
  });

  console.log('Submit result for allReady:', submitRes2.allReady);
  const startResPhase = gameManager.startResolutionPhase(room);
  console.log('Start resolution phase result:', startResPhase.type);
  console.log('Room status after decisions:', room.status);
  console.log('Resolution queue length:', room.resolutionQueue.length);

  // If there are more steps in queue, step them
  let stepRes = startResPhase;
  while (stepRes && stepRes.type === 'swap_resolved' && room.resolutionQueue.length > 0) {
    stepRes = gameManager.stepResolutionQueue(room);
    console.log('Next step result type:', stepRes.type);
  }
  if (stepRes && stepRes.type === 'swap_resolved') {
    stepRes = gameManager.stepResolutionQueue(room);
    console.log('Final step result type:', stepRes.type);
  }

  // Check draft picks after resolution
  console.log(`${p1.name} draft picks count: ${p1.draftPicks.length}`);
  console.log(`${p2.name} draft picks count: ${p2.draftPicks.length}`);
  if (p2.draftPicks.length !== 1) throw new Error('Bob should have 1 draft pick from swap');

  // Check TTS export
  const ttsExport = gameManager.generateTTSExport(p2.draftPicks);
  console.log('TTS Decklist sample for P2:\n' + ttsExport);

  console.log('✅ ALL GETAWAY DRAFT TESTS PASSED CLEANLY!');
}

runTest();
