/**
 * Card ID → image path mapping.
 * Only includes cards that actually have generated images.
 */
const AVAILABLE = new Set([
  'fool', 'magician', 'priestess', 'empress', 'emperor',
  'hierophant', 'lovers', 'chariot', 'strength', 'hermit',
  'wheel', 'justice', 'hanged', 'death', 'temperance', 'devil',
  'tower', 'star', 'moon', 'sun', 'judgement', 'world',
])

const SLUG_MAP = {
  fool: 'fool',
  magician: 'magician',
  priestess: 'high-priestess',
  empress: 'empress',
  emperor: 'emperor',
  hierophant: 'hierophant',
  lovers: 'lovers',
  chariot: 'chariot',
  strength: 'strength',
  hermit: 'hermit',
  wheel: 'wheel-of-fortune',
  justice: 'justice',
  hanged: 'hanged-man',
  death: 'death',
  temperance: 'temperance',
  devil: 'devil',
  tower: 'tower',
  star: 'star',
  moon: 'moon',
  sun: 'sun',
  judgement: 'judgement',
  world: 'world',
}

export function getCardImage(cardId) {
  if (!AVAILABLE.has(cardId)) return null
  const slug = SLUG_MAP[cardId]
  return slug ? `/images/cards/${slug}.webp` : null
}
