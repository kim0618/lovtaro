/**
 * 역방향(reversed) 카드 해석 수정자
 * 정방향 해석을 감싸서 역방향 뉘앙스를 제공합니다.
 *
 * 구조: cardId -> { summary, emotionTags, prefix }
 * prefix는 emotionFlow/advice/caution 앞에 추가되는 역방향 맥락 문장입니다.
 */
export const REVERSED_MODIFIERS = {
  magician: {
    summary: '능력은 있지만 방향을 잃었거나, 진심이 아닌 기술로 관계를 다루고 있는 기류가 읽혀요.',
    emotionHook: '잘하고 있는 것 같은데,\n왜 공허한 건지 모르겠지 않나요?',
    emotionTags: ['방향 상실', '조작', '과신', '공허'],
    prefix: '역방향의 마법사 카드는 자신감이 과신으로, 진심이 기술로 바뀔 수 있다는 경고예요.',
  },
  priestess: {
    summary: '직관을 무시하고 있거나, 알고 있는 답을 외면하는 기류가 읽혀요.',
    emotionHook: '사실은 답을 알면서,\n모른 척하고 있진 않나요?',
    emotionTags: ['직관 무시', '자기기만', '혼란', '억압'],
    prefix: '역방향의 여사제 카드는 내면의 목소리를 외면하고 있을 수 있다는 결이에요.',
  },
  empress: {
    summary: '과잉 돌봄이나 의존, 자기 방치로 흐를 수 있는 기류가 읽혀요.',
    emotionHook: '혹시 너무 퍼주고 있진 않나요?\n나한테도 좀 다정해져요.',
    emotionTags: ['과잉 돌봄', '의존', '자기 방치', '불균형'],
    prefix: '역방향의 여황제 카드는 돌봄의 방향이 일방적이거나 자기 자신을 잃고 있을 수 있다는 결이에요.',
  },
  emperor: {
    summary: '통제적이거나 경직된 태도로 관계를 옥죄고 있는 기류가 읽혀요.',
    emotionHook: '지키려는 건지, 잡으려는 건지\n구분이 되나요?',
    emotionTags: ['통제', '경직', '지배', '권위적'],
    prefix: '역방향의 황제 카드는 보호가 통제로, 안정이 지배로 바뀔 수 있다는 경고예요.',
  },
  hierophant: {
    summary: '형식에 갇히거나 자유로운 감정 표현이 억압된 기류가 읽혀요.',
    emotionHook: '"원래 이래야 하는 건데"라는 말 뒤에,\n진짜 하고 싶은 말이 있지 않나요?',
    emotionTags: ['형식주의', '독단', '억압', '답답함'],
    prefix: '역방향의 교황 카드는 전통과 규칙에 갇혀 진짜 마음을 외면하고 있을 수 있다는 결이에요.',
  },
  fool: {
    summary: '무모한 방향으로 흐를 수 있는 기류가 읽혀요. 설렘과 충동을 구분해보세요.',
    emotionHook: '설레는 건지, 그냥 심심한 건지\n한 번 생각해본 적 있나요?',
    emotionTags: ['충동', '방향 없음', '산만함', '불안정'],
    prefix: '역방향의 바보 카드는 가벼움이 무모함으로 기울 수 있다는 경고예요.',
  },
  lovers: {
    summary: '감정은 있지만 불균형하거나 엇갈리는 기류가 읽혀요.',
    emotionHook: '좋아하는 마음은 확실한데,\n방향이 같은 건지는 모르겠죠?',
    emotionTags: ['불일치', '갈등', '의심', '엇갈림'],
    prefix: '역방향의 연인 카드는 마음이 있어도 서로 다른 방향을 보고 있을 수 있다는 결이에요.',
  },
  star: {
    summary: '희망이 흔들리고 자신감이 낮아진 기류가 읽혀요.',
    emotionHook: '괜찮아질 거라는 말이\n오늘따라 믿기 어렵지 않나요?',
    emotionTags: ['자신감 저하', '의심', '지침', '회복 지연'],
    prefix: '역방향의 별 카드는 치유가 더 오래 걸리거나 희망을 잃기 쉬운 시기를 가리켜요.',
  },
  world: {
    summary: '완성에 가까웠지만 무언가 마무리되지 않은 기류가 읽혀요.',
    emotionHook: '거의 다 온 것 같은데,\n뭔가 하나가 부족한 느낌 들지 않나요?',
    emotionTags: ['미완성', '지연', '아쉬움', '한 발 부족'],
    prefix: '역방향의 세계 카드는 충분히 왔지만 아직 마지막 한 걸음이 남아 있다는 결이에요.',
  },
  chariot: {
    summary: '방향을 잃은 질주이거나, 이기려는 마음이 관계를 해치는 기류가 읽혀요.',
    emotionHook: '열심히 달리고 있긴 한데,\n어디로 가는 건지 모를 때 있지 않나요?',
    emotionTags: ['방향 상실', '공격성', '독주', '통제 상실'],
    prefix: '역방향의 전차 카드는 추진력이 공격성으로 바뀌거나 방향 없이 달리고 있을 수 있다는 결이에요.',
  },
  strength: {
    summary: '내면의 힘이 흔들리고 자기 의심이 커진 기류가 읽혀요.',
    emotionHook: '할 수 있을까 싶은 마음,\n요즘 자주 들지 않나요?',
    emotionTags: ['자기 의심', '나약함', '두려움', '위축'],
    prefix: '역방향의 힘 카드는 용기가 필요한 순간에 두려움이 앞서고 있다는 결이에요.',
  },
  death: {
    summary: '변화를 거부하거나, 끝나야 할 것을 억지로 붙잡고 있는 기류가 읽혀요.',
    emotionHook: '끝난 거 알면서,\n아직도 손에 쥐고 있진 않나요?',
    emotionTags: ['변화 거부', '집착', '정체', '미련'],
    prefix: '역방향의 죽음 카드는 놓아야 할 것을 놓지 못하고 있어 새로운 시작이 막혀 있다는 결이에요.',
  },
  temperance: {
    summary: '균형이 깨지고 조급함이나 극단으로 흐르는 기류가 읽혀요.',
    emotionHook: '참다 참다 한 번에 터진 적,\n최근에 있지 않았나요?',
    emotionTags: ['불균형', '조급함', '극단', '과잉'],
    prefix: '역방향의 절제 카드는 참을성이 바닥나거나 한쪽으로 치우치기 쉬운 시기를 가리켜요.',
  },
  moon: {
    summary: '혼란이 더 깊어지고 감정의 안개가 짙어진 기류가 읽혀요.',
    emotionHook: '생각하면 할수록 더 모르겠는 거,\n나만 그런 게 아니에요.',
    emotionTags: ['깊은 혼란', '기만', '환상', '불안 심화'],
    prefix: '역방향의 달 카드는 보이는 것이 진실이 아닐 수 있다는 강한 경고예요.',
  },
  hermit: {
    summary: '지나친 고립이나 단절로 흐를 수 있는 기류가 읽혀요.',
    emotionHook: '혼자 있고 싶은 건지,\n아무도 안 찾아줘서 혼자인 건지 헷갈리지 않나요?',
    emotionTags: ['과도한 고립', '외로움', '단절', '회피'],
    prefix: '역방향의 은둔자 카드는 성찰이 아닌 도피로 기울 수 있다는 결이에요.',
  },
  wheel: {
    summary: '변화에 저항하거나 흐름을 억지로 되돌리려는 기류가 읽혀요.',
    emotionHook: '예전으로 돌아가고 싶은 마음,\n요즘 자주 들지 않나요?',
    emotionTags: ['저항', '정체', '통제 욕구', '불운'],
    prefix: '역방향의 운명의 수레바퀴는 변화를 거부할수록 더 힘들어지는 기류를 가리켜요.',
  },
  hanged: {
    summary: '기다림이 무의미한 정체로 바뀌고 있는 기류가 읽혀요.',
    emotionHook: '기다리는 건지, 그냥 결정을 피하고 있는 건지\n솔직히 어떤가요?',
    emotionTags: ['무의미한 기다림', '포기', '정체', '결단 회피'],
    prefix: '역방향의 매달린 사람은 인내가 아닌 회피로 빠지고 있을 수 있다는 결이에요.',
  },
  justice: {
    summary: '불공정하거나 진실이 왜곡된 기류가 읽혀요.',
    emotionHook: '내 입장에서만 보고 있진 않은지,\n한 번 돌아봐도 괜찮아요.',
    emotionTags: ['불공정', '자기 합리화', '편향', '왜곡'],
    prefix: '역방향의 정의 카드는 자신에게 유리한 쪽으로만 상황을 보고 있을 수 있다는 결이에요.',
  },
  devil: {
    summary: '속박에서 벗어나려는 움직임이 시작되고 있지만, 아직 완전히 자유롭지 못한 기류가 읽혀요.',
    emotionHook: '안 좋은 줄 알면서도\n자꾸 손이 가는 거, 있지 않나요?',
    emotionTags: ['벗어남', '자각', '여전한 유혹', '과도기'],
    prefix: '역방향의 악마 카드는 건강하지 않은 패턴을 인식하기 시작했지만 완전히 벗어나지는 못한 상태를 가리켜요.',
  },
  tower: {
    summary: '변화를 막으려 해도 피할 수 없는 기류가 읽혀요. 하지만 파괴는 더 서서히 올 수 있어요.',
    emotionHook: '괜찮은 척하고 있지만,\n안에서 조금씩 무너지고 있진 않나요?',
    emotionTags: ['천천히 무너짐', '회피', '지연된 충격', '내면 붕괴'],
    prefix: '역방향의 탑 카드는 갑작스러운 충격보다 내면에서 서서히 무너지는 흐름을 가리켜요.',
  },
  sun: {
    summary: '기쁨이 가려지거나, 낙관이 현실을 덮고 있는 기류가 읽혀요.',
    emotionHook: '웃고 있긴 한데,\n진짜 즐거운 건 맞나요?',
    emotionTags: ['낙관 과잉', '현실 외면', '기쁨 상실', '허세'],
    prefix: '역방향의 태양 카드는 밝은 것만 보려 하거나 진짜 감정을 감추고 있을 수 있다는 결이에요.',
  },
  judgement: {
    summary: '자기 성찰을 피하거나, 같은 실수를 반복하려는 기류가 읽혀요.',
    emotionHook: '또 같은 패턴이라는 거,\n어딘가에서 느끼고 있지 않나요?',
    emotionTags: ['성찰 회피', '반복', '자기기만', '회피'],
    prefix: '역방향의 심판 카드는 과거의 교훈을 외면하고 같은 패턴을 반복할 위험이 있다는 결이에요.',
  },
  'ace-of-cups': {
    summary: '감정이 시작되려다 막혀 있거나, 열리기 두려운 기류가 읽혀요.',
    emotionHook: '좋아하는 마음이 드는 것 같은데,\n인정하기가 무서운 거죠?',
    emotionTags: ['감정 차단', '두려움', '망설임', '막힘'],
    prefix: '역방향의 에이스 컵 카드는 감정이 흐르지 못하고 고여 있는 결이에요.',
  },
  'two-of-cups': {
    summary: '감정의 균형이 깨지거나 온도차가 느껴지는 기류가 읽혀요.',
    emotionHook: '내가 더 많이 좋아하는 것 같은 느낌,\n오늘 유난히 크지 않나요?',
    emotionTags: ['온도차', '불균형', '일방통행', '어긋남'],
    prefix: '역방향의 컵의 2 카드는 서로의 감정이 같은 자리에 있지 않을 수 있다는 결이에요.',
  },
  'three-of-cups': {
    summary: '즐거움 뒤에 채워지지 않는 무언가가 있거나, 관계가 피상적으로 느껴지는 기류가 읽혀요.',
    emotionHook: '여럿이 있을 땐 편한데 단둘은 어색한,\n그런 관계가 생겨나고 있지 않나요?',
    emotionTags: ['피상적', '소외감', '에너지 분산', '제3자'],
    prefix: '역방향의 컵의 3 카드는 기쁨이 표면적이거나 관계에 제3자가 개입될 수 있다는 결이에요.',
  },
  'four-of-cups': {
    summary: '감정이 다시 살아나기 시작하거나, 놓쳤던 무언가가 눈에 들어오는 기류가 읽혀요.',
    emotionHook: '오래 무감각했던 것이 갑자기 느껴지는,\n그 감각이 낯설지 않나요?',
    emotionTags: ['재발견', '관심', '회복', '새로운 눈'],
    prefix: '역방향의 컵의 4 카드는 오래 닫혀 있던 감정의 문이 조금씩 열리기 시작하는 결이에요.',
  },
  'five-of-cups': {
    summary: '힘들었던 시간이 서서히 지나가고, 마음이 조금씩 가벼워지는 기류가 읽혀요.',
    emotionHook: '완전히 괜찮지는 않은데,\n어제보다는 조금 나아진 것 같은 느낌이죠?',
    emotionTags: ['회복', '해소', '전환', '조금씩'],
    prefix: '역방향의 컵의 5 카드는 슬픔이 정점을 지나 조금씩 흘러내려가기 시작하는 결이에요.',
  },
  'six-of-cups': {
    summary: '과거의 미련이나 지나간 기억이 현재로 나아가는 것을 막고 있는 기류가 읽혀요.',
    emotionHook: '새로운 사람 앞에서도 자꾸 과거가 떠오르는,\n그 기준에서 아직 자유롭지 않죠?',
    emotionTags: ['미련', '비교', '과거 집착', '닫힌 마음'],
    prefix: '역방향의 컵의 6 카드는 지나간 기억이 지금을 보는 눈을 가리고 있을 수 있다는 결이에요.',
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
    emotionHook: mod.emotionHook || uprightResult.emotionHook,
    emotionTags: mod.emotionTags,
    emotionFlow: [mod.prefix, ...uprightResult.emotionFlow],
  }
}
