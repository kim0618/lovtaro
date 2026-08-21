/**
 * 한국어 조사 자동 선택.
 *
 * 카드 이름을 문장에 끼울 때 조사를 하드코딩하면 받침 있는 이름이 전부 깨진다
 * (실제로 78장 중 18장이 "달는"·"연인는"·"죽음는"으로 나갔다).
 * 카드 이름은 데이터라서 눈으로 다 확인할 수 없으므로 함수로 붙인다.
 */

/** 마지막 글자에 받침이 있으면 true. 한글이 아니면 null(판정 불가). */
function hasBatchim(word) {
  const last = (word || '').trim().slice(-1)
  if (!last) return null
  const code = last.charCodeAt(0)
  if (code < 0xac00 || code > 0xd7a3) return null
  return (code - 0xac00) % 28 !== 0
}

/**
 * 단어에 맞는 조사를 골라 붙인다.
 * @example withJosa('연인', '은', '는') // '연인은'
 * @example withJosa('바보', '은', '는') // '바보는'
 */
export function withJosa(word, withBatchim, withoutBatchim) {
  const b = hasBatchim(word)
  // 한글이 아니면 받침 없는 쪽으로 둔다(영문 카드명 등)
  return `${word}${b === true ? withBatchim : withoutBatchim}`
}

/** `은/는` 전용 단축형. 가장 많이 쓰인다. */
export function topic(word) {
  return withJosa(word, '은', '는')
}
