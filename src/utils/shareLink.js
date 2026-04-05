/**
 * 리딩 결과를 URL 파라미터로 인코딩/디코딩하는 유틸리티
 * 공유 받은 사람은 결과 미리보기 + "나도 해보기" CTA를 볼 수 있음
 */

/**
 * 단일 카드 리딩 결과를 URL 파라미터로 생성
 * @param {Object} options
 * @param {string} options.cardId - 카드 ID (예: 'magician')
 * @param {boolean} options.reversed - 역방향 여부
 * @param {string} options.status - 관계 상태
 * @returns {string} 쿼리스트링 (? 포함)
 */
export function encodeReadingParams({ cardId, reversed, status }) {
  const params = new URLSearchParams()
  params.set('c', cardId)
  if (reversed) params.set('r', '1')
  if (status) params.set('s', status)
  return `?${params.toString()}`
}

/**
 * 3장 리딩 결과를 URL 파라미터로 생성
 * @param {Array} cards - [{id, reversed}]
 * @param {string} status - 관계 상태
 * @returns {string} 쿼리스트링
 */
export function encodeSpreadParams(cards, status) {
  const params = new URLSearchParams()
  const cardStr = cards.map(c => `${c.id}${c.reversed ? '.r' : ''}`).join(',')
  params.set('c', cardStr)
  if (status) params.set('s', status)
  return `?${params.toString()}`
}

/**
 * URL에서 단일 카드 파라미터 추출
 * @returns {Object|null} { cardId, reversed, status }
 */
export function decodeReadingParams() {
  const params = new URLSearchParams(window.location.search)
  const cardId = params.get('c')
  if (!cardId) return null
  return {
    cardId,
    reversed: params.get('r') === '1',
    status: params.get('s') || '',
  }
}

/**
 * URL에서 3장 카드 파라미터 추출
 * @returns {Object|null} { cards: [{id, reversed}], status }
 */
export function decodeSpreadParams() {
  const params = new URLSearchParams(window.location.search)
  const cardStr = params.get('c')
  if (!cardStr) return null
  const cards = cardStr.split(',').map(part => {
    const isReversed = part.endsWith('.r')
    const id = isReversed ? part.slice(0, -2) : part
    return { id, reversed: isReversed }
  })
  return {
    cards,
    status: params.get('s') || '',
  }
}

/**
 * 현재 URL에 공유 파라미터를 붙인 링크 생성
 * @param {string} basePath - 리딩 경로 (예: '/reading/mind')
 * @param {string} queryString - 쿼리스트링
 * @returns {string} 전체 공유 URL
 */
export function buildShareUrl(basePath, queryString) {
  const origin = window.location.origin
  return `${origin}${basePath}${queryString}`
}
