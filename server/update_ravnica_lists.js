const fs = require('fs');
const path = require('path');

const cubeFile = 'C:/Users/OverD/OneDrive/Escritorio/RavnicaCube (1).txt';
const plazaFile = 'C:/Users/OverD/OneDrive/Escritorio/gateway_plaza.txt';

function parse(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
    const match = line.match(/^(\d+)\s+(.+?)\s+\(([^)]+)\)\s+(.+)$/);
    if (!match) throw new Error(`No se pudo interpretar: ${line}`);
    return { qty: Number(match[1]), name: match[2], set: match[3].toLowerCase(), collector_number: match[4] };
  });
}

const cubeEntries = parse(cubeFile);
const plazaEntries = parse(plazaFile);
const entries = [...cubeEntries, ...plazaEntries];
const identifiers = [...new Map(entries.map(entry => [`${entry.set}/${entry.collector_number}`, { set: entry.set, collector_number: entry.collector_number }])).values()];

async function main() {
  const metadata = new Map();
  for (let i = 0; i < identifiers.length; i += 75) {
    const res = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'GetawayDraft/3.0' },
      body: JSON.stringify({ identifiers: identifiers.slice(i, i + 75) })
    });
    if (!res.ok) throw new Error(`Scryfall respondió ${res.status}`);
    const json = await res.json();
    for (const card of json.data || []) {
      const image = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
      metadata.set(`${card.set}/${card.collector_number}`, {
        name: card.name, cmc: card.cmc || 0,
        mana_cost: card.mana_cost || card.card_faces?.[0]?.mana_cost || '',
        colors: card.colors || card.card_faces?.[0]?.colors || [], color_identity: card.color_identity || [],
        type_line: card.type_line || '', oracle_text: card.oracle_text || card.card_faces?.[0]?.oracle_text || '',
        power: card.power ?? null, toughness: card.toughness ?? null, rarity: card.rarity || 'common', image_url: image,
        set: card.set.toUpperCase(), collector_number: card.collector_number
      });
    }
    await new Promise(resolve => setTimeout(resolve, 120));
  }
  const expand = (list, prefix) => list.flatMap(entry => Array.from({ length: entry.qty }, (_, copy) => ({
    id: `${prefix}_${String(list.slice(0, list.indexOf(entry)).reduce((sum, item) => sum + item.qty, 0) + copy + 1).padStart(3, '0')}`,
    ...(metadata.get(`${entry.set}/${entry.collector_number}`) || { name: entry.name, cmc: 0, mana_cost: '', colors: [], color_identity: [], type_line: 'Card', oracle_text: '', power: null, toughness: null, rarity: 'common', image_url: '', set: entry.set.toUpperCase(), collector_number: entry.collector_number }),
    isFixer: prefix === 'cube' && (entry.name.includes('Signet') || entry.name.includes('Guildgate'))
  })));
  const cube = expand(cubeEntries, 'cube');
  const plaza = expand(plazaEntries, 'plaza');
  if (cube.length !== 360 || plaza.length !== 32) throw new Error(`Cantidades inesperadas: cubo ${cube.length}, plaza ${plaza.length}`);
  fs.writeFileSync(path.join(__dirname, 'cube360.json'), JSON.stringify(cube, null, 2));
  fs.writeFileSync(path.join(__dirname, 'ravnicaCube.json'), JSON.stringify(cube, null, 2));
  fs.writeFileSync(path.join(__dirname, 'plazaCards.json'), JSON.stringify(plaza, null, 2));
  console.log(`Actualizado: ${cube.length} cartas de cubo y ${plaza.length} de Gateway Plaza.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
