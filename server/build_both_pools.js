const fs = require('fs');
const path = require('path');

const plazaRaw = `1 Azorius Chancery (gk2) 25
2 Azorius Guildgate (rvr) 272
1 Boros Garrison (gk1) 98
2 Boros Guildgate (rvr) 398
1 Dimir Aqueduct (gk1) 23
2 Dimir Guildgate (rvr) 400
2 Gate Colossus (rvr) 257
2 Golgari Guildgate (rvr) 402
2 Gruul Guildgate (rvr) 403
1 Izzet Boilerworks (gk1) 47
2 Izzet Guildgate (rvr) 405
1 Novijen, Heart of Progress (dis) 175
1 Orzhov Basilica (gk2) 49
2 Orzhov Guildgate (rvr) 406
2 Rakdos Guildgate (rvr) 408
1 Rix Maadi, Dungeon Palace (dis) 179
2 Selesnya Guildgate (rvr) 410
2 Simic Guildgate (rvr) 411
1 Skarrg, the Rage Pits (gpt) 163
1 Svogthos, the Restless Tomb (rav) 283
1 Vitu-Ghazi, the City-Tree (rav) 285`;

const mainCubeRaw = `1 Boros Elite (PLST) GK1-78
1 Boros Elite (PLST) GK1-78
1 Boros Elite (PLST) GK1-78
1 Healer's Hawk (GRN) 14
1 Healer's Hawk (GRN) 14
1 Healer's Hawk (GRN) 14
1 Healer's Hawk (GRN) 14
1 Azorius Arrester (RVR) 5
1 Azorius Arrester (RVR) 5
1 Azorius Arrester (RVR) 5
1 Azorius Arrester (RVR) 5
1 Sunhome Stalwart (RVR) 28
1 Sunhome Stalwart (RVR) 28
1 Sunhome Stalwart (RVR) 28
1 Basilica Guards (RVR) 7
1 Basilica Guards (RVR) 7
1 Basilica Guards (RVR) 7
1 Makeshift Battalion (RVR) 22
1 Makeshift Battalion (RVR) 22
1 Makeshift Battalion (RVR) 22
1 Ministrant of Obligation (PLST) RNA-16
1 Ministrant of Obligation (PLST) RNA-16
1 Rising Populace (RVR) 25
1 Rising Populace (RVR) 25
1 Azorius Justiciar (RVR) 6
1 Arrester's Zeal (RVR) 4
1 Arrester's Zeal (RVR) 4
1 Arrester's Zeal (RVR) 4
1 Carom (RVR) 12
1 Carom (RVR) 12
1 To Arms! (RVR) 30
1 To Arms! (RVR) 30
1 Rootborn Defenses (CLU) 71
1 Rootborn Defenses (CLU) 71
1 Unbreakable Formation (RVR) 32
1 Unbreakable Formation (RVR) 32
1 Eyes in the Skies (RVR) 17
1 Eyes in the Skies (RVR) 17
1 Eyes in the Skies (RVR) 17
1 Battle Screech (CMM) 17
1 Blind Obedience (RVR) 9
1 Benthic Biomancer (RNA) 32
1 Benthic Biomancer (RNA) 32
1 Cloudfin Raptor (RVR) 37
1 Cloudfin Raptor (RVR) 37
1 Cloudfin Raptor (RVR) 37
1 Cloudfin Raptor (RVR) 37
1 Nightveil Sprite (GRN) 48
1 Nightveil Sprite (GRN) 48
1 Nightveil Sprite (J25) 335
1 Persistent Petitioners (RVR) 53
1 Drift of Phantasms (RVR) 42
1 Drift of Phantasms (RVR) 42
1 Drift of Phantasms (RVR) 42
1 Murmuring Mystic (RVR) 51
1 Downsize (RVR) 41
1 Downsize (RVR) 41
1 Downsize (RVR) 41
1 Quicken (RVR) 57
1 Quicken (RVR) 57
1 Quicken (RVR) 57
1 Radical Idea (RVR) 58
1 Radical Idea (RVR) 58
1 Radical Idea (RVR) 58
1 Remand (J25) 349
1 Remand (J25) 349
1 Remand (J25) 349
1 Arrester's Admonition (RNA) 31
1 Arrester's Admonition (RNA) 31
1 Arrester's Admonition (RNA) 31
1 Sinister Sabotage (RVR) 61
1 Sinister Sabotage (RVR) 61
1 Sinister Sabotage (RVR) 61
1 Aetherize (FDN) 151
1 Aetherize (FDN) 151
1 Chemister's Insight (GRN) 32
1 Chemister's Insight (GRN) 32
1 Clear the Mind (RNA) 34
1 Compulsive Research (RVR) 38
1 Compulsive Research (RVR) 38
1 Compulsive Research (RVR) 38
1 Quasiduplicate (RVR) 55
1 Banehound (WAR) 77
1 Banehound (WAR) 77
1 Banehound (WAR) 77
1 Shadow Alley Denizen (RVR) 92
1 Shadow Alley Denizen (RVR) 92
1 Golgari Thug (RVR) 76
1 Golgari Thug (RVR) 76
1 Golgari Thug (RVR) 76
1 Orzhov Enforcer (PLST) RNA-79
1 Orzhov Enforcer (PLST) RNA-79
1 Orzhov Enforcer (PLST) RNA-79
1 Priest of Forgotten Gods (RVR) 90
1 Priest of Forgotten Gods (RVR) 90
1 Thrill-Kill Assassin (RVR) 94
1 Thrill-Kill Assassin (RVR) 94
1 Thrill-Kill Assassin (RVR) 94
1 Thrill-Kill Assassin (RVR) 94
1 Midnight Reaper (RVR) 86
1 Midnight Reaper (RVR) 86
1 Orzhov Euthanist (RVR) 88
1 Orzhov Euthanist (RVR) 88
1 Sewer Shambler (RVR) 91
1 Sewer Shambler (RVR) 91
1 Stinkweed Imp (GK1) 53
1 Dimir House Guard (RVR) 73
1 Dimir House Guard (RVR) 73
1 Blade Juggler (RVR) 67
1 Blade Juggler (RVR) 67
1 Doom Whisperer (GRN) 69
1 Massacre Girl (RVR) 83
1 Disembowel (RVR) 74
1 Disembowel (RVR) 74
1 Disembowel (RVR) 74
1 Last Gasp (RVR) 79
1 Last Gasp (RVR) 79
1 Last Gasp (RVR) 79
1 Last Gasp (RVR) 79
1 Infernal Tutor (RVR) 78
1 Macabre Waltz (RVR) 82
1 Macabre Waltz (RVR) 82
1 Gruesome Menagerie (GRN) 71
1 Scorched Rusalka (RVR) 122
1 Scorched Rusalka (RVR) 122
1 Scorched Rusalka (RVR) 122
1 Tin Street Dodger (RVR) 128
1 Tin Street Dodger (RVR) 128
1 Tin Street Dodger (RVR) 128
1 Tin Street Dodger (RVR) 128
1 Bomber Corps (RVR) 102
1 Bomber Corps (RVR) 102
1 Electrostatic Field (PLST) GRN-97
1 Electrostatic Field (PLST) GRN-97
1 Electrostatic Field (GRN) 97
1 Legion Warboss (RVR) 116
1 Arclight Phoenix (RVR) 100
1 Arclight Phoenix (RVR) 100
1 Arclight Phoenix (RVR) 100
1 Krenko, Mob Boss (RVR) 114
1 Ilharg, the Raze-Boar (RVR) 113
1 Skarrgan Hellkite (RNA) 114
1 Skarrgan Hellkite (RNA) 114
1 Skarrgan Hellkite (RNA) 114
1 Utvara Hellkite (RVR) 129
1 Street Spasm (DDJ) 30
1 Street Spasm (DDJ) 30
1 Skullcrack (RVR) 125
1 Skullcrack (RVR) 125
1 Skullcrack (RVR) 125
1 Demonfire (RVR) 107
1 Mugging (RVR) 119
1 Mugging (RVR) 119
1 Mugging (RVR) 119
1 Mugging (RVR) 119
1 Lava Coil (2X2) 116
1 Lava Coil (2X2) 116
1 Light Up the Stage (RVR) 117
1 Light Up the Stage (RVR) 117
1 Light Up the Stage (RVR) 117
1 Light Up the Stage (RVR) 117
1 Skewer the Critics (RVR) 124
1 Skewer the Critics (RVR) 124
1 Skewer the Critics (RVR) 124
1 Arboreal Grazer (TDC) 245
1 Arboreal Grazer (TDC) 245
1 Arboreal Grazer (TDC) 245
1 Experiment One (RVR) 137
1 Experiment One (RVR) 137
1 Experiment One (RVR) 137
1 Crocanura (RVR) 135
1 Crocanura (RVR) 135
1 Crocanura (RVR) 135
1 Crocanura (RVR) 135
1 Evolution Witness (MH3) 151
1 Loaming Shaman (RVR) 149
1 Beast Whisperer (CLU) 158
1 Greater Mossdog (RVR) 145
1 Greater Mossdog (RVR) 145
1 Greater Mossdog (RVR) 145
1 Golgari Grave-Troll (RVR) 144
1 Giant Adephage (DSC) 179
1 Giant Adephage (DSC) 179
1 Arboretum Elemental (GRN) 122
1 Skarrg Goliath (PGTC) 133★
1 Edge of Autumn (TSR) 201
1 Edge of Autumn (TSR) 201
1 Edge of Autumn (TSR) 201
1 Farseek (RVR) 138
1 Farseek (RVR) 138
1 Farseek (RVR) 138
1 Life from the Loam (RVR) 148
1 Sprouting Renewal (RVR) 157
1 Sprouting Renewal (RVR) 157
1 Sprouting Renewal (RVR) 157
1 Forced Adaptation (RVR) 140
1 Forced Adaptation (RVR) 140
1 Utopia Sprawl (RVR) 159
1 Utopia Sprawl (RVR) 159
1 Utopia Sprawl (RVR) 159
1 Fists of Ironwood (RVR) 139
1 Fists of Ironwood (RVR) 139
1 Fists of Ironwood (RVR) 139
1 Moldervine Cloak (RVR) 150
1 Moldervine Cloak (RVR) 150
1 Judge's Familiar (RVR) 192
1 Judge's Familiar (RVR) 192
1 Azorius Guildmage (RVR) 165
1 Azorius Guildmage (RVR) 165
1 Azorius Signet (RVR) 250
1 Lyev Skyknight (RTR) 179
1 Lyev Skyknight (RTR) 179
1 Lyev Skyknight (RTR) 179
1 Sphinx of New Prahv (RVR) 227
1 Sphinx of New Prahv (RVR) 227
1 Isperia the Inscrutable (GK2) 13
1 Lavinia of the Tenth (CLU) 199
1 Sky Hussar (RVR) 224
1 Dimir Guildmage (RVR) 178
1 Dimir Guildmage (RVR) 178
1 Dimir Signet (RVR) 256
1 House Guildmage (GRN) 177
1 Dimir Doppelganger (GK1) 12
1 Thief of Sanity (GRN) 205
1 Thief of Sanity (GRN) 205
1 Whisper Agent (RVR) 238
1 Whisper Agent (RVR) 238
1 Whisper Agent (RVR) 238
1 Lazav, Dimir Mastermind (GTC) 174
1 Whispering Madness (GTC) 207
1 Consuming Aberration (GTC) 152
1 Mirko Vosk, Mind Drinker (GK1) 17
1 Footlight Fiend (RVR) 181
1 Footlight Fiend (RVR) 181
1 Footlight Fiend (RVR) 181
1 Gobhobbler Rats (RVR) 185
1 Gobhobbler Rats (RVR) 185
1 Rakdos Guildmage (RVR) 214
1 Rakdos Signet (RVR) 265
1 Judith, the Scourge Diva (RNA) 185
1 Theater of Horrors (RNA) 213
1 Theater of Horrors (RNA) 213
1 Carnage Gladiator (DGM) 61
1 Carnage Gladiator (DGM) 61
1 Rakdos Firewheeler (RVR) 213
1 Rakdos, Lord of Riots (RVR) 215
1 Goblin Anarchomancer (MH2) 200
1 Goblin Anarchomancer (MH2) 200
1 Gruul Signet (RVR) 259
1 Rhythm of the Wild (RVR) 217
1 Rhythm of the Wild (RVR) 217
1 Sunder Shaman (RVR) 230
1 Sunder Shaman (RVR) 230
1 Sunder Shaman (RVR) 230
1 Nikya of the Old Ways (RNA) 193
1 Ravager Wurm (RNA) 200
1 Ravager Wurm (RNA) 200
1 Ravager Wurm (RNA) 200
1 Rubblehulk (GK2) 95
1 Call of the Conclave (RVR) 169
1 Call of the Conclave (RVR) 169
1 Selesnya Evangel (GK1) 118
1 Selesnya Evangel (GK1) 118
1 Selesnya Evangel (GK1) 118
1 Selesnya Guildmage (CLU) 207
1 Selesnya Guildmage (CLU) 207
1 Selesnya Signet (RVR) 267
1 March of the Multitudes (GRN) 188
1 Conclave Cavalier (RVR) 173
1 Growing Ranks (GK1) 113
1 Trostani, Selesnya's Voice (PLST) GK1-102
1 Tolsimir Wolfblood (RVR) 234
1 Cartel Aristocrat (RVR) 170
1 Cartel Aristocrat (RVR) 170
1 Mourning Thrull (RVR) 204
1 Mourning Thrull (RVR) 204
1 Mourning Thrull (RVR) 204
1 Orzhov Signet (RVR) 263
1 Teysa, Orzhov Scion (RVR) 233
1 Blind Hunter (RVR) 166
1 Ghost Council of Orzhova (GK2) 40
1 Seraph of the Scales (RNA) 205
1 Seraph of the Scales (RNA) 205
1 Revival // Revenge (RVR) 241
1 Revival // Revenge (RVR) 241
1 Goblin Electromancer (RVR) 186
1 Goblin Electromancer (RVR) 186
1 Goblin Electromancer (RVR) 186
1 Izzet Charm (RVR) 190
1 Izzet Charm (RVR) 190
1 Izzet Signet (RVR) 261
1 League Guildmage (GRN) 185
1 League Guildmage (GRN) 185
1 Wee Dragonauts (GRN) 214
1 Wee Dragonauts (GRN) 214
1 Crackling Drake (RVR) 174
1 Crackling Drake (RVR) 174
1 Ral, Storm Conduit (WAR) 211
1 Niv-Mizzet, Dracogenius (RTR) 183
1 Deathrite Shaman (RVR) 175
1 Deathrite Shaman (RVR) 175
1 Slitherhead (RVR) 226
1 Slitherhead (RVR) 226
1 Slitherhead (RVR) 226
1 Glowspore Shaman (RVR) 184
1 Glowspore Shaman (RVR) 184
1 Glowspore Shaman (RVR) 184
1 Golgari Signet (RVR) 258
1 Jarad, Golgari Lich Lord (GK1) 65
1 Vraska, Golgari Queen (GRN) 213
1 Underrealm Lich (GRN) 211
1 Izoni, Thousand-Eyed (GRN) 180
1 Find // Finality (RVR) 245
1 Boros Guildmage (RVR) 168
1 Boros Guildmage (RVR) 168
1 Boros Signet (RVR) 251
1 Fresh-Faced Recruit (RVR) 182
1 Fresh-Faced Recruit (RVR) 182
1 Fresh-Faced Recruit (RVR) 182
1 Boros Reckoner (GTC) 215
1 Skyknight Legionnaire (RVR) 225
1 Skyknight Legionnaire (RVR) 225
1 Skyknight Legionnaire (RVR) 225
1 Aurelia, Exemplar of Justice (RVR) 164
1 Bell Borca, Spectral Sergeant (CMR) 271
1 Truefire Captain (RVR) 235
1 Hydroid Krasis (PRNA) 183p
1 Hydroid Krasis (PRNA) 183p
1 Simic Guildmage (RVR) 223
1 Simic Guildmage (RVR) 223
1 Simic Signet (RVR) 269
1 Bred for the Hunt (DGM) 59
1 Fathom Mage (GTC) 162
1 Fathom Mage (GTC) 162
1 Frilled Mystic (RVR) 183
1 Frilled Mystic (RVR) 183
1 Master Biomancer (CLU) 200
1 Sharktocrab (RVR) 222
1 Sharktocrab (RVR) 222
1 Zegana, Utopian Speaker (RNA) 214
1 Azorius Guildgate (PLST) RNA-243
1 Azorius Guildgate (PLST) RNA-243
1 Dimir Guildgate (PLST) GRN-245
1 Dimir Guildgate (PLST) GRN-245
1 Rakdos Guildgate (PLST) RNA-256
1 Rakdos Guildgate (PLST) RNA-256
1 Gruul Guildgate (PLST) RNA-249
1 Gruul Guildgate (PLST) RNA-249
1 Selesnya Guildgate (PLST) GRN-255
1 Selesnya Guildgate (PLST) GRN-255
1 Orzhov Guildgate (PLST) RNA-253
1 Orzhov Guildgate (PLST) RNA-253
1 Izzet Guildgate (PLST) GRN-251
1 Izzet Guildgate (PLST) GRN-251
1 Golgari Guildgate (PLST) GRN-248
1 Golgari Guildgate (PLST) GRN-248
1 Boros Guildgate (PLST) GRN-243
1 Boros Guildgate (PLST) GRN-243
1 Simic Guildgate (PLST) RNA-257
1 Simic Guildgate (PLST) RNA-257`;

