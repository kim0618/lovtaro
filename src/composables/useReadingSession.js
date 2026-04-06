import { watch, onUnmounted } from 'vue'

const PREFIX = 'lovtaro_session_'

/**
 * Saves and restores reading session state across page refreshes.
 * Only persists during the browser session (sessionStorage).
 *
 * @param {string} key - Unique key for this reading type (e.g. 'mind', 'love')
 * @param {Object} refs - Reactive refs to persist
 * @param {import('vue').Ref} refs.phase
 * @param {import('vue').Ref} refs.selectedIds
 * @param {import('vue').Ref} refs.relationshipStatus
 * @param {import('vue').Ref<Array>} refs.deck
 */
export function useReadingSession(key, { phase, selectedIds, relationshipStatus, deck }) {
  const storageKey = PREFIX + key

  // Try to restore
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (raw) {
      const data = JSON.parse(raw)
      // Only restore if there was meaningful progress (past intro/status)
      if ((data.phase === 'draw' || data.phase === 'result') && data.selectedIds?.some(Boolean)) {
        // Restore data BEFORE phase to avoid watchers seeing stale state
        selectedIds.value = data.selectedIds
        if (data.relationshipStatus && relationshipStatus) {
          relationshipStatus.value = data.relationshipStatus
        }
        if (data.deck && deck) {
          deck.value = data.deck
        }
        phase.value = data.phase
      }
    }
  } catch {
    // ignore
  }

  // Watch and save on changes
  watch(
    [phase, selectedIds],
    () => {
      try {
        const data = {
          phase: phase.value,
          selectedIds: selectedIds.value,
          relationshipStatus: relationshipStatus?.value ?? null,
          deck: deck?.value ?? null,
        }
        // Only save meaningful states
        if (phase.value === 'draw' || phase.value === 'result') {
          sessionStorage.setItem(storageKey, JSON.stringify(data))
        }
      } catch {
        // ignore (private browsing, quota, etc.)
      }
    },
    { deep: true }
  )

  // Clean up when reading is complete and user leaves
  onUnmounted(() => {
    // Keep session data — it clears when browser tab closes
  })

  function clearSession() {
    try { sessionStorage.removeItem(storageKey) } catch { /* ignore */ }
  }

  return { clearSession }
}
