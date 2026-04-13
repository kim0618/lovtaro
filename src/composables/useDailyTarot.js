import { ref, computed } from 'vue'
import { TAROT_CARDS, shuffleCards } from '../data/tarotCards.js'
import { getCardImage } from '../data/cardImages.js'
import { TODAY_RESULTS } from '../data/readings/today.js'
import { applyReversedModifier } from '../data/reversedModifiers.js'
import { saveReadingHistory } from './useReadingHistory.js'
import { useStreak } from './useStreak.js'

const STORAGE_KEY = 'lovtaro_daily_tarot'

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadTodayResult() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.date !== getTodayKey()) return null
    return data
  } catch {
    return null
  }
}

function saveTodayResult({ cardId, cardName, cardNameEn, reversed, energy, keywords }) {
  try {
    const data = {
      date: getTodayKey(),
      cardId,
      cardName,
      cardNameEn,
      reversed,
      energy,
      keywords,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

/**
 * Daily tarot composable.
 * If user already drew today, returns the saved result directly.
 */
export function useDailyTarot() {
  const saved = ref(loadTodayResult())
  const alreadyDrawn = ref(!!saved.value)
  const phase = ref(saved.value ? 'result' : 'draw')
  let revealTimer = null

  // Card draw state
  const deck = ref(shuffleCards(TAROT_CARDS))
  const selectedIds = ref([])

  // Resolved card (from new draw or from saved)
  const drawnCard = computed(() => {
    if (saved.value && alreadyDrawn.value) {
      return {
        id: saved.value.cardId,
        name: saved.value.cardName,
        nameEn: saved.value.cardNameEn,
        reversed: saved.value.reversed,
        energy: saved.value.energy,
        keywords: saved.value.keywords,
        image: getCardImage(saved.value.cardId) || '',
      }
    }
    const id = selectedIds.value[0]
    if (!id) return null
    return deck.value.find(c => c.id === id) ?? null
  })

  const isReversed = computed(() => drawnCard.value?.reversed ?? false)

  const result = computed(() => {
    if (!drawnCard.value) return null
    const upright = TODAY_RESULTS[drawnCard.value.id]
    if (!upright) return null
    return applyReversedModifier(drawnCard.value.id, upright, isReversed.value)
  })

  const canConfirm = computed(() => selectedIds.value.length === 1)

  function onSelect(cardId) {
    if (selectedIds.value.includes(cardId)) {
      selectedIds.value = []
    } else {
      selectedIds.value = [cardId]
    }
  }

  function confirm() {
    if (!canConfirm.value) return
    const card = drawnCard.value
    if (card) {
      saveTodayResult({
        cardId: card.id,
        cardName: card.name,
        cardNameEn: card.nameEn,
        reversed: card.reversed,
        energy: card.energy,
        keywords: card.keywords,
      })
      const r = applyReversedModifier(card.id, TODAY_RESULTS[card.id], card.reversed)
      saveReadingHistory({
        readingType: '오늘의 연애 카드',
        spreadType: 'single',
        cards: [{ id: card.id, name: card.name, nameEn: card.nameEn, reversed: card.reversed }],
        summary: r?.summary ?? '',
        details: r ? { emotionTags: r.emotionTags, advice: r.advice, caution: r.caution } : null,
      })
      alreadyDrawn.value = true
      const { recordToday } = useStreak()
      recordToday()
    }
    phase.value = 'reveal'
    revealTimer = setTimeout(() => { phase.value = 'result' }, 2200)
  }

  function clearRevealTimer() {
    if (revealTimer) { clearTimeout(revealTimer); revealTimer = null }
  }

  function reset() {
    selectedIds.value = []
    deck.value = shuffleCards(TAROT_CARDS)
  }

  function resetToday() {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    saved.value = null
    alreadyDrawn.value = false
    selectedIds.value = []
    deck.value = shuffleCards(TAROT_CARDS)
    phase.value = 'draw'
  }

  return {
    phase,
    deck,
    selectedIds,
    drawnCard,
    isReversed,
    result,
    canConfirm,
    alreadyDrawn,
    onSelect,
    confirm,
    reset,
    resetToday,
    clearRevealTimer,
  }
}
