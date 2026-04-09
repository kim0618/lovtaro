/**
 * Yes/No 타로 역방향(reversed) 카드 해석 수정자
 * 정방향 해석을 감싸서 역방향 뉘앙스를 제공합니다.
 *
 * 구조: cardId -> { answer, answerLabel, answerDesc, summary, emotionTags, prefix }
 */
export const YESNO_REVERSED_MODIFIERS = {
  fool: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '무모한 방향으로 흐를 수 있어요. 한 번 더 생각해보세요.',
    summary: '설렘이 충동으로 기울 수 있는 기류예요. 지금은 잠시 멈추고 다시 생각해보세요.',
    emotionTags: ['충동', '불안정', '방향 없음', '산만'],
    prefix: '역방향의 바보 카드는 가벼운 설렘이 무모함으로 바뀔 수 있다는 경고예요.',
  },
  magician: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '능력은 있지만 방향이 흔들리고 있어요.',
    summary: '할 수 있는 힘은 있지만, 잘못된 방향으로 쓰고 있을 수 있어요.',
    emotionTags: ['방향 상실', '과신', '조작', '혼란'],
    prefix: '역방향의 마법사 카드는 능력이 있어도 방향을 잃으면 결과가 달라질 수 있다는 결이에요.',
  },
  priestess: {
    answer: 'no',
    answerLabel: 'No',
    answerDesc: '직관을 무시하고 있어요. 내면의 경고에 귀를 기울이세요.',
    summary: '마음 깊은 곳에서 이미 답을 알고 있지만 외면하고 있을 수 있어요.',
    emotionTags: ['직관 무시', '자기기만', '혼란', '억압'],
    prefix: '역방향의 여사제 카드는 내면의 목소리를 외면하고 있다는 강한 경고예요.',
  },
  empress: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '과한 기대나 의존이 결과를 흐리고 있어요.',
    summary: '따뜻한 에너지가 과잉 돌봄이나 의존으로 흐를 수 있는 기류예요.',
    emotionTags: ['과잉 돌봄', '의존', '불균형', '자기 방치'],
    prefix: '역방향의 여황제 카드는 돌봄의 방향이 일방적이거나 자기 자신을 잃을 수 있다는 결이에요.',
  },
  emperor: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '지나친 통제가 오히려 역효과를 내고 있어요.',
    summary: '안정을 추구하다 경직되거나, 통제하려는 태도가 상황을 악화시킬 수 있어요.',
    emotionTags: ['통제', '경직', '지배', '완고함'],
    prefix: '역방향의 황제 카드는 안정이 통제로, 보호가 지배로 바뀔 수 있다는 경고예요.',
  },
  hierophant: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '형식에 얽매여 진짜 답을 놓치고 있을 수 있어요.',
    summary: '기존 방식에만 고집하면 새로운 가능성을 놓칠 수 있어요.',
    emotionTags: ['형식주의', '독단', '억압', '경직'],
    prefix: '역방향의 교황 카드는 전통에 갇혀 자유로운 판단이 막혀 있을 수 있다는 결이에요.',
  },
  lovers: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '마음이 갈리고 있어요. 진심을 먼저 정리하세요.',
    summary: '감정은 있지만 엇갈리거나 불균형한 상태예요. 진심을 먼저 확인하세요.',
    emotionTags: ['갈등', '불일치', '의심', '엇갈림'],
    prefix: '역방향의 연인 카드는 마음이 있어도 서로 다른 방향을 보고 있을 수 있다는 결이에요.',
  },
  chariot: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '추진력이 방향을 잃고 있어요. 멈추고 확인하세요.',
    summary: '달리고 있지만 방향이 맞는지 확인이 필요해요. 잘못된 질주일 수 있어요.',
    emotionTags: ['방향 상실', '독주', '통제 상실', '공격성'],
    prefix: '역방향의 전차 카드는 추진력이 공격성으로, 전진이 독주로 바뀔 수 있다는 결이에요.',
  },
  strength: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '자신감이 흔들리고 있어요. 내면의 힘을 다시 찾으세요.',
    summary: '할 수 있는 힘이 있지만 자기 의심이 앞서고 있는 상태예요.',
    emotionTags: ['자기 의심', '위축', '두려움', '나약함'],
    prefix: '역방향의 힘 카드는 용기가 필요한 순간에 두려움이 앞서고 있다는 결이에요.',
  },
  hermit: {
    answer: 'no',
    answerLabel: 'No',
    answerDesc: '지나친 고립이 판단을 흐리고 있어요.',
    summary: '성찰이 아닌 도피로 빠져 있을 수 있어요. 바깥 세계와의 연결이 필요해요.',
    emotionTags: ['과도한 고립', '도피', '단절', '외로움'],
    prefix: '역방향의 은둔자 카드는 성찰이 도피로 기울어 더 깊은 혼란에 빠질 수 있다는 결이에요.',
  },
  wheel: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '흐름에 저항하고 있어요. 변화를 받아들여보세요.',
    summary: '변화의 흐름을 거부하거나 억지로 되돌리려 하면 더 힘들어질 수 있어요.',
    emotionTags: ['저항', '정체', '통제 욕구', '불운'],
    prefix: '역방향의 운명의 수레바퀴는 변화를 거부할수록 상황이 어려워진다는 결이에요.',
  },
  justice: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '공정하지 못한 시각이 결과를 왜곡하고 있어요.',
    summary: '자기 합리화나 편향된 시각으로 상황을 보고 있을 수 있어요.',
    emotionTags: ['불공정', '편향', '자기 합리화', '왜곡'],
    prefix: '역방향의 정의 카드는 객관성을 잃고 자신에게 유리한 해석만 하고 있을 수 있다는 결이에요.',
  },
  hanged: {
    answer: 'no',
    answerLabel: 'No',
    answerDesc: '기다림이 정체로 변했어요. 움직임이 필요해요.',
    summary: '인내가 무기력으로 바뀌어 있는 상태예요. 이제는 움직여야 해요.',
    emotionTags: ['정체', '무기력', '포기', '회피'],
    prefix: '역방향의 매달린 사람은 기다림이 아닌 회피로 빠져 아무것도 나아가지 않는 상태를 가리켜요.',
  },
  death: {
    answer: 'no',
    answerLabel: 'No',
    answerDesc: '변화를 거부하면서 더 깊이 빠지고 있어요.',
    summary: '끝나야 할 것을 억지로 붙잡고 있어 새로운 시작이 막혀 있어요.',
    emotionTags: ['집착', '미련', '변화 거부', '정체'],
    prefix: '역방향의 죽음 카드는 놓아야 할 것을 놓지 못하고 있어 상황이 더 악화되고 있다는 결이에요.',
  },
  temperance: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '균형이 깨져 있어요. 중심을 다시 잡아야 해요.',
    summary: '조급함이나 극단적인 태도가 결과를 흐리고 있어요.',
    emotionTags: ['불균형', '조급함', '극단', '과잉'],
    prefix: '역방향의 절제 카드는 참을성이 바닥나거나 한쪽으로 치우치기 쉬운 시기를 가리켜요.',
  },
  devil: {
    answer: 'no',
    answerLabel: 'No',
    answerDesc: '집착의 고리를 인식하기 시작했지만, 아직 벗어나지 못했어요.',
    summary: '건강하지 않은 패턴을 알아차리기 시작했지만, 완전히 자유롭지는 못한 상태예요.',
    emotionTags: ['자각', '여전한 유혹', '과도기', '벗어남'],
    prefix: '역방향의 악마 카드는 문제를 인식했지만 행동으로 옮기지 못하고 있다는 결이에요.',
  },
  tower: {
    answer: 'no',
    answerLabel: 'No',
    answerDesc: '내면에서 서서히 무너지고 있어요. 근본적인 변화가 필요해요.',
    summary: '겉으로는 괜찮아 보이지만 안에서 천천히 균열이 생기고 있어요.',
    emotionTags: ['내면 붕괴', '회피', '지연된 충격', '서서히 무너짐'],
    prefix: '역방향의 탑 카드는 갑작스러운 충격 대신 내면에서 서서히 무너지는 흐름을 가리켜요.',
  },
  star: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '희망이 흔들리고 있어요. 다시 믿어보세요.',
    summary: '희망을 잃어가고 있거나 자신감이 낮아진 상태예요. 회복에 시간이 필요해요.',
    emotionTags: ['희망 상실', '자신감 저하', '지침', '회복 지연'],
    prefix: '역방향의 별 카드는 치유가 더 오래 걸리거나 희망을 잃기 쉬운 시기를 가리켜요.',
  },
  moon: {
    answer: 'no',
    answerLabel: 'No',
    answerDesc: '혼란이 더 깊어지고 있어요. 지금은 판단하지 마세요.',
    summary: '감정의 안개가 짙어져 진실과 환상을 구분하기 어려운 상태예요.',
    emotionTags: ['깊은 혼란', '기만', '환상', '불안 심화'],
    prefix: '역방향의 달 카드는 보이는 것이 진실이 아닐 수 있다는 강한 경고예요.',
  },
  sun: {
    answer: 'yes',
    answerLabel: 'Yes',
    answerDesc: '약간의 그림자가 있지만, 여전히 긍정적이에요.',
    summary: '밝은 에너지가 약간 가려져 있지만, 기본적으로 긍정의 흐름은 유지되고 있어요.',
    emotionTags: ['약한 긍정', '현실 직시', '기쁨 지연', '희망'],
    prefix: '역방향의 태양 카드도 기본적으로 긍정이지만, 낙관에만 기대지 말고 현실도 살피라는 결이에요.',
  },
  judgement: {
    answer: 'no',
    answerLabel: 'No',
    answerDesc: '과거의 교훈을 무시하고 같은 실수를 반복하고 있어요.',
    summary: '성찰 없이 같은 패턴을 반복하면 결과도 같을 수밖에 없어요.',
    emotionTags: ['반복', '성찰 회피', '자기기만', '미성숙'],
    prefix: '역방향의 심판 카드는 과거의 교훈을 외면하고 같은 패턴을 반복하고 있다는 결이에요.',
  },
  world: {
    answer: 'maybe',
    answerLabel: 'Maybe',
    answerDesc: '완성에 가까웠지만, 마지막 한 걸음이 남아 있어요.',
    summary: '거의 다 왔지만 아직 무언가가 마무리되지 않았어요. 조금만 더 노력하세요.',
    emotionTags: ['미완성', '아쉬움', '지연', '한 발 부족'],
    prefix: '역방향의 세계 카드는 충분히 왔지만 아직 마지막 한 걸음이 남아 있다는 결이에요.',
  },
}

/**
 * Yes/No 역방향 수정자를 적용합니다.
 * @param {string} cardId
 * @param {Object} uprightResult - yesno.js의 카드 결과
 * @param {boolean} reversed
 * @returns {Object} 조정된 결과
 */
export function applyYesNoReversedModifier(cardId, uprightResult, reversed) {
  if (!reversed) return uprightResult

  const mod = YESNO_REVERSED_MODIFIERS[cardId]
  if (!mod) return uprightResult

  return {
    ...uprightResult,
    answer: mod.answer,
    answerLabel: mod.answerLabel,
    answerDesc: mod.answerDesc,
    summary: mod.summary,
    emotionTags: mod.emotionTags,
    emotionFlow: [mod.prefix, ...uprightResult.emotionFlow],
  }
}
