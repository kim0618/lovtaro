const STORAGE_KEY = 'lovtaro_last_reading'

/**
 * 마지막 리딩 결과를 localStorage에 저장/읽기
 * 저장 형식: { readingType, cardId, cardName, cardNameEn, timestamp }
 */
export function saveLastReading({ readingType, cardId, cardName, cardNameEn }) {
  try {
    const data = { readingType, cardId, cardName, cardNameEn, timestamp: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage 접근 불가 환경 무시
  }
}

export function loadLastReading() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
