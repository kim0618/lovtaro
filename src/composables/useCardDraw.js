import { ref, computed } from 'vue'
import { TAROT_CARDS, shuffleCards } from '../data/tarotCards.js'

/**
 * @param {Object} options
 * @param {number} options.maxSelect - 선택할 카드 수 (기본 1)
 */
export function useCardDraw({ maxSelect = 1 } = {}) {
  const deck = ref(shuffleCards(TAROT_CARDS))
  const selectedIds = ref(new Array(maxSelect).fill(null))

  const selectedCards = computed(() =>
    selectedIds.value.map(id => id ? deck.value.find(c => c.id === id) ?? null : null)
  )

  const selectedCount = computed(() => selectedIds.value.filter(Boolean).length)

  const canConfirm = computed(() => selectedIds.value.every(id => id !== null))

  function onSelect(cardId) {
    // 이미 선택된 카드면 해제
    const existingIdx = selectedIds.value.indexOf(cardId)
    if (existingIdx !== -1) {
      const copy = [...selectedIds.value]
      copy[existingIdx] = null
      selectedIds.value = copy
      return
    }
    // 빈 슬롯 찾아서 채우기
    const emptyIdx = selectedIds.value.indexOf(null)
    if (emptyIdx !== -1) {
      const copy = [...selectedIds.value]
      copy[emptyIdx] = cardId
      selectedIds.value = copy
    }
  }

  function removeAt(index) {
    const copy = [...selectedIds.value]
    copy[index] = null
    selectedIds.value = copy
  }

  function reset() {
    selectedIds.value = new Array(maxSelect).fill(null)
    deck.value = shuffleCards(TAROT_CARDS)
  }

  return { deck, selectedIds, selectedCards, selectedCount, canConfirm, onSelect, removeAt, reset }
}
