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

function calcCurrentCount() {
  const data = loadStreak()
  const today = getTodayKey()
  const yesterday = getYesterdayKey()

  if (data.lastDate === today) return data.count
  if (data.lastDate === yesterday) return data.count
  return 0
}

// 모듈 레벨 공유 상태 — 모든 useStreak() 호출이 같은 ref를 참조
const streak = ref(calcCurrentCount())
const recordedToday = ref(loadStreak().lastDate === getTodayKey())

/**
 * Get current streak state.
 * Call recordToday() when user completes a daily reading.
 * All callers share the same reactive refs.
 */
export function useStreak() {
  function recordToday() {
    const today = getTodayKey()
    if (recordedToday.value) return

    const prev = loadStreak()
    const yesterday = getYesterdayKey()
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
