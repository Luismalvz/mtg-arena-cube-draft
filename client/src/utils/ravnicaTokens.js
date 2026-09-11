export const RAVNICA_TOKENS = [
  {
    id: 'trvr-1', name: 'Bird', set: 'trvr', collector_number: '1',
    type_line: 'Token Creature — Bird', oracle_text: 'Flying', power: '1', toughness: '1',
    image_url: 'https://cards.scryfall.io/normal/front/f/b/fb446f25-40e4-4cd6-968c-8e22fe799203.jpg?1783913158',
    requiredBy: ['Eyes in the Skies', 'Battle Screech']
  },
  {
    id: 'trvr-5', name: 'Bird Illusion', set: 'trvr', collector_number: '5',
    type_line: 'Token Creature — Bird Illusion', oracle_text: 'Flying', power: '1', toughness: '1',
    image_url: 'https://cards.scryfall.io/normal/front/1/6/16bc1cfe-c2b2-416f-9691-94106cfbf98c.jpg?1783913157',
    requiredBy: ['Murmuring Mystic']
  },
  {
    id: 'trvr-10', name: 'Centaur', set: 'trvr', collector_number: '10',
    type_line: 'Token Creature — Centaur', oracle_text: '', power: '3', toughness: '3',
    image_url: 'https://cards.scryfall.io/normal/front/5/f/5f657b65-67fc-4b7d-bc9e-840190f69362.jpg?1783913155',
    requiredBy: ['Call of the Conclave']
  },
  {
    id: 'trvr-7', name: 'Dragon', set: 'trvr', collector_number: '7',
    type_line: 'Token Creature — Dragon', oracle_text: 'Flying', power: '6', toughness: '6',
    image_url: 'https://cards.scryfall.io/normal/front/a/f/af8209b4-f9db-4fff-b379-86f19669a82f.jpg?1783913156',
    requiredBy: ['Utvara Hellkite']
  },
  {
    id: 'trvr-15', name: 'Elf Knight', set: 'trvr', collector_number: '15',
    type_line: 'Token Creature — Elf Knight', oracle_text: 'Vigilance', power: '2', toughness: '2',
    image_url: 'https://cards.scryfall.io/normal/front/2/0/204b3adf-e76b-4ce9-b84d-b4e65b7054d4.jpg?1783913151',
    requiredBy: ['Sprouting Renewal', 'Conclave Cavalier']
  },
  {
    id: 'trvr-8', name: 'Goblin', set: 'trvr', collector_number: '8',
    type_line: 'Token Creature — Goblin', oracle_text: '', power: '1', toughness: '1',
    image_url: 'https://cards.scryfall.io/normal/front/5/9/59a207c7-0605-4c8d-a0fa-588bf8d8ada8.jpg?1783913155',
    requiredBy: ['Legion Warboss', 'Krenko, Mob Boss']
  },
  {
    id: 'trvr-9', name: 'Goblin', set: 'trvr', collector_number: '9',
    type_line: 'Token Creature — Goblin', oracle_text: 'Haste', power: '2', toughness: '1',
    image_url: 'https://cards.scryfall.io/normal/front/7/9/79707ef3-9ac8-4774-b34b-f227546ff4bd.jpg?1783913156',
    requiredBy: ['Rakdos Guildmage']
  },
  {
    id: 'tgrn-5', name: 'Insect', set: 'tgrn', collector_number: '5',
    type_line: 'Token Creature — Insect', oracle_text: '', power: '1', toughness: '1',
    image_url: 'https://cards.scryfall.io/normal/front/0/4/0436e71b-c1f9-4ca8-a29c-775da858a0cd.jpg?1783934061',
    requiredBy: ['Izoni, Thousand-Eyed']
  },
  {
    id: 'trvr-12', name: 'Saproling', set: 'trvr', collector_number: '12',
    type_line: 'Token Creature — Saproling', oracle_text: '', power: '1', toughness: '1',
    image_url: 'https://cards.scryfall.io/normal/front/0/b/0bf3d41e-cd0a-46bd-8b89-8855906ea6b5.jpg?1783913153',
    requiredBy: ['Fists of Ironwood', 'Selesnya Evangel', 'Selesnya Guildmage', 'Vitu-Ghazi, the City-Tree']
  },
  {
    id: 'tgrn-2', name: 'Soldier', set: 'tgrn', collector_number: '2',
    type_line: 'Token Creature — Soldier', oracle_text: 'Lifelink', power: '1', toughness: '1',
    image_url: 'https://cards.scryfall.io/normal/front/4/5/45907b16-af17-4237-ab38-9d7537fd30e8.jpg?1783934064',
    requiredBy: ['March of the Multitudes']
  },
  {
    id: 'trna-10', name: 'Spirit', set: 'trna', collector_number: '10',
    type_line: 'Token Creature — Spirit', oracle_text: 'Flying', power: '1', toughness: '1',
    image_url: 'https://cards.scryfall.io/normal/front/4/5/45b3bdd7-b093-4bfd-8a9a-965e72bfefb3.jpg?1783933602',
    requiredBy: ['Ministrant of Obligation', 'Orzhov Enforcer', 'Seraph of the Scales']
  },
  {
    id: 'trvr-4', name: 'Spirit', set: 'trvr', collector_number: '4',
    type_line: 'Token Creature — Spirit', oracle_text: 'Flying', power: '1', toughness: '1',
    image_url: 'https://cards.scryfall.io/normal/front/0/8/08c8ab9d-50c7-427d-a2ab-eebaa42842a3.jpg?1783913157',
    requiredBy: ['Teysa, Orzhov Scion']
  },
  {
    id: 'trvr-19', name: 'Voja', set: 'trvr', collector_number: '19',
    type_line: 'Token Legendary Creature — Wolf', oracle_text: '', power: '2', toughness: '2',
    image_url: 'https://cards.scryfall.io/normal/front/a/f/af8ba142-4f39-45e4-8872-b6e348fd760c.jpg?1783913148',
    requiredBy: ['Tolsimir Wolfblood']
  }
];

export function tokensForCards(cards = []) {
  const cardNames = new Set(cards.map(card => card?.name).filter(Boolean));
  return RAVNICA_TOKENS
    .filter(token => token.requiredBy.some(name => cardNames.has(name)))
    .map(({ requiredBy, ...token }) => ({ ...token, quantity: 1 }));
}
