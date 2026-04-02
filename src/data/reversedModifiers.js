/**
 * 역방향(reversed) 카드 해석 수정자
 * 정방향 해석을 감싸서 역방향 뉘앙스를 제공합니다.
 *
 * 구조: cardId -> { summary, emotionTags, prefix }
 * prefix는 emotionFlow/advice/caution 앞에 추가되는 역방향 맥락 문장입니다.
 */
export const REVERSED_MODIFIERS = {
  fool: {
    summary: '무모한 방향으로 흐를 수 있는 기류가 읽혀요. 설렘과 충동을 구분해보세요.',
    emotionTags: ['충동', '방향 없음', '산만함', '불안정'],
    prefix: '역방향의 바보 카드는 가벼움이 무모함으로 기울 수 있다는 경고예요.',
  },
  lovers: {
    summary: '감정은 있지만 불균형하거나 엇갈리는 기류가 읽혀요.',
    emotionTags: ['불일치', '갈등', '의심', '엇갈림'],
    prefix: '역방향의 연인 카드는 마음이 있어도 서로 다른 방향을 보고 있을 수 있다는 결이에요.',
  },
  star: {
    summary: '희망이 흔들리고 자신감이 낮아진 기류가 읽혀요.',
    emotionTags: ['자신감 저하', '의심', '지침', '회복 지연'],
    prefix: '역방향의 별 카드는 치유가 더 오래 걸리거나 희망을 잃기 쉬운 시기를 가리켜요.',
  },
  world: {
    summary: '완성에 가까웠지만 무언가 마무리되지 않은 기류가 읽혀요.',
    emotionTags: ['미완성', '지연', '아쉬움', '한 발 부족'],
    prefix: '역방향의 세계 카드는 충분히 왔지만 아직 마지막 한 걸음이 남아 있다는 결이에요.',
  },
  strength: {
    summary: '내면의 힘이 흔들리고 자기 의심이 커진 기류가 읽혀요.',
    emotionTags: ['자기 의심', '나약함', '두려움', '위축'],
    prefix: '역방향의 힘 카드는 용기가 필요한 순간에 두려움이 앞서고 있다는 결이에요.',
  },
  temperance: {
    summary: '균형이 깨지고 조급함이나 극단으로 흐르는 기류가 읽혀요.',
    emotionTags: ['불균형', '조급함', '극단', '과잉'],
    prefix: '역방향의 절제 카드는 참을성이 바닥나거나 한쪽으로 치우치기 쉬운 시기를 가리켜요.',
  },
  moon: {
    summary: '혼란이 더 깊어지고 감정의 안개가 짙어진 기류가 읽혀요.',
    emotionTags: ['깊은 혼란', '기만', '환상', '불안 심화'],
    prefix: '역방향의 달 카드는 보이는 것이 진실이 아닐 수 있다는 강한 경고예요.',
  },
  hermit: {
    summary: '지나친 고립이나 단절로 흐를 수 있는 기류가 읽혀요.',
    emotionTags: ['과도한 고립', '외로움', '단절', '회피'],
    prefix: '역방향의 은둔자 카드는 성찰이 아닌 도피로 기울 수 있다는 결이에요.',
  },
  wheel: {
    summary: '변화에 저항하거나 흐름을 억지로 되돌리려는 기류가 읽혀요.',
    emotionTags: ['저항', '정체', '통제 욕구', '불운'],
    prefix: '역방향의 운명의 수레바퀴는 변화를 거부할수록 더 힘들어지는 기류를 가리켜요.',
  },
  hanged: {
    summary: '기다림이 무의미한 정체로 바뀌고 있는 기류가 읽혀요.',
    emotionTags: ['무의미한 기다림', '포기', '정체', '결단 회피'],
    prefix: '역방향의 매달린 사람은 인내가 아닌 회피로 빠지고 있을 수 있다는 결이에요.',
  },
  justice: {
    summary: '불공정하거나 진실이 왜곡된 기류가 읽혀요.',
    emotionTags: ['불공정', '자기 합리화', '편향', '왜곡'],
    prefix: '역방향의 정의 카드는 자신에게 유리한 쪽으로만 상황을 보고 있을 수 있다는 결이에요.',
  },
  tower: {
    summary: '변화를 막으려 해도 피할 수 없는 기류가 읽혀요. 하지만 파괴는 더 서서히 올 수 있어요.',
    emotionTags: ['천천히 무너짐', '회피', '지연된 충격', '내면 붕괴'],
    prefix: '역방향의 탑 카드는 갑작스러운 충격보다 내면에서 서서히 무너지는 흐름을 가리켜요.',
  },
}

/**
 * 정방향/역방향에 따라 해석 결과를 조정합니다.
 * @param {string} cardId
 * @param {Object} uprightResult - { summary, emotionTags, emotionFlow, advice, caution }
 * @param {boolean} reversed
 * @returns {Object} 조정된 결과
 */
export function applyReversedModifier(cardId, uprightResult, reversed) {
  if (!reversed) return uprightResult

  const mod = REVERSED_MODIFIERS[cardId]
  if (!mod) return uprightResult

  return {
    ...uprightResult,
    summary: mod.summary,
    emotionTags: mod.emotionTags,
    emotionFlow: [mod.prefix, ...uprightResult.emotionFlow],
  }
}
