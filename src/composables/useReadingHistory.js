import { trackEvent } from '../utils/gtag.js'

const STORAGE_KEY = 'lovtaro_reading_history'
const MAX_ENTRIES = 50

/**
 * Reading history entry structure:
 * {
 *   id: string (unique),
 *   timestamp: number,
 *   readingType: string (e.g. "오늘의 연애 카드", "상대방 속마음"),
 *   spreadType: 'single' | 'three',
 *   cards: [{ id, name, nameEn, reversed, position? }],
 *   summary: string,
 *   memo: string (user note, optional),
 *   details: { emotionTags?, advice?, caution? } (optional, for expandable view),
 * }
 */

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // ignore
  }
}

/**
 * Save a reading to history.
 * @param {Object} entry
 * @param {string} entry.readingType
 * @param {'single'|'three'} entry.spreadType
 * @param {Array} entry.cards - [{ id, name, nameEn, reversed, position? }]
 * @param {string} entry.summary
 */
export function saveReadingHistory({ readingType, spreadType, cards, summary, details }) {
  const entries = loadHistory()
  const newEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    readingType,
    spreadType,
    cards,
    summary,
    memo: '',
    details: details || null,
  }
  entries.unshift(newEntry)
  persistHistory(entries)

  trackEvent('reading_complete', {
    reading_type: readingType,
    spread_type: spreadType,
    card_count: cards.length,
  })
}

/**
 * Get all reading history entries.
 * @returns {Array}
 */
export function getReadingHistory() {
  return loadHistory()
}

/**
 * Update memo for a specific reading entry.
 * @param {string} entryId
 * @param {string} memo
 */
export function updateReadingMemo(entryId, memo) {
  const entries = loadHistory()
  const entry = entries.find(e => e.id === entryId)
  if (entry) {
    entry.memo = memo
    persistHistory(entries)
  }
}

/**
 * Clear all reading history.
 */
export function clearReadingHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
