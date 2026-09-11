export const TOKEN_AVATARS = [
  { id: '046', src: '/tokens/046.png' },
  { id: '050', src: '/tokens/050.png' },
  { id: '050_2', src: '/tokens/050_2.png' },
  { id: '110', src: '/tokens/110.png' },
  { id: '112', src: '/tokens/112.png' },
  { id: '115_1', src: '/tokens/115_1.png' },
  { id: '117', src: '/tokens/117.png' },
  { id: '140', src: '/tokens/140.png' },
  { id: '193', src: '/tokens/193.png' },
  { id: '197', src: '/tokens/197.png' },
  { id: '204', src: '/tokens/204.png' }
];

export function getAvatarSrc(avatarId) {
  if (!avatarId) return TOKEN_AVATARS[0].src;
  if (avatarId.startsWith('/') || avatarId.startsWith('http')) return avatarId;
  const found = TOKEN_AVATARS.find((a) => a.id === avatarId);
  if (found) return found.src;
  if (['azorius', 'orzhov', 'izzet', 'rakdos', 'golgari'].includes(avatarId)) {
    return `/avatar-${avatarId}.png`;
  }
  return `/tokens/${avatarId}.png`;
}
