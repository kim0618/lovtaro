/**
 * Card ID → image path mapping.
 * Only includes cards that actually have generated images.
 */

// Major Arcana: custom slug mapping
const MAJOR_SLUG_MAP = {
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

// Minor Arcana: ID matches filename directly (ace-of-cups → ace-of-cups.webp)
const MINOR_IDS = new Set([
  'ace-of-cups', 'two-of-cups', 'three-of-cups', 'four-of-cups',
  'five-of-cups', 'six-of-cups', 'seven-of-cups', 'eight-of-cups',
  'nine-of-cups', 'ten-of-cups', 'page-of-cups', 'knight-of-cups',
  'queen-of-cups', 'king-of-cups',
  'ace-of-pentacles', 'two-of-pentacles', 'three-of-pentacles', 'four-of-pentacles',
  'five-of-pentacles', 'six-of-pentacles', 'seven-of-pentacles', 'eight-of-pentacles',
  'nine-of-pentacles', 'ten-of-pentacles', 'page-of-pentacles', 'knight-of-pentacles',
  'queen-of-pentacles', 'king-of-pentacles',
  'ace-of-swords', 'two-of-swords', 'three-of-swords', 'four-of-swords',
  'five-of-swords', 'six-of-swords', 'seven-of-swords', 'eight-of-swords',
  'nine-of-swords', 'ten-of-swords', 'page-of-swords', 'knight-of-swords',
  'queen-of-swords', 'king-of-swords',
  'ace-of-wands', 'two-of-wands', 'three-of-wands', 'four-of-wands',
  'five-of-wands', 'six-of-wands', 'seven-of-wands', 'eight-of-wands',
  'nine-of-wands', 'ten-of-wands', 'page-of-wands', 'knight-of-wands',
  'queen-of-wands', 'king-of-wands',
])

export function getCardImage(cardId) {
  if (MINOR_IDS.has(cardId)) {
    return `/images/cards/${cardId}.webp`
  }
  const slug = MAJOR_SLUG_MAP[cardId]
  return slug ? `/images/cards/${slug}.webp` : null
}
