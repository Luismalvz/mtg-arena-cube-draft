const fs = require('fs');
const path = require('path');

const cubeFile = path.join(__dirname, 'ravnicaCube.txt');

function parse(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
    const match = line.match(/^(\d+)\s+(.+?)\s+\(([^)]+)\)\s+(.+)$/);
    if (!match) throw new Error(`No se pudo interpretar: ${line}`);
    return { qty: Number(match[1]), name: match[2], set: match[3].toLowerCase(), collector_number: match[4] };
  });
}

const cubeEntries = parse(cubeFile);
const previousCube = JSON.parse(fs.readFileSync(path.join(__dirname, 'ravnicaCube.json'), 'utf8'));
const identifiers = [...new Map(cubeEntries.map(entry => [`${entry.set}/${entry.collector_number}`, { set: entry.set, collector_number: entry.collector_number }])).values()];

async function main() {
  const metadata = new Map(previousCube.map(({ id, isFixer, ...card }) => [`${card.set.toLowerCase()}/${card.collector_number}`, card]));
  const missing = identifiers.filter(entry => !metadata.has(`${entry.set}/${entry.collector_number}`));
  for (let i = 0; i < missing.length; i += 75) {
    const res = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': 'GetawayDraft/3.0' },
      body: JSON.stringify({ identifiers: missing.slice(i, i + 75) })
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
  let nextId = 1;
  const cube = cubeEntries.flatMap(entry => Array.from({ length: entry.qty }, () => {
    const card = metadata.get(`${entry.set}/${entry.collector_number}`);
    if (!card) throw new Error(`Carta sin datos: ${entry.name} (${entry.set}) ${entry.collector_number}`);
    if (card.name !== entry.name) throw new Error(`Nombre no coincide: ${entry.name} / ${card.name}`);
    return { id: `cube_${String(nextId++).padStart(3, '0')}`, ...card,
      isFixer: entry.name.includes('Signet') || entry.name.includes('Guildgate') };
  }));
  if (cube.length !== 360) throw new Error(`Cantidad inesperada: cubo ${cube.length}`);
  fs.writeFileSync(path.join(__dirname, 'cube360.json'), JSON.stringify(cube, null, 2));
  fs.writeFileSync(path.join(__dirname, 'ravnicaCube.json'), JSON.stringify(cube, null, 2));
  console.log(`Actualizado: ${cube.length} cartas de cubo.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
