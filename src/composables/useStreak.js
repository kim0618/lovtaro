import { ref } from 'vue'

const STORAGE_KEY = 'lovtaro_streak'

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getYesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadStreak() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { count: 0, lastDate: '' }
    return JSON.parse(raw)
  } catch {
    return { count: 0, lastDate: '' }
  }
}

function saveStreak(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

/**
 * Get current streak state.
 * Call recordToday() when user completes a daily reading.
 */
export function useStreak() {
  const data = loadStreak()
  const today = getTodayKey()
  const yesterday = getYesterdayKey()

  // Calculate current streak
  let currentCount = 0
  if (data.lastDate === today) {
    // Already recorded today
    currentCount = data.count
  } else if (data.lastDate === yesterday) {
    // Yesterday was recorded, streak is alive but not yet updated for today
    currentCount = data.count
  } else {
    // Streak broken
    currentCount = 0
  }

  const streak = ref(currentCount)
  const recordedToday = ref(data.lastDate === today)

  function recordToday() {
    if (recordedToday.value) return

    const prev = loadStreak()
    let newCount = 1

    if (prev.lastDate === yesterday) {
      newCount = prev.count + 1
    } else if (prev.lastDate === today) {
      newCount = prev.count
    }

    saveStreak({ count: newCount, lastDate: today })
    streak.value = newCount
    recordedToday.value = true
  }

  return { streak, recordedToday, recordToday }
}
