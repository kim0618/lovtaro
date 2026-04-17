import { trackEvent } from '../utils/gtag.js'

export function trackReadingStart(readingType) {
  trackEvent('reading_start', { reading_type: readingType })
}

export function trackCardDrawn(readingType, { spreadType, cards }) {
  cards.forEach((card, idx) => {
    trackEvent('card_drawn', {
      reading_type: readingType,
      spread_type: spreadType,
      card_id: card.id,
      reversed: !!card.reversed,
      position: card.position || String(idx),
    })
  })
}

export function trackReadingReveal(readingType, { spreadType, cardCount }) {
  trackEvent('reading_reveal', {
    reading_type: readingType,
    spread_type: spreadType,
    card_count: cardCount,
  })
}

export function trackReadingReset(readingType) {
  trackEvent('reading_reset', { reading_type: readingType })
}

export function trackTodayDraw({ cardId, reversed }) {
  trackEvent('today_draw', {
    card_id: cardId,
    reversed: !!reversed,
  })
}
