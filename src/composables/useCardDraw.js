import { ref, computed } from 'vue'
import { TAROT_CARDS, shuffleCards } from '../data/tarotCards.js'

/**
 * @param {Object} options
 * @param {number} options.maxSelect - 선택할 카드 수 (기본 1)
 */
export function useCardDraw({ maxSelect = 1 } = {}) {
  const deck = ref(shuffleCards(TAROT_CARDS))
  const selectedIds = ref([])

  const selectedCards = computed(() =>
    selectedIds.value.map(id => deck.value.find(c => c.id === id)).filter(Boolean)
  )

  const canConfirm = computed(() => selectedIds.value.length === maxSelect)

  function onSelect(cardId) {
    if (selectedIds.value.includes(cardId)) {
      selectedIds.value = selectedIds.value.filter(id => id !== cardId)
    } else if (selectedIds.value.length < maxSelect) {
      selectedIds.value = [...selectedIds.value, cardId]
    }
  }

  function reset() {
    selectedIds.value = []
    deck.value = shuffleCards(TAROT_CARDS)
  }

  return { deck, selectedIds, selectedCards, canConfirm, onSelect, reset }
}