function parseList(rawText) {
  const lines = rawText.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const entries = [];
  for (const line of lines) {
    const match = line.match(/^(\d+)\s+(.+?)(?:\s+\((.+?)\)\s*(.*))?$/);
    if (match) {
      entries.push({
        qty: parseInt(match[1]),
        name: match[2].trim(),
        set: (match[3] || '').trim()
      });
    }
  }
  return entries;
}

const plazaEntries = parseList(plazaRaw);
const mainCubeEntries = parseList(mainCubeRaw);

console.log('Plaza total quantity:', plazaEntries.reduce((a,b)=>a+b.qty,0));
console.log('Main Cube total quantity:', mainCubeEntries.reduce((a,b)=>a+b.qty,0));

const allUniqueNames = [...new Set([...plazaEntries, ...mainCubeEntries].map(c => c.name))];
console.log('Total unique card names across both pools:', allUniqueNames.length);

async function buildBothDatasets() {
  const metadataMap = new Map();
  const chunkSize = 75;

  for (let i = 0; i < allUniqueNames.length; i += chunkSize) {
    const chunk = allUniqueNames.slice(i, i + chunkSize);
    const identifiers = chunk.map(name => ({ name }));

    console.log(`Fetching chunk ${i / chunkSize + 1}...`);
    const res = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'RavnicaCubeBuilder/2.0' },
      body: JSON.stringify({ identifiers })
    });

    const json = await res.json();
    for (const card of (json.data || [])) {
      const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
      metadataMap.set(card.name, {
        name: card.name,
        cmc: card.cmc || 0,
        mana_cost: card.mana_cost || card.card_faces?.[0]?.mana_cost || '',
        colors: card.colors || card.card_faces?.[0]?.colors || [],
        color_identity: card.color_identity || [],
        type_line: card.type_line || '',
        oracle_text: card.oracle_text || card.card_faces?.[0]?.oracle_text || '',
        power: card.power !== undefined ? card.power : null,
        toughness: card.toughness !== undefined ? card.toughness : null,
        rarity: card.rarity || 'common',
        image_url: img
      });
    }
    await new Promise(r => setTimeout(r, 100));
  }

  // Build Plaza Pool (32 cards)
  const plazaCards = [];
  let plazaId = 0;
  for (const entry of plazaEntries) {
    const meta = metadataMap.get(entry.name) || { name: entry.name, cmc: 0, mana_cost: '', colors: [], color_identity: [], type_line: 'Card', oracle_text: '', power: null, toughness: null, rarity: 'common', image_url: '' };
    for (let i = 0; i < entry.qty; i++) {
      plazaId++;
      plazaCards.push({
        id: `plaza_${String(plazaId).padStart(3, '0')}`,
        ...meta
      });
    }
  }

  // Build Main Cube (360 cards)
  const mainCubeCards = [];
  let cubeId = 0;
  for (const entry of mainCubeEntries) {
    const meta = metadataMap.get(entry.name) || { name: entry.name, cmc: 0, mana_cost: '', colors: [], color_identity: [], type_line: 'Card', oracle_text: '', power: null, toughness: null, rarity: 'common', image_url: '' };
    for (let i = 0; i < entry.qty; i++) {
      cubeId++;
      mainCubeCards.push({
        id: `cube_${String(cubeId).padStart(3, '0')}`,
        ...meta,
        isFixer: entry.name.includes('Signet') || entry.name.includes('Guildgate')
      });
    }
  }

  console.log(`Plaza Pool: ${plazaCards.length} cards.`);
  console.log(`Main Cube: ${mainCubeCards.length} cards.`);
  const cubeFixers = mainCubeCards.filter(c => c.isFixer);
  console.log(`Main Cube Fixers (Signets + Guildgates): ${cubeFixers.length} cards.`);

  fs.writeFileSync(path.join(__dirname, 'plazaCards.json'), JSON.stringify(plazaCards, null, 2));
  fs.writeFileSync(path.join(__dirname, 'ravnicaCube.json'), JSON.stringify(mainCubeCards, null, 2));
  console.log('Successfully saved plazaCards.json and ravnicaCube.json!');
}

buildBothDatasets();
